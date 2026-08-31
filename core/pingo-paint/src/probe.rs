//! Painted-text probe: the text this frame's paint actually emitted.
//!
//! The probe is **pull based**. Nothing is recorded while painting, and no
//! field is added to the paint cache, so the frame path pays nothing whether or
//! not anyone asks. A query re-walks the cached subtree tree the paint engine
//! already retains, in the same order [`crate::PaintEngine`] flattens it, and
//! reports every text instruction it finds.
//!
//! Why this exists: the wire loses the strings. `DrawGlyphRun` carries a glyph
//! span, not text, and under incremental Pictures the frame's top-level
//! DisplayList is a single `DrawPicture`. So neither the DisplayList nor the
//! Scene semantics can answer "did this frame paint that string".

use std::{collections::HashMap, sync::Arc};

use pingo_abi::DisplayCommand;
use pingo_layout::LayoutSnapshot;
use pingo_scene::{NodeId, Scene};

use crate::{PaintError, engine::CachedSubtree};

/// Upper bound on records collected from one frame.
///
/// Deliberately the same bound as the instruction stream the records are
/// derived from: the probe must never cap more aggressively than the thing it
/// observes, or it would report a silent subset as if it were the whole frame.
pub const MAX_PAINTED_TEXT_RECORDS: usize = pingo_abi::MAX_DISPLAY_INSTRUCTIONS as usize;

/// Which of paint's three text instructions produced a record.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum PaintedTextChannel {
    /// `DrawGlyphRun`: Core-shaped glyphs against an interned span.
    ShapedRun,
    /// `DrawTextFallback`: system-font fallback over an interned string.
    SystemFallback,
    /// `DrawTextInlineFallback`: a string owned by active Core editing state.
    InlineFallback,
}

/// Where a record's string comes from.
///
/// Paint never resolves a node's content itself. An editable node paints what
/// the text subsystem overrode it with -- a password field paints bullets, not
/// its value -- so reading the Scene string back would report something that
/// was never drawn. Only the two instructions that carry their own string are
/// resolved here; the shaped-run case is deliberately left to the owner of the
/// content that was shaped.
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PaintedTextSource {
    /// The instruction named an interned UTF-8 Scene resource.
    Resource(u32),
    /// The instruction carried its own string.
    Inline(String),
    /// Shaped glyphs: the string is the node's painted content.
    NodeContent,
}

/// One text instruction this frame's paint emitted.
#[derive(Clone, Debug, PartialEq)]
pub struct PaintedText {
    /// Scene node that emitted the instruction.
    pub node: NodeId,
    /// Which instruction it was.
    pub channel: PaintedTextChannel,
    /// The string, or how to find it.
    pub source: PaintedTextSource,
    /// The instruction's own origin, mapped into device space.
    ///
    /// Its meaning is the instruction's, not a normalized one: `DrawGlyphRun`
    /// positions a shaped run's box, the two fallbacks position a baseline.
    pub origin: [f32; 2],
    /// Whether `origin` fell outside the accumulated clip.
    ///
    /// Conservative under rotation: clips are intersected as device-space
    /// bounding boxes, so `true` is definitive while `false` can be optimistic
    /// for a rotated clip. It is also a statement about the origin alone, not
    /// about whether the whole run is visible.
    pub origin_clipped: bool,
}

/// Paint-order text records for one frame.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct PaintedTextFrame {
    /// Records in paint order: a later record draws over an earlier one.
    pub records: Vec<PaintedText>,
    /// Whether [`MAX_PAINTED_TEXT_RECORDS`] stopped collection early.
    pub truncated: bool,
}

/// Canvas2D-compatible affine transform.
///
/// Concatenation and point mapping match `pingo_headless::renderer::Affine` and
/// `CanvasRenderingContext2D.transform`; the headless renderer is the
/// differential oracle for both.
#[derive(Clone, Copy, Debug)]
struct Affine([f32; 6]);

