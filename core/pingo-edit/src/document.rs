use std::collections::VecDeque;

use crate::{
    Affinity, EditError, MarkRuns, OffsetBias, TextIndex, Utf16Range,
    session::{TextClass, text_class},
    word_boundary_utf16,
};

/// A Shell-assigned block identity, stable for the block's lifetime.
///
/// Core never interprets a key. Splitting a block produces a new key and
/// merging keeps the earlier one; that is the Shell's decision, and Core only
/// uses the key to tell one block from another across projections -- the same
/// role `getItemKey` plays in a virtual list.
pub type BlockKey = u64;

/// What the Shell has told Core about one block's contents.
///
/// This is the answer to whether Core's position space holds the whole
/// document: it holds every block's **length**, and only a materialized
/// block's **text**. Lengths are what the flat space and cross-block selection
/// need, and they are O(1) per block; text is what grapheme-safe movement and
/// partial deletion need, and only a block the user can see requires those.
/// A five-thousand-block document therefore costs Core one integer per
/// off-screen block rather than a second copy of the document.
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BlockContent {
    /// The Shell has materialized this block.
    Materialized {
        /// The block's UTF-8 value; empty for an atomic block.
        text: String,
        /// Mark table for that value, or `None` for the base style throughout.
        marks: Option<MarkRuns>,
    },
    /// The Shell knows only how long the block is.
    Placeholder {
        /// UTF-16 code-unit length the Shell declares.
        len_utf16: u32,
    },
}

/// One block of the Shell's projection.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BlockProjection {
    /// Stable identity.
    pub key: BlockKey,
    /// What Core knows about the block.
    pub content: BlockContent,
    /// Whether the caret may enter the block.
    ///
    /// An atomic block is an object, not text: arrow keys step over it and the
    /// only way to select it is as a whole. Core does not guess this from the
    /// block's contents, because "a code block is one object" is a schema
    /// decision and the schema lives in the Shell.
    pub atomic: bool,
}

impl BlockProjection {
    /// Creates a materialized text block.
    #[must_use]
    pub fn text(key: BlockKey, text: impl Into<String>, marks: Option<MarkRuns>) -> Self {
        Self {
            key,
            content: BlockContent::Materialized {
                text: text.into(),
                marks,
            },
            atomic: false,
        }
    }

    /// Creates a block the caret may not enter.
    #[must_use]
    pub fn object(key: BlockKey) -> Self {
        Self {
            key,
            content: BlockContent::Materialized {
                text: String::new(),
                marks: None,
            },
            atomic: true,
        }
    }

    /// Creates a block the Shell has not materialized yet.
    #[must_use]
    pub const fn placeholder(key: BlockKey, len_utf16: u32) -> Self {
        Self {
            key,
            content: BlockContent::Placeholder { len_utf16 },
            atomic: false,
        }
    }
}

/// One block's text, its offset table, and its marks.
///
/// Shared behind a pointer so cloning a document is a refcount bump per block
/// rather than a copy of every block's text and offset table. A five-thousand
/// block document is cloned once per keystroke -- input is applied to a
/// candidate that is only installed when the whole batch succeeds -- and
/// copying it there is what makes editing cost what the document costs.
#[derive(Clone, Debug, Eq, PartialEq)]
struct BlockText {
    text: String,
    index: TextIndex,
    marks: MarkRuns,
}

impl BlockText {
    /// The payload every unmaterialized block shares.
    fn empty() -> Result<Self, EditError> {
        Ok(Self {
            text: String::new(),
            index: TextIndex::new("")?,
            marks: MarkRuns::default(),
        })
    }
}

/// One block's Core-owned state.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DocumentBlock {
    key: BlockKey,
    content: std::sync::Arc<BlockText>,
    atomic: bool,
    /// Declared length, which is all Core knows about an unmaterialized block.
    len_utf16: u32,
    materialized: bool,
}

impl DocumentBlock {
    /// Returns the block's stable identity.
    #[must_use]
    pub const fn key(&self) -> BlockKey {
        self.key
    }

    /// Returns the block's UTF-8 value.
    #[must_use]
    pub fn text(&self) -> &str {
        &self.content.text
    }

    /// Returns the block's mark table.
    #[must_use]
    pub fn marks(&self) -> &MarkRuns {
        &self.content.marks
    }

    /// Returns the block's grapheme-safe offset table.
    fn index(&self) -> &TextIndex {
        &self.content.index
    }

    /// Returns whether the caret may not enter the block.
    #[must_use]
    pub const fn is_atomic(&self) -> bool {
        self.atomic
    }

    /// Returns the block's UTF-16 length, declared or measured.
    #[must_use]
    pub const fn len_utf16(&self) -> u32 {
        self.len_utf16
    }

    /// Returns whether the Shell has materialized this block's text.
    #[must_use]
    pub const fn is_materialized(&self) -> bool {
        self.materialized
    }

    /// Returns whether the caret may stand inside this block.
    ///
    /// An object has no text positions, and a placeholder has no text to put
    /// them on until the Shell sends it.
    #[must_use]
    pub const fn is_enterable(&self) -> bool {
        !self.atomic && self.materialized
    }
}

/// A caret position inside one block.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct DocumentPosition {
    /// Block the position belongs to.
    pub key: BlockKey,
    /// UTF-16 offset inside that block.
    pub offset: u32,
    /// Visual edge preference at a line wrap.
    pub affinity: Affinity,
}

impl DocumentPosition {
    /// Creates a downstream-affinity position.
    #[must_use]
    pub const fn new(key: BlockKey, offset: u32) -> Self {
        Self {
            key,
            offset,
            affinity: Affinity::Downstream,
        }
    }
}

/// What the user currently has selected.
///
/// Three kinds, not one. A document editor has to express "these characters",
/// "this object", and "the empty spot between two objects"; folding the last
/// two into a text range is what makes deleting a picture and typing between
/// two pictures impossible to express.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum DocumentSelection {
    /// A run of characters, possibly spanning blocks.
    Text {
        /// Fixed edge.
        anchor: DocumentPosition,
        /// Moving edge and caret location.
        focus: DocumentPosition,
    },
    /// One whole block selected as an object.
    Node {
        /// The selected block.
        key: BlockKey,
    },
    /// The caret between two blocks, where no block can hold it.
    Gap {
        /// Index of the block the gap precedes; the document length means the
        /// gap after the last block.
        before: usize,
    },
}

impl Default for DocumentSelection {
    fn default() -> Self {
        Self::Gap { before: 0 }
    }
}

/// Direction of a caret movement.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Direction {
    /// Toward the start of the document.
    Backward,
    /// Toward the end of the document.
    Forward,
}

/// How far one caret movement travels.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Granularity {
    /// One grapheme cluster, or one block boundary.
    Character,
    /// One word boundary.
    Word,
}

/// A flat integer position in the document's own coordinate space.
///
/// The space interleaves block boundaries with block content, so a single
/// integer can name "between these two blocks" as well as "here in this
/// block". Comparing two selections, or asking whether one contains the other,
/// is then integer comparison rather than a tree walk.
pub type FlatPosition = u32;

/// Core's position space over an ordered block sequence.
///
/// The Shell owns the tree; this owns where things are in it. That split is the
/// whole point of the design: Core never learns why a list nests, and the Shell
/// never has to reimplement caret movement.
#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct Document {
    blocks: Vec<DocumentBlock>,
    /// Flat position of each block's opening boundary, parallel to `blocks`.
    starts: Vec<FlatPosition>,
    length: FlatPosition,
    selection: DocumentSelection,
    /// The text an input method is still composing, if any.
    ///
    /// A composition never spans blocks: there is no candidate list that
    /// crosses a paragraph break, and letting one span the boundary would make
    /// the composing range meaningless the moment the block split. It lives
    /// here rather than in a per-block session so that undo stays document-wide
    /// and the block's text keeps one owner.
    composition: Option<Composition>,
    /// Blocks the caret wanted to be in but the Shell has not sent yet.
    pending_materialization: Vec<BlockKey>,
    undo: VecDeque<HistoryEntry>,
    redo: VecDeque<HistoryEntry>,
    undo_bytes: usize,
    redo_bytes: usize,
    /// Shape of the entry on top of `undo`, or `None` when the next edit has to
    /// start a fresh group.
    anchor: Option<UndoAnchor>,
    /// The next `apply_edit` is replaying history and must not record itself.
    replaying: bool,
}

/// One undoable step over the document.
///
/// Both directions are stored as replacements rather than as a diff to replay,
/// because undo has to restore the marks the edit removed as well as the text,
/// and a replacement already carries both.
#[derive(Clone, Debug, Eq, PartialEq)]
struct HistoryEntry {
    forward: Vec<BlockReplacement>,
    inverse: Vec<BlockReplacement>,
    before: DocumentSelection,
    after: DocumentSelection,
    retained_bytes: usize,
    /// The edit also asked the Shell to change the block structure.
    ///
    /// Core cannot put back a block it never created, so undo stops here rather
    /// than restoring text into a shape the document no longer has.
    structural: bool,
}

/// Where the last entry left the caret, so the next edit can join it.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct UndoAnchor {
    key: BlockKey,
    /// Caret offset the next insertion has to start at to continue the burst.
    offset: u32,
    class: TextClass,
}

/// Retained bytes of document history, matching the session's budget.
const UNDO_BUDGET_BYTES: usize = 1 << 20;

/// Text an input method is still composing, inside one block.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct Composition {
    /// Block the composition is anchored in.
    pub key: BlockKey,
    /// UTF-16 range the composing text currently occupies.
    pub range: Utf16Range,
}

impl Document {
    /// Builds a document from a projection.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::DuplicateBlockKey`] when two blocks share a key, or
    /// a mark error when a table does not tile its block.
    pub fn new(projection: Vec<BlockProjection>) -> Result<Self, EditError> {
        let mut document = Self::default();
        document.reproject(projection)?;
        Ok(document)
    }

