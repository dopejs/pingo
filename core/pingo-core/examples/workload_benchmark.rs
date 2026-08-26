//! Workloads the milestone benchmarks do not represent.
//!
//! `m1_benchmark` flips `Prop::Opacity` on twenty *contiguous* nodes of a flat
//! 5,000-sibling list: paint-only invalidation, perfect locality, no layout.
//! `m3`/`m9` scroll, `m4` types into one field, `m7` animates. Nothing measures
//! a dense screen whose nodes are all visible, a long text document reflowing
//! after an edit in its middle, or an update pattern that is scattered rather
//! than sequential -- and those are what an application built on this engine
//! actually does.
//!
//! Three scenarios, one report. Each states the axis it stresses so a
//! regression points somewhere.

use std::hint::black_box;
use std::time::Instant;

use pingo_abi::{
    Mutation, MutationBatch, MutationInstruction, NULL_NODE_ID, NodeKind, Prop, ResourceKind,
    StyleKeyword,
};
use pingo_core::{CoreEngine, FrameDiagnostics};
use pingo_paint::{SolidPaint, TextStyleResource};
use pingo_scene::NodeId;

const WARMUP_FRAMES: u32 = 30;
const SAMPLE_FRAMES: u32 = 300;
const FRAME_BUDGET_MS: f64 = 16.7;

const PAINT_RESOURCE: u32 = 1;
const STYLE_RESOURCE: u32 = 2;
const FIRST_STRING_RESOURCE: u32 = 16;

/// Dense screen: every node is on screen, so viewport culling can save nothing.
const DENSE_ROWS: u32 = 120;
const DENSE_FIELDS_PER_ROW: u32 = 6;

/// Long document: paragraphs whose reflow cost is what a text editor pays.
const DOCUMENT_PARAGRAPHS: u32 = 400;

/// Scattered: same node and update counts as `m1`, so the two are comparable.
const SCATTERED_NODES: u32 = 5_000;
const SCATTERED_UPDATES: u32 = 20;

fn main() {
    let dense = dense_ui();
    let document = long_document();
    // Two scattered variants so the comparison against `m1` isolates one
    // variable at a time: `m1` is contiguous + paint-only, `scattered-paint`
    // changes only the locality, `scattered-mixed` then adds a layout property.
    let scattered_paint = scattered_update(false);
    let scattered_mixed = scattered_update(true);
    println!(
        "{{\"version\":1,\"scenarios\":[{dense},{document},{scattered_paint},{scattered_mixed}]}}"
    );
}

/// A settings screen: nested rows of label/value/control, all of them visible.
///
/// The update touches `Prop::Width`, not opacity, because resizing is what a
/// real interaction does and it invalidates layout rather than paint alone.
fn dense_ui() -> String {
    let node_count = DENSE_ROWS * (DENSE_FIELDS_PER_ROW + 1) + 1;
    let mut engine = CoreEngine::new(1280.0, 900.0).expect("dense viewport");
    let initial_start = Instant::now();
    black_box(engine.commit(&dense_scene()).expect("dense initial frame"));
    let initial_ms = initial_start.elapsed().as_secs_f64() * 1_000.0;

    let mut rng = Rng::new(0x5eed_0001_u64);
    for frame in 0..WARMUP_FRAMES {
        black_box(
            engine
                .commit(&dense_update(frame + 2, &mut rng, node_count))
                .expect("dense warmup"),
        );
    }
    let mut samples = Vec::with_capacity(SAMPLE_FRAMES as usize);
    let mut last = None;
    for frame in 0..SAMPLE_FRAMES {
        let bytes = dense_update(frame + WARMUP_FRAMES + 2, &mut rng, node_count);
        let start = Instant::now();
        let output = engine.commit(&bytes).expect("dense sample");
        samples.push(start.elapsed().as_secs_f64() * 1_000.0);
        last = Some(output.diagnostics);
    }
    report(
        "dense-ui",
        node_count,
        initial_ms,
        &mut samples,
        &engine,
        last.as_ref(),
    )
}

