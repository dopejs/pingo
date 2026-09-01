#![forbid(unsafe_code)]
#![deny(missing_docs)]

//! Deterministic top-level orchestration for the pingo rendering Core.

mod animation;
#[cfg(feature = "rich-text")]
#[path = "document_rich.rs"]
mod document;
#[cfg(not(feature = "rich-text"))]
#[path = "document_stub.rs"]
mod document;
mod editing;
mod engine;
mod error;
mod interaction;
mod scroll;
mod text;

pub use engine::{CoreEngine, CoreMetrics, FrameDiagnostics, FrameOutput, FramePhaseTimings};
pub use error::CoreError;
pub use pingo_scroll::ScrollPlatform;
pub use scroll::{CoreScrollMetrics, VirtualRefillRequest};
pub use text::CoreTextMetrics;

#[cfg(target_arch = "wasm32")]
mod wasm;