impl Affine {
    const IDENTITY: Self = Self([1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);

    #[allow(clippy::similar_names)]
    fn multiply(self, next: Self) -> Self {
        let [m00, m10, m01, m11, tx, ty] = self.0;
        let [next_m00, next_m10, next_m01, next_m11, next_tx, next_ty] = next.0;
        Self([
            m00 * next_m00 + m01 * next_m10,
            m10 * next_m00 + m11 * next_m10,
            m00 * next_m01 + m01 * next_m11,
            m10 * next_m01 + m11 * next_m11,
            m00 * next_tx + m01 * next_ty + tx,
            m10 * next_tx + m11 * next_ty + ty,
        ])
    }

    const fn translation(x: f32, y: f32) -> Self {
        Self([1.0, 0.0, 0.0, 1.0, x, y])
    }

    fn point(self, x: f32, y: f32) -> [f32; 2] {
        let [m00, m10, m01, m11, tx, ty] = self.0;
        [m00 * x + m01 * y + tx, m10 * x + m11 * y + ty]
    }
}

/// Device-space clip bounds as `[left, top, right, bottom]`.
#[derive(Clone, Copy, Debug)]
struct Clip([f32; 4]);

impl Clip {
    const UNBOUNDED: Self = Self([
        f32::NEG_INFINITY,
        f32::NEG_INFINITY,
        f32::INFINITY,
        f32::INFINITY,
    ]);

    /// Intersects with a local rectangle mapped through `transform`.
    fn intersect(self, transform: Affine, rect: [f32; 4]) -> Self {
        let [x, y, width, height] = rect;
        let corners = [
            transform.point(x, y),
            transform.point(x + width, y),
            transform.point(x, y + height),
            transform.point(x + width, y + height),
        ];
        let mut bounds = [
            f32::INFINITY,
            f32::INFINITY,
            f32::NEG_INFINITY,
            f32::NEG_INFINITY,
        ];
        for [corner_x, corner_y] in corners {
            bounds[0] = bounds[0].min(corner_x);
            bounds[1] = bounds[1].min(corner_y);
            bounds[2] = bounds[2].max(corner_x);
            bounds[3] = bounds[3].max(corner_y);
        }
        Self([
            self.0[0].max(bounds[0]),
            self.0[1].max(bounds[1]),
            self.0[2].min(bounds[2]),
            self.0[3].min(bounds[3]),
        ])
    }