/// A document of paragraphs, edited in the middle.
///
/// Replacing one paragraph's text run changes the height of that paragraph and
/// therefore the position of every paragraph after it. That reflow is the cost
/// a text editor pays on a keystroke, and no existing benchmark contains it:
/// `m4` types into a single field, where nothing follows to be moved.
fn long_document() -> String {
    let node_count = DOCUMENT_PARAGRAPHS + 1;
    let mut engine = CoreEngine::new(760.0, 900.0).expect("document viewport");
    let initial_start = Instant::now();
    black_box(
        engine
            .commit(&document_scene())
            .expect("document initial frame"),
    );
    let initial_ms = initial_start.elapsed().as_secs_f64() * 1_000.0;

    for frame in 0..WARMUP_FRAMES {
        black_box(
            engine
                .commit(&document_edit(frame + 2))
                .expect("document warmup"),
        );
    }
    let mut samples = Vec::with_capacity(SAMPLE_FRAMES as usize);
    let mut last = None;
    for frame in 0..SAMPLE_FRAMES {
        let bytes = document_edit(frame + WARMUP_FRAMES + 2);
        let start = Instant::now();
        let output = engine.commit(&bytes).expect("document sample");
        samples.push(start.elapsed().as_secs_f64() * 1_000.0);
        last = Some(output.diagnostics);
    }
    report(
        "long-document-edit",
        node_count,
        initial_ms,
        &mut samples,
        &engine,
        last.as_ref(),
    )
}

/// `m1`'s node and update counts with `m1`'s locality removed.
///
/// Same 5,000 nodes and same 20 updates per frame, but at scattered indices and
/// mixing a layout property in. The gap between this and `m1-core-update-5000`
/// is the diagnostic: it is the part of `m1`'s result that comes from its
/// access pattern rather than from the engine.
fn scattered_update(with_layout: bool) -> String {
    let mut engine = CoreEngine::new(1280.0, 720.0).expect("scattered viewport");
    let initial_start = Instant::now();
    black_box(
        engine
            .commit(&flat_scene(SCATTERED_NODES))
            .expect("scattered initial frame"),
    );
    let initial_ms = initial_start.elapsed().as_secs_f64() * 1_000.0;

    let mut rng = Rng::new(0x5eed_0002_u64);
    for frame in 0..WARMUP_FRAMES {
        black_box(
            engine
                .commit(&scattered_frame(frame + 2, &mut rng, with_layout))
                .expect("scattered warmup"),
        );
    }
    let mut samples = Vec::with_capacity(SAMPLE_FRAMES as usize);
    let mut last = None;
    for frame in 0..SAMPLE_FRAMES {
        let bytes = scattered_frame(frame + WARMUP_FRAMES + 2, &mut rng, with_layout);
        let start = Instant::now();
        let output = engine.commit(&bytes).expect("scattered sample");
        samples.push(start.elapsed().as_secs_f64() * 1_000.0);
        last = Some(output.diagnostics);
    }
    report(
        if with_layout {
            "scattered-mixed-5000"
        } else {
            "scattered-paint-5000"
        },
        SCATTERED_NODES,
        initial_ms,
        &mut samples,
        &engine,
        last.as_ref(),
    )
}

fn dense_scene() -> Vec<u8> {
    let mut mutations = base_resources();
    mutations.push(create(0, NodeKind::Root, None));
    let mut next = 1;
    for _ in 0..DENSE_ROWS {
        let row = next;
        next += 1;
        mutations.extend([
            create(row, NodeKind::Container, Some(0)),
            set_f32(row, Prop::Width, 1280.0),
            set_f32(row, Prop::Height, 7.0),
            set_f32(row, Prop::Direction, 1.0),
            set_ref(row, Prop::BackgroundColor, PAINT_RESOURCE),
        ]);
        for field in 0..DENSE_FIELDS_PER_ROW {
            let cell = next;
            next += 1;
            // Heterogeneous on purpose: a screen of identical containers does
            // not exercise the branches a real one takes.
            let kind = if field % 3 == 0 {
                NodeKind::Text
            } else {
                NodeKind::Container
            };
            mutations.extend([
                create(cell, kind, Some(row)),
                set_f32(cell, Prop::Width, 200.0),
                set_f32(cell, Prop::Height, 6.0),
            ]);
            if kind == NodeKind::Text {
                mutations.push(Mutation::SetTextRun {
                    node_id: id(cell),
                    string_id: FIRST_STRING_RESOURCE,
                    style_id: STYLE_RESOURCE,
                });
            } else {
                mutations.push(set_ref(cell, Prop::BackgroundColor, PAINT_RESOURCE));
            }
        }
    }
    encode(1, mutations)
}

