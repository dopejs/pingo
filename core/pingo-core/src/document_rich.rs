//! Core-owned document position spaces.
//!
//! Compiled away entirely when the `rich-text` feature is off, leaving a stub
//! that reports no documents. Every caller in the engine goes through that
//! stub, so turning the capability off does not scatter `cfg` attributes
//! through the frame path.

use std::sync::Arc;

use pingo_abi::{
    CaretDirection, CaretGranularity, DocumentBlockRecord, DocumentOperation,
    DocumentSelectionRecord, EditTransactionKind, EditTransactionRecord, InputCommand, NodeKind,
    StructureKind, StructureRequestRecord, WireAffinity, WireDocumentSelection, WireMapSegment,
    WireMarkRun, WireRange,
};
use pingo_collections::OrderedMap;
use pingo_edit::{
    BlockKey, BlockProjection, BlockReplacement, Composition, Direction, Document, DocumentBlock,
    DocumentEdit, DocumentPosition, DocumentSelection, Granularity, MarkRuns, PositionMap,
    StructureRequest, Utf16Range,
};

/// What a replacing command turned out to ask for.
enum Planned {
    /// Text Core applies itself.
    Edit(NodeId, DocumentEdit),
    /// A block boundary only the Shell's schema can decide.
    Split(NodeId),
    /// Nothing this controller owns.
    Nothing,
}

/// The block a text selection's caret is in, if it is in text at all.
const fn focus_key(selection: DocumentSelection) -> Option<BlockKey> {
    match selection {
        DocumentSelection::Text { focus, .. } => Some(focus.key),
        DocumentSelection::Node { .. } | DocumentSelection::Gap { .. } => None,
    }
}

/// One step of an input method composition.
#[derive(Clone, Copy)]
enum Composing<'a> {
    Begin,
    Update(&'a str),
    Commit(Option<&'a str>),
    Cancel,
}
use pingo_scene::{NodeId, Scene};

use crate::CoreError;
use crate::editing::EditDisplay;

/// Observable counters for the document round trip.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub(crate) struct DocumentMetrics {
    /// Structure requests handed to the Shell.
    pub(crate) structure_requests: u64,
    /// Times the Shell's projection disagreed with Core's optimistic guess.
    ///
    /// A disagreement is legal -- the Shell owns the schema -- but a silent one
    /// is not diagnosable, so every one is counted.
    pub(crate) corrections: u64,
}

#[derive(Clone)]
struct ActiveDocument {
    document: Document,
    /// Shell revision of the projection Core last accepted.
    shell_revision: u64,
    /// What Core predicted the projection would become, if anything.
    predicted: Option<Vec<BlockKey>>,
    next_sequence: u32,
    pending: Vec<StructureRequestRecord>,
    /// Selection last reported to the Shell, so only changes are sent.
    reported: Option<DocumentSelection>,
    /// Core's revision of this document's text.
    ///
    /// One counter for the document rather than one per block: a transaction
    /// carries the revision the Shell must not overwrite with anything older,
    /// and an edit that touches two blocks is one edit.
    revision: u64,
    /// Text transactions produced since the last drain.
    transactions: Vec<EditTransactionRecord>,
    /// Scene node holding each materialized block's text.
    ///
    /// Keys are the Shell's, not node identifiers: a block the Shell has not
    /// materialized has no node at all, so the two cannot be the same number.
    nodes: OrderedMap<BlockKey, NodeId>,
}

impl ActiveDocument {
    /// Records one transaction per block whose text this edit changed.
    ///
    /// Without them the Shell repaints what Core drew but never learns what was
    /// typed, so its own document diverges on the first keystroke.
    fn record_text_transactions(
        &mut self,
        edit: &DocumentEdit,
        base_revision: u64,
        previous_lengths: &[Option<u32>],
    ) {
        for (replacement, previous_length) in edit.replacements.iter().zip(previous_lengths) {
            // An unmaterialized block has no node to report against; the
            // Shell's next projection is what reconciles it.
            let Some(node) = self.nodes.get(&replacement.key).copied() else {
                continue;
            };
            let Some(index) = self.document.index_of(replacement.key) else {
                continue;
            };
            let block = &self.document.blocks()[index];
            let caret =
                block_selection(self.document.selection(), replacement.key).unwrap_or_else(|| {
                    let end = replacement
                        .range
                        .start
                        .saturating_add(utf16_len(&replacement.text));
                    [end, end]
                });
            self.transactions.push(EditTransactionRecord {
                node_id: node.raw(),
                base_revision,
                revision: self.revision,
                delta: Some((
                    WireRange {
                        start: replacement.range.start,
                        end: replacement.range.end,
                    },
                    replacement.text.clone(),
                )),
                selection: caret,
                affinities: [WireAffinity::Downstream, WireAffinity::Downstream],
                composition: None,
                kind: EditTransactionKind::Edit,
                marks: Some(
                    block
                        .marks()
                        .runs()
                        .iter()
                        .map(|run| WireMarkRun {
                            length: run.length,
                            style: run.style,
                            font: run.font,
                        })
                        .collect(),
                ),
                map: previous_length
                    .map_or_else(Vec::new, |length| replacement_map(replacement, length)),
            });
        }
    }
}

