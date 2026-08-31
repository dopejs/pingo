use core::fmt;

use pingo_abi::{AbiError, Prop, ResourceKind};
use pingo_scene::NodeId;

/// A paint build failure. The prior immutable Picture remains active.
#[allow(missing_docs)]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PaintError {
    LayoutTopologyMismatch,
    GeometryBitmapLengthMismatch {
        expected: usize,
        actual: usize,
    },
    MissingGeometry {
        node: NodeId,
    },
    MissingResource {
        resource_id: u32,
    },
    WrongResourceKind {
        resource_id: u32,
        expected: ResourceKind,
        actual: ResourceKind,
    },
    InvalidResource {
        resource_id: u32,
        reason: &'static str,
    },
    InvalidOpacity {
        node: NodeId,
    },
    MissingCachedSubtree {
        node: NodeId,
    },
    /// The retained paint cache contradicts itself or the Scene.
    ///
    /// Only reachable through the painted-text probe, which walks the cache
    /// rather than rebuilding it; a frame build cannot produce this.
    MalformedPaintCache {
        reason: &'static str,
    },
    WrongPropertyResource {
        node: NodeId,
        prop: Prop,
    },
    Abi(AbiError),
}

impl fmt::Display for PaintError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "paint build rejected: {self:?}")
    }
}

impl std::error::Error for PaintError {}

impl From<AbiError> for PaintError {
    fn from(error: AbiError) -> Self {
        Self::Abi(error)
    }
}