    /// Replaces the block sequence, keeping the selection where it still exists.
    ///
    /// A selection whose block is gone falls back to the nearest position that
    /// does exist rather than being dropped: losing the caret because the Shell
    /// reflowed a paragraph is the kind of failure a user reads as the editor
    /// forgetting where they were.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::DuplicateBlockKey`] when two blocks share a key, or
    /// a mark error when a table does not tile its block.
    pub fn reproject(&mut self, projection: Vec<BlockProjection>) -> Result<(), EditError> {
        let mut blocks = Vec::with_capacity(projection.len());
        let mut seen = std::collections::BTreeSet::new();
        let empty = std::sync::Arc::new(BlockText::empty()?);
        for block in projection {
            if !seen.insert(block.key) {
                return Err(EditError::DuplicateBlockKey { key: block.key });
            }
            blocks.push(match block.content {
                BlockContent::Materialized { text, marks } => {
                    let index = TextIndex::new(&text)?;
                    let marks = match marks {
                        Some(marks) if marks.length() == index.utf16_len() => marks,
                        Some(marks) => {
                            return Err(EditError::InvalidMarkRuns {
                                covered: marks.length(),
                                text_len: index.utf16_len(),
                            });
                        }
                        None => MarkRuns::plain(index.utf16_len()),
                    };
                    DocumentBlock {
                        key: block.key,
                        len_utf16: index.utf16_len(),
                        content: std::sync::Arc::new(BlockText { text, index, marks }),
                        atomic: block.atomic,
                        materialized: true,
                    }
                }
                // Every placeholder shares one empty payload, so declaring a
                // five-thousand-block document allocates nothing per block.
                BlockContent::Placeholder { len_utf16 } => DocumentBlock {
                    key: block.key,
                    content: std::sync::Arc::clone(&empty),
                    atomic: block.atomic,
                    len_utf16,
                    materialized: false,
                },
            });
        }
        let previous = std::mem::replace(&mut self.blocks, blocks);
        self.rebuild_starts()?;
        self.selection = self.recover_selection(&previous);
        // A composing range describes offsets in a block the Shell may have
        // just replaced, split or removed. Keeping it would leave the input
        // method underlining text that is no longer the text it proposed.
        if let Some(composition) = self.composition {
            let survives = self
                .index_of(composition.key)
                .is_some_and(|index| self.blocks[index].len_utf16() >= composition.range.end);
            if !survives {
                self.composition = None;
            }
        }
        Ok(())
    }

    /// Returns the blocks in document order.
    #[must_use]
    pub fn blocks(&self) -> &[DocumentBlock] {
        &self.blocks
    }

    /// Returns the total size of the flat position space.
    #[must_use]
    pub const fn len(&self) -> FlatPosition {
        self.length
    }

