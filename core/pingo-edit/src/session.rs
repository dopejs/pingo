use std::collections::VecDeque;

use crate::{
    EditCommand, EditConfig, EditDelta, EditError, EditIntent, EditTransaction, ExternalValue,
    MarkRuns, MarkSide, OffsetBias, PositionMap, Selection, TextIndex, TransactionKind, Utf16Range,
};

#[derive(Clone, Debug, Eq, PartialEq)]
struct Composition {
    original_range: Utf16Range,
    current_range: Utf16Range,
    original_text: String,
    original_marks: MarkRuns,
    original_selection: Selection,
}

#[derive(Clone, Debug, Eq, PartialEq)]
struct HistoryEntry {
    forward: EditDelta,
    inverse: EditDelta,
    /// Marks the forward delta installs over its inserted text.
    forward_marks: MarkRuns,
    /// Marks the inverse delta restores, so undo returns styling as well as text.
    inverse_marks: MarkRuns,
    before_selection: Selection,
    after_selection: Selection,
    retained_bytes: usize,
}

/// Coarse character class used to seal an undo group at a semantic boundary.
///
/// Typing `hello world` is two bursts, not one: the space changes class and
/// ends the first group. Classifying the whole inserted or removed chunk keeps
/// a paste of mixed content opaque instead of silently joining a burst.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum TextClass {
    /// Alphanumeric content, including CJK and combining marks.
    Word,
    /// Horizontal whitespace.
    Space,
    /// Punctuation and symbols.
    Other,
}

/// The shape of the last committed history entry, for coalescing the next one.
///
/// Every variant records the caret edge the next command has to line up with,
/// so a merge can never join two edits that are not physically adjacent.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum UndoAnchor {
    /// Nothing at the top of the undo stack may absorb the next command.
    None,
    /// The top entry ends with an insertion whose caret sits at `caret`.
    Insert { caret: u32, class: TextClass },
    /// The top entry ends with a backward deletion that began at `start`.
    DeleteBackward { start: u32, class: TextClass },
    /// The top entry ends with a forward deletion anchored at `caret`.
    DeleteForward { caret: u32, class: TextClass },
}

/// How one accepted command participates in undo grouping.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum GroupKind {
    /// Caret insertion; may continue and start a typing burst.
    Insert,
    /// Backspace; may continue and start a deletion burst.
    DeleteBackward,
    /// Forward delete; may continue and start a deletion burst.
    DeleteForward,
    /// Anything else: it neither merges nor lets the next command merge.
    Opaque,
}

/// Classifies a chunk, returning `None` for empty, mixed, or newline content.
fn text_class(text: &str) -> Option<TextClass> {
    let mut class = None;
    for character in text.chars() {
        if character == '\n' || character == '\r' {
            return None;
        }
        let current = if character.is_alphanumeric() || character == '_' {
            TextClass::Word
        } else if character.is_whitespace() {
            TextClass::Space
        } else {
            TextClass::Other
        };
        match class {
            None => class = Some(current),
            Some(previous) if previous == current => {}
            Some(_) => return None,
        }
    }
    class
}

fn utf16_units(text: &str) -> Result<u32, EditError> {
    u32::try_from(text.encode_utf16().count()).map_err(|_| EditError::OffsetOverflow)
}

struct PreparedReplacement {
    next_text: String,
    next_index: TextIndex,
    next_marks: MarkRuns,
    forward: EditDelta,
    inverse: EditDelta,
    /// Marks covering the inserted text.
    forward_marks: MarkRuns,
    /// Marks covering the text this replacement removes.
    inverse_marks: MarkRuns,
    map: PositionMap,
    after_selection: Selection,
    text_changed: bool,
    marks_changed: bool,
}

/// Core-owned state for one active editable-text node.
#[derive(Clone)]
pub struct EditSession {
    text: String,
    index: TextIndex,
    marks: MarkRuns,
    /// Style and font the next caret insertion adopts, cleared by any
    /// selection change.
    pending_mark: Option<(u32, u32)>,
    selection: Selection,
    composition: Option<Composition>,
    revision: u64,
    /// Revision of the last transaction that changed the text, as opposed to
    /// the selection or composition state. Word segmentation depends only on
    /// the text, so this is what decides whether Host-computed boundaries are
    /// still valid; gating them on `revision` made every caret click stale.
    text_revision: u64,
    config: EditConfig,
    undo: VecDeque<HistoryEntry>,
    redo: VecDeque<HistoryEntry>,
    undo_bytes: usize,
    redo_bytes: usize,
    /// Shape of the entry currently on top of `undo`, or `None` when the next
    /// command must start a fresh group.
    undo_anchor: UndoAnchor,
    /// Map produced by the replacement committed in the current command.
    pending_map: Option<PositionMap>,
    /// Whether the current command changed the mark table.
    marks_dirty: bool,
}

impl EditSession {
    /// Creates a validated session whose value carries only the base style.
    pub fn new(
        text: String,
        selection: Selection,
        revision: u64,
        config: EditConfig,
    ) -> Result<Self, EditError> {
        Self::new_styled(text, None, selection, revision, config)
    }

    /// Creates a validated session from authoritative initial state and marks.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::InvalidMarkRuns`] when the table does not tile the
    /// value, plus the usual value-policy errors.
    pub fn new_styled(
        text: String,
        marks: Option<MarkRuns>,
        selection: Selection,
        revision: u64,
        config: EditConfig,
    ) -> Result<Self, EditError> {
        let index = TextIndex::new(&text)?;
        validate_value(&config, &text, &index)?;
        let marks = normalize_marks(marks, index.utf16_len())?;
        let selection = index.normalize_selection(selection)?;
        Ok(Self {
            text,
            index,
            marks,
            pending_mark: None,
            selection,
            composition: None,
            revision,
            text_revision: revision,
            config,
            undo: VecDeque::new(),
            redo: VecDeque::new(),
            undo_bytes: 0,
            redo_bytes: 0,
            undo_anchor: UndoAnchor::None,
            pending_map: None,
            marks_dirty: false,
        })
    }

    /// Returns the active UTF-8 value.
    #[must_use]
    pub fn text(&self) -> &str {
        &self.text
    }

    /// Returns the revision of the last transaction that changed the text.
    #[must_use]
    pub const fn text_revision(&self) -> u64 {
        self.text_revision
    }

    /// Consumes one revision to acknowledge a command applied against a stale
    /// base, changing nothing else.
    ///
    /// The input surface bumps its optimistic revision when it sends a command;
    /// a command raced past by an engine-side selection change arrives stale,
    /// and dropping it without a transaction would desynchronize every command
    /// that follows. The acknowledgement realigns the surface instead.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::RevisionOverflow`] when the revision space is
    /// exhausted.
    pub fn acknowledge_stale(&mut self) -> Result<EditTransaction, EditError> {
        let next_revision = self
            .revision
            .checked_add(1)
            .ok_or(EditError::RevisionOverflow)?;
        Ok(self.finish_no_op(next_revision, TransactionKind::Edit))
    }

    /// Returns the mark table for the active revision.
    #[must_use]
    pub const fn marks(&self) -> &MarkRuns {
        &self.marks
    }

    /// Returns the style and font the next caret insertion would adopt.
    #[must_use]
    pub fn effective_mark(&self) -> (u32, u32) {
        self.pending_mark.unwrap_or_else(|| {
            let run = self
                .marks
                .run_at(self.selection.range().start, MarkSide::Before);
            (run.style, run.font)
        })
    }

    /// Returns the conversion table for the active revision.
    #[must_use]
    pub const fn text_index(&self) -> &TextIndex {
        &self.index
    }

    /// Returns the active directed selection.
    #[must_use]
    pub const fn selection(&self) -> Selection {
        self.selection
    }

    /// Returns the active Core revision.
    #[must_use]
    pub const fn revision(&self) -> u64 {
        self.revision
    }