fn dense_update(frame_seq: u32, rng: &mut Rng, node_count: u32) -> Vec<u8> {
    let mut mutations = Vec::with_capacity(SCATTERED_UPDATES as usize);
    for _ in 0..SCATTERED_UPDATES {
        let index = 1 + rng.next_below(node_count - 1);
        mutations.push(set_f32(
            index,
            Prop::Width,
            180.0 + f32::from(u16::try_from(frame_seq % 40).unwrap_or(0)),
        ));
    }
    encode(frame_seq, mutations)
}

fn document_scene() -> Vec<u8> {
    let mut mutations = base_resources();
    mutations.push(create(0, NodeKind::Root, None));
    for index in 1..=DOCUMENT_PARAGRAPHS {
        mutations.extend([
            create(index, NodeKind::Text, Some(0)),
            set_f32(index, Prop::Width, 720.0),
        ]);
        mutations.push(Mutation::SetTextRun {
            node_id: id(index),
            string_id: FIRST_STRING_RESOURCE,
            style_id: STYLE_RESOURCE,
        });
    }
    encode(1, mutations)
}

fn document_edit(frame_seq: u32) -> Vec<u8> {
    // Strings are immutable interned resources, so an edit defines a new one
    // and repoints the run -- the same shape a keystroke takes.
    let string_id = FIRST_STRING_RESOURCE + 1 + (frame_seq % 2);
    let middle = DOCUMENT_PARAGRAPHS / 2;
    let mut text = String::from("The quick brown fox jumps over the lazy dog. ");
    // Length alternates so the paragraph's height can change and everything
    // after it has to move; an edit that never reflows measures nothing.
    for _ in 0..(frame_seq % 3) {
        text.push_str("Reflow follows an edit in the middle of a document. ");
    }
    // Two slots alternating. The new string is defined, the run repointed at
    // it, and only then is the previous slot released -- releasing before the
    // repoint would drop a resource the scene still references, and redefining
    // an id in the same batch that releases it is rejected outright.
    let previous = FIRST_STRING_RESOURCE + 1 + ((frame_seq + 1) % 2);
    let mut mutations = vec![
        Mutation::DefineResource {
            resource_id: string_id,
            kind: ResourceKind::Utf8String,
            bytes: text.into_bytes(),
        },
        Mutation::SetTextRun {
            node_id: id(middle),
            string_id,
            style_id: STYLE_RESOURCE,
        },
    ];
    if frame_seq > 2 {
        mutations.push(Mutation::ReleaseResource {
            resource_id: previous,
        });
    }
    encode(frame_seq, mutations)
}

fn flat_scene(count: u32) -> Vec<u8> {
    let mut mutations = base_resources();
    mutations.push(create(0, NodeKind::Root, None));
    for index in 1..=count {
        mutations.extend([
            create(index, NodeKind::Container, Some(0)),
            set_f32(index, Prop::Width, 1280.0),
            set_f32(index, Prop::Height, 1.0),
            set_ref(index, Prop::BackgroundColor, PAINT_RESOURCE),
        ]);
    }
    encode(1, mutations)
}

fn scattered_frame(frame_seq: u32, rng: &mut Rng, with_layout: bool) -> Vec<u8> {
    let mut mutations = Vec::with_capacity(SCATTERED_UPDATES as usize);
    for slot in 0..SCATTERED_UPDATES {
        let index = 1 + rng.next_below(SCATTERED_NODES);
        if !with_layout || slot % 2 == 0 {
            mutations.push(set_f32(
                index,
                Prop::Opacity,
                if frame_seq.is_multiple_of(2) {
                    0.99
                } else {
                    1.0
                },
            ));
        } else {
            mutations.push(set_f32(
                index,
                Prop::Height,
                1.0 + f32::from(u16::try_from(frame_seq % 3).unwrap_or(0)),
            ));
        }
    }
    encode(frame_seq, mutations)
}

fn base_resources() -> Vec<Mutation> {
    vec![
        Mutation::DefineResource {
            resource_id: PAINT_RESOURCE,
            kind: ResourceKind::Paint,
            bytes: SolidPaint {
                red: 32,
                green: 96,
                blue: 192,
                alpha: 255,
            }
            .encode()
            .to_vec(),
        },
        Mutation::DefineResource {
            resource_id: STYLE_RESOURCE,
            kind: ResourceKind::TextStyle,
            bytes: TextStyleResource {
                paint_id: PAINT_RESOURCE,
                font_size: 14.0,
                line_height: 18.0,
                weight: 400,
                family: "sans-serif".into(),
                font_style: StyleKeyword::Normal,
                text_align: StyleKeyword::Start,
                white_space: StyleKeyword::Normal,
                overflow_wrap: StyleKeyword::Normal,
                text_overflow: StyleKeyword::Clip,
            }
            .encode()
            .expect("text style resource"),
        },
        Mutation::DefineResource {
            resource_id: FIRST_STRING_RESOURCE,
            kind: ResourceKind::Utf8String,
            bytes: b"The quick brown fox jumps over the lazy dog.".to_vec(),
        },
    ]
}