/// Core-owned document position spaces, one per configured document root.
#[derive(Clone, Default)]
pub(crate) struct DocumentController {
    documents: OrderedMap<NodeId, ActiveDocument>,
    /// The document the host's input surface is activated over, if any.
    ///
    /// A document holds its selection whether or not it is focused, the way an
    /// editing session does, but an unfocused one draws no caret and offers no
    /// caret geometry: the surface it would belong to is not there.
    focused: Option<NodeId>,
    metrics: DocumentMetrics,
}

impl DocumentController {
    /// Rebuilds every configured document from the committed Scene.
    ///
    /// The Scene is the projection: the Shell already declares its tree there,
    /// so a second declaration channel would be a second tree to keep aligned.
    pub(crate) fn synchronize(&mut self, scene: &Scene) -> Result<(), CoreError> {
        let roots = scene
            .ids()
            .iter()
            .copied()
            .filter(|node| scene.document(*node).is_some())
            .collect::<Vec<_>>();
        self.documents.retain(|node, _| roots.contains(node));
        if self.focused.is_some_and(|node| !roots.contains(&node)) {
            self.focused = None;
        }
        for root in roots {
            let Some(declared) = scene.document(root) else {
                continue;
            };
            let revision = declared.revision;
            let projection = project(scene, &declared.blocks);
            let keys = projection.iter().map(|block| block.key).collect::<Vec<_>>();
            let nodes = declared
                .blocks
                .iter()
                .filter_map(|record| {
                    NodeId::from_raw(record.node_id)
                        .ok()
                        .filter(|node| scene.resolve(*node).is_some())
                        .map(|node| (BlockKey::from(record.key), node))
                })
                .collect::<OrderedMap<_, _>>();
            if let Some(active) = self.documents.get_mut(&root) {
                if active.shell_revision == revision {
                    // The revision guards the text, not the topology. A Shell
                    // may re-parent a block without editing it -- a block type
                    // that draws differently, a wrapper appearing, a
                    // virtualized block materializing -- and the node behind
                    // the key changes at the same revision. Keeping the old
                    // node made every press on that block name a node the
                    // document no longer had.
                    active.nodes = nodes;
                    continue;
                }
                if let Some(predicted) = active.predicted.take()
                    && predicted != keys
                {
                    self.metrics.corrections = self.metrics.corrections.saturating_add(1);
                }
                active.shell_revision = revision;
                active.nodes = nodes;
                active
                    .document
                    .reproject(projection)
                    .map_err(CoreError::Edit)?;
                continue;
            }
            let document = Document::new(projection).map_err(CoreError::Edit)?;
            self.documents.insert(
                root,
                ActiveDocument {
                    document,
                    shell_revision: revision,
                    predicted: None,
                    next_sequence: 1,
                    revision: 1,
                    transactions: Vec::new(),
                    pending: Vec::new(),
                    reported: None,
                    nodes,
                },
            );
        }
        Ok(())
    }

    /// Returns whether a node belongs to a document Core already owns.
    pub(crate) fn owns(&self, node: NodeId) -> bool {
        self.documents
            .values()
            .any(|active| active.nodes.values().any(|owned| *owned == node))
    }

    /// The materialized blocks of a document, in order, with their nodes.
    ///
    /// A press on the document itself rather than on a block -- which is what
    /// the host sends once its input surface is active -- has to find the block
    /// before it can find an offset.
    pub(crate) fn block_nodes(&self, root: NodeId) -> Vec<(BlockKey, NodeId)> {
        let Some(active) = self.documents.get(&root) else {
            return Vec::new();
        };
        active
            .document
            .blocks()
            .iter()
            .filter_map(|block| {
                active
                    .nodes
                    .get(&block.key())
                    .map(|node| (block.key(), *node))
            })
            .collect()
    }

    /// The block the caret is in and its selection span inside that block.
    ///
    /// The focus edge, not the anchor: a selection that crosses blocks is
    /// reported against the block the caret is actually in, which is where an
    /// input method's candidate window and a selection toolbar belong.
    pub(crate) fn focus_root_visual(&self) -> Option<(NodeId, NodeId, [u32; 2])> {
        // Not gated on focus. A selection has a place on screen whether or not
        // the input surface is over it, and a toolbar that anchors to it needs
        // that place before the reader has touched anything.
        for (root, active) in self.documents.iter() {
            let DocumentSelection::Text { anchor, focus } = active.document.selection() else {
                continue;
            };
            let node = active.nodes.get(&focus.key).copied()?;
            let span = if anchor.key == focus.key {
                [
                    anchor.offset.min(focus.offset),
                    anchor.offset.max(focus.offset),
                ]
            } else {
                // The other edge is in another block, so this block contributes
                // from its own edge to the caret.
                [focus.offset, focus.offset]
            };
            return Some((*root, node, span));
        }
        None
    }

    /// Whether this node is a document root Core is holding.
    pub(crate) fn is_root(&self, node: NodeId) -> bool {
        self.documents.contains_key(&node)
    }