    /// Returns the temporary composition span.
    #[must_use]
    pub fn composition_range(&self) -> Option<Utf16Range> {
        self.composition
            .as_ref()
            .map(|composition| composition.current_range)
    }

    /// Returns whether an undo operation is available.
    #[must_use]
    pub fn can_undo(&self) -> bool {
        !self.undo.is_empty() && self.composition.is_none()
    }

    /// Returns whether a redo operation is available.
    #[must_use]
    pub fn can_redo(&self) -> bool {
        !self.redo.is_empty() && self.composition.is_none()
    }

    /// Returns how many undo steps are retained, after grouping.
    ///
    /// This is the observable that makes grouping diagnosable: a burst of
    /// twenty keystrokes must leave one step, not twenty.
    #[must_use]
    pub fn undo_depth(&self) -> usize {
        self.undo.len()
    }

    /// Returns how many redo steps are retained.
    #[must_use]
    pub fn redo_depth(&self) -> usize {
        self.redo.len()
    }

    /// Revalidates the active value against a new policy without changing revision.
    ///
    /// Existing undo entries remain valid; history is trimmed to the new budgets.
    pub fn reconfigure(&mut self, config: EditConfig) -> Result<(), EditError> {
        validate_value(&config, &self.text, &self.index)?;
        self.config = config;
        while self.undo.len() > config.max_history_entries
            || self.undo_bytes > config.max_history_bytes
        {
            let removed = self.undo.pop_front().expect("history is non-empty");
            self.undo_bytes -= removed.retained_bytes;
        }
        while self.redo.len() > config.max_history_entries
            || self.redo_bytes > config.max_history_bytes
        {
            let removed = self.redo.pop_front().expect("history is non-empty");
            self.redo_bytes -= removed.retained_bytes;
        }
        if self.undo.is_empty() {
            self.undo_anchor = UndoAnchor::None;
        }
        Ok(())
    }

    /// Applies one exact-base-revision command atomically.
    pub fn apply(&mut self, command: EditCommand) -> Result<EditTransaction, EditError> {
        if command.base_revision != self.revision {
            return Err(EditError::StaleRevision {
                current: self.revision,
                supplied: command.base_revision,
            });
        }
        let next_revision = self
            .revision
            .checked_add(1)
            .ok_or(EditError::RevisionOverflow)?;
        let base_length = self.index.utf16_len();
        self.pending_map = None;
        self.marks_dirty = false;
        if self.composition.is_some()
            && matches!(
                command.intent,
                EditIntent::Replace { .. }
                    | EditIntent::Insert(_)
                    | EditIntent::DeleteBackward
                    | EditIntent::DeleteForward
                    | EditIntent::Undo
                    | EditIntent::Redo
            )
        {
            return Err(EditError::CompositionActive);
        }

        let (delta, kind) = match command.intent {
            EditIntent::Replace { range, text } => {
                let prepared = self.prepare_replacement(range, text, None)?;
                let delta = prepared.forward.clone();
                self.commit_regular(prepared, GroupKind::Opaque)?;
                (Some(delta), TransactionKind::Edit)
            }
            EditIntent::Insert(text) => {
                let prepared = self.prepare_replacement(self.selection.range(), text, None)?;
                let delta = prepared.forward.clone();
                let group = if prepared.forward.range.is_collapsed() {
                    GroupKind::Insert
                } else {
                    GroupKind::Opaque
                };
                self.commit_regular(prepared, group)?;
                (Some(delta), TransactionKind::Edit)
            }
            EditIntent::DeleteBackward => {
                let range = if self.selection.is_collapsed() {
                    let caret = self.selection.focus.offset;
                    Utf16Range::new(self.index.previous(caret)?, caret)
                } else {
                    self.selection.range()
                };
                let prepared = self.prepare_replacement(range, String::new(), None)?;
                let delta = prepared.forward.clone();
                self.commit_regular(prepared, GroupKind::DeleteBackward)?;
                (Some(delta), TransactionKind::Edit)
            }
            EditIntent::DeleteForward => {
                let range = if self.selection.is_collapsed() {
                    let caret = self.selection.focus.offset;
                    Utf16Range::new(caret, self.index.next(caret)?)
                } else {
                    self.selection.range()
                };
                let prepared = self.prepare_replacement(range, String::new(), None)?;
                let delta = prepared.forward.clone();
                self.commit_regular(prepared, GroupKind::DeleteForward)?;
                (Some(delta), TransactionKind::Edit)
            }
            EditIntent::SetSelection(selection) => {
                let next = self.index.normalize_selection(selection)?;
                if next != self.selection {
                    // Moving the caret ends the burst: the next keystroke is a
                    // separate user intention even though nothing else changed.
                    // It also disarms a pending mark, which by definition only
                    // applies where the caret was when the Shell armed it.
                    self.undo_anchor = UndoAnchor::None;
                    self.pending_mark = None;
                }
                self.selection = next;
                (None, TransactionKind::Edit)
            }
            EditIntent::BeginComposition => {
                if self.composition.is_some() {
                    return Err(EditError::CompositionAlreadyActive);
                }
                let range = self.index.normalize_range(self.selection.range())?;
                let original_text = self.slice(range)?.to_owned();
                let original_marks = self.marks.slice(range)?;
                self.composition = Some(Composition {
                    original_range: range,
                    current_range: range,
                    original_text,
                    original_marks,
                    original_selection: self.selection,
                });
                self.undo_anchor = UndoAnchor::None;
                (None, TransactionKind::Composition)
            }
            EditIntent::UpdateComposition(text) => {
                let composition = self
                    .composition
                    .clone()
                    .ok_or(EditError::CompositionNotActive)?;
                let prepared = self.prepare_replacement(composition.current_range, text, None)?;
                let delta = prepared.forward.clone();
                let next_range = range_after(&prepared.forward)?;
                self.commit_prepared(prepared);
                self.composition
                    .as_mut()
                    .expect("composition validated before replacement")
                    .current_range = next_range;
                (Some(delta), TransactionKind::Composition)
            }
            EditIntent::CommitComposition(final_text) => {
                let mut composition = self
                    .composition
                    .clone()
                    .ok_or(EditError::CompositionNotActive)?;
                let delta = if let Some(text) = final_text {
                    let prepared =
                        self.prepare_replacement(composition.current_range, text, None)?;
                    let delta = prepared.forward.clone();
                    composition.current_range = range_after(&prepared.forward)?;
                    self.commit_prepared(prepared);
                    Some(delta)
                } else {
                    None
                };
                let final_text = self.slice(composition.current_range)?.to_owned();
                let final_marks = self.marks.slice(composition.current_range)?;
                let forward = EditDelta {
                    range: composition.original_range,
                    text: final_text,
                };
                let inverse = EditDelta {
                    range: composition.current_range,
                    text: composition.original_text,
                };
                if forward.text != inverse.text || forward.range != inverse.range {
                    let entry = HistoryEntry::new(
                        forward,
                        inverse,
                        final_marks,
                        composition.original_marks,
                        composition.original_selection,
                        self.selection,
                    );
                    self.push_undo(entry);
                    self.clear_redo();
                }
                self.composition = None;
                (delta, TransactionKind::Composition)
            }
            EditIntent::CancelComposition => {
                let composition = self
                    .composition
                    .clone()
                    .ok_or(EditError::CompositionNotActive)?;
                let prepared = self.prepare_replacement(
                    composition.current_range,
                    composition.original_text,
                    Some(composition.original_marks),
                )?;
                let delta = prepared.forward.clone();
                self.commit_prepared(prepared);
                self.selection = composition.original_selection;
                self.composition = None;
                (Some(delta), TransactionKind::Composition)
            }
            EditIntent::SetMarks { range, style, font } => {
                let range = self.index.normalize_range(range)?;
                let text = self.slice(range)?.to_owned();
                let span = MarkRuns::uniform(range.end - range.start, style, font);
                let mut prepared = self.prepare_replacement(range, text, Some(span))?;
                // Styling text does not move the caret, so the transaction has
                // to keep the selection the user still has.
                prepared.after_selection = self.selection;
                self.commit_regular(prepared, GroupKind::Opaque)?;
                (None, TransactionKind::Edit)
            }
            EditIntent::SetPendingMark(mark) => {
                self.pending_mark = mark;
                (None, TransactionKind::Edit)
            }
            EditIntent::BreakUndoGroup => {
                self.undo_anchor = UndoAnchor::None;
                (None, TransactionKind::Edit)
            }
            EditIntent::Undo => {
                // An empty history is an ordinary key press, not an error. It
                // must still consume the revision: the input surface bumps its
                // optimistic revision when it sends the command, and only this
                // transaction's acknowledgement keeps the two in step. Skipping
                // the command desynchronizes every edit that follows.
                self.undo_anchor = UndoAnchor::None;
                let Some(entry) = self.undo.back() else {
                    // No text or selection change; only the revision advances.
                    return Ok(self.finish_no_op(next_revision, TransactionKind::Undo));
                };
                let prepared = self.prepare_replacement(
                    entry.inverse.range,
                    entry.inverse.text.clone(),
                    Some(entry.inverse_marks.clone()),
                )?;
                let delta = prepared.forward.clone();
                let entry = self.undo.pop_back().expect("history entry validated");
                self.undo_bytes -= entry.retained_bytes;
                self.commit_prepared(prepared);
                self.selection = entry.before_selection;
                self.redo_bytes += entry.retained_bytes;
                self.redo.push_back(entry);
                (Some(delta), TransactionKind::Undo)
            }
            EditIntent::Redo => {
                self.undo_anchor = UndoAnchor::None;
                let Some(entry) = self.redo.back() else {
                    return Ok(self.finish_no_op(next_revision, TransactionKind::Redo));
                };
                let prepared = self.prepare_replacement(
                    entry.forward.range,
                    entry.forward.text.clone(),
                    Some(entry.forward_marks.clone()),
                )?;
                let delta = prepared.forward.clone();
                let entry = self.redo.pop_back().expect("redo entry validated");
                self.redo_bytes -= entry.retained_bytes;
                self.commit_prepared(prepared);
                self.selection = entry.after_selection;
                self.undo_bytes += entry.retained_bytes;
                self.undo.push_back(entry);
                (Some(delta), TransactionKind::Redo)
            }
        };

        let base_revision = self.revision;
        self.revision = next_revision;
        if delta.is_some() {
            self.text_revision = next_revision;
        }
        let map = self
            .pending_map
            .take()
            .unwrap_or_else(|| PositionMap::identity(base_length));
        let marks = self.marks_dirty.then(|| self.marks.clone());
        self.marks_dirty = false;
        Ok(EditTransaction {
            base_revision,
            revision: next_revision,
            delta,
            selection: self.selection,
            composition: self.composition_range(),
            kind,
            map,
            marks,
        })
    }

