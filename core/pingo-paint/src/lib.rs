#![forbid(unsafe_code)]
#![deny(missing_docs)]

//! Scene-to-DisplayList paint orchestration and immutable pictures.

mod engine;
mod error;
mod probe;
mod resource;

pub use engine::{
    EditorDecoration, PaintEngine, PaintMetrics, PaintOutcome, Picture, PlaceholderRect,
    ShapedGlyphRun, TextPaintResolver, VirtualPaintResolver,
};
pub use error::PaintError;
pub use probe::{
    MAX_PAINTED_TEXT_RECORDS, PaintedText, PaintedTextChannel, PaintedTextFrame, PaintedTextSource,
};
pub use resource::{AffineResource, SolidPaint, TextStyleResource};