    /// The document root and block key a Scene node draws, if any.
    ///
    /// A press lands on the node that painted the block, but a document
    /// selection is stated in the Shell's block keys against the document root,
    /// so the caret cannot be placed without translating one into the other.
    /// The block the caret is in and where it sits inside it.
    ///
    /// Vertical movement needs a point, not an offset: the answer is whichever
    /// block the line above or below belongs to, which only geometry knows.
    pub(crate) fn focus_position(&self, root: NodeId) -> Option<(NodeId, u32)> {
        let active = self.documents.get(&root)?;
        let DocumentSelection::Text { focus, .. } = active.document.selection() else {
            return None;
        };
        Some((active.nodes.get(&focus.key).copied()?, focus.offset))
    }

    pub(crate) fn locate(&self, node: NodeId) -> Option<(NodeId, BlockKey)> {
        self.documents.iter().find_map(|(root, active)| {
            active
                .nodes
                .iter()
                .find(|(_, owned)| **owned == node)
                .map(|(key, _)| (*root, *key))
        })
    }

    /// The anchor a shift-press extends from, in block key and UTF-16 offset.
    ///
    /// Plain integers rather than the selection type: the caller only needs the
    /// edge that stays put, and the document types do not exist in a build
    /// without the capability.
    pub(crate) fn text_anchor(&self, root: NodeId) -> Option<(BlockKey, u32)> {
        match self.documents.get(&root)?.document.selection() {
            DocumentSelection::Text { anchor, .. } => Some((anchor.key, anchor.offset)),
            DocumentSelection::Node { .. } | DocumentSelection::Gap { .. } => None,
        }
    }

    /// The block's current text, for word selection at a press.
    pub(crate) fn block_text(&self, root: NodeId, key: BlockKey) -> Option<Arc<str>> {
        let active = self.documents.get(&root)?;
        let index = active.document.index_of(key)?;
        Some(Arc::from(active.document.blocks()[index].text()))
    }

    /// Returns the observable round-trip counters.
    pub(crate) const fn metrics(&self) -> DocumentMetrics {
        self.metrics
    }

    /// Returns what every document block currently paints.
    pub(crate) fn display_overrides(&self) -> std::collections::HashMap<NodeId, EditDisplay> {
        let mut result = std::collections::HashMap::new();
        for active in self.documents.values() {
            // Iterate the materialized blocks, not the document: a five
            // thousand block document has sixty of them, and walking the rest
            // to skip them is work proportional to the document rather than to
            // the screen.
            for (key, node) in active.nodes.iter() {
                let Some(index) = active.document.index_of(*key) else {
                    continue;
                };
                let block = &active.document.blocks()[index];
                result.insert(
                    *node,
                    EditDisplay {
                        text: Arc::from(block.text()),
                        marks: Some(block.marks().clone()),
                    },
                );
            }
        }
        result
    }

    /// Applies one document command, returning the blocks that changed.
    pub(crate) fn apply_command(
        &mut self,
        command: &InputCommand,
    ) -> Result<Vec<NodeId>, CoreError> {
        let (root, edit) = match command {
            InputCommand::SetDocumentSelection {
                node_id, selection, ..
            } => {
                let root = NodeId::from_raw(*node_id)?;
                let active = self
                    .documents
                    .get_mut(&root)
                    .ok_or(CoreError::InvalidEditableTarget { node: root })?;
                active
                    .document
                    .set_selection(document_selection(*selection))
                    .map_err(CoreError::Edit)?;
                return Ok(Vec::new());
            }
            // The document command and the single-value one carry the same
            // fields and mean the same thing here; which one the host sends
            // depends only on whether it went through the native input surface.
            InputCommand::MoveDocumentCaret {
                node_id,
                direction,
                granularity,
                extend,
            }
            | InputCommand::MoveCaret {
                node_id,
                direction,
                granularity,
                extend,
            } => return self.move_caret(*node_id, *direction, *granularity, *extend),
            // Everything that replaces text, whichever command said so.
            InputCommand::EditDocument { .. }
            | InputCommand::Insert { .. }
            | InputCommand::DeleteBackward { .. }
            | InputCommand::DeleteForward { .. }
            // The native surface's two block-local commands plan the same way;
            // leaving them out of this list dropped every keystroke that came
            // through the OS input surface, silently.
            | InputCommand::Replace { .. }
            | InputCommand::SetSelection { .. } => match self.plan_text_command(command)? {
                Planned::Edit(root, edit) => (root, edit),
                Planned::Split(root) => return self.plan_split(root),
                Planned::Nothing => return Ok(Vec::new()),
            },
            // Focus over a document is the surface's, not a session's: the
            // caret already lives in the document, so there is nothing to
            // move -- but the command must be accepted rather than rejected.
            InputCommand::FocusEditable { node_id } | InputCommand::BlurEditable { node_id } => {
                let root = NodeId::from_raw(*node_id)?;
                if !self.documents.contains_key(&root) {
                    return Err(CoreError::InvalidEditableTarget { node: root });
                }
                self.focused = matches!(command, InputCommand::FocusEditable { .. }).then_some(root);
                return Ok(self.block_nodes(root).into_iter().map(|(_, node)| node).collect());
            }
            // Undo is Core's, over the whole document rather than per block:
            // one flat position space means one history, so a burst that
            // crossed a block boundary comes back as one step.
            InputCommand::Undo { node_id, .. } | InputCommand::Redo { node_id, .. } => {
                let root = NodeId::from_raw(*node_id)?;
                let backward = matches!(command, InputCommand::Undo { .. });
                let active = self
                    .documents
                    .get_mut(&root)
                    .ok_or(CoreError::InvalidEditableTarget { node: root })?;
                let applied = if backward {
                    active.document.undo()
                } else {
                    active.document.redo()
                }
                .map_err(CoreError::Edit)?;
                let Some(edit) = applied else {
                    return Ok(Vec::new());
                };
                (root, edit)
            }
            // A composition is a document-level edit like any other: it is
            // addressed to the document root, so the same four commands an
            // editable answers work here without a second opcode.
            InputCommand::BeginComposition { node_id, .. } => {
                return self.compose(NodeId::from_raw(*node_id)?, Composing::Begin);
            }
            InputCommand::UpdateComposition { node_id, text, .. } => {
                return self.compose(NodeId::from_raw(*node_id)?, Composing::Update(text));
            }
            InputCommand::CommitComposition { node_id, text, .. } => {
                return self.compose(
                    NodeId::from_raw(*node_id)?,
                    Composing::Commit(text.as_deref()),
                );
            }
            InputCommand::CancelComposition { node_id, .. } => {
                return self.compose(NodeId::from_raw(*node_id)?, Composing::Cancel);
            }
            _ => return Ok(Vec::new()),
        };
        self.commit_edit(root, &edit)
    }