    /// Consumes the revision without changing any state.
    ///
    /// Undo or redo on an empty history lands here: the input surface has
    /// already bumped its optimistic revision for the command it sent, so the
    /// command must produce an acknowledging transaction even though it changes
    /// nothing — dropping it would desynchronize every edit that follows.
    fn finish_no_op(&mut self, next_revision: u64, kind: TransactionKind) -> EditTransaction {
        let base_revision = self.revision;
        self.revision = next_revision;
        EditTransaction {
            base_revision,
            revision: next_revision,
            delta: None,
            selection: self.selection,
            composition: self.composition_range(),
            kind,
            map: PositionMap::identity(self.index.utf16_len()),
            marks: None,
        }
    }

    /// Applies a strictly newer authoritative Shell value and clears local history.
    pub fn apply_external(
        &mut self,
        external: ExternalValue,
    ) -> Result<EditTransaction, EditError> {
        if external.revision <= self.revision {
            return Err(EditError::StaleRevision {
                current: self.revision,
                supplied: external.revision,
            });
        }
        let index = TextIndex::new(&external.text)?;
        validate_value(&self.config, &external.text, &index)?;
        let marks = normalize_marks(external.marks, index.utf16_len())?;
        let selection = index.normalize_selection(external.selection)?;
        let base_revision = self.revision;
        let map = PositionMap::from_replacement(
            Utf16Range::new(0, self.index.utf16_len()),
            index.utf16_len(),
            self.index.utf16_len(),
        )?;
        let delta = EditDelta {
            range: Utf16Range::new(0, self.index.utf16_len()),
            text: external.text.clone(),
        };
        self.text = external.text;
        self.index = index;
        self.marks = marks;
        self.pending_mark = None;
        self.selection = selection;
        self.composition = None;
        self.revision = external.revision;
        self.text_revision = external.revision;
        self.undo.clear();
        self.redo.clear();
        self.undo_bytes = 0;
        self.redo_bytes = 0;
        self.undo_anchor = UndoAnchor::None;
        self.pending_map = None;
        self.marks_dirty = false;
        Ok(EditTransaction {
            base_revision,
            revision: self.revision,
            delta: Some(delta),
            selection: self.selection,
            composition: None,
            kind: TransactionKind::External,
            map,
            marks: Some(self.marks.clone()),
        })
    }

    fn prepare_replacement(
        &self,
        range: Utf16Range,
        inserted: String,
        inserted_marks: Option<MarkRuns>,
    ) -> Result<PreparedReplacement, EditError> {
        let range = self.index.normalize_range(range)?;
        let start = self
            .index
            .utf16_to_utf8(range.start, OffsetBias::Backward)?;
        let end = self.index.utf16_to_utf8(range.end, OffsetBias::Forward)?;
        let removed = self.text[start..end].to_owned();
        let mut next_text = String::with_capacity(self.text.len() - (end - start) + inserted.len());
        next_text.push_str(&self.text[..start]);
        next_text.push_str(&inserted);
        next_text.push_str(&self.text[end..]);
        let next_index = TextIndex::new(&next_text)?;
        validate_value(&self.config, &next_text, &next_index)?;
        let inserted_units = utf16_units(&inserted)?;
        let inserted_end = range
            .start
            .checked_add(inserted_units)
            .ok_or(EditError::OffsetOverflow)?;
        // Typing at a boundary continues the run it was touching unless the
        // Shell has armed a different style, which is what "turn bold on and
        // type" means.
        let forward_marks = match inserted_marks {
            Some(marks) if marks.length() == inserted_units => marks,
            Some(_) => {
                return Err(EditError::InvalidMarkRuns {
                    covered: 0,
                    text_len: inserted_units,
                });
            }
            None => {
                let (style, font) = self.pending_mark.unwrap_or_else(|| {
                    let run = self.marks.run_at(range.start, MarkSide::Before);
                    (run.style, run.font)
                });
                MarkRuns::uniform(inserted_units, style, font)
            }
        };
        let inverse_marks = self.marks.slice(range)?;
        let next_marks = self.marks.replace(range, &forward_marks)?;
        // A replacement that puts back the same text moves nothing, and a
        // mark change is exactly that. Reporting a replaced span there would
        // collapse every Shell anchor inside it onto one edge.
        let map = if removed == inserted {
            PositionMap::identity(self.index.utf16_len())
        } else {
            PositionMap::from_replacement(range, inserted_units, self.index.utf16_len())?
        };
        let after_selection = Selection::collapsed(inserted_end);
        let text_changed = next_text != self.text;
        let marks_changed = next_marks != self.marks;
        Ok(PreparedReplacement {
            next_text,
            next_index,
            next_marks,
            forward: EditDelta {
                range,
                text: inserted,
            },
            inverse: EditDelta {
                range: Utf16Range::new(range.start, inserted_end),
                text: removed,
            },
            forward_marks,
            inverse_marks,
            map,
            after_selection,
            text_changed,
            marks_changed,
        })
    }