    /// Returns whether the document has no blocks.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.blocks.is_empty()
    }

    /// Returns the active selection.
    #[must_use]
    pub const fn selection(&self) -> DocumentSelection {
        self.selection
    }

    /// Returns the blocks the caret needs but the Shell has not sent.
    ///
    /// A placeholder is a real position in the document, so the caret can be
    /// asked to go there; it just cannot move *within* one until the text
    /// arrives. Reporting the request is what turns that into one frame of
    /// latency instead of a caret that refuses to move.
    #[must_use]
    pub fn pending_materialization(&self) -> &[BlockKey] {
        &self.pending_materialization
    }

    /// Records that the caret needs a block the Shell has not materialized.
    fn request_materialization(&mut self, key: BlockKey) {
        if !self.pending_materialization.contains(&key) {
            self.pending_materialization.push(key);
        }
    }

    /// Drains the materialization requests produced since the last drain.
    pub fn take_materialization_requests(&mut self) -> Vec<BlockKey> {
        std::mem::take(&mut self.pending_materialization)
    }

    /// Returns the index of the block with `key`.
    ///
    /// A scan, not a map: a map would have to be rebuilt on every edit, and
    /// rebuilding an index of five thousand keys costs more than scanning
    /// them the handful of times one command asks.
    #[must_use]
    pub fn index_of(&self, key: BlockKey) -> Option<usize> {
        self.blocks.iter().position(|block| block.key == key)
    }

    /// The range an input method is still composing, if any.
    #[must_use]
    pub const fn composition(&self) -> Option<Composition> {
        self.composition
    }

    /// Plans the edit that starts a composition at the caret.
    ///
    /// A selection is collapsed first, the way a browser does: the composing
    /// range has to be somewhere, and the only place that is unambiguous is
    /// where the caret ends up once the selected text is gone.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::CompositionAlreadyActive`] when one is running, or
    /// a planning error from the collapse.
    pub fn plan_begin_composition(&self) -> Result<DocumentEdit, EditError> {
        if self.composition.is_some() {
            return Err(EditError::CompositionAlreadyActive);
        }
        self.plan_replace(String::new(), MarkRuns::default())
    }

    /// Plans replacing the composing range, or the caret when none is running.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::UnknownBlock`] when the composing block is gone, or
    /// a mark error when the table does not cover the text.
    pub fn plan_composition_replace(
        &self,
        text: String,
        marks: MarkRuns,
    ) -> Result<DocumentEdit, EditError> {
        let Some(composition) = self.composition else {
            return self.plan_replace(text, marks);
        };
        let index = self
            .index_of(composition.key)
            .ok_or(EditError::UnknownBlock)?;
        let inserted =
            u32::try_from(text.encode_utf16().count()).map_err(|_| EditError::OffsetOverflow)?;
        if marks.length() != inserted {
            return Err(EditError::InvalidMarkRuns {
                covered: marks.length(),
                text_len: inserted,
            });
        }
        let mut edit = self.single_block_edit(index, composition.range, text);
        let start = composition.range.start;
        if let Some(replacement) = edit.replacements.first_mut() {
            replacement.marks = marks;
        }
        edit.selection = DocumentSelection::Text {
            anchor: DocumentPosition::new(composition.key, start + inserted),
            focus: DocumentPosition::new(composition.key, start + inserted),
        };
        Ok(edit)
    }

    /// Records where the composition now sits, or that it ended.
    ///
    /// Separate from applying the edit because the range is stated in the
    /// revision the edit produced, not the one it consumed.
    pub fn set_composition(&mut self, composition: Option<Composition>) {
        self.composition = composition;
    }

    /// Sets the selection after normalizing it onto positions that exist.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::UnknownBlock`] when a named block is not in the
    /// document, or an offset error when a position leaves its block.
    pub fn set_selection(&mut self, selection: DocumentSelection) -> Result<(), EditError> {
        self.selection = self.normalize_selection(selection)?;
        for key in self.unmaterialized_edges(self.selection) {
            self.request_materialization(key);
        }
        Ok(())
    }

    /// Returns the selection's own blocks that have no text yet.
    fn unmaterialized_edges(&self, selection: DocumentSelection) -> Vec<BlockKey> {
        let keys = match selection {
            DocumentSelection::Text { anchor, focus } => vec![anchor.key, focus.key],
            DocumentSelection::Node { key } => vec![key],
            DocumentSelection::Gap { before } => {
                // Typing in a gap lands in whichever block the Shell makes
                // there, so its neighbours are what the caret will need next.
                let mut keys = Vec::new();
                if let Some(index) = before.checked_sub(1)
                    && let Some(block) = self.blocks.get(index)
                {
                    keys.push(block.key);
                }
                if let Some(block) = self.blocks.get(before) {
                    keys.push(block.key);
                }
                keys
            }
        };
        keys.into_iter()
            .filter(|key| {
                self.index_of(*key)
                    .is_some_and(|index| !self.blocks[index].materialized)
            })
            .collect()
    }

    /// Normalizes a selection onto positions the caret may actually occupy.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::UnknownBlock`] when a named block is not in the
    /// document, or an offset error when a position leaves its block.
    pub fn normalize_selection(
        &self,
        selection: DocumentSelection,
    ) -> Result<DocumentSelection, EditError> {
        match selection {
            DocumentSelection::Text { anchor, focus } => {
                let (anchor_key, focus_key) = (anchor.key, focus.key);
                let anchor = self.normalize_position(anchor)?;
                let focus = self.normalize_position(focus)?;
                match (anchor, focus) {
                    (Some(anchor), Some(focus)) => Ok(DocumentSelection::Text { anchor, focus }),
                    // An edge landed in a block the caret may not enter, so the
                    // intent was to select an object rather than characters.
                    (None, _) => Ok(DocumentSelection::Node { key: anchor_key }),
                    (_, None) => Ok(DocumentSelection::Node { key: focus_key }),
                }
            }
            DocumentSelection::Node { key } => {
                self.index_of(key).ok_or(EditError::UnknownBlock)?;
                Ok(DocumentSelection::Node { key })
            }
            DocumentSelection::Gap { before } => Ok(DocumentSelection::Gap {
                before: before.min(self.blocks.len()),
            }),
        }
    }

    /// Converts a position to the flat space.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::UnknownBlock`] when the block is not in the
    /// document, or [`EditError::InvalidRange`] when the offset leaves it.
    pub fn flatten(&self, position: DocumentPosition) -> Result<FlatPosition, EditError> {
        let index = self.index_of(position.key).ok_or(EditError::UnknownBlock)?;
        let block = &self.blocks[index];
        if position.offset > block.len_utf16() {
            return Err(EditError::InvalidRange {
                start: position.offset,
                end: position.offset,
                text_len: block.len_utf16(),
            });
        }
        Ok(self.starts[index] + 1 + position.offset)
    }

    /// Returns the flat position of the gap before block `index`.
    #[must_use]
    pub fn gap_position(&self, index: usize) -> FlatPosition {
        self.starts.get(index).copied().unwrap_or(self.length)
    }

    /// Converts a flat position back to a block position, when one exists.
    #[must_use]
    pub fn unflatten(&self, position: FlatPosition) -> Option<DocumentPosition> {
        let index = self.block_containing(position)?;
        let block = &self.blocks[index];
        let start = self.starts[index] + 1;
        (position >= start && position <= start + block.len_utf16()).then(|| DocumentPosition {
            key: block.key,
            offset: position - start,
            affinity: Affinity::Downstream,
        })
    }

    /// Returns the block whose content span contains `position`.
    #[must_use]
    pub fn block_containing(&self, position: FlatPosition) -> Option<usize> {
        let index = match self.starts.binary_search(&position) {
            // Exactly on a boundary: that is a gap, not block content.
            Ok(_) => return None,
            Err(index) => index.checked_sub(1)?,
        };
        let block = self.blocks.get(index)?;
        let start = self.starts[index] + 1;
        (position >= start && position <= start + block.len_utf16()).then_some(index)
    }

    /// Returns the flat span a selection covers, ordered and never inverted.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::UnknownBlock`] when a named block is missing.
    pub fn flat_range(&self, selection: DocumentSelection) -> Result<(u32, u32), EditError> {
        match selection {
            DocumentSelection::Text { anchor, focus } => {
                let anchor = self.flatten(anchor)?;
                let focus = self.flatten(focus)?;
                Ok((anchor.min(focus), anchor.max(focus)))
            }
            DocumentSelection::Node { key } => {
                let index = self.index_of(key).ok_or(EditError::UnknownBlock)?;
                Ok((self.starts[index], self.gap_position(index + 1)))
            }
            DocumentSelection::Gap { before } => {
                let position = self.gap_position(before.min(self.blocks.len()));
                Ok((position, position))
            }
        }
    }

    /// Returns the per-block ranges a text selection covers, in document order.
    ///
    /// A block covered end to end appears with its whole range, which is what
    /// lets a caller tell "delete these characters" from "delete this block".
    ///
    /// # Errors
    ///
    /// Returns [`EditError::UnknownBlock`] when a named block is missing.
    pub fn covered_blocks(
        &self,
        selection: DocumentSelection,
    ) -> Result<Vec<(usize, Utf16Range)>, EditError> {
        let (start, end) = self.flat_range(selection)?;
        let mut covered = Vec::new();
        // Start at the first block whose span can reach `start`, and stop at
        // the first one that begins past `end`: a selection touches a few
        // blocks, and scanning the document to find them is what makes editing
        // cost what the document costs.
        let first = self
            .starts
            .partition_point(|position| *position < start)
            .saturating_sub(1);
        for index in first..self.blocks.len() {
            let block = &self.blocks[index];
            let open = self.starts[index];
            if open > end {
                break;
            }
            let close = self.gap_position(index + 1);
            if open >= start && close <= end {
                // The block's own boundaries are inside the selection, so the
                // block is covered as an object rather than as characters.
                // An empty block is covered too, which is what makes deleting
                // a picture expressible.
                covered.push((index, Utf16Range::new(0, block.len_utf16())));
                continue;
            }
            let content_start = open + 1;
            let content_end = content_start + block.len_utf16();
            let from = content_start.max(start);
            let to = content_end.min(end);
            if from > to {
                continue;
            }
            if from == to && !(start == end && from == start) {
                // A zero-width overlap at a block edge is the neighbouring
                // block's business, not this one's.
                continue;
            }
            covered.push((
                index,
                Utf16Range::new(from - content_start, to - content_start),
            ));
        }
        Ok(covered)
    }

    /// Returns the selection one movement away from the current one.
    ///
    /// # Errors
    ///
    /// Returns an offset error when the active selection names a position that
    /// no longer exists.
    pub fn moved(
        &self,
        direction: Direction,
        granularity: Granularity,
        extend: bool,
    ) -> Result<DocumentSelection, EditError> {
        if self.blocks.is_empty() {
            return Ok(DocumentSelection::Gap { before: 0 });
        }
        // Collapsing a range is a movement in itself: pressing an arrow key
        // with text selected puts the caret at that end rather than moving one
        // character past it.
        if !extend
            && let DocumentSelection::Text { anchor, focus } = self.selection
            && anchor != focus
        {
            let (start, end) = self.flat_range(self.selection)?;
            let target = match direction {
                Direction::Backward => start,
                Direction::Forward => end,
            };
            return self.selection_at(target, false);
        }
        if !extend && let DocumentSelection::Node { key } = self.selection {
            let index = self.index_of(key).ok_or(EditError::UnknownBlock)?;
            return Ok(match direction {
                Direction::Backward => DocumentSelection::Gap { before: index },
                Direction::Forward => DocumentSelection::Gap { before: index + 1 },
            });
        }
        let from = self.focus_flat()?;
        let target = self.step(from, direction, granularity)?;
        self.selection_at(target, extend)
    }

    /// Returns the flat position of the selection's moving edge.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::UnknownBlock`] when the selection names a block
    /// that is not in the document.
    pub fn focus_flat(&self) -> Result<FlatPosition, EditError> {
        match self.selection {
            DocumentSelection::Text { focus, .. } => self.flatten(focus),
            DocumentSelection::Node { key } => {
                let index = self.index_of(key).ok_or(EditError::UnknownBlock)?;
                Ok(self.gap_position(index + 1))
            }
            DocumentSelection::Gap { before } => Ok(self.gap_position(before)),
        }
    }

    fn step(
        &self,
        from: FlatPosition,
        direction: Direction,
        granularity: Granularity,
    ) -> Result<FlatPosition, EditError> {
        // A block the caret is standing in is materialized by construction:
        // `normalize_position` refuses to put it anywhere else.
        if let Some(index) = self.block_containing(from) {
            let block = &self.blocks[index];
            let start = self.starts[index] + 1;
            let offset = from - start;
            let next = match (direction, granularity) {
                (Direction::Backward, Granularity::Character) => block.index().previous(offset)?,
                (Direction::Forward, Granularity::Character) => block.index().next(offset)?,
                (direction, Granularity::Word) => word_boundary_utf16(
                    block.text(),
                    offset,
                    matches!(direction, Direction::Forward),
                )?,
            };
            if next != offset {
                return Ok(start + next);
            }
            // Already at the block edge: leave it through the adjacent gap.
            return Ok(match direction {
                Direction::Backward => self.starts[index],
                Direction::Forward => self.gap_position(index + 1),
            });
        }
        // The caret is in a gap; enter the neighbouring block, or step past it
        // when it is an object the caret may not enter.
        let gap = self.gap_index(from);
        match direction {
            Direction::Backward => {
                let Some(index) = gap.checked_sub(1) else {
                    return Ok(from);
                };
                Ok(if self.blocks[index].is_enterable() {
                    self.starts[index] + 1 + self.blocks[index].len_utf16()
                } else {
                    self.gap_position(index)
                })
            }
            Direction::Forward => {
                let Some(block) = self.blocks.get(gap) else {
                    return Ok(from);
                };
                Ok(if block.is_enterable() {
                    self.starts[gap] + 1
                } else {
                    self.gap_position(gap + 1)
                })
            }
        }
    }

    /// Returns which gap a flat boundary position names.
    fn gap_index(&self, position: FlatPosition) -> usize {
        match self.starts.binary_search(&position) {
            Ok(index) => index,
            Err(_) => self.blocks.len(),
        }
    }

    /// Builds the selection a caret at `target` produces.
    fn selection_at(
        &self,
        target: FlatPosition,
        extend: bool,
    ) -> Result<DocumentSelection, EditError> {
        let focus = self.unflatten(target);
        match (focus, extend) {
            (Some(focus), false) => Ok(DocumentSelection::Text {
                anchor: focus,
                focus,
            }),
            (Some(focus), true) => {
                let anchor = match self.selection {
                    DocumentSelection::Text { anchor, .. } => Some(anchor),
                    _ => None,
                };
                Ok(DocumentSelection::Text {
                    anchor: anchor.unwrap_or(focus),
                    focus,
                })
            }
            (None, _) => Ok(DocumentSelection::Gap {
                before: self.gap_index(target),
            }),
        }
    }

    fn normalize_position(
        &self,
        position: DocumentPosition,
    ) -> Result<Option<DocumentPosition>, EditError> {
        let index = self.index_of(position.key).ok_or(EditError::UnknownBlock)?;
        let block = &self.blocks[index];
        if block.atomic {
            return Ok(None);
        }
        if !block.materialized {
            // The offsets exist -- the Shell declared the length -- but there
            // is no text to snap them to a grapheme boundary against. Clamp to
            // an edge, which is always a boundary, and ask for the block.
            return Ok(Some(DocumentPosition {
                key: position.key,
                offset: if position.offset * 2 >= block.len_utf16 {
                    block.len_utf16
                } else {
                    0
                },
                affinity: position.affinity,
            }));
        }
        let bias = match position.affinity {
            Affinity::Upstream => OffsetBias::Backward,
            Affinity::Downstream => OffsetBias::Forward,
        };
        let clamped = position.offset.min(block.len_utf16());
        let byte = block.index().utf16_to_utf8(clamped, bias)?;
        Ok(Some(DocumentPosition {
            key: position.key,
            offset: block.index().utf8_to_utf16(byte)?,
            affinity: position.affinity,
        }))
    }

    fn rebuild_starts(&mut self) -> Result<(), EditError> {
        self.starts.clear();
        self.starts.reserve(self.blocks.len());
        let mut cursor = 0_u32;
        for block in &self.blocks {
            self.starts.push(cursor);
            // Two boundary positions plus the content: the opening one is the
            // gap before the block and the closing one is the gap after it.
            cursor = cursor
                .checked_add(2)
                .and_then(|value| value.checked_add(block.len_utf16()))
                .ok_or(EditError::OffsetOverflow)?;
        }
        self.length = cursor;
        Ok(())
    }

    /// Keeps as much of the previous selection as the new projection allows.
    fn recover_selection(&self, previous: &[DocumentBlock]) -> DocumentSelection {
        if self.blocks.is_empty() {
            return DocumentSelection::Gap { before: 0 };
        }
        let recovered = match self.selection {
            DocumentSelection::Text { anchor, focus } => {
                match (self.clamp_into(anchor), self.clamp_into(focus)) {
                    (Some(anchor), Some(focus)) => DocumentSelection::Text { anchor, focus },
                    (Some(position), None) | (None, Some(position)) => DocumentSelection::Text {
                        anchor: position,
                        focus: position,
                    },
                    (None, None) => self.nearest_gap(previous, Some(focus.key)),
                }
            }
            DocumentSelection::Node { key } => {
                if self.index_of(key).is_some() {
                    DocumentSelection::Node { key }
                } else {
                    self.nearest_gap(previous, Some(key))
                }
            }
            DocumentSelection::Gap { before } => DocumentSelection::Gap {
                before: before.min(self.blocks.len()),
            },
        };
        self.normalize_selection(recovered)
            .unwrap_or(DocumentSelection::Gap { before: 0 })
    }

    fn clamp_into(&self, position: DocumentPosition) -> Option<DocumentPosition> {
        let index = self.index_of(position.key)?;
        let block = &self.blocks[index];
        if block.atomic {
            return None;
        }
        Some(DocumentPosition {
            key: position.key,
            offset: position.offset.min(block.len_utf16()),
            affinity: position.affinity,
        })
    }

    /// Finds the gap closest to where a vanished block used to be.
    fn nearest_gap(&self, previous: &[DocumentBlock], key: Option<BlockKey>) -> DocumentSelection {
        let Some(key) = key else {
            return DocumentSelection::Gap { before: 0 };
        };
        let Some(old_index) = previous.iter().position(|block| block.key == key) else {
            return DocumentSelection::Gap { before: 0 };
        };
        // The block before the vanished one is the anchor a user expects: it is
        // the content that did not move.
        let before = previous[..old_index]
            .iter()
            .rev()
            .find_map(|block| self.index_of(block.key).map(|index| index + 1))
            .unwrap_or(0);
        DocumentSelection::Gap {
            before: before.min(self.blocks.len()),
        }
    }
}