    /// Plans the text edit a replacing command asks for.
    ///
    /// `None` means the command produced no edit of its own -- a split hands
    /// the work to the Shell and answers on the reverse channel instead.
    fn plan_text_command(&mut self, command: &InputCommand) -> Result<Planned, CoreError> {
        let planned = match command {
            InputCommand::EditDocument {
                node_id,
                operation,
                style,
                font,
                text,
                ..
            } => {
                let root = NodeId::from_raw(*node_id)?;
                let active = self
                    .documents
                    .get(&root)
                    .ok_or(CoreError::InvalidEditableTarget { node: root })?;
                let edit = match operation {
                    DocumentOperation::DeleteBackward => {
                        active.document.plan_delete(Direction::Backward)
                    }
                    DocumentOperation::DeleteForward => {
                        active.document.plan_delete(Direction::Forward)
                    }
                    DocumentOperation::Insert => {
                        let units = u32::try_from(text.encode_utf16().count()).map_err(|_| {
                            CoreError::InvalidEditableConfiguration(
                                "document insertion exceeds the offset space",
                            )
                        })?;
                        active
                            .document
                            .plan_replace(text.clone(), MarkRuns::uniform(units, *style, *font))
                    }
                    // Enter is the Shell's decision, not a text edit: Core
                    // moves the caret and asks on the reverse channel.
                    DocumentOperation::Split => return Ok(Planned::Split(root)),
                }
                .map_err(CoreError::Edit)?;
                (root, edit)
            }
            // The host's native input surface speaks the single-value commands,
            // because to an input method a document is one value with one
            // caret. Core knows which block that caret is in, so an insertion
            // needs no offsets and a selection is stated in the block the
            // surface was activated over.
            InputCommand::Insert { node_id, text, .. } => {
                let root = NodeId::from_raw(*node_id)?;
                let active = self
                    .documents
                    .get(&root)
                    .ok_or(CoreError::InvalidEditableTarget { node: root })?;
                let units = u32::try_from(text.encode_utf16().count()).map_err(|_| {
                    CoreError::InvalidEditableConfiguration(
                        "document insertion exceeds the offset space",
                    )
                })?;
                let edit = active
                    .document
                    .plan_replace(text.clone(), MarkRuns::uniform(units, 0, 0))
                    .map_err(CoreError::Edit)?;
                (root, edit)
            }
            // The native surface addresses a range inside one block; it is the
            // block the caret is in, which is what it was activated over.
            InputCommand::Replace { .. } | InputCommand::SetSelection { .. } => {
                return self.plan_surface_command(command);
            }
            InputCommand::DeleteBackward { node_id, .. } => {
                let root = NodeId::from_raw(*node_id)?;
                let active = self
                    .documents
                    .get(&root)
                    .ok_or(CoreError::InvalidEditableTarget { node: root })?;
                let edit = active
                    .document
                    .plan_delete(Direction::Backward)
                    .map_err(CoreError::Edit)?;
                (root, edit)
            }
            InputCommand::DeleteForward { node_id, .. } => {
                let root = NodeId::from_raw(*node_id)?;
                let active = self
                    .documents
                    .get(&root)
                    .ok_or(CoreError::InvalidEditableTarget { node: root })?;
                let edit = active
                    .document
                    .plan_delete(Direction::Forward)
                    .map_err(CoreError::Edit)?;
                (root, edit)
            }
            _ => return Ok(Planned::Nothing),
        };
        Ok(Planned::Edit(planned.0, planned.1))
    }