    fn commit_regular(
        &mut self,
        prepared: PreparedReplacement,
        group: GroupKind,
    ) -> Result<(), EditError> {
        if !prepared.text_changed && !prepared.marks_changed {
            // Backspace at offset zero and friends: nothing happened, so the
            // burst in progress must survive untouched.
            self.commit_prepared(prepared);
            return Ok(());
        }
        let entry = HistoryEntry::new(
            prepared.forward.clone(),
            prepared.inverse.clone(),
            prepared.forward_marks.clone(),
            prepared.inverse_marks.clone(),
            self.selection,
            prepared.after_selection,
        );
        let anchor = self.next_anchor(group, &entry)?;
        let merged = self.config.group_undo && self.try_merge(group, &entry)?;
        self.commit_prepared(prepared);
        if !merged {
            self.push_undo(entry);
        }
        self.clear_redo();
        self.undo_anchor = anchor;
        Ok(())
    }

    /// Returns the anchor the next command must line up with to continue this
    /// burst, or [`UndoAnchor::None`] when the entry seals its group.
    fn next_anchor(&self, group: GroupKind, entry: &HistoryEntry) -> Result<UndoAnchor, EditError> {
        if self.config.max_history_entries == 0 {
            return Ok(UndoAnchor::None);
        }
        Ok(match group {
            GroupKind::Insert => match text_class(&entry.forward.text) {
                Some(class) => UndoAnchor::Insert {
                    caret: entry.after_selection.focus.offset,
                    class,
                },
                None => UndoAnchor::None,
            },
            GroupKind::DeleteBackward => match text_class(&entry.inverse.text) {
                Some(class) => UndoAnchor::DeleteBackward {
                    start: entry.forward.range.start,
                    class,
                },
                None => UndoAnchor::None,
            },
            GroupKind::DeleteForward => match text_class(&entry.inverse.text) {
                Some(class) => UndoAnchor::DeleteForward {
                    caret: entry.forward.range.start,
                    class,
                },
                None => UndoAnchor::None,
            },
            GroupKind::Opaque => UndoAnchor::None,
        })
    }

    /// Folds `entry` into the top of the undo stack when the two are adjacent
    /// and of the same class, returning whether the fold happened.
    ///
    /// The merged entry has to undo to exactly the state the first command of
    /// the burst started from, so it keeps the first entry's `before_selection`
    /// and rewrites both deltas rather than storing a list of steps.
    fn try_merge(&mut self, group: GroupKind, entry: &HistoryEntry) -> Result<bool, EditError> {
        let Some(previous) = self.undo.back() else {
            return Ok(false);
        };
        let merged = match (group, self.undo_anchor) {
            (GroupKind::Insert, UndoAnchor::Insert { caret, class })
                if entry.forward.range.is_collapsed()
                    && entry.forward.range.start == caret
                    && text_class(&entry.forward.text) == Some(class) =>
            {
                let mut text = previous.forward.text.clone();
                text.push_str(&entry.forward.text);
                let end = previous
                    .inverse
                    .range
                    .end
                    .checked_add(utf16_units(&entry.forward.text)?)
                    .ok_or(EditError::OffsetOverflow)?;
                let mut forward_marks = previous.forward_marks.clone();
                forward_marks = forward_marks.replace(
                    Utf16Range::collapsed(forward_marks.length()),
                    &entry.forward_marks,
                )?;
                HistoryEntry::new(
                    EditDelta {
                        range: previous.forward.range,
                        text,
                    },
                    EditDelta {
                        range: Utf16Range::new(previous.inverse.range.start, end),
                        text: previous.inverse.text.clone(),
                    },
                    forward_marks,
                    previous.inverse_marks.clone(),
                    previous.before_selection,
                    entry.after_selection,
                )
            }
            (GroupKind::DeleteBackward, UndoAnchor::DeleteBackward { start, class })
                if entry.forward.range.end == start
                    && text_class(&entry.inverse.text) == Some(class) =>
            {
                let mut restored = entry.inverse.text.clone();
                restored.push_str(&previous.inverse.text);
                let restored_marks = entry.inverse_marks.replace(
                    Utf16Range::collapsed(entry.inverse_marks.length()),
                    &previous.inverse_marks,
                )?;
                HistoryEntry::new(
                    EditDelta {
                        range: Utf16Range::new(
                            entry.forward.range.start,
                            previous.forward.range.end,
                        ),
                        text: String::new(),
                    },
                    EditDelta {
                        range: Utf16Range::collapsed(entry.forward.range.start),
                        text: restored,
                    },
                    MarkRuns::default(),
                    restored_marks,
                    previous.before_selection,
                    entry.after_selection,
                )
            }
            (GroupKind::DeleteForward, UndoAnchor::DeleteForward { caret, class })
                if entry.forward.range.start == caret
                    && text_class(&entry.inverse.text) == Some(class) =>
            {
                let mut restored = previous.inverse.text.clone();
                restored.push_str(&entry.inverse.text);
                let restored_marks = previous.inverse_marks.replace(
                    Utf16Range::collapsed(previous.inverse_marks.length()),
                    &entry.inverse_marks,
                )?;
                let width = entry
                    .forward
                    .range
                    .end
                    .checked_sub(entry.forward.range.start)
                    .ok_or(EditError::OffsetOverflow)?;
                let end = previous
                    .forward
                    .range
                    .end
                    .checked_add(width)
                    .ok_or(EditError::OffsetOverflow)?;
                HistoryEntry::new(
                    EditDelta {
                        range: Utf16Range::new(previous.forward.range.start, end),
                        text: String::new(),
                    },
                    EditDelta {
                        range: Utf16Range::collapsed(previous.forward.range.start),
                        text: restored,
                    },
                    MarkRuns::default(),
                    restored_marks,
                    previous.before_selection,
                    entry.after_selection,
                )
            }
            _ => return Ok(false),
        };
        if merged.retained_bytes > self.config.max_history_bytes {
            // The burst outgrew the budget; keep the sealed entry and let the
            // new command start its own group instead of evicting silently.
            return Ok(false);
        }
        let replaced = self.undo.pop_back().expect("history entry validated");
        self.undo_bytes -= replaced.retained_bytes;
        self.undo_bytes += merged.retained_bytes;
        self.undo.push_back(merged);
        Ok(true)
    }

    fn commit_prepared(&mut self, prepared: PreparedReplacement) {
        self.text = prepared.next_text;
        self.index = prepared.next_index;
        self.marks_dirty |= prepared.marks_changed;
        self.marks = prepared.next_marks;
        self.selection = prepared.after_selection;
        if prepared.text_changed {
            self.pending_mark = None;
        }
        self.pending_map = Some(prepared.map);
    }

    fn slice(&self, range: Utf16Range) -> Result<&str, EditError> {
        let range = self.index.normalize_range(range)?;
        let start = self
            .index
            .utf16_to_utf8(range.start, OffsetBias::Backward)?;
        let end = self.index.utf16_to_utf8(range.end, OffsetBias::Forward)?;
        Ok(&self.text[start..end])
    }

    fn push_undo(&mut self, entry: HistoryEntry) {
        self.undo_anchor = UndoAnchor::None;
        if self.config.max_history_entries == 0
            || entry.retained_bytes > self.config.max_history_bytes
        {
            self.undo.clear();
            self.undo_bytes = 0;
            return;
        }
        self.undo_bytes += entry.retained_bytes;
        self.undo.push_back(entry);
        while self.undo.len() > self.config.max_history_entries
            || self.undo_bytes > self.config.max_history_bytes
        {
            let removed = self.undo.pop_front().expect("history is non-empty");
            self.undo_bytes -= removed.retained_bytes;
        }
    }

    fn clear_redo(&mut self) {
        self.redo.clear();
        self.redo_bytes = 0;
    }
}