fn report(
    scenario: &str,
    nodes: u32,
    initial_ms: f64,
    samples: &mut [f64],
    engine: &CoreEngine,
    last: Option<&FrameDiagnostics>,
) -> String {
    samples.sort_by(f64::total_cmp);
    let p50 = percentile(samples, 50, 100);
    let p95 = percentile(samples, 95, 100);
    let p99 = percentile(samples, 99, 100);
    let maximum = *samples.last().expect("samples");
    let dropped = samples
        .iter()
        .filter(|sample| **sample > FRAME_BUDGET_MS)
        .count();
    let dropped_rate = f64::from(u32::try_from(dropped).expect("bounded dropped count"))
        / f64::from(SAMPLE_FRAMES);
    let paint = engine.paint_metrics();
    // `layoutVisitedNodes` is reported next to the timing because a frame that
    // changes ten nodes and visits five thousand is a different problem from
    // one that visits ten and is slow anyway, and the timing alone cannot tell
    // them apart.
    let core = last.expect("a sampled frame");
    format!(
        "{{\"scenario\":\"{scenario}\",\"nodes\":{nodes},\"samples\":{SAMPLE_FRAMES},\"initialMs\":{initial_ms:.6},\"p50Ms\":{p50:.6},\"p95Ms\":{p95:.6},\"p99Ms\":{p99:.6},\"maxMs\":{maximum:.6},\"droppedFrameRate\":{dropped_rate:.8},\"dirtyLayoutNodes\":{},\"layoutVisitedNodes\":{},\"layoutChangedNodes\":{},\"dirtyPaintNodes\":{},\"pictureBuilds\":{},\"overInvalidatedFrames\":{}}}",
        core.dirty_layout_nodes,
        core.layout_visited_nodes,
        core.layout_changed_nodes,
        core.dirty_paint_nodes,
        paint.builds,
        paint.over_invalidated_frames,
    )
}

/// Seeded xorshift: the scatter has to be identical on every run, or the
/// benchmark measures the generator instead of the engine.
struct Rng(u64);

impl Rng {
    const fn new(seed: u64) -> Self {
        Self(seed)
    }

    fn next_u32(&mut self) -> u32 {
        let mut state = self.0;
        state ^= state << 13;
        state ^= state >> 7;
        state ^= state << 17;
        self.0 = state;
        u32::try_from(state >> 32).unwrap_or(0)
    }

    fn next_below(&mut self, bound: u32) -> u32 {
        if bound == 0 {
            0
        } else {
            self.next_u32() % bound
        }
    }
}

fn create(index: u32, kind: NodeKind, parent: Option<u32>) -> Mutation {
    Mutation::CreateNode {
        node_id: id(index),
        kind,
        parent: parent.map_or(NULL_NODE_ID, id),
        before_sibling: NULL_NODE_ID,
    }
}

fn set_f32(index: u32, prop: Prop, value: f32) -> Mutation {
    Mutation::SetF32 {
        node_id: id(index),
        prop,
        value,
    }
}

fn set_ref(index: u32, prop: Prop, resource_id: u32) -> Mutation {
    Mutation::SetRef {
        node_id: id(index),
        prop,
        resource_id,
    }
}

fn encode(frame_seq: u32, mutations: Vec<Mutation>) -> Vec<u8> {
    MutationBatch {
        frame_seq,
        instructions: mutations
            .into_iter()
            .map(|mutation| MutationInstruction { flags: 0, mutation })
            .collect(),
    }
    .encode()
    .expect("workload Mutation Stream")
}

fn id(index: u32) -> u32 {
    NodeId::new(index, 1).expect("workload node id").raw()
}

fn percentile(samples: &[f64], numerator: usize, denominator: usize) -> f64 {
    let rank = samples
        .len()
        .checked_mul(numerator)
        .and_then(|value| value.checked_add(denominator - 1))
        .map(|value| value / denominator)
        .expect("bounded percentile rank");
    samples[rank.saturating_sub(1).min(samples.len() - 1)]
}