    /// Answers the two commands the native input surface states block-locally.
    ///
    /// It holds one block's value, so its offsets are inside that block; Core
    /// resolves them against the caret rather than against the whole document.
    fn plan_surface_command(&mut self, command: &InputCommand) -> Result<Planned, CoreError> {
        let planned = match command {
            // The native surface holds one block's value, so it addresses a
            // range inside that block. Core knows which block the caret is in,
            // which is the one the surface was activated over.
            InputCommand::Replace {
                node_id,
                start,
                end,
                text,
                ..
            } => {
                let root = NodeId::from_raw(*node_id)?;
                let active = self
                    .documents
                    .get_mut(&root)
                    .ok_or(CoreError::InvalidEditableTarget { node: root })?;
                let Some(key) = focus_key(active.document.selection()) else {
                    return Ok(Planned::Nothing);
                };
                active
                    .document
                    .set_selection(DocumentSelection::Text {
                        anchor: DocumentPosition::new(key, *start),
                        focus: DocumentPosition::new(key, *end),
                    })
                    .map_err(CoreError::Edit)?;
                let units = u32::try_from(text.encode_utf16().count()).map_err(|_| {
                    CoreError::InvalidEditableConfiguration(
                        "document replacement exceeds the offset space",
                    )
                })?;
                let edit = active
                    .document
                    .plan_replace(text.clone(), MarkRuns::uniform(units, 0, 0))
                    .map_err(CoreError::Edit)?;
                (root, edit)
            }
            InputCommand::SetSelection {
                node_id, selection, ..
            } => {
                let root = NodeId::from_raw(*node_id)?;
                let active = self
                    .documents
                    .get_mut(&root)
                    .ok_or(CoreError::InvalidEditableTarget { node: root })?;
                let Some(key) = focus_key(active.document.selection()) else {
                    return Ok(Planned::Nothing);
                };
                let moved = DocumentSelection::Text {
                    anchor: DocumentPosition::new(key, selection.anchor.offset),
                    focus: DocumentPosition::new(key, selection.focus.offset),
                };
                active
                    .document
                    .set_selection(moved)
                    .map_err(CoreError::Edit)?;
                return Ok(Planned::Nothing);
            }
            _ => return Ok(Planned::Nothing),
        };
        Ok(Planned::Edit(planned.0, planned.1))
    }

    /// Runs one step of an input method composition inside the caret's block.
    ///
    /// The composing range is recorded after the edit, not before, because it
    /// is stated in the revision the edit produced. Committing and cancelling
    /// both end the composition; what differs is whether the proposed text
    /// stays.
    fn compose(&mut self, root: NodeId, step: Composing<'_>) -> Result<Vec<NodeId>, CoreError> {
        let Some(active) = self.documents.get(&root) else {
            return Ok(Vec::new());
        };
        let (edit, next) = match step {
            Composing::Begin => {
                let edit = active
                    .document
                    .plan_begin_composition()
                    .map_err(CoreError::Edit)?;
                let anchor = match edit.selection {
                    DocumentSelection::Text { focus, .. } => focus,
                    // A gap or an object has no text to compose into; the
                    // Shell has to make a block first.
                    DocumentSelection::Node { .. } | DocumentSelection::Gap { .. } => {
                        return Ok(Vec::new());
                    }
                };
                (
                    edit,
                    Some(Composition {
                        key: anchor.key,
                        range: Utf16Range::collapsed(anchor.offset),
                    }),
                )
            }
            Composing::Update(text) => {
                let (edit, composition) = self.plan_compose_text(root, text)?;
                (edit, composition)
            }
            Composing::Commit(text) => {
                let value = text.unwrap_or("");
                let (edit, _) = self.plan_compose_text(root, value)?;
                (edit, None)
            }
            Composing::Cancel => {
                let (edit, _) = self.plan_compose_text(root, "")?;
                (edit, None)
            }
        };
        let changed = self.commit_edit(root, &edit)?;
        if let Some(active) = self.documents.get_mut(&root) {
            active.document.set_composition(next);
        }
        Ok(changed)
    }

    /// Plans replacing the composing range with `text`, and where it lands.
    fn plan_compose_text(
        &self,
        root: NodeId,
        text: &str,
    ) -> Result<(DocumentEdit, Option<Composition>), CoreError> {
        let active = self
            .documents
            .get(&root)
            .ok_or(CoreError::InvalidEditableTarget { node: root })?;
        let units = u32::try_from(text.encode_utf16().count()).map_err(|_| {
            CoreError::InvalidEditableConfiguration("composition exceeds the offset space")
        })?;
        let edit = active
            .document
            .plan_composition_replace(text.to_owned(), MarkRuns::uniform(units, 0, 0))
            .map_err(CoreError::Edit)?;
        let composition = match edit.selection {
            DocumentSelection::Text { focus, .. } => Some(Composition {
                key: focus.key,
                range: Utf16Range {
                    start: focus.offset.saturating_sub(units),
                    end: focus.offset,
                },
            }),
            DocumentSelection::Node { .. } | DocumentSelection::Gap { .. } => None,
        };
        Ok((edit, composition))
    }