impl HistoryEntry {
    fn new(
        forward: EditDelta,
        inverse: EditDelta,
        forward_marks: MarkRuns,
        inverse_marks: MarkRuns,
        before_selection: Selection,
        after_selection: Selection,
    ) -> Self {
        let retained_bytes = forward.text.len()
            + inverse.text.len()
            + (forward_marks.runs().len() + inverse_marks.runs().len())
                * size_of::<crate::MarkRun>();
        Self {
            forward,
            inverse,
            forward_marks,
            inverse_marks,
            before_selection,
            after_selection,
            retained_bytes,
        }
    }
}

fn normalize_marks(marks: Option<MarkRuns>, length: u32) -> Result<MarkRuns, EditError> {
    match marks {
        Some(marks) if marks.length() == length => Ok(marks),
        Some(marks) => Err(EditError::InvalidMarkRuns {
            covered: marks.length(),
            text_len: length,
        }),
        None => Ok(MarkRuns::plain(length)),
    }
}

fn range_after(delta: &EditDelta) -> Result<Utf16Range, EditError> {
    let units =
        u32::try_from(delta.text.encode_utf16().count()).map_err(|_| EditError::OffsetOverflow)?;
    let end = delta
        .range
        .start
        .checked_add(units)
        .ok_or(EditError::OffsetOverflow)?;
    Ok(Utf16Range::new(delta.range.start, end))
}