    fn excludes(self, point: [f32; 2]) -> bool {
        !(point[0] >= self.0[0]
            && point[0] <= self.0[2]
            && point[1] >= self.0[1]
            && point[1] <= self.0[3])
    }
}

#[derive(Clone, Copy, Debug)]
struct State {
    transform: Affine,
    clip: Clip,
}

/// Mirrors the flatten walk in `build_display_list`: local, children, post,
/// then the `Restore` that closes the `Save` every node's local opens with.
enum Step<'a> {
    Subtree(&'a Arc<CachedSubtree>),
    Post(&'a Arc<CachedSubtree>),
    Restore,
}

/// Maps a cached subtree's allocation to the node that owns it.
///
/// Cached subtrees are shared by `Arc::clone`, so allocation identity is node
/// identity. This keeps the probe from costing the paint cache a byte, and an
/// entry that is reachable but unmapped is reported as an error rather than
/// silently mislabeled.
pub(crate) type SubtreeIndex = HashMap<usize, NodeId>;

pub(crate) fn subtree_key(subtree: &Arc<CachedSubtree>) -> usize {
    Arc::as_ptr(subtree).addr()
}

pub(crate) fn collect(
    root: &Arc<CachedSubtree>,
    index: &SubtreeIndex,
    scene: &Scene,
    layout: &LayoutSnapshot,
) -> Result<PaintedTextFrame, PaintError> {
    let mut frame = PaintedTextFrame::default();
    let mut states = vec![State {
        transform: Affine::IDENTITY,
        clip: Clip::UNBOUNDED,
    }];
    let mut stack = vec![Step::Subtree(root)];
    while let Some(step) = stack.pop() {
        match step {
            Step::Subtree(subtree) => {
                // A `display: none` node builds no instructions, and the
                // flatten walk skips it and everything under it.
                if subtree.local.is_empty() {
                    continue;
                }
                let node = node_of(index, subtree)?;
                enter(subtree, node, scene, layout, &mut states)?;
                apply(&subtree.local[1..], node, &mut states, &mut frame)?;
                stack.push(Step::Restore);
                if !subtree.post.is_empty() {
                    stack.push(Step::Post(subtree));
                }
                for child in subtree.children.iter().rev() {
                    stack.push(Step::Subtree(child));
                }
            }
            Step::Post(subtree) => {
                let node = node_of(index, subtree)?;
                apply(&subtree.post, node, &mut states, &mut frame)?;
            }
            Step::Restore => {
                pop(&mut states)?;
            }
        }
        if frame.records.len() >= MAX_PAINTED_TEXT_RECORDS {
            frame.truncated = true;
            break;
        }
    }
    Ok(frame)
}

fn node_of(index: &SubtreeIndex, subtree: &Arc<CachedSubtree>) -> Result<NodeId, PaintError> {
    index
        .get(&subtree_key(subtree))
        .copied()
        .ok_or(PaintError::MalformedPaintCache {
            reason: "a reachable cached subtree is not owned by any live node",
        })
}

/// Opens a subtree's state, making both paint paths one instruction stream.
///
/// `build_node` always opens with `Save`. The inline path follows it with the
/// node's layout offset; the Picture path leaves that offset to the parent's
/// `DrawPicture`, so it is injected here. `picture_id` is the per-subtree
/// record of which path built it, so this does not depend on engine state that
/// could have changed since.
fn enter(
    subtree: &Arc<CachedSubtree>,
    node: NodeId,
    scene: &Scene,
    layout: &LayoutSnapshot,
    states: &mut Vec<State>,
) -> Result<(), PaintError> {
    if subtree
        .local
        .first()
        .map(|instruction| &instruction.command)
        != Some(&DisplayCommand::Save)
    {
        return Err(PaintError::MalformedPaintCache {
            reason: "a cached subtree does not open with Save",
        });
    }
    let current = *states.last().ok_or(PaintError::MalformedPaintCache {
        reason: "the paint state stack underflowed",
    })?;
    states.push(current);
    if subtree.picture_id.is_some() {
        let index = scene
            .resolve(node)
            .ok_or(PaintError::MissingGeometry { node })?;
        let (offset, _) = layout
            .geometry_at(index)
            .ok_or(PaintError::MissingGeometry { node })?;
        let state = states.last_mut().ok_or(PaintError::MalformedPaintCache {
            reason: "the paint state stack underflowed",
        })?;
        state.transform = state
            .transform
            .multiply(Affine::translation(offset.x, offset.y));
    }
    Ok(())
}

fn pop(states: &mut Vec<State>) -> Result<(), PaintError> {
    if states.len() <= 1 {
        return Err(PaintError::MalformedPaintCache {
            reason: "the paint state stack underflowed",
        });
    }
    states.pop();
    Ok(())
}

fn apply(
    instructions: &[pingo_abi::DisplayInstruction],
    node: NodeId,
    states: &mut Vec<State>,
    frame: &mut PaintedTextFrame,
) -> Result<(), PaintError> {
    for instruction in instructions {
        match &instruction.command {
            DisplayCommand::Save => {
                let current = *states.last().ok_or(PaintError::MalformedPaintCache {
                    reason: "the paint state stack underflowed",
                })?;
                states.push(current);
            }
            DisplayCommand::Restore => pop(states)?,
            DisplayCommand::Transform(matrix) => {
                let state = top(states)?;
                state.transform = state.transform.multiply(Affine(*matrix));
            }
            DisplayCommand::ClipRect(rect) => {
                let state = top(states)?;
                state.clip = state.clip.intersect(state.transform, *rect);
            }
            DisplayCommand::DrawGlyphRun { origin, .. } => record(
                frame,
                states,
                node,
                PaintedTextChannel::ShapedRun,
                PaintedTextSource::NodeContent,
                *origin,
            )?,
            DisplayCommand::DrawTextFallback {
                string_id, origin, ..
            } => record(
                frame,
                states,
                node,
                PaintedTextChannel::SystemFallback,
                PaintedTextSource::Resource(*string_id),
                *origin,
            )?,
            DisplayCommand::DrawTextInlineFallback { origin, text, .. } => record(
                frame,
                states,
                node,
                PaintedTextChannel::InlineFallback,
                PaintedTextSource::Inline(text.clone()),
                *origin,
            )?,
            _ => {}
        }
        if frame.records.len() >= MAX_PAINTED_TEXT_RECORDS {
            frame.truncated = true;
            return Ok(());
        }
    }
    Ok(())
}

fn top(states: &mut [State]) -> Result<&mut State, PaintError> {
    states.last_mut().ok_or(PaintError::MalformedPaintCache {
        reason: "the paint state stack underflowed",
    })
}

fn record(
    frame: &mut PaintedTextFrame,
    states: &[State],
    node: NodeId,
    channel: PaintedTextChannel,
    source: PaintedTextSource,
    origin: [f32; 2],
) -> Result<(), PaintError> {
    let state = *states.last().ok_or(PaintError::MalformedPaintCache {
        reason: "the paint state stack underflowed",
    })?;
    let device = state.transform.point(origin[0], origin[1]);
    frame.records.push(PaintedText {
        node,
        channel,
        source,
        origin: device,
        origin_clipped: state.clip.excludes(device),
    });
    Ok(())
}