/// One block's share of a document edit.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BlockReplacement {
    /// Block to change.
    pub key: BlockKey,
    /// UTF-16 range to replace, in the block's current revision.
    pub range: Utf16Range,
    /// Replacement text.
    pub text: String,
    /// Marks covering that text.
    pub marks: MarkRuns,
}

/// A structural consequence of an edit that only the Shell can carry out.
///
/// Core predicts these so the caret can move immediately, but the Shell owns
/// the schema and therefore the last word. Its next projection corrects any
/// disagreement.
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum StructureRequest {
    /// Remove these blocks from the tree.
    Remove {
        /// Blocks to remove, in document order.
        keys: Vec<BlockKey>,
    },
    /// Append `source` to `target` and remove `source`.
    Merge {
        /// Block that survives.
        target: BlockKey,
        /// Block whose remaining content moves into `target`.
        source: BlockKey,
    },
}

/// One planned document edit: what changes, and what the Shell must decide.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DocumentEdit {
    /// Per-block text replacements Core applies immediately.
    pub replacements: Vec<BlockReplacement>,
    /// Structural work handed to the Shell, in application order.
    pub structure: Vec<StructureRequest>,
    /// Where the caret ends up once the edit is applied.
    pub selection: DocumentSelection,
}

impl DocumentEdit {
    /// Returns whether the edit changes nothing but the selection.
    #[must_use]
    pub fn is_selection_only(&self) -> bool {
        self.replacements.is_empty() && self.structure.is_empty()
    }
}

impl Document {
    /// Plans what one delete key press does, without applying it.
    ///
    /// Planning and applying are separate because a delete that crosses blocks
    /// changes the tree, and the tree belongs to the Shell. Core predicts the
    /// outcome so the caret moves on the same frame as the key press; the
    /// Shell's next projection is what makes it true.
    ///
    /// # Errors
    ///
    /// Returns an offset error when the active selection names a position that
    /// no longer exists.
    pub fn plan_delete(&self, direction: Direction) -> Result<DocumentEdit, EditError> {
        match self.selection {
            DocumentSelection::Node { key } => {
                let index = self.index_of(key).ok_or(EditError::UnknownBlock)?;
                Ok(DocumentEdit {
                    replacements: Vec::new(),
                    structure: vec![StructureRequest::Remove { keys: vec![key] }],
                    selection: DocumentSelection::Gap { before: index },
                })
            }
            DocumentSelection::Gap { before } => {
                let target = match direction {
                    Direction::Backward => before.checked_sub(1),
                    Direction::Forward => (before < self.blocks.len()).then_some(before),
                };
                let Some(index) = target else {
                    return Ok(self.no_op());
                };
                let block = &self.blocks[index];
                if block.atomic {
                    return Ok(DocumentEdit {
                        replacements: Vec::new(),
                        structure: vec![StructureRequest::Remove {
                            keys: vec![block.key],
                        }],
                        selection: DocumentSelection::Gap { before: index },
                    });
                }
                // Entering a text block from a gap deletes its edge grapheme.
                let range = match direction {
                    Direction::Backward => {
                        let end = block.len_utf16();
                        Utf16Range::new(block.index().previous(end)?, end)
                    }
                    Direction::Forward => Utf16Range::new(0, block.index().next(0)?),
                };
                Ok(self.single_block_edit(index, range, String::new()))
            }
            DocumentSelection::Text { anchor, focus } => {
                if anchor != focus {
                    return self.plan_range_delete();
                }
                let index = self.index_of(focus.key).ok_or(EditError::UnknownBlock)?;
                let block = &self.blocks[index];
                let at_edge = match direction {
                    Direction::Backward => focus.offset == 0,
                    Direction::Forward => focus.offset == block.len_utf16(),
                };
                if !at_edge {
                    let range = match direction {
                        Direction::Backward => {
                            Utf16Range::new(block.index().previous(focus.offset)?, focus.offset)
                        }
                        Direction::Forward => {
                            Utf16Range::new(focus.offset, block.index().next(focus.offset)?)
                        }
                    };
                    return Ok(self.single_block_edit(index, range, String::new()));
                }
                let neighbour = match direction {
                    Direction::Backward => index.checked_sub(1),
                    Direction::Forward => (index + 1 < self.blocks.len()).then_some(index + 1),
                };
                let Some(neighbour) = neighbour else {
                    return Ok(self.no_op());
                };
                if self.blocks[neighbour].atomic {
                    // Backspacing into a picture selects it first. Removing it
                    // on the same key press is the classic way to lose an image
                    // to a key press that felt like moving the caret.
                    return Ok(DocumentEdit {
                        replacements: Vec::new(),
                        structure: Vec::new(),
                        selection: DocumentSelection::Node {
                            key: self.blocks[neighbour].key,
                        },
                    });
                }
                let (target, source) = match direction {
                    Direction::Backward => (neighbour, index),
                    Direction::Forward => (index, neighbour),
                };
                let caret = self.blocks[target].len_utf16();
                Ok(DocumentEdit {
                    replacements: Vec::new(),
                    structure: vec![StructureRequest::Merge {
                        target: self.blocks[target].key,
                        source: self.blocks[source].key,
                    }],
                    selection: DocumentSelection::Text {
                        anchor: DocumentPosition::new(self.blocks[target].key, caret),
                        focus: DocumentPosition::new(self.blocks[target].key, caret),
                    },
                })
            }
        }
    }

    /// Plans replacing the current selection with `text`.
    ///
    /// # Errors
    ///
    /// Returns an offset error when the active selection names a position that
    /// no longer exists, or a mark error when the table does not tile `text`.
    pub fn plan_replace(&self, text: String, marks: MarkRuns) -> Result<DocumentEdit, EditError> {
        let mut edit = match self.selection {
            DocumentSelection::Text { anchor, focus } if anchor == focus => {
                let index = self.index_of(focus.key).ok_or(EditError::UnknownBlock)?;
                self.single_block_edit(index, Utf16Range::collapsed(focus.offset), String::new())
            }
            DocumentSelection::Text { .. } => self.plan_range_delete()?,
            // A gap and a selected object have no text to type into, so the
            // Shell has to make a block first. Core reports the deletion and
            // leaves the insertion to the projection that follows.
            DocumentSelection::Node { .. } | DocumentSelection::Gap { .. } => {
                return self.plan_delete(Direction::Forward);
            }
        };
        if text.is_empty() {
            return Ok(edit);
        }
        let inserted =
            u32::try_from(text.encode_utf16().count()).map_err(|_| EditError::OffsetOverflow)?;
        if marks.length() != inserted {
            return Err(EditError::InvalidMarkRuns {
                covered: marks.length(),
                text_len: inserted,
            });
        }
        let Some(last) = edit.replacements.first_mut() else {
            return Ok(edit);
        };
        let start = last.range.start;
        let key = last.key;
        last.text = text;
        last.marks = marks;
        edit.selection = DocumentSelection::Text {
            anchor: DocumentPosition::new(key, start + inserted),
            focus: DocumentPosition::new(key, start + inserted),
        };
        Ok(edit)
    }

    /// Applies a planned edit's text changes and structural predictions.
    ///
    /// This is the optimistic half of the round trip: without it the caret sits
    /// still for a frame after every Enter and Backspace, which is one of the
    /// most visible defects an editor can have.
    ///
    /// # Errors
    ///
    /// Returns an offset error when a replacement leaves its block.
    pub fn apply_edit(&mut self, edit: &DocumentEdit) -> Result<(), EditError> {
        if std::mem::take(&mut self.replaying) {
            return self.apply_edit_inner(edit);
        }
        let entry = self.history_entry(edit)?;
        self.apply_edit_inner(edit)?;
        self.record(entry);
        Ok(())
    }