    /// Moves the document caret, which is one caret over one position space.
    fn move_caret(
        &mut self,
        node_id: u32,
        direction: CaretDirection,
        granularity: CaretGranularity,
        extend: bool,
    ) -> Result<Vec<NodeId>, CoreError> {
        let root = NodeId::from_raw(node_id)?;
        let active = self
            .documents
            .get_mut(&root)
            .ok_or(CoreError::InvalidEditableTarget { node: root })?;
        let moved = match direction {
            // Home and End have no line to go to at document level: line
            // geometry lives with the block's layout, so they degrade to the
            // block's own edges. Stepping one character instead, which is what
            // the shared mapping did, made End the right arrow over again.
            CaretDirection::LineStart | CaretDirection::LineEnd => block_edge_selection(
                &active.document,
                matches!(direction, CaretDirection::LineEnd),
                extend,
            )?,
            _ => active
                .document
                .moved(
                    caret_direction(direction),
                    caret_granularity(granularity),
                    extend,
                )
                .map_err(CoreError::Edit)?,
        };
        active
            .document
            .set_selection(moved)
            .map_err(CoreError::Edit)?;
        Ok(Vec::new())
    }

    /// Plans an Enter press: Core moves the caret, the Shell makes the block.
    fn plan_split(&mut self, root: NodeId) -> Result<Vec<NodeId>, CoreError> {
        let active = self
            .documents
            .get_mut(&root)
            .ok_or(CoreError::InvalidEditableTarget { node: root })?;
        let DocumentSelection::Text { anchor, focus } = active.document.selection() else {
            // Splitting a gap or an object is a schema question with no text
            // position to split at, so the Shell decides alone.
            return Ok(Vec::new());
        };
        if anchor != focus {
            let edit = active
                .document
                .plan_delete(Direction::Backward)
                .map_err(CoreError::Edit)?;
            self.commit_edit(root, &edit)?;
        }
        let active = self
            .documents
            .get_mut(&root)
            .ok_or(CoreError::InvalidEditableTarget { node: root })?;
        let DocumentSelection::Text { focus, .. } = active.document.selection() else {
            return Ok(Vec::new());
        };
        let sequence = active.next_sequence;
        active.next_sequence = active.next_sequence.saturating_add(1);
        active.pending.push(StructureRequestRecord {
            node_id: root.raw(),
            sequence,
            kind: StructureKind::Split,
            target: wire_key(focus.key),
            source: 0,
            offset: focus.offset,
            keys: Vec::new(),
        });
        self.metrics.structure_requests = self.metrics.structure_requests.saturating_add(1);
        Ok(Vec::new())
    }

    fn commit_edit(&mut self, root: NodeId, edit: &DocumentEdit) -> Result<Vec<NodeId>, CoreError> {
        let active = self
            .documents
            .get_mut(&root)
            .ok_or(CoreError::InvalidEditableTarget { node: root })?;
        let mut changed = edit
            .replacements
            .iter()
            .filter_map(|replacement| active.nodes.get(&replacement.key).copied())
            .collect::<Vec<_>>();
        let base_revision = active.revision;
        if !edit.replacements.is_empty() {
            active.revision = active.revision.saturating_add(1);
        }
        // The block lengths the map is written against are the ones before the
        // edit, so they are read before it is applied.
        let previous_lengths = edit
            .replacements
            .iter()
            .map(|replacement| {
                active
                    .document
                    .index_of(replacement.key)
                    .map(|index| active.document.blocks()[index].len_utf16())
            })
            .collect::<Vec<_>>();
        active.document.apply_edit(edit).map_err(CoreError::Edit)?;
        active.record_text_transactions(edit, base_revision, &previous_lengths);
        for request in &edit.structure {
            let sequence = active.next_sequence;
            active.next_sequence = active.next_sequence.saturating_add(1);
            let record = match request {
                StructureRequest::Remove { keys } => StructureRequestRecord {
                    node_id: root.raw(),
                    sequence,
                    kind: StructureKind::Remove,
                    target: 0,
                    source: 0,
                    offset: 0,
                    keys: keys.iter().copied().map(wire_key).collect(),
                },
                StructureRequest::Merge { target, source } => {
                    changed.extend(active.nodes.get(target).copied());
                    StructureRequestRecord {
                        node_id: root.raw(),
                        sequence,
                        kind: StructureKind::Merge,
                        target: wire_key(*target),
                        source: wire_key(*source),
                        offset: 0,
                        keys: Vec::new(),
                    }
                }
            };
            active.pending.push(record);
            self.metrics.structure_requests = self.metrics.structure_requests.saturating_add(1);
        }
        if !edit.structure.is_empty() {
            // Record what Core believes the projection will become, so the
            // Shell's answer can be compared rather than merely accepted.
            active.predicted = Some(
                active
                    .document
                    .blocks()
                    .iter()
                    .map(DocumentBlock::key)
                    .collect(),
            );
        }
        changed.sort_unstable();
        changed.dedup();
        Ok(changed)
    }

    /// Returns whether anything is waiting for the Shell on the reverse channel.
    pub(crate) fn has_pending_structure(&self) -> bool {
        self.documents.values().any(|active| {
            !active.pending.is_empty()
                || !active.transactions.is_empty()
                || active.reported != Some(active.document.selection())
        })
    }