fn validate_value(config: &EditConfig, text: &str, index: &TextIndex) -> Result<(), EditError> {
    if !config.multiline
        && text
            .chars()
            .any(|character| matches!(character, '\n' | '\r'))
    {
        return Err(EditError::NewlineNotAllowed);
    }
    if text.len() > config.max_utf8_bytes {
        return Err(EditError::TextByteLimitExceeded {
            actual: text.len(),
            maximum: config.max_utf8_bytes,
        });
    }
    if index.grapheme_count() > config.max_graphemes {
        return Err(EditError::GraphemeLimitExceeded {
            actual: index.grapheme_count(),
            maximum: config.max_graphemes,
        });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use proptest::prelude::*;

    use super::*;
    use crate::{MapBias, MarkRun, Utf16Position};

    fn session(text: &str, selection: Selection) -> EditSession {
        EditSession::new(text.to_owned(), selection, 0, EditConfig::default()).expect("session")
    }

    fn apply(session: &mut EditSession, intent: EditIntent) -> EditTransaction {
        session
            .apply(EditCommand {
                base_revision: session.revision(),
                intent,
            })
            .expect("accepted command")
    }

    #[test]
    fn stale_command_cannot_overwrite_newer_input() {
        let mut editor = session("", Selection::collapsed(0));
        apply(&mut editor, EditIntent::Insert("a".to_owned()));
        let before = (
            editor.text().to_owned(),
            editor.selection(),
            editor.revision(),
        );
        assert_eq!(
            editor.apply(EditCommand {
                base_revision: 0,
                intent: EditIntent::Insert("stale".to_owned()),
            }),
            Err(EditError::StaleRevision {
                current: 1,
                supplied: 0,
            })
        );
        assert_eq!(
            (
                editor.text().to_owned(),
                editor.selection(),
                editor.revision()
            ),
            before
        );
    }

    #[test]
    fn backward_delete_removes_one_extended_grapheme() {
        let value = "a\u{301}👨‍👩‍👧‍👦";
        let end = value.encode_utf16().count() as u32;
        let mut editor = session(value, Selection::collapsed(end));
        apply(&mut editor, EditIntent::DeleteBackward);
        assert_eq!(editor.text(), "a\u{301}");
        apply(&mut editor, EditIntent::DeleteBackward);
        assert_eq!(editor.text(), "");
    }

    #[test]
    fn composition_updates_commit_as_one_undo_unit() {
        let mut editor = session(
            "ab",
            Selection {
                anchor: Utf16Position::new(1),
                focus: Utf16Position::new(2),
            },
        );
        apply(&mut editor, EditIntent::BeginComposition);
        apply(&mut editor, EditIntent::UpdateComposition("に".to_owned()));
        apply(
            &mut editor,
            EditIntent::UpdateComposition("日本".to_owned()),
        );
        apply(&mut editor, EditIntent::CommitComposition(None));
        assert_eq!(editor.text(), "a日本");
        assert!(editor.can_undo());
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "ab");
        assert!(!editor.can_undo());
        apply(&mut editor, EditIntent::Redo);
        assert_eq!(editor.text(), "a日本");
    }

    #[test]
    fn composition_matrix_covers_combining_zwj_rtl_and_multi_segment_cjk() {
        // Combining sequence: the composed grapheme deletes as one unit.
        let mut editor = session("x", Selection::collapsed(1));
        apply(&mut editor, EditIntent::BeginComposition);
        apply(&mut editor, EditIntent::UpdateComposition("e".to_owned()));
        apply(
            &mut editor,
            EditIntent::UpdateComposition("e\u{301}".to_owned()),
        );
        apply(&mut editor, EditIntent::CommitComposition(None));
        assert_eq!(editor.text(), "xe\u{301}");
        apply(&mut editor, EditIntent::DeleteBackward);
        assert_eq!(editor.text(), "x");

        // Emoji ZWJ family commits, deletes, and undoes as a single grapheme.
        let mut editor = session("", Selection::collapsed(0));
        apply(&mut editor, EditIntent::BeginComposition);
        apply(
            &mut editor,
            EditIntent::UpdateComposition("👨\u{200d}👩\u{200d}👧\u{200d}👦".to_owned()),
        );
        apply(&mut editor, EditIntent::CommitComposition(None));
        assert_eq!(editor.text(), "👨\u{200d}👩\u{200d}👧\u{200d}👦");
        apply(&mut editor, EditIntent::DeleteBackward);
        assert_eq!(editor.text(), "");
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "👨\u{200d}👩\u{200d}👧\u{200d}👦");
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "");

        // RTL Hebrew edits stay logical-order and grapheme-safe.
        let mut editor = session("שלום", Selection::collapsed(4));
        apply(&mut editor, EditIntent::Insert(" עולם".to_owned()));
        assert_eq!(editor.text(), "שלום עולם");
        apply(&mut editor, EditIntent::DeleteBackward);
        assert_eq!(editor.text(), "שלום עול");
        assert_eq!(
            crate::word_range_utf16(editor.text(), 1).expect("rtl word"),
            (0, 4)
        );

        // Multi-segment CJK conversion: every candidate swap stays one
        // temporary state and the final commit is one undo unit.
        let mut editor = session("说：", Selection::collapsed(1));
        let base_revision = editor.revision();
        apply(&mut editor, EditIntent::BeginComposition);
        for candidate in ["ni", "ni hao", "你好", "妳好", "你好世界"] {
            apply(
                &mut editor,
                EditIntent::UpdateComposition((*candidate).to_owned()),
            );
            assert!(editor.composition_range().is_some());
        }
        apply(
            &mut editor,
            EditIntent::CommitComposition(Some("你好世界".to_owned())),
        );
        assert_eq!(editor.text(), "说你好世界：");
        assert!(editor.revision() > base_revision);
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "说：");
        assert!(!editor.can_undo());
    }

    #[test]
    fn cancel_composition_restores_value_and_selection() {
        let original_selection = Selection::collapsed(1);
        let mut editor = session("ab", original_selection);
        apply(&mut editor, EditIntent::BeginComposition);
        apply(
            &mut editor,
            EditIntent::UpdateComposition("候補".to_owned()),
        );
        apply(&mut editor, EditIntent::CancelComposition);
        assert_eq!(editor.text(), "ab");
        assert_eq!(editor.selection(), original_selection);
        assert!(!editor.can_undo());
    }

    #[test]
    fn newer_external_value_cancels_composition_and_history() {
        let mut editor = session("old", Selection::collapsed(3));
        apply(&mut editor, EditIntent::Insert("!".to_owned()));
        apply(&mut editor, EditIntent::BeginComposition);
        let current = editor.revision();
        editor
            .apply_external(ExternalValue {
                revision: current + 10,
                text: "server".to_owned(),
                selection: Selection::collapsed(6),
                marks: None,
            })
            .expect("newer external state");
        assert_eq!(editor.text(), "server");
        assert_eq!(editor.composition_range(), None);
        assert!(!editor.can_undo());
        assert_eq!(
            editor.apply_external(ExternalValue {
                revision: current,
                text: "stale".to_owned(),
                selection: Selection::collapsed(0),
                marks: None,
            }),
            Err(EditError::StaleRevision {
                current: current + 10,
                supplied: current,
            })
        );
    }

    #[test]
    fn typing_burst_collapses_into_one_undo_step() {
        let mut editor = session("", Selection::collapsed(0));
        for character in ["h", "e", "l", "l", "o"] {
            apply(&mut editor, EditIntent::Insert((*character).to_owned()));
        }
        assert_eq!(editor.text(), "hello");
        assert_eq!(editor.undo_depth(), 1);
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "");
        assert_eq!(editor.selection(), Selection::collapsed(0));
        apply(&mut editor, EditIntent::Redo);
        assert_eq!(editor.text(), "hello");
        assert_eq!(editor.selection(), Selection::collapsed(5));
    }

    #[test]
    fn class_change_caret_move_and_newline_seal_the_group() {
        // A class change ends the burst: "hello" and " " and "world" are three.
        let mut editor = session("", Selection::collapsed(0));
        for chunk in ["h", "i", " ", "y", "o"] {
            apply(&mut editor, EditIntent::Insert((*chunk).to_owned()));
        }
        assert_eq!(editor.undo_depth(), 3);
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "hi ");

        // Moving the caret ends the burst even though nothing else changed.
        let mut editor = session("ab", Selection::collapsed(2));
        apply(&mut editor, EditIntent::Insert("c".to_owned()));
        apply(
            &mut editor,
            EditIntent::SetSelection(Selection::collapsed(0)),
        );
        apply(&mut editor, EditIntent::Insert("z".to_owned()));
        assert_eq!(editor.text(), "zabc");
        assert_eq!(editor.undo_depth(), 2);

        // A newline is never absorbed into a burst.
        let mut editor = session("", Selection::collapsed(0));
        apply(&mut editor, EditIntent::Insert("a".to_owned()));
        apply(&mut editor, EditIntent::Insert("\n".to_owned()));
        apply(&mut editor, EditIntent::Insert("b".to_owned()));
        assert_eq!(editor.undo_depth(), 3);
    }

    #[test]
    fn deletion_bursts_group_per_direction_and_never_across_directions() {
        let mut editor = session("abcdef", Selection::collapsed(6));
        for _ in 0..3 {
            apply(&mut editor, EditIntent::DeleteBackward);
        }
        assert_eq!(editor.text(), "abc");
        assert_eq!(editor.undo_depth(), 1);
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "abcdef");
        assert_eq!(editor.selection(), Selection::collapsed(6));

        let mut editor = session("abcdef", Selection::collapsed(2));
        for _ in 0..3 {
            apply(&mut editor, EditIntent::DeleteForward);
        }
        assert_eq!(editor.text(), "abf");
        assert_eq!(editor.undo_depth(), 1);
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "abcdef");

        // Backspace then forward-delete are two intentions, so two steps.
        let mut editor = session("abcdef", Selection::collapsed(3));
        apply(&mut editor, EditIntent::DeleteBackward);
        apply(&mut editor, EditIntent::DeleteForward);
        assert_eq!(editor.text(), "abef");
        assert_eq!(editor.undo_depth(), 2);
    }

    #[test]
    fn an_input_rule_replacement_is_its_own_undo_step() {
        // Typing the closing delimiter, then the Shell rewriting the span, must
        // undo as two steps: the format first, the burst second.
        let mut editor = session("", Selection::collapsed(0));
        for chunk in ["*", "*"] {
            apply(&mut editor, EditIntent::Insert((*chunk).to_owned()));
        }
        apply(&mut editor, EditIntent::Insert("b".to_owned()));
        apply(&mut editor, EditIntent::Insert("*".to_owned()));
        apply(&mut editor, EditIntent::Insert("*".to_owned()));
        assert_eq!(editor.text(), "**b**");
        apply(
            &mut editor,
            EditIntent::Replace {
                range: Utf16Range::new(0, 5),
                text: "b".to_owned(),
            },
        );
        assert_eq!(editor.text(), "b");
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "**b**");
        // The following keystroke may not rejoin the replacement's group.
        let mut editor = session("x", Selection::collapsed(1));
        apply(
            &mut editor,
            EditIntent::Replace {
                range: Utf16Range::new(0, 1),
                text: "y".to_owned(),
            },
        );
        apply(&mut editor, EditIntent::Insert("z".to_owned()));
        assert_eq!(editor.undo_depth(), 2);
    }

    #[test]
    fn grouping_is_disabled_by_configuration_and_survives_history_budgets() {
        let ungrouped = EditConfig {
            group_undo: false,
            ..EditConfig::default()
        };
        let mut editor = EditSession::new(String::new(), Selection::collapsed(0), 0, ungrouped)
            .expect("session");
        for character in ["a", "b", "c"] {
            apply(&mut editor, EditIntent::Insert((*character).to_owned()));
        }
        assert_eq!(editor.undo_depth(), 3);

        // A burst that outgrows the retained-byte budget seals the group rather
        // than growing an entry past the budget. The sealed entry is then
        // evicted by the ordinary byte budget, so the value it restores is the
        // burst prefix, not the empty document.
        // The budget counts retained text plus the mark runs that restore its
        // styling, so it is stated in those units rather than in characters.
        let tight = EditConfig {
            max_history_bytes: 3 + size_of::<crate::MarkRun>(),
            ..EditConfig::default()
        };
        let mut editor =
            EditSession::new(String::new(), Selection::collapsed(0), 0, tight).expect("session");
        for character in ["a", "b", "c", "d"] {
            apply(&mut editor, EditIntent::Insert((*character).to_owned()));
        }
        assert_eq!(editor.text(), "abcd");
        assert_eq!(editor.undo_depth(), 1);
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "abc");
        assert!(!editor.can_undo());
    }

    #[test]
    fn composition_and_external_values_never_join_a_typing_burst() {
        let mut editor = session("", Selection::collapsed(0));
        apply(&mut editor, EditIntent::Insert("a".to_owned()));
        apply(&mut editor, EditIntent::BeginComposition);
        apply(&mut editor, EditIntent::UpdateComposition("b".to_owned()));
        apply(&mut editor, EditIntent::CommitComposition(None));
        apply(&mut editor, EditIntent::Insert("c".to_owned()));
        assert_eq!(editor.text(), "abc");
        assert_eq!(editor.undo_depth(), 3);
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "ab");
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "a");
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "");
    }

    #[test]
    fn typing_continues_the_run_the_caret_is_touching() {
        let mut editor = session("ab", Selection::collapsed(2));
        apply(
            &mut editor,
            EditIntent::SetMarks {
                range: Utf16Range::new(0, 2),
                style: 1,
                font: 0,
            },
        );
        assert_eq!(
            editor.marks().runs(),
            &[MarkRun {
                length: 2,
                style: 1,
                font: 0,
            }]
        );
        // The caret sits at the end of the bold run, so typing stays bold.
        apply(&mut editor, EditIntent::Insert("c".to_owned()));
        assert_eq!(
            editor.marks().runs(),
            &[MarkRun {
                length: 3,
                style: 1,
                font: 0,
            }]
        );

        // At offset zero there is no preceding run, so the following one
        // answers and the value stays one bold span. The Shell overrides that
        // with SetPendingMark when its schema wants the other reading.
        apply(
            &mut editor,
            EditIntent::SetSelection(Selection::collapsed(0)),
        );
        apply(&mut editor, EditIntent::Insert("x".to_owned()));
        assert_eq!(
            editor.marks().runs(),
            &[MarkRun {
                length: 4,
                style: 1,
                font: 0,
            }]
        );
        apply(
            &mut editor,
            EditIntent::SetSelection(Selection::collapsed(0)),
        );
        apply(&mut editor, EditIntent::SetPendingMark(Some((0, 0))));
        apply(&mut editor, EditIntent::Insert("y".to_owned()));
        assert_eq!(
            editor.marks().runs(),
            &[
                MarkRun {
                    length: 1,
                    style: 0,
                    font: 0,
                },
                MarkRun {
                    length: 4,
                    style: 1,
                    font: 0,
                },
            ]
        );
    }

    #[test]
    fn an_armed_mark_applies_to_the_next_insertion_and_then_disarms() {
        let mut editor = session("ab", Selection::collapsed(1));
        apply(&mut editor, EditIntent::SetPendingMark(Some((4, 0))));
        assert_eq!(editor.effective_mark(), (4, 0));
        apply(&mut editor, EditIntent::Insert("Z".to_owned()));
        assert_eq!(editor.text(), "aZb");
        assert_eq!(
            editor.marks().runs(),
            &[
                MarkRun {
                    length: 1,
                    style: 0,
                    font: 0,
                },
                MarkRun {
                    length: 1,
                    style: 4,
                    font: 0,
                },
                MarkRun {
                    length: 1,
                    style: 0,
                    font: 0,
                },
            ]
        );
        // The caret is now inside the styled run, so it stays armed by position
        // rather than by the one-shot request.
        assert_eq!(editor.effective_mark(), (4, 0));
        apply(
            &mut editor,
            EditIntent::SetSelection(Selection::collapsed(0)),
        );
        assert_eq!(editor.effective_mark(), (0, 0));
    }

    #[test]
    fn styling_neither_moves_the_caret_nor_moves_shell_anchors() {
        let selection = Selection {
            anchor: Utf16Position::new(1),
            focus: Utf16Position::new(4),
        };
        let mut editor = session("abcdef", selection);
        let transaction = apply(
            &mut editor,
            EditIntent::SetMarks {
                range: Utf16Range::new(1, 4),
                style: 2,
                font: 0,
            },
        );
        assert_eq!(editor.selection(), selection);
        assert_eq!(transaction.delta, None);
        assert!(transaction.map.is_identity(), "styling moves nothing");
        assert_eq!(
            transaction.marks.expect("marks changed").runs(),
            &[
                MarkRun {
                    length: 1,
                    style: 0,
                    font: 0,
                },
                MarkRun {
                    length: 3,
                    style: 2,
                    font: 0,
                },
                MarkRun {
                    length: 2,
                    style: 0,
                    font: 0,
                },
            ]
        );
        // And it is one undo step that restores the styling, not the text.
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "abcdef");
        assert_eq!(
            editor.marks().runs(),
            &[MarkRun {
                length: 6,
                style: 0,
                font: 0,
            }]
        );
        apply(&mut editor, EditIntent::Redo);
        assert_eq!(
            editor.marks().runs(),
            &[
                MarkRun {
                    length: 1,
                    style: 0,
                    font: 0,
                },
                MarkRun {
                    length: 3,
                    style: 2,
                    font: 0,
                },
                MarkRun {
                    length: 2,
                    style: 0,
                    font: 0,
                },
            ]
        );
    }

    #[test]
    fn undo_restores_marks_that_a_deletion_removed() {
        let mut editor = session("abcdef", Selection::collapsed(0));
        apply(
            &mut editor,
            EditIntent::SetMarks {
                range: Utf16Range::new(2, 4),
                style: 3,
                font: 0,
            },
        );
        apply(
            &mut editor,
            EditIntent::SetSelection(Selection {
                anchor: Utf16Position::new(1),
                focus: Utf16Position::new(5),
            }),
        );
        apply(&mut editor, EditIntent::DeleteBackward);
        assert_eq!(editor.text(), "af");
        assert_eq!(
            editor.marks().runs(),
            &[MarkRun {
                length: 2,
                style: 0,
                font: 0,
            }]
        );
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "abcdef");
        assert_eq!(
            editor.marks().runs(),
            &[
                MarkRun {
                    length: 2,
                    style: 0,
                    font: 0,
                },
                MarkRun {
                    length: 2,
                    style: 3,
                    font: 0,
                },
                MarkRun {
                    length: 2,
                    style: 0,
                    font: 0,
                },
            ]
        );
    }

    #[test]
    fn composition_across_a_mark_boundary_commits_and_cancels_cleanly() {
        // Preedit replaces a span that is half plain and half styled; the
        // committed text takes the style the caret was touching, and cancelling
        // puts the original two runs back exactly.
        let mut editor = session("abcd", Selection::collapsed(0));
        apply(
            &mut editor,
            EditIntent::SetMarks {
                range: Utf16Range::new(2, 4),
                style: 5,
                font: 0,
            },
        );
        apply(
            &mut editor,
            EditIntent::SetSelection(Selection {
                anchor: Utf16Position::new(1),
                focus: Utf16Position::new(3),
            }),
        );
        apply(&mut editor, EditIntent::BeginComposition);
        apply(&mut editor, EditIntent::UpdateComposition("に".to_owned()));
        apply(
            &mut editor,
            EditIntent::UpdateComposition("日本".to_owned()),
        );
        apply(&mut editor, EditIntent::CancelComposition);
        assert_eq!(editor.text(), "abcd");
        assert_eq!(
            editor.marks().runs(),
            &[
                MarkRun {
                    length: 2,
                    style: 0,
                    font: 0,
                },
                MarkRun {
                    length: 2,
                    style: 5,
                    font: 0,
                },
            ]
        );

        apply(&mut editor, EditIntent::BeginComposition);
        apply(
            &mut editor,
            EditIntent::UpdateComposition("日本".to_owned()),
        );
        apply(&mut editor, EditIntent::CommitComposition(None));
        assert_eq!(editor.text(), "a日本d");
        assert_eq!(editor.marks().length(), 4);
        apply(&mut editor, EditIntent::Undo);
        assert_eq!(editor.text(), "abcd");
        assert_eq!(
            editor.marks().runs(),
            &[
                MarkRun {
                    length: 2,
                    style: 0,
                    font: 0,
                },
                MarkRun {
                    length: 2,
                    style: 5,
                    font: 0,
                },
            ]
        );
    }

    proptest! {
        #[test]
        fn arbitrary_insert_delete_sequences_are_grapheme_safe_and_reversible(
            operations in prop::collection::vec((any::<bool>(), 0_usize..5), 0..100),
        ) {
            let corpus = ["a", "é", "a\u{301}", "👨‍👩‍👧‍👦", "日本"];
            let mut editor = session("", Selection::collapsed(0));
            let mut last_revision = editor.revision();
            for (insert, corpus_index) in operations {
                let intent = if insert {
                    EditIntent::Insert(corpus[corpus_index].to_owned())
                } else {
                    EditIntent::DeleteBackward
                };
                apply(&mut editor, intent);
                prop_assert!(editor.revision() > last_revision);
                last_revision = editor.revision();
                let focus = editor.selection().focus.offset;
                let byte = editor.text_index().utf16_to_utf8(focus, OffsetBias::Backward).expect("focus");
                prop_assert_eq!(editor.text_index().utf8_to_utf16(byte), Ok(focus));
            }
            let final_text = editor.text().to_owned();
            while editor.can_undo() {
                apply(&mut editor, EditIntent::Undo);
            }
            prop_assert_eq!(editor.text(), "");
            while editor.can_redo() {
                apply(&mut editor, EditIntent::Redo);
            }
            prop_assert_eq!(editor.text(), final_text);
        }

        #[test]
        fn grouping_only_changes_undo_granularity_never_reachable_states(
            operations in prop::collection::vec((0_usize..6, 0_usize..5), 0..80),
        ) {
            let corpus = ["a", "b", " ", ".", "日", "e\u{301}"];
            let intents: Vec<EditIntent> = operations
                .iter()
                .map(|(corpus_index, action)| match action {
                    0..=2 => EditIntent::Insert(corpus[*corpus_index].to_owned()),
                    3 => EditIntent::DeleteBackward,
                    4 => EditIntent::DeleteForward,
                    _ => unreachable!("action range is 0..5"),
                })
                .collect();

            let ungrouped_config = EditConfig {
                group_undo: false,
                ..EditConfig::default()
            };
            let mut ungrouped =
                EditSession::new(String::new(), Selection::collapsed(0), 0, ungrouped_config)
                    .expect("session");
            let mut grouped = session("", Selection::collapsed(0));
            // Every state the user actually passed through, newest last.
            let mut snapshots = vec![(String::new(), Selection::collapsed(0))];
            for intent in &intents {
                apply(&mut ungrouped, intent.clone());
                apply(&mut grouped, intent.clone());
                // Grouping must not change the forward path at all.
                prop_assert_eq!(grouped.text(), ungrouped.text());
                prop_assert_eq!(grouped.selection(), ungrouped.selection());
                snapshots.push((ungrouped.text().to_owned(), ungrouped.selection()));
            }
            let final_state = (grouped.text().to_owned(), grouped.selection());
            prop_assert!(grouped.undo_depth() <= ungrouped.undo_depth());

            // Undo may only land on states that existed, and must walk strictly
            // backwards through them until the document is empty again.
            let mut cursor = snapshots.len();
            while grouped.can_undo() {
                apply(&mut grouped, EditIntent::Undo);
                let state = (grouped.text().to_owned(), grouped.selection());
                let found = snapshots[..cursor]
                    .iter()
                    .rposition(|snapshot| *snapshot == state);
                prop_assert!(found.is_some(), "undo reached a state that never existed");
                cursor = found.expect("checked above");
            }
            prop_assert_eq!(grouped.text(), "");
            while grouped.can_redo() {
                apply(&mut grouped, EditIntent::Redo);
            }
            prop_assert_eq!((grouped.text().to_owned(), grouped.selection()), final_state);
        }

        #[test]
        fn the_map_carries_untouched_spans_onto_the_same_text(
            body in prop::collection::vec(prop::sample::select(&["a", "b", "c", "日", "e\u{301}"][..]), 0..24),
            start in 0_usize..24,
            span in 0_usize..24,
            replacement in prop::collection::vec(prop::sample::select(&["x", "y", "🙂"][..]), 0..6),
        ) {
            let text = body.concat();
            let mut editor = session(&text, Selection::collapsed(0));
            let length = editor.text_index().utf16_len();
            let start = u32::try_from(start).expect("small") % (length + 1);
            let end = start
                + u32::try_from(span).expect("small") % (length + 1 - start);
            let range = editor
                .text_index()
                .normalize_range(Utf16Range::new(start, end))
                .expect("range");
            let inserted = replacement.concat();
            let before = editor.text().to_owned();
            let transaction = apply(
                &mut editor,
                EditIntent::Replace {
                    range,
                    text: inserted,
                },
            );
            let after = editor.text().to_owned();
            let map = &transaction.map;
            prop_assert_eq!(map.old_length(), length);
            prop_assert_eq!(map.new_length(), editor.text_index().utf16_len());

            // A span that does not overlap the edit still delimits the exact
            // same characters after the map is applied. That is the whole
            // contract a link range or a comment anchor depends on.
            let units: Vec<u16> = before.encode_utf16().collect();
            let next_units: Vec<u16> = after.encode_utf16().collect();
            for anchor_start in 0..=length {
                for anchor_end in anchor_start..=length {
                    let disjoint = anchor_end <= range.start || anchor_start >= range.end;
                    // A span whose edge sits exactly where text was inserted
                    // deliberately grows to contain it, so it is not a
                    // content-preserving case. `map_range` pins that behavior.
                    let touches_insertion = range.is_collapsed()
                        && (anchor_start == range.start || anchor_end == range.start);
                    if !disjoint || touches_insertion {
                        continue;
                    }
                    let mapped = map.map_range(Utf16Range::new(anchor_start, anchor_end));
                    prop_assert_eq!(
                        &units[anchor_start as usize..anchor_end as usize],
                        &next_units[mapped.start as usize..mapped.end as usize],
                        "span {}..{} moved onto different text", anchor_start, anchor_end
                    );
                }
            }

            // Undoing produces the inverse journey: an offset strictly outside
            // the edit returns to exactly where it started. An offset on either
            // edge does not, and must not: with a left bias it deliberately
            // stays in front of whatever is re-inserted there.
            if editor.can_undo() {
                let undo = apply(&mut editor, EditIntent::Undo);
                for offset in 0..=length {
                    if offset >= range.start && offset <= range.end {
                        continue;
                    }
                    let round_trip = undo
                        .map
                        .map_offset(map.map_offset(offset, MapBias::Left), MapBias::Left);
                    prop_assert_eq!(round_trip, offset, "offset {} did not come back", offset);
                }
            }
        }

        #[test]
        fn the_mark_table_always_tiles_the_value(
            operations in prop::collection::vec((0_usize..5, 0_u32..12, 0_u32..12, 0_u32..3), 0..48),
        ) {
            let mut editor = session("seed text", Selection::collapsed(0));
            for (kind, first, second, style) in operations {
                let length = editor.text_index().utf16_len();
                let start = first % (length + 1);
                let end = start + second % (length + 1 - start);
                let intent = match kind {
                    0 => EditIntent::Insert("ab".to_owned()),
                    1 => EditIntent::DeleteBackward,
                    2 => EditIntent::DeleteForward,
                    3 => EditIntent::SetMarks {
                        range: Utf16Range::new(start, end),
                        style,
                        font: 0,
                    },
                    _ => EditIntent::SetSelection(Selection {
                        anchor: Utf16Position::new(start),
                        focus: Utf16Position::new(end),
                    }),
                };
                let transaction = apply(&mut editor, intent);
                prop_assert_eq!(
                    editor.marks().length(),
                    editor.text_index().utf16_len(),
                    "mark table stopped tiling the value"
                );
                for pair in editor.marks().runs().windows(2) {
                    prop_assert_ne!(pair[0].style, pair[1].style);
                }
                prop_assert!(editor.marks().runs().iter().all(|run| run.length > 0));
                if let Some(marks) = &transaction.marks {
                    prop_assert_eq!(marks, editor.marks());
                }
            }
            // Undoing everything restores the plain table it started from.
            while editor.can_undo() {
                apply(&mut editor, EditIntent::Undo);
            }
            prop_assert_eq!(editor.text(), "seed text");
            prop_assert_eq!(editor.marks(), &MarkRuns::plain(9));
        }

        #[test]
        fn replaying_the_same_intents_is_deterministic(
            operations in prop::collection::vec((any::<bool>(), 0_usize..3), 0..64),
        ) {
            let corpus = ["x", "🙂", "e\u{301}"];
            let mut first = session("", Selection::collapsed(0));
            let mut second = session("", Selection::collapsed(0));
            for (insert, corpus_index) in operations {
                let intent = if insert {
                    EditIntent::Insert(corpus[corpus_index].to_owned())
                } else {
                    EditIntent::DeleteBackward
                };
                let left = apply(&mut first, intent.clone());
                let right = apply(&mut second, intent);
                prop_assert_eq!(left, right);
                prop_assert_eq!(first.text(), second.text());
            }
        }
    }
}