    /// Builds the entry that would undo `edit`, read before anything moves.
    fn history_entry(&self, edit: &DocumentEdit) -> Result<HistoryEntry, EditError> {
        let mut inverse = Vec::with_capacity(edit.replacements.len());
        let mut retained_bytes = 0;
        for replacement in &edit.replacements {
            let index = self
                .index_of(replacement.key)
                .ok_or(EditError::UnknownBlock)?;
            let content = &self.blocks[index].content;
            let range = content.index.normalize_range(replacement.range)?;
            let start = content
                .index
                .utf16_to_utf8(range.start, OffsetBias::Backward)?;
            let end = content
                .index
                .utf16_to_utf8(range.end, OffsetBias::Forward)?;
            let removed = content.text[start..end].to_owned();
            let inserted = u32::try_from(replacement.text.encode_utf16().count())
                .map_err(|_| EditError::OffsetOverflow)?;
            retained_bytes += removed.len() + replacement.text.len();
            inverse.push(BlockReplacement {
                key: replacement.key,
                // The inverse covers what the forward edit wrote, which starts
                // where it started and is as long as what it inserted.
                range: Utf16Range {
                    start: range.start,
                    end: range.start + inserted,
                },
                text: removed,
                marks: content.marks.slice(range)?,
            });
        }
        Ok(HistoryEntry {
            forward: edit.replacements.clone(),
            inverse,
            before: self.selection,
            after: edit.selection,
            retained_bytes,
            structural: !edit.structure.is_empty(),
        })
    }

    /// Pushes an entry, joining the burst above it when the caret lines up.
    fn record(&mut self, entry: HistoryEntry) {
        self.redo.clear();
        self.redo_bytes = 0;
        let next_anchor = self.anchor_for(&entry);
        if !entry.structural
            && let Some(anchor) = self.anchor
            && next_anchor.is_some()
            && self.merge_into_top(&entry, anchor)
        {
            self.anchor = next_anchor;
            return;
        }
        self.undo_bytes += entry.retained_bytes;
        self.undo.push_back(entry);
        self.anchor = next_anchor;
        while self.undo_bytes > UNDO_BUDGET_BYTES {
            let Some(dropped) = self.undo.pop_front() else {
                break;
            };
            self.undo_bytes = self.undo_bytes.saturating_sub(dropped.retained_bytes);
        }
    }

    /// The anchor an entry leaves behind, or `None` when it cannot be joined.
    fn anchor_for(&self, entry: &HistoryEntry) -> Option<UndoAnchor> {
        if entry.structural || entry.forward.len() != 1 {
            return None;
        }
        let replacement = entry.forward.first()?;
        // Only a pure insertion continues a burst. A replacement removed
        // something, and joining that to the typing before it would undo both
        // at once.
        if replacement.range.start != replacement.range.end {
            return None;
        }
        let class = text_class(&replacement.text)?;
        let inserted = u32::try_from(replacement.text.encode_utf16().count()).ok()?;
        Some(UndoAnchor {
            key: replacement.key,
            offset: replacement.range.start + inserted,
            class,
        })
    }

    /// Extends the entry on top when this one continues it.
    fn merge_into_top(&mut self, entry: &HistoryEntry, anchor: UndoAnchor) -> bool {
        let Some(replacement) = entry.forward.first() else {
            return false;
        };
        let Some(class) = text_class(&replacement.text) else {
            return false;
        };
        if replacement.key != anchor.key
            || replacement.range.start != anchor.offset
            || class != anchor.class
        {
            return false;
        }
        let Some(top) = self.undo.back_mut() else {
            return false;
        };
        let (Some(top_forward), Some(top_inverse)) =
            (top.forward.first_mut(), top.inverse.first_mut())
        else {
            return false;
        };
        if top_forward.key != replacement.key {
            return false;
        }
        top_forward.text.push_str(&replacement.text);
        top_inverse.range.end += u32::try_from(replacement.text.encode_utf16().count())
            .unwrap_or(u32::MAX)
            .min(u32::MAX - top_inverse.range.end);
        top.after = entry.after;
        top.retained_bytes += entry.retained_bytes;
        self.undo_bytes += entry.retained_bytes;
        true
    }

    /// Reverses the last edit, returning what changed.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::UnknownBlock`] when a block the entry names is gone.
    pub fn undo(&mut self) -> Result<Option<DocumentEdit>, EditError> {
        let Some(entry) = self.undo.pop_back() else {
            return Ok(None);
        };
        self.undo_bytes = self.undo_bytes.saturating_sub(entry.retained_bytes);
        self.anchor = None;
        let edit = DocumentEdit {
            replacements: entry.inverse.clone(),
            structure: Vec::new(),
            selection: entry.before,
        };
        self.redo_bytes += entry.retained_bytes;
        self.redo.push_back(entry);
        // The caller applies it, so the map and the transactions are built the
        // same way they are for any other edit. Replaying must not push the
        // reversal onto the stack it just came from.
        self.replaying = true;
        Ok(Some(edit))
    }

    /// Reapplies the last undone edit.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::UnknownBlock`] when a block the entry names is gone.
    pub fn redo(&mut self) -> Result<Option<DocumentEdit>, EditError> {
        let Some(entry) = self.redo.pop_back() else {
            return Ok(None);
        };
        self.redo_bytes = self.redo_bytes.saturating_sub(entry.retained_bytes);
        self.anchor = None;
        let edit = DocumentEdit {
            replacements: entry.forward.clone(),
            structure: Vec::new(),
            selection: entry.after,
        };
        self.undo_bytes += entry.retained_bytes;
        self.undo.push_back(entry);
        self.replaying = true;
        Ok(Some(edit))
    }

    /// Whether there is anything to undo or redo.
    #[must_use]
    pub fn can_undo(&self) -> bool {
        !self.undo.is_empty()
    }

    /// Whether there is anything to redo.
    #[must_use]
    pub fn can_redo(&self) -> bool {
        !self.redo.is_empty()
    }

    fn apply_edit_inner(&mut self, edit: &DocumentEdit) -> Result<(), EditError> {
        for replacement in &edit.replacements {
            let index = self
                .index_of(replacement.key)
                .ok_or(EditError::UnknownBlock)?;
            let block = &mut self.blocks[index];
            let content = std::sync::Arc::make_mut(&mut block.content);
            let range = content.index.normalize_range(replacement.range)?;
            let start = content
                .index
                .utf16_to_utf8(range.start, OffsetBias::Backward)?;
            let end = content
                .index
                .utf16_to_utf8(range.end, OffsetBias::Forward)?;
            let mut next =
                String::with_capacity(content.text.len() - (end - start) + replacement.text.len());
            next.push_str(&content.text[..start]);
            next.push_str(&replacement.text);
            next.push_str(&content.text[end..]);
            content.marks = content.marks.replace(range, &replacement.marks)?;
            content.index = TextIndex::new(&next)?;
            content.text = next;
            block.len_utf16 = content.index.utf16_len();
        }
        for request in &edit.structure {
            match request {
                StructureRequest::Remove { keys } => {
                    self.blocks.retain(|block| !keys.contains(&block.key));
                }
                StructureRequest::Merge { target, source } => {
                    let Some(source_index) = self.index_of(*source) else {
                        continue;
                    };
                    let moved = self.blocks.remove(source_index);
                    let moved_marks = moved.marks().clone();
                    let Some(target_index) = self.index_of(*target) else {
                        continue;
                    };
                    let block = &mut self.blocks[target_index];
                    let content = std::sync::Arc::make_mut(&mut block.content);
                    let at = content.index.utf16_len();
                    content.marks = content
                        .marks
                        .replace(Utf16Range::collapsed(at), &moved_marks)?;
                    content.text.push_str(moved.text());
                    content.index = TextIndex::new(&content.text)?;
                    block.len_utf16 = content.index.utf16_len();
                }
            }
        }
        self.rebuild_starts()?;
        self.selection = self
            .normalize_selection(edit.selection)
            .unwrap_or(DocumentSelection::Gap { before: 0 });
        Ok(())
    }

    fn no_op(&self) -> DocumentEdit {
        DocumentEdit {
            replacements: Vec::new(),
            structure: Vec::new(),
            selection: self.selection,
        }
    }

    fn single_block_edit(&self, index: usize, range: Utf16Range, text: String) -> DocumentEdit {
        let block = &self.blocks[index];
        DocumentEdit {
            replacements: vec![BlockReplacement {
                key: block.key,
                range,
                text,
                marks: MarkRuns::default(),
            }],
            structure: Vec::new(),
            selection: DocumentSelection::Text {
                anchor: DocumentPosition::new(block.key, range.start),
                focus: DocumentPosition::new(block.key, range.start),
            },
        }
    }

    /// Plans deleting a selection that covers characters, possibly across
    /// blocks.
    fn plan_range_delete(&self) -> Result<DocumentEdit, EditError> {
        let covered = self.covered_blocks(self.selection)?;
        // A block the selection swallows whole is removed without its text; a
        // block it only trims needs grapheme boundaries, and those need the
        // text. Refusing here is what keeps a virtualized delete from guessing.
        for (index, range) in &covered {
            let block = &self.blocks[*index];
            let whole = range.start == 0 && range.end == block.len_utf16();
            if !whole && !block.materialized {
                return Err(EditError::BlockNotMaterialized { key: block.key });
            }
        }
        let mut replacements = Vec::new();
        let mut removed = Vec::new();
        let mut survivor: Option<usize> = None;
        let mut tail: Option<usize> = None;
        for (index, range) in covered {
            let block = &self.blocks[index];
            let whole = range.start == 0 && range.end == block.len_utf16();
            if whole && (block.atomic || !block.materialized || survivor.is_some()) {
                // A block the selection swallows whole disappears, except for
                // the first one: emptying it keeps the caret somewhere. An
                // unmaterialized block is never that survivor -- it has no text
                // to keep, and the caret cannot stand in it.
                removed.push(block.key);
                continue;
            }
            replacements.push(BlockReplacement {
                key: block.key,
                range,
                text: String::new(),
                marks: MarkRuns::default(),
            });
            if survivor.is_none() {
                survivor = Some(index);
            } else {
                tail = Some(index);
            }
        }
        let mut structure = Vec::new();
        if !removed.is_empty() {
            structure.push(StructureRequest::Remove { keys: removed });
        }
        if let (Some(survivor), Some(tail)) = (survivor, tail) {
            structure.push(StructureRequest::Merge {
                target: self.blocks[survivor].key,
                source: self.blocks[tail].key,
            });
        }
        let selection = match survivor {
            Some(index) => {
                let start = replacements
                    .first()
                    .map_or(0, |replacement| replacement.range.start);
                DocumentSelection::Text {
                    anchor: DocumentPosition::new(self.blocks[index].key, start),
                    focus: DocumentPosition::new(self.blocks[index].key, start),
                }
            }
            None => {
                let (start, _) = self.flat_range(self.selection)?;
                DocumentSelection::Gap {
                    before: self.gap_index(start).min(self.blocks.len()),
                }
            }
        };
        Ok(DocumentEdit {
            replacements,
            structure,
            selection,
        })
    }
}