    /// Drains the text transactions produced since the last drain.
    pub(crate) fn take_transactions(&mut self) -> Vec<EditTransactionRecord> {
        let mut result = Vec::new();
        for active in self.documents.values_mut() {
            result.append(&mut active.transactions);
        }
        result
    }

    /// Drains the document selections that changed since the last drain.
    ///
    /// Core is what moved the caret, so the Shell has to be told: a toolbar
    /// that does not know where the selection is cannot say whether bold is on.
    pub(crate) fn take_selections(&mut self) -> Vec<DocumentSelectionRecord> {
        let mut result = Vec::new();
        for (node, active) in self.documents.iter_mut() {
            let selection = active.document.selection();
            if active.reported == Some(selection) {
                continue;
            }
            active.reported = Some(selection);
            result.push(DocumentSelectionRecord {
                node_id: node.raw(),
                selection: wire_selection(selection, &active.document),
            });
        }
        result
    }

    /// Drains the structure requests produced since the last frame.
    pub(crate) fn take_structure(&mut self) -> Vec<StructureRequestRecord> {
        let mut result = Vec::new();
        for active in self.documents.values_mut() {
            result.append(&mut active.pending);
        }
        // `sequence` is per-document and monotonic, so no two records compare
        // equal and stability has nothing to preserve. An unstable sort is
        // still deterministic for a given input, which is what the frame
        // contract requires; a stable one would link a second sort algorithm
        // into the module for no observable difference.
        result.sort_unstable_by_key(|record| (record.node_id, record.sequence));
        result
    }

    /// Returns the selection of the document rooted at `root`.
    #[cfg_attr(not(test), allow(dead_code))]
    pub(crate) fn selection(&self, root: NodeId) -> Option<DocumentSelection> {
        self.documents
            .get(&root)
            .map(|active| active.document.selection())
    }

    /// Returns the per-block selection spans the frame must decorate.
    ///
    /// A text selection may cover several blocks, and an object selection
    /// covers a block that has no text at all, so paint needs a list rather
    /// than one active editor.
    pub(crate) fn visuals(&self) -> Vec<BlockVisual> {
        let mut visuals = Vec::new();
        let Some(focused) = self.focused else {
            return visuals;
        };
        for (root, active) in self.documents.iter() {
            if *root != focused {
                continue;
            }
            let document = &active.document;
            match document.selection() {
                DocumentSelection::Text { .. } => {
                    let Ok(covered) = document.covered_blocks(document.selection()) else {
                        continue;
                    };
                    for (index, range) in covered {
                        let block = &document.blocks()[index];
                        let Some(node) = active.nodes.get(&block.key()).copied() else {
                            continue;
                        };
                        visuals.push(BlockVisual {
                            node,
                            kind: BlockVisualKind::Text {
                                selection: [range.start, range.end],
                            },
                        });
                    }
                }
                DocumentSelection::Node { key } => {
                    if let Some(node) = active.nodes.get(&key).copied() {
                        visuals.push(BlockVisual {
                            node,
                            kind: BlockVisualKind::Object,
                        });
                    }
                }
                DocumentSelection::Gap { before } => {
                    // The gap draws against the block it precedes, or after the
                    // last one when it is the document's trailing position.
                    let (index, trailing) = if before < document.blocks().len() {
                        (before, false)
                    } else {
                        (document.blocks().len().saturating_sub(1), true)
                    };
                    let Some(block) = document.blocks().get(index) else {
                        continue;
                    };
                    if let Some(node) = active.nodes.get(&block.key()).copied() {
                        visuals.push(BlockVisual {
                            node,
                            kind: BlockVisualKind::Gap { trailing },
                        });
                    }
                }
            }
        }
        visuals
    }
}

/// What one block has to draw for the document's selection.
#[derive(Clone, Copy, Debug, PartialEq)]
pub(crate) struct BlockVisual {
    /// The block's Scene node.
    pub(crate) node: NodeId,
    /// What to draw on it.
    pub(crate) kind: BlockVisualKind,
}

/// The three things a block can be asked to draw.
#[derive(Clone, Copy, Debug, PartialEq)]
pub(crate) enum BlockVisualKind {
    /// A character range, in the block's own UTF-16 offsets.
    Text {
        /// Inclusive start and exclusive end offsets.
        selection: [u32; 2],
    },
    /// The whole block, selected as an object.
    Object,
    /// A caret in the gap before this block, or after it when trailing.
    Gap {
        /// Whether the gap follows the block instead of preceding it.
        trailing: bool,
    },
}

/// Turns the Shell's declared block list into a projection.
///
/// The list is authoritative about which blocks exist and how long they are;
/// the Scene supplies the text of the ones it has nodes for. A block with no
/// node is one the Shell has not materialized, and it enters the position
/// space as a placeholder of the declared length.
fn project(scene: &Scene, declared: &[DocumentBlockRecord]) -> Vec<BlockProjection> {
    declared
        .iter()
        .map(|record| {
            let key = BlockKey::from(record.key);
            if record.atomic {
                return BlockProjection::object(key);
            }
            let materialized = NodeId::from_raw(record.node_id)
                .ok()
                .filter(|node| {
                    matches!(
                        scene.kind(*node),
                        Some(NodeKind::Text | NodeKind::EditableText)
                    )
                })
                .and_then(|node| block_content(scene, node));
            match materialized {
                Some((text, marks)) => BlockProjection::text(key, text, marks),
                None => BlockProjection::placeholder(key, record.len_utf16),
            }
        })
        .collect()
}

