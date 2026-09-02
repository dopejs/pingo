//! Stub document controller for builds without the `rich-text` feature.

use std::collections::HashMap;

use pingo_abi::{
    DocumentSelectionRecord, EditTransactionRecord, InputCommand, StructureRequestRecord,
};
use pingo_scene::{NodeId, Scene};

use crate::CoreError;
use crate::editing::EditDisplay;

/// Observable counters for the document round trip; always zero here.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub(crate) struct DocumentMetrics {
    pub(crate) structure_requests: u64,
    pub(crate) corrections: u64,
}

/// A controller that owns no documents.
///
/// Every method is the identity so the engine's frame path is written once,
/// whether or not the capability is compiled in. The lints that would ask for
/// a smaller signature are asking it to stop matching the real controller,
/// which is the only reason this type exists.
#[derive(Clone, Default)]
pub(crate) struct DocumentController {
    /// Keeps the stub a non-unit struct so callers clone and default it the
    /// same way they do the real controller.
    _private: (),
}

// The lints below would each ask for a smaller signature, which is the one
// thing this type must not have: it exists to match the real controller so the
// engine's frame path is written once.
#[allow(
    clippy::unused_self,
    clippy::unnecessary_wraps,
    clippy::trivially_copy_pass_by_ref,
    clippy::needless_pass_by_ref_mut
)]
impl DocumentController {
    pub(crate) const fn synchronize(&mut self, _scene: &Scene) -> Result<(), CoreError> {
        Ok(())
    }

    pub(crate) const fn owns(&self, _node: NodeId) -> bool {
        false
    }

    pub(crate) const fn metrics(&self) -> DocumentMetrics {
        DocumentMetrics {
            structure_requests: 0,
            corrections: 0,
        }
    }

    pub(crate) fn display_overrides(&self) -> HashMap<NodeId, EditDisplay> {
        HashMap::new()
    }

    pub(crate) fn apply_command(
        &mut self,
        _command: &InputCommand,
    ) -> Result<Vec<NodeId>, CoreError> {
        Ok(Vec::new())
    }

    pub(crate) const fn has_pending_structure(&self) -> bool {
        false
    }

    pub(crate) const fn take_structure(&mut self) -> Vec<StructureRequestRecord> {
        Vec::new()
    }

    pub(crate) const fn take_transactions(&mut self) -> Vec<EditTransactionRecord> {
        Vec::new()
    }

    pub(crate) const fn take_selections(&mut self) -> Vec<DocumentSelectionRecord> {
        Vec::new()
    }

    pub(crate) fn visuals(&self) -> Vec<BlockVisual> {
        Vec::new()
    }
}

/// What one block has to draw for the document's selection.
#[derive(Clone, Copy, Debug, PartialEq)]
pub(crate) struct BlockVisual {
    pub(crate) node: NodeId,
    pub(crate) kind: BlockVisualKind,
}

/// The three things a block can be asked to draw.
///
/// Nothing constructs these without the capability; they exist so the engine's
/// paint path compiles unchanged.
#[allow(dead_code)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub(crate) enum BlockVisualKind {
    Text { selection: [u32; 2] },
    Object,
    Gap { trailing: bool },
}