#[cfg(test)]
mod tests {
    use proptest::prelude::*;

    use super::*;

    fn text_block(key: BlockKey, text: &str) -> BlockProjection {
        BlockProjection::text(key, text, None)
    }

    fn object(key: BlockKey) -> BlockProjection {
        BlockProjection::object(key)
    }

    fn document(blocks: Vec<BlockProjection>) -> Document {
        Document::new(blocks).expect("projection")
    }

    /// Runs undo or redo and applies what it hands back.
    fn apply_reversal(
        document: &mut Document,
        step: fn(&mut Document) -> Result<Option<DocumentEdit>, EditError>,
    ) {
        let edit = step(document)
            .expect("reversal")
            .expect("something to reverse");
        document.apply_edit(&edit).expect("apply");
    }

    /// Types `text` one grapheme at a time at the caret, as a burst would.
    fn type_burst(document: &mut Document, text: &str) {
        for character in text.chars() {
            let edit = document
                .plan_replace(character.to_string(), MarkRuns::uniform(1, 0, 0))
                .expect("plan");
            document.apply_edit(&edit).expect("apply");
        }
    }

    #[test]
    fn undo_takes_back_a_typing_burst_rather_than_one_character() {
        let mut document = document(vec![text_block(1, "")]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 0),
                focus: DocumentPosition::new(1, 0),
            })
            .expect("caret");
        type_burst(&mut document, "hello");
        assert_eq!(document.blocks()[0].text(), "hello");

        // One undo, not five: the whole burst is one step because every
        // keystroke continued the one before it at the same caret.
        apply_reversal(&mut document, Document::undo);
        assert_eq!(document.blocks()[0].text(), "");
        assert!(!document.can_undo());
        apply_reversal(&mut document, Document::redo);
        assert_eq!(document.blocks()[0].text(), "hello");
    }

    #[test]
    fn a_word_boundary_ends_the_burst_so_undo_stops_at_it() {
        let mut document = document(vec![text_block(1, "")]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 0),
                focus: DocumentPosition::new(1, 0),
            })
            .expect("caret");
        type_burst(&mut document, "one two");

        // The space is a different class, so it opened a group: undo takes back
        // "two", then the space, then "one".
        apply_reversal(&mut document, Document::undo);
        assert_eq!(document.blocks()[0].text(), "one ");
        apply_reversal(&mut document, Document::undo);
        assert_eq!(document.blocks()[0].text(), "one");
        apply_reversal(&mut document, Document::undo);
        assert_eq!(document.blocks()[0].text(), "");
    }

    #[test]
    fn undo_restores_the_marks_the_edit_removed() {
        let mut document = document(vec![BlockProjection::text(
            1,
            "abcdef",
            Some(MarkRuns::uniform(6, 7, 0)),
        )]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 2),
                focus: DocumentPosition::new(1, 5),
            })
            .expect("selection");
        let edit = document
            .plan_replace("X".to_owned(), MarkRuns::uniform(1, 0, 0))
            .expect("plan");
        document.apply_edit(&edit).expect("apply");
        assert_eq!(document.blocks()[0].text(), "abXf");

        // Undo puts back the text and the styling it was wearing; restoring one
        // without the other would leave the block looking like a different edit.
        apply_reversal(&mut document, Document::undo);
        assert_eq!(document.blocks()[0].text(), "abcdef");
        assert_eq!(document.blocks()[0].marks(), &MarkRuns::uniform(6, 7, 0));
    }

    #[test]
    fn a_new_edit_after_undo_drops_what_was_undone() {
        let mut document = document(vec![text_block(1, "")]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 0),
                focus: DocumentPosition::new(1, 0),
            })
            .expect("caret");
        type_burst(&mut document, "abc");
        apply_reversal(&mut document, Document::undo);
        assert!(document.can_redo());
        type_burst(&mut document, "z");
        // The redone future is gone: it described a document that no longer
        // exists.
        assert!(!document.can_redo());
        assert_eq!(document.blocks()[0].text(), "z");
    }

    #[test]
    fn the_flat_space_interleaves_boundaries_with_content() {
        let document = document(vec![text_block(1, "ab"), object(2), text_block(3, "c")]);
        // Block 1 owns 0..=3 (open, a, b, close), the object owns 4..=5, and
        // block 3 owns 6..=8.
        assert_eq!(document.len(), 9);
        assert_eq!(document.gap_position(0), 0);
        assert_eq!(document.gap_position(1), 4);
        assert_eq!(document.gap_position(2), 6);
        assert_eq!(document.gap_position(3), 9);
        assert_eq!(
            document.flatten(DocumentPosition::new(1, 0)).expect("flat"),
            1
        );
        assert_eq!(
            document.flatten(DocumentPosition::new(1, 2)).expect("flat"),
            3
        );
        assert_eq!(
            document.flatten(DocumentPosition::new(3, 1)).expect("flat"),
            8
        );
        assert_eq!(document.unflatten(1), Some(DocumentPosition::new(1, 0)));
        // A boundary is a gap, not a position inside a block.
        assert_eq!(document.unflatten(0), None);
        assert_eq!(document.unflatten(4), None);
        // Every position inside a block round-trips.
        for position in 0..document.len() {
            if let Some(inside) = document.unflatten(position) {
                assert_eq!(document.flatten(inside).expect("round trip"), position);
            }
        }
    }

    #[test]
    fn a_selection_spanning_blocks_reports_each_block_it_covers() {
        let document = document(vec![
            text_block(1, "hello"),
            text_block(2, "world"),
            text_block(3, "again"),
        ]);
        let selection = DocumentSelection::Text {
            anchor: DocumentPosition::new(1, 3),
            focus: DocumentPosition::new(3, 2),
        };
        assert_eq!(
            document.covered_blocks(selection).expect("covered"),
            vec![
                (0, Utf16Range::new(3, 5)),
                (1, Utf16Range::new(0, 5)),
                (2, Utf16Range::new(0, 2)),
            ]
        );
        // The middle block is covered end to end, which is what tells a caller
        // it can be removed rather than edited.
        let middle = &document.blocks()[1];
        assert_eq!(
            document.covered_blocks(selection).expect("covered")[1].1,
            Utf16Range::new(0, middle.len_utf16())
        );

        // A collapsed selection touches exactly one block.
        let caret = DocumentSelection::Text {
            anchor: DocumentPosition::new(2, 0),
            focus: DocumentPosition::new(2, 0),
        };
        assert_eq!(
            document.covered_blocks(caret).expect("covered"),
            vec![(1, Utf16Range::new(0, 0))]
        );
    }

    #[test]
    fn arrow_keys_step_over_an_object_and_stop_in_the_gaps_around_it() {
        let mut document = document(vec![text_block(1, "ab"), object(2), object(3)]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 2),
                focus: DocumentPosition::new(1, 2),
            })
            .expect("caret");

        // Out of the text block into the gap before the first object.
        let step = |document: &Document| {
            document
                .moved(Direction::Forward, Granularity::Character, false)
                .expect("moved")
        };
        let next = step(&document);
        assert_eq!(next, DocumentSelection::Gap { before: 1 });
        document.set_selection(next).expect("gap");

        // The caret can stand between the two adjacent objects, which is the
        // position the user needs to type there.
        let next = step(&document);
        assert_eq!(next, DocumentSelection::Gap { before: 2 });
        document.set_selection(next).expect("gap");

        let next = step(&document);
        assert_eq!(next, DocumentSelection::Gap { before: 3 });
        document.set_selection(next).expect("gap");
        // The document end holds.
        assert_eq!(step(&document), DocumentSelection::Gap { before: 3 });

        // And back the other way, landing at the end of the text block.
        for expected in [
            DocumentSelection::Gap { before: 2 },
            DocumentSelection::Gap { before: 1 },
        ] {
            let previous = document
                .moved(Direction::Backward, Granularity::Character, false)
                .expect("moved");
            assert_eq!(previous, expected);
            document.set_selection(previous).expect("gap");
        }
        let previous = document
            .moved(Direction::Backward, Granularity::Character, false)
            .expect("moved");
        assert_eq!(
            previous,
            DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 2),
                focus: DocumentPosition::new(1, 2),
            }
        );
    }

    #[test]
    fn a_position_inside_an_object_becomes_a_node_selection() {
        let document = document(vec![text_block(1, "ab"), object(2)]);
        assert_eq!(
            document
                .normalize_selection(DocumentSelection::Text {
                    anchor: DocumentPosition::new(2, 0),
                    focus: DocumentPosition::new(2, 0),
                })
                .expect("normalized"),
            DocumentSelection::Node { key: 2 }
        );
        // Selecting the object covers its whole flat span, so Delete removes
        // the block rather than a character.
        assert_eq!(
            document
                .flat_range(DocumentSelection::Node { key: 2 })
                .expect("range"),
            (4, 6)
        );
        assert!(
            document
                .covered_blocks(DocumentSelection::Node { key: 2 })
                .expect("covered")
                .iter()
                .any(|(index, _)| *index == 1)
        );
    }

    #[test]
    fn arrow_keys_leave_a_node_selection_through_the_gap_on_that_side() {
        let mut document = document(vec![text_block(1, "ab"), object(2), text_block(3, "cd")]);
        document
            .set_selection(DocumentSelection::Node { key: 2 })
            .expect("node");
        assert_eq!(
            document
                .moved(Direction::Backward, Granularity::Character, false)
                .expect("moved"),
            DocumentSelection::Gap { before: 1 }
        );
        assert_eq!(
            document
                .moved(Direction::Forward, Granularity::Character, false)
                .expect("moved"),
            DocumentSelection::Gap { before: 2 }
        );
    }

    #[test]
    fn an_arrow_key_collapses_a_range_instead_of_moving_past_it() {
        let mut document = document(vec![text_block(1, "hello"), text_block(2, "world")]);
        let selection = DocumentSelection::Text {
            anchor: DocumentPosition::new(1, 1),
            focus: DocumentPosition::new(2, 3),
        };
        document.set_selection(selection).expect("selection");
        assert_eq!(
            document
                .moved(Direction::Backward, Granularity::Character, false)
                .expect("moved"),
            DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 1),
                focus: DocumentPosition::new(1, 1),
            }
        );
        assert_eq!(
            document
                .moved(Direction::Forward, Granularity::Character, false)
                .expect("moved"),
            DocumentSelection::Text {
                anchor: DocumentPosition::new(2, 3),
                focus: DocumentPosition::new(2, 3),
            }
        );
        // Extending keeps the anchor and moves only the focus.
        assert_eq!(
            document
                .moved(Direction::Forward, Granularity::Character, true)
                .expect("moved"),
            DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 1),
                focus: DocumentPosition::new(2, 4),
            }
        );
    }

    #[test]
    fn movement_never_splits_a_grapheme_and_word_steps_stop_at_word_edges() {
        let mut document = document(vec![text_block(
            1,
            "a\u{301}\u{1f469}\u{200d}\u{1f4bb} two",
        )]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 0),
                focus: DocumentPosition::new(1, 0),
            })
            .expect("caret");
        let mut offsets = Vec::new();
        loop {
            let next = document
                .moved(Direction::Forward, Granularity::Character, false)
                .expect("moved");
            if next == document.selection() {
                break;
            }
            document.set_selection(next).expect("caret");
            match next {
                DocumentSelection::Text { focus, .. } => offsets.push(focus.offset),
                _ => break,
            }
        }
        // "a" + combining acute is one step, and the emoji ZWJ sequence is one
        // more; neither is ever entered halfway.
        assert_eq!(offsets.first().copied(), Some(2));
        assert_eq!(offsets.get(1).copied(), Some(7));

        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 0),
                focus: DocumentPosition::new(1, 0),
            })
            .expect("caret");
        let word = document
            .moved(Direction::Forward, Granularity::Word, false)
            .expect("moved");
        assert!(matches!(word, DocumentSelection::Text { .. }));
    }

    #[test]
    fn a_reprojection_keeps_the_caret_where_the_content_still_is() {
        let mut document = document(vec![
            text_block(1, "first"),
            text_block(2, "second"),
            text_block(3, "third"),
        ]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(2, 4),
                focus: DocumentPosition::new(2, 4),
            })
            .expect("caret");

        // The block shrank: the caret clamps into it rather than leaving it.
        document
            .reproject(vec![
                text_block(1, "first"),
                text_block(2, "se"),
                text_block(3, "third"),
            ])
            .expect("reproject");
        assert_eq!(
            document.selection(),
            DocumentSelection::Text {
                anchor: DocumentPosition::new(2, 2),
                focus: DocumentPosition::new(2, 2),
            }
        );

        // The block is gone: the caret lands in the gap after the block that
        // did not move, not at the top of the document.
        document
            .reproject(vec![text_block(1, "first"), text_block(3, "third")])
            .expect("reproject");
        assert_eq!(document.selection(), DocumentSelection::Gap { before: 1 });

        // An empty document has exactly one position.
        document.reproject(Vec::new()).expect("reproject");
        assert_eq!(document.selection(), DocumentSelection::Gap { before: 0 });
        assert_eq!(document.len(), 0);
        assert!(document.is_empty());
    }

    #[test]
    fn duplicate_keys_and_untiled_mark_tables_are_rejected() {
        assert_eq!(
            Document::new(vec![text_block(1, "a"), text_block(1, "b")]),
            Err(EditError::DuplicateBlockKey { key: 1 })
        );
        assert!(matches!(
            Document::new(vec![BlockProjection::text(
                1,
                "abc",
                Some(MarkRuns::uniform(2, 1, 0)),
            )]),
            Err(EditError::InvalidMarkRuns { .. })
        ));
        let document = document(vec![text_block(1, "a")]);
        assert_eq!(
            document.flatten(DocumentPosition::new(9, 0)),
            Err(EditError::UnknownBlock)
        );
        assert!(matches!(
            document.flatten(DocumentPosition::new(1, 5)),
            Err(EditError::InvalidRange { .. })
        ));
    }

    #[test]
    fn delete_removes_a_selected_object_and_leaves_the_caret_between_its_neighbours() {
        let mut document = document(vec![text_block(1, "ab"), object(2), text_block(3, "cd")]);
        document
            .set_selection(DocumentSelection::Node { key: 2 })
            .expect("node");
        let edit = document.plan_delete(Direction::Forward).expect("plan");
        assert_eq!(
            edit.structure,
            vec![StructureRequest::Remove { keys: vec![2] }]
        );
        assert!(edit.replacements.is_empty());
        document.apply_edit(&edit).expect("apply");
        assert_eq!(
            document
                .blocks()
                .iter()
                .map(DocumentBlock::key)
                .collect::<Vec<_>>(),
            vec![1, 3]
        );
        assert_eq!(document.selection(), DocumentSelection::Gap { before: 1 });
    }

    #[test]
    fn backspace_at_a_block_start_selects_a_picture_before_it_removes_it() {
        let mut document = document(vec![object(1), text_block(2, "ab")]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(2, 0),
                focus: DocumentPosition::new(2, 0),
            })
            .expect("caret");
        // First press selects the object rather than deleting it, so a key that
        // felt like moving the caret cannot silently destroy an image.
        let select = document.plan_delete(Direction::Backward).expect("plan");
        assert!(select.is_selection_only());
        assert_eq!(select.selection, DocumentSelection::Node { key: 1 });
        document.apply_edit(&select).expect("apply");
        // The second press removes it.
        let remove = document.plan_delete(Direction::Backward).expect("plan");
        assert_eq!(
            remove.structure,
            vec![StructureRequest::Remove { keys: vec![1] }]
        );
        document.apply_edit(&remove).expect("apply");
        assert_eq!(document.blocks().len(), 1);
    }

    #[test]
    fn backspace_at_a_block_start_asks_the_shell_to_merge_it_backwards() {
        let mut document = document(vec![text_block(1, "ab"), text_block(2, "cd")]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(2, 0),
                focus: DocumentPosition::new(2, 0),
            })
            .expect("caret");
        let edit = document.plan_delete(Direction::Backward).expect("plan");
        assert_eq!(
            edit.structure,
            vec![StructureRequest::Merge {
                target: 1,
                source: 2,
            }]
        );
        // The predicted caret sits at the join, which is where it has to be on
        // the very next frame.
        assert_eq!(
            edit.selection,
            DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 2),
                focus: DocumentPosition::new(1, 2),
            }
        );
        document.apply_edit(&edit).expect("apply");
        assert_eq!(document.blocks().len(), 1);
        assert_eq!(document.blocks()[0].text(), "abcd");
        assert_eq!(document.selection(), edit.selection);
    }

    #[test]
    fn a_cross_block_delete_trims_the_edges_removes_the_middle_and_merges_once() {
        let mut document = document(vec![
            text_block(1, "hello"),
            text_block(2, "middle"),
            object(3),
            text_block(4, "world"),
        ]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 2),
                focus: DocumentPosition::new(4, 3),
            })
            .expect("selection");
        let edit = document.plan_delete(Direction::Backward).expect("plan");
        assert_eq!(
            edit.replacements
                .iter()
                .map(|replacement| (replacement.key, replacement.range))
                .collect::<Vec<_>>(),
            vec![(1, Utf16Range::new(2, 5)), (4, Utf16Range::new(0, 3))]
        );
        assert_eq!(
            edit.structure,
            vec![
                StructureRequest::Remove { keys: vec![2, 3] },
                StructureRequest::Merge {
                    target: 1,
                    source: 4,
                },
            ]
        );
        document.apply_edit(&edit).expect("apply");
        assert_eq!(document.blocks().len(), 1);
        assert_eq!(document.blocks()[0].text(), "held");
        assert_eq!(
            document.selection(),
            DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 2),
                focus: DocumentPosition::new(1, 2),
            }
        );
    }

    #[test]
    fn typing_over_a_cross_block_selection_lands_in_the_surviving_block() {
        let mut document = document(vec![text_block(1, "hello"), text_block(2, "world")]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 2),
                focus: DocumentPosition::new(2, 2),
            })
            .expect("selection");
        let edit = document
            .plan_replace("X".to_owned(), MarkRuns::uniform(1, 7, 0))
            .expect("plan");
        document.apply_edit(&edit).expect("apply");
        assert_eq!(document.blocks().len(), 1);
        assert_eq!(document.blocks()[0].text(), "heXrld");
        assert_eq!(
            document.selection(),
            DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 3),
                focus: DocumentPosition::new(1, 3),
            }
        );
        // The typed character keeps the mark the caller asked for.
        assert_eq!(
            document.blocks()[0]
                .marks()
                .style_at(2, crate::MarkSide::After),
            7
        );
    }

    #[test]
    fn a_delete_at_the_document_edge_changes_nothing() {
        let mut document = document(vec![text_block(1, "a")]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 0),
                focus: DocumentPosition::new(1, 0),
            })
            .expect("caret");
        assert!(
            document
                .plan_delete(Direction::Backward)
                .expect("plan")
                .is_selection_only()
        );
        document
            .set_selection(DocumentSelection::Gap { before: 0 })
            .expect("gap");
        assert!(
            document
                .plan_delete(Direction::Backward)
                .expect("plan")
                .is_selection_only()
        );
    }

    fn placeholder(key: BlockKey, len: u32) -> BlockProjection {
        BlockProjection::placeholder(key, len)
    }

    #[test]
    fn an_unmaterialized_block_still_occupies_the_position_space() {
        let document = document(vec![
            text_block(1, "ab"),
            placeholder(2, 500),
            text_block(3, "cd"),
        ]);
        // The middle block costs one integer, not five hundred characters, but
        // it occupies exactly the positions its length claims.
        assert_eq!(document.len(), 4 + 502 + 4);
        assert_eq!(document.gap_position(2), 4 + 502);
        assert!(!document.blocks()[1].is_materialized());
        assert_eq!(document.blocks()[1].text(), "");
        assert_eq!(document.blocks()[1].len_utf16(), 500);

        // A selection can still span it, and it reports as fully covered.
        let selection = DocumentSelection::Text {
            anchor: DocumentPosition::new(1, 1),
            focus: DocumentPosition::new(3, 1),
        };
        assert_eq!(
            document.covered_blocks(selection).expect("covered"),
            vec![
                (0, Utf16Range::new(1, 2)),
                (1, Utf16Range::new(0, 500)),
                (2, Utf16Range::new(0, 1)),
            ]
        );
    }

    #[test]
    fn the_caret_stops_at_an_unmaterialized_block_and_asks_for_it() {
        let mut document = document(vec![text_block(1, "ab"), placeholder(2, 5)]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 2),
                focus: DocumentPosition::new(1, 2),
            })
            .expect("caret");
        assert!(document.take_materialization_requests().is_empty());

        // Forward leaves the text block for the gap, then stops: there is no
        // text in the next block to put a caret on yet.
        let next = document
            .moved(Direction::Forward, Granularity::Character, false)
            .expect("moved");
        assert_eq!(next, DocumentSelection::Gap { before: 1 });
        document.set_selection(next).expect("gap");
        assert_eq!(document.take_materialization_requests(), vec![2]);
        assert_eq!(
            document
                .moved(Direction::Forward, Granularity::Character, false)
                .expect("moved"),
            DocumentSelection::Gap { before: 2 }
        );

        // Once the Shell sends it, the same key enters it.
        document
            .reproject(vec![text_block(1, "ab"), text_block(2, "xyzzy")])
            .expect("reproject");
        document
            .set_selection(DocumentSelection::Gap { before: 1 })
            .expect("gap");
        assert_eq!(
            document
                .moved(Direction::Forward, Granularity::Character, false)
                .expect("moved"),
            DocumentSelection::Text {
                anchor: DocumentPosition::new(2, 0),
                focus: DocumentPosition::new(2, 0),
            }
        );
    }

    #[test]
    fn a_selection_edge_inside_an_unmaterialized_block_clamps_and_asks_for_it() {
        let mut document = document(vec![text_block(1, "ab"), placeholder(2, 10)]);
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 0),
                focus: DocumentPosition::new(2, 7),
            })
            .expect("selection");
        // Offset seven of ten has no grapheme boundary Core can check, so it
        // clamps to the nearer edge rather than inventing one.
        assert_eq!(
            document.selection(),
            DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 0),
                focus: DocumentPosition::new(2, 10),
            }
        );
        assert_eq!(document.take_materialization_requests(), vec![2]);
    }

    #[test]
    fn a_delete_that_only_trims_an_unmaterialized_block_is_refused() {
        let mut document = document(vec![
            text_block(1, "ab"),
            placeholder(2, 10),
            text_block(3, "cd"),
        ]);
        // Whole blocks are removable without their text.
        document
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(1, 1),
                focus: DocumentPosition::new(3, 1),
            })
            .expect("selection");
        let edit = document.plan_delete(Direction::Backward).expect("plan");
        assert_eq!(
            edit.structure
                .iter()
                .filter_map(|request| match request {
                    StructureRequest::Remove { keys } => Some(keys.clone()),
                    StructureRequest::Merge { .. } => None,
                })
                .collect::<Vec<_>>(),
            vec![vec![2]]
        );

        // An unmaterialized block is never the block that survives a delete:
        // emptying it would need text it does not have, so it is removed and
        // the caret goes to a block that does.
        let mut leading = document;
        leading
            .set_selection(DocumentSelection::Text {
                anchor: DocumentPosition::new(2, 0),
                focus: DocumentPosition::new(3, 1),
            })
            .expect("selection");
        let edit = leading.plan_delete(Direction::Backward).expect("plan");
        assert_eq!(
            edit.structure,
            vec![StructureRequest::Remove { keys: vec![2] }]
        );
        assert_eq!(
            edit.replacements
                .iter()
                .map(|replacement| replacement.key)
                .collect::<Vec<_>>(),
            vec![3]
        );
        leading.apply_edit(&edit).expect("apply");
        assert_eq!(
            leading
                .blocks()
                .iter()
                .map(DocumentBlock::key)
                .collect::<Vec<_>>(),
            vec![1, 3]
        );
        assert_eq!(leading.blocks()[1].text(), "d");
    }

    proptest! {
        #[test]
        fn deleting_any_selection_removes_exactly_the_text_it_covered(
            shape in prop::collection::vec((any::<bool>(), 1_usize..5), 1..8),
            anchor in 0_u32..40,
            focus in 0_u32..40,
        ) {
            let blocks = shape
                .iter()
                .enumerate()
                .map(|(index, (atomic, length))| {
                    let key = u64::try_from(index).expect("small index") + 1;
                    if *atomic {
                        object(key)
                    } else {
                        // Distinct characters per block so a wrong splice shows.
                        let base = char::from(b'a' + u8::try_from(index % 20).expect("small"));
                        text_block(key, &base.to_string().repeat(*length))
                    }
                })
                .collect::<Vec<_>>();
            let mut document = document(blocks);
            let flat_len = document.len();
            let anchor_flat = anchor % (flat_len + 1);
            let focus_flat = focus % (flat_len + 1);
            // This property is about deleting a character selection; a gap and
            // a selected object delete a neighbour instead, which the unit
            // tests cover directly.
            let (Some(anchor), Some(focus)) =
                (document.unflatten(anchor_flat), document.unflatten(focus_flat))
            else {
                return Ok(());
            };
            document
                .set_selection(DocumentSelection::Text { anchor, focus })
                .expect("selection");
            // A collapsed caret deletes a neighbouring grapheme or merges two
            // blocks, which is again not what this property describes.
            let DocumentSelection::Text { anchor, focus } = document.selection() else {
                return Ok(());
            };
            if anchor == focus {
                return Ok(());
            }

            // The concatenation of every block, minus the covered spans, is
            // what the document must contain afterwards.
            let covered = document.covered_blocks(document.selection()).expect("covered");
            let expected: String = document
                .blocks()
                .iter()
                .enumerate()
                .map(|(index, block)| {
                    let range = covered
                        .iter()
                        .find(|(covered_index, _)| *covered_index == index)
                        .map(|(_, range)| *range);
                    let Some(range) = range else {
                        return block.text().to_owned();
                    };
                    let units: Vec<u16> = block.text().encode_utf16().collect();
                    let kept: Vec<u16> = units[..range.start as usize]
                        .iter()
                        .chain(&units[range.end as usize..])
                        .copied()
                        .collect();
                    String::from_utf16(&kept).expect("valid utf16")
                })
                .collect();

            let edit = document.plan_delete(Direction::Backward).expect("plan");
            document.apply_edit(&edit).expect("apply");
            let actual: String = document
                .blocks()
                .iter()
                .map(DocumentBlock::text)
                .collect::<Vec<_>>()
                .concat();
            prop_assert_eq!(&actual, &expected);

            // Whatever happened, the document is still walkable: every block
            // has a valid mark table and the selection names a real position.
            for block in document.blocks() {
                prop_assert_eq!(
                    block.marks().length(),
                    block.len_utf16(),
                    "mark table stopped tiling a block"
                );
            }
            prop_assert_eq!(
                document.normalize_selection(document.selection()).expect("normalizable"),
                document.selection()
            );
        }

        #[test]
        fn walking_the_document_visits_every_reachable_position_exactly_once(
            shape in prop::collection::vec((any::<bool>(), 0_usize..4), 1..12),
        ) {
            let blocks = shape
                .iter()
                .enumerate()
                .map(|(index, (atomic, length))| {
                    let key = u64::try_from(index).expect("small index") + 1;
                    if *atomic {
                        object(key)
                    } else {
                        text_block(key, &"x".repeat(*length))
                    }
                })
                .collect::<Vec<_>>();
            let mut document = document(blocks);
            document
                .set_selection(DocumentSelection::Gap { before: 0 })
                .expect("start");

            // Walking forward to the end and back must retrace the same
            // positions: a caret that cannot get back where it came from is the
            // symptom users report as "the arrow keys skip".
            let mut forward = vec![document.focus_flat().expect("flat")];
            loop {
                let next = document
                    .moved(Direction::Forward, Granularity::Character, false)
                    .expect("moved");
                if next == document.selection() {
                    break;
                }
                document.set_selection(next).expect("caret");
                let position = document.focus_flat().expect("flat");
                prop_assert!(
                    position > *forward.last().expect("non-empty"),
                    "forward movement did not advance"
                );
                forward.push(position);
                prop_assert!(forward.len() <= usize::try_from(document.len()).expect("small") + 2);
            }
            let mut backward = vec![document.focus_flat().expect("flat")];
            loop {
                let previous = document
                    .moved(Direction::Backward, Granularity::Character, false)
                    .expect("moved");
                if previous == document.selection() {
                    break;
                }
                document.set_selection(previous).expect("caret");
                backward.push(document.focus_flat().expect("flat"));
            }
            backward.reverse();
            prop_assert_eq!(&forward, &backward);

            // Every visited position is either inside a block the caret may
            // enter, or a gap.
            for position in forward {
                match document.block_containing(position) {
                    Some(index) => prop_assert!(!document.blocks()[index].is_atomic()),
                    None => prop_assert!(document.gap_position(document.gap_index(position)) == position),
                }
            }
        }
    }
}
