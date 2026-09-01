#![forbid(unsafe_code)]
#![deny(missing_docs)]

//! Deterministic, revisioned editable-text state for pingo Core.

#[cfg(feature = "document")]
mod document;
mod error;
mod index;
mod input;
mod mapping;
mod marks;
mod session;
mod types;

#[cfg(feature = "document")]
pub use document::{
    BlockKey, BlockProjection, BlockReplacement, Direction, Document, DocumentBlock, DocumentEdit,
    DocumentPosition, DocumentSelection, FlatPosition, Granularity, StructureRequest,
};
pub use error::EditError;
pub use index::{OffsetBias, TextIndex, word_boundary_utf16, word_range_utf16};
pub use input::{InputReplayError, InputReplayOutcome, edit_command_from_input};
pub use mapping::{MapBias, MapSegment, PositionMap};
pub use marks::{MarkRun, MarkRuns, MarkSide};
pub use session::EditSession;
pub use types::{
    Affinity, EditCommand, EditConfig, EditDelta, EditIntent, EditTransaction, ExternalValue,
    Selection, TransactionKind, Utf16Position, Utf16Range,
};
