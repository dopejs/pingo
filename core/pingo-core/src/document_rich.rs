//! Core-owned document position spaces.
//!
//! Compiled away entirely when the `rich-text` feature is off, leaving a stub
//! that reports no documents. Every caller in the engine goes through that
//! stub, so turning the capability off does not scatter `cfg` attributes
//! through the frame path.

use std::sync::Arc;

use pingo_abi::{
    CaretDirection, CaretGranularity, DocumentBlockRecord, DocumentOperation,
    DocumentSelectionRecord, InputCommand, NodeKind, StructureKind, StructureRequestRecord,
    WireDocumentSelection,
};
use pingo_collections::OrderedMap;
use pingo_edit::{
    BlockKey, BlockProjection, Direction, Document, DocumentBlock, DocumentEdit, DocumentPosition,
    DocumentSelection, Granularity, MarkRuns, StructureRequest,
};
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
    /// Scene node holding each materialized block's text.
    ///
    /// Keys are the Shell's, not node identifiers: a block the Shell has not
    /// materialized has no node at all, so the two cannot be the same number.
    nodes: OrderedMap<BlockKey, NodeId>,
}

/// Core-owned document position spaces, one per configured document root.
#[derive(Clone, Default)]
pub(crate) struct DocumentController {
    documents: OrderedMap<NodeId, ActiveDocument>,
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

    /// Returns the observable round-trip counters.
    pub(crate) const fn metrics(&self) -> DocumentMetrics {
        self.metrics
    }

    /// Returns what every document block currently paints.
    pub(crate) fn display_overrides(&self) -> std::collections::HashMap<NodeId, EditDisplay> {
        let mut result = std::collections::HashMap::new();
        for active in self.documents.values() {
            for block in active.document.blocks() {
                let Some(node) = active.nodes.get(&block.key()) else {
                    continue;
                };
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
            InputCommand::MoveDocumentCaret {
                node_id,
                direction,
                granularity,
                extend,
            } => {
                let root = NodeId::from_raw(*node_id)?;
                let active = self
                    .documents
                    .get_mut(&root)
                    .ok_or(CoreError::InvalidEditableTarget { node: root })?;
                let moved = active
                    .document
                    .moved(
                        caret_direction(*direction),
                        caret_granularity(*granularity),
                        *extend,
                    )
                    .map_err(CoreError::Edit)?;
                active
                    .document
                    .set_selection(moved)
                    .map_err(CoreError::Edit)?;
                return Ok(Vec::new());
            }
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
                    DocumentOperation::Split => return self.plan_split(root),
                }
                .map_err(CoreError::Edit)?;
                (root, edit)
            }
            _ => return Ok(Vec::new()),
        };
        self.commit_edit(root, &edit)
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
        active.document.apply_edit(edit).map_err(CoreError::Edit)?;
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
            !active.pending.is_empty() || active.reported != Some(active.document.selection())
        })
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
        result.sort_by_key(|record| (record.node_id, record.sequence));
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
        for active in self.documents.values() {
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