fn block_content(scene: &Scene, node: NodeId) -> Option<(String, Option<MarkRuns>)> {
    let text = crate::editing::scene_block_text(scene, node)?;
    Some((text, crate::editing::scene_block_marks(scene, node)))
}

/// Narrows a block key for the wire, which carries the Shell's own u32 keys.
fn wire_key(key: BlockKey) -> u32 {
    u32::try_from(key).unwrap_or(u32::MAX)
}

/// Moves the caret to the edge of the block it is in.
///
/// The anchor stays put when the movement extends, so shift-End selects to the
/// end of the block rather than collapsing there.
fn block_edge_selection(
    document: &Document,
    forward: bool,
    extend: bool,
) -> Result<DocumentSelection, CoreError> {
    let selection = document.selection();
    let DocumentSelection::Text { anchor, focus } = selection else {
        return Ok(selection);
    };
    let Some(block) = document
        .blocks()
        .iter()
        .find(|candidate| candidate.key() == focus.key)
    else {
        return Err(CoreError::Edit(pingo_edit::EditError::UnknownBlock));
    };
    let offset = if forward { block.len_utf16() } else { 0 };
    let moved = DocumentPosition::new(focus.key, offset);
    Ok(DocumentSelection::Text {
        anchor: if extend { anchor } else { moved },
        focus: moved,
    })
}

const fn caret_direction(direction: CaretDirection) -> Direction {
    match direction {
        // Vertical movement needs line geometry, which lives with the block's
        // own layout; at document level it degrades to the block edge in that
        // direction rather than silently doing nothing.
        CaretDirection::Backward | CaretDirection::Up | CaretDirection::LineStart => {
            Direction::Backward
        }
        CaretDirection::Forward | CaretDirection::Down | CaretDirection::LineEnd => {
            Direction::Forward
        }
    }
}

const fn caret_granularity(granularity: CaretGranularity) -> Granularity {
    match granularity {
        CaretGranularity::Word => Granularity::Word,
        CaretGranularity::Grapheme => Granularity::Character,
    }
}

fn wire_selection(selection: DocumentSelection, document: &Document) -> WireDocumentSelection {
    match selection {
        DocumentSelection::Text { anchor, focus } => WireDocumentSelection::Text {
            anchor_key: wire_key(anchor.key),
            anchor_offset: anchor.offset,
            focus_key: wire_key(focus.key),
            focus_offset: focus.offset,
        },
        DocumentSelection::Node { key } => WireDocumentSelection::Node { key: wire_key(key) },
        DocumentSelection::Gap { before } => WireDocumentSelection::Gap {
            index: u32::try_from(before.min(document.blocks().len())).unwrap_or(u32::MAX),
        },
    }
}

fn document_selection(selection: WireDocumentSelection) -> DocumentSelection {
    match selection {
        WireDocumentSelection::Text {
            anchor_key,
            anchor_offset,
            focus_key,
            focus_offset,
        } => DocumentSelection::Text {
            anchor: DocumentPosition::new(BlockKey::from(anchor_key), anchor_offset),
            focus: DocumentPosition::new(BlockKey::from(focus_key), focus_offset),
        },
        WireDocumentSelection::Node { key } => DocumentSelection::Node {
            key: BlockKey::from(key),
        },
        WireDocumentSelection::Gap { index } => DocumentSelection::Gap {
            before: usize::try_from(index).unwrap_or(usize::MAX),
        },
    }
}

/// UTF-16 length of a string, saturating at the offset space.
fn utf16_len(value: &str) -> u32 {
    u32::try_from(value.encode_utf16().count()).unwrap_or(u32::MAX)
}

/// The block-local selection offsets, when the caret is inside that block.
///
/// A selection that ends somewhere else leaves the block's own transaction
/// reporting the edit's end instead, because the record's offsets are the
/// block's and there is nothing else to say about a block the caret left.
fn block_selection(selection: DocumentSelection, key: BlockKey) -> Option<[u32; 2]> {
    match selection {
        DocumentSelection::Text { anchor, focus } if anchor.key == key && focus.key == key => {
            Some([anchor.offset, focus.offset])
        }
        _ => None,
    }
}

/// How offsets in the block's previous revision move into this one.
fn replacement_map(replacement: &BlockReplacement, previous_length: u32) -> Vec<WireMapSegment> {
    let Ok(map) = PositionMap::from_replacement(
        replacement.range,
        utf16_len(&replacement.text),
        previous_length,
    ) else {
        // The replacement was validated against this block before it was
        // applied, so an out-of-range one cannot reach here; the identity is
        // the honest answer rather than a panic on a diagnostic path.
        return Vec::new();
    };
    if map.is_identity() {
        return Vec::new();
    }
    map.segments()
        .iter()
        .map(|segment| WireMapSegment {
            old_start: segment.old_start,
            old_end: segment.old_end,
            new_start: segment.new_start,
            new_end: segment.new_end,
            kept: segment.kept,
        })
        .collect()
}
