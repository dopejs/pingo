//! Editing latency against a real-shaped document.
//!
//! The E15 exit gate is not "editing is fast" but "editing does not get slower
//! as the document gets longer". One measurement cannot show that, so this runs
//! the identical keystroke sequence against a short document and a long one and
//! reports both, plus the ratio between them.
//!
//! The long fixture is the one the design asks for: at least five thousand
//! blocks, mixed mark density, nested list structure, and inline atomic
//! objects, with only a viewport's worth of blocks materialized.

use std::hint::black_box;
use std::time::Instant;

use pingo_abi::{
    DocumentBlockRecord, DocumentOperation, EditTransactionBatch, InputBatch, InputCommand,
    InputInstruction, Mutation, MutationBatch, MutationInstruction, NULL_NODE_ID, NodeKind, Prop,
    ResourceKind, StyleKeyword, StyledRun, StyledRunsResource,
};
use pingo_core::CoreEngine;
use pingo_paint::{SolidPaint, TextStyleResource};
use pingo_scene::NodeId;

const SHORT_BLOCKS: u32 = 500;
const LONG_BLOCKS: u32 = 5_000;
/// Blocks the Shell materializes: a viewport's worth, not the document.
const MATERIALIZED: u32 = 60;
const WARMUP_KEYSTROKES: u32 = 40;
const SAMPLE_KEYSTROKES: u32 = 400;
const FRAME_BUDGET_MS: f64 = 16.7;

fn main() {
    let short = measure(SHORT_BLOCKS);
    let long = measure(LONG_BLOCKS);
    // A ratio, not a difference: the claim is about growth with length, and
    // the two runs share every other cost.
    let ratio = if short.p95 > 0.0 {
        long.p95 / short.p95
    } else {
        1.0
    };
    println!(
        "{{\"version\":1,\"scenario\":\"e15-document-keystroke\",\"samples\":{SAMPLE_KEYSTROKES},\
\"shortBlocks\":{SHORT_BLOCKS},\"longBlocks\":{LONG_BLOCKS},\
\"shortP95Ms\":{:.6},\"longP95Ms\":{:.6},\"longP99Ms\":{:.6},\"longMaxMs\":{:.6},\
\"growthRatio\":{ratio:.6},\"droppedFrameRate\":{:.8}}}",
        short.p95, long.p95, long.p99, long.maximum, long.dropped_rate,
    );
}

struct Report {
    p95: f64,
    p99: f64,
    maximum: f64,
    dropped_rate: f64,
}

fn measure(blocks: u32) -> Report {
    let mut engine = CoreEngine::new(1280.0, 720.0).expect("benchmark viewport");
    black_box(
        engine
            .commit(&initial_frame(blocks))
            .expect("initial frame"),
    );
    drain(&mut engine);

    let mut sequence = 1_u32;
    let mut revision = 0_u64;
    // Put the caret in the middle materialized block, which is where a reader
    // scrolled to the middle of a long document would be typing.
    let focus = MATERIALIZED / 2;
    submit(
        &mut engine,
        &mut sequence,
        &mut revision,
        InputCommand::SetDocumentSelection {
            node_id: document_root(),
            base_revision: 0,
            selection: pingo_abi::WireDocumentSelection::Text {
                anchor_key: block_key(focus),
                anchor_offset: 0,
                focus_key: block_key(focus),
                focus_offset: 0,
            },
        },
    );

    for step in 0..WARMUP_KEYSTROKES {
        let command = keystroke(step, revision);
        submit(&mut engine, &mut sequence, &mut revision, command);
    }

    let mut samples = Vec::with_capacity(SAMPLE_KEYSTROKES as usize);
    for step in 0..SAMPLE_KEYSTROKES {
        let bytes = input(sequence, keystroke(step + WARMUP_KEYSTROKES, revision));
        sequence += 1;
        let start = Instant::now();
        black_box(engine.input(&bytes).expect("sample input"));
        samples.push(start.elapsed().as_secs_f64() * 1_000.0);
        drain(&mut engine);
    }

    samples.sort_by(f64::total_cmp);
    let dropped = samples
        .iter()
        .filter(|sample| **sample > FRAME_BUDGET_MS)
        .count();
    Report {
        p95: percentile(&samples, 95),
        p99: percentile(&samples, 99),
        maximum: *samples.last().expect("samples"),
        dropped_rate: f64::from(u32::try_from(dropped).expect("bounded dropped count"))
            / f64::from(SAMPLE_KEYSTROKES),
    }
}

/// Rotates through typing, caret movement, and deletion.
fn keystroke(step: u32, revision: u64) -> InputCommand {
    match step % 8 {
        6 | 7 => InputCommand::EditDocument {
            node_id: document_root(),
            base_revision: revision,
            operation: DocumentOperation::DeleteBackward,
            style: 0,
            font: 0,
            text: String::new(),
        },
        5 => InputCommand::MoveDocumentCaret {
            node_id: document_root(),
            direction: pingo_abi::CaretDirection::Backward,
            granularity: pingo_abi::CaretGranularity::Grapheme,
            extend: false,
        },
        index => InputCommand::EditDocument {
            node_id: document_root(),
            base_revision: revision,
            operation: DocumentOperation::Insert,
            style: 0,
            font: 0,
            text: ["a", "b", "文", "字", "e"][index as usize % 5].to_owned(),
        },
    }
}

fn submit(engine: &mut CoreEngine, sequence: &mut u32, revision: &mut u64, command: InputCommand) {
    let bytes = input(*sequence, command);
    *sequence += 1;
    black_box(engine.input(&bytes).expect("editing input"));
    *revision = drain(engine).unwrap_or(*revision);
}

fn drain(engine: &mut CoreEngine) -> Option<u64> {
    let drained = engine.take_edit_transactions().expect("drain edits");
    let _ = engine.take_glyph_resources();
    if drained.is_empty() {
        return None;
    }
    let batch = EditTransactionBatch::decode(&drained).expect("edit batch");
    batch.records.last().map(|record| record.revision)
}

fn input(sequence: u32, command: InputCommand) -> Vec<u8> {
    InputBatch {
        frame_seq: sequence,
        instructions: vec![InputInstruction { flags: 0, command }],
    }
    .encode()
    .expect("input batch")
}

fn document_root() -> u32 {
    NodeId::new(1, 1).expect("document id").raw()
}

/// Keys are the Shell's, so they are deliberately not node identifiers.
const fn block_key(index: u32) -> u32 {
    0x0010_0000 + index
}

fn materialized_node(index: u32) -> u32 {
    NodeId::new(index + 2, 1).expect("block id").raw()
}

/// Text long enough to wrap, varying so no two blocks share a cache entry.
fn block_text(index: u32) -> String {
    format!(
        "Block {index} carries a sentence long enough to wrap inside a column and to give \
the shaper something to do."
    )
}

fn initial_frame(blocks: u32) -> Vec<u8> {
    let root = NodeId::new(0, 1).expect("root id").raw();
    let mut mutations = document_shell(root);
    let mut resource = 16_u32;
    for index in 0..MATERIALIZED.min(blocks) {
        materialize_block(&mut mutations, index, resource);
        resource += 2;
    }
    mutations.push(Mutation::ConfigureDocument {
        node_id: document_root(),
        revision: 1,
        flags: 0,
        blocks: projection(blocks),
    });
    MutationBatch {
        frame_seq: 1,
        instructions: mutations
            .into_iter()
            .map(|mutation| MutationInstruction { flags: 0, mutation })
            .collect(),
    }
    .encode()
    .expect("initial mutation batch")
}

/// Root, the document container, and the two styles blocks are drawn with.
fn document_shell(root: u32) -> Vec<Mutation> {
    vec![
        Mutation::CreateNode {
            node_id: root,
            kind: NodeKind::Root,
            parent: NULL_NODE_ID,
            before_sibling: NULL_NODE_ID,
        },
        Mutation::CreateNode {
            node_id: document_root(),
            kind: NodeKind::Container,
            parent: root,
            before_sibling: NULL_NODE_ID,
        },
        Mutation::SetF32 {
            node_id: document_root(),
            prop: Prop::Width,
            value: 720.0,
        },
        Mutation::DefineResource {
            resource_id: 1,
            kind: ResourceKind::Paint,
            bytes: SolidPaint {
                red: 20,
                green: 20,
                blue: 20,
                alpha: 255,
            }
            .encode()
            .to_vec(),
        },
        Mutation::DefineResource {
            resource_id: 2,
            kind: ResourceKind::TextStyle,
            bytes: text_style(1, 16.0),
        },
        Mutation::DefineResource {
            resource_id: 3,
            kind: ResourceKind::TextStyle,
            bytes: text_style(1, 18.0),
        },
    ]
}

/// Builds one on-screen block. Every third one is styled in three runs, one of
/// which is an inline atomic object, so mark density is mixed rather than
/// uniform.
fn materialize_block(mutations: &mut Vec<Mutation>, index: u32, resource: u32) {
    let node = materialized_node(index);
    let text = block_text(index);
    mutations.push(Mutation::CreateNode {
        node_id: node,
        kind: NodeKind::EditableText,
        parent: document_root(),
        before_sibling: NULL_NODE_ID,
    });
    mutations.push(Mutation::DefineResource {
        resource_id: resource,
        kind: ResourceKind::Utf8String,
        bytes: text.as_bytes().to_vec(),
    });
    if index.is_multiple_of(3) && text.len() > 24 {
        let runs = StyledRunsResource {
            runs: vec![
                StyledRun {
                    utf8_start: 0,
                    utf8_length: 6,
                    style_id: 2,
                    font_id: 0,
                    flags: 0,
                },
                StyledRun {
                    utf8_start: 6,
                    utf8_length: 4,
                    style_id: 3,
                    font_id: 0,
                    flags: pingo_abi::STYLED_RUN_FLAG_ATOMIC,
                },
                StyledRun {
                    utf8_start: 10,
                    utf8_length: u32::try_from(text.len() - 10).expect("small block"),
                    style_id: 2,
                    font_id: 0,
                    flags: 0,
                },
            ],
        }
        .encode()
        .expect("styled runs");
        mutations.push(Mutation::DefineResource {
            resource_id: resource + 1,
            kind: ResourceKind::StyledRuns,
            bytes: runs,
        });
        mutations.push(Mutation::SetRichText {
            node_id: node,
            string_id: resource,
            style_id: 2,
            runs_id: resource + 1,
        });
    } else {
        mutations.push(Mutation::SetTextRun {
            node_id: node,
            string_id: resource,
            style_id: 2,
        });
    }
    mutations.push(Mutation::ConfigureEditable {
        node_id: node,
        revision: 0,
        flags: 1,
        max_graphemes: 1_000_000,
    });
}

/// The whole document, of which only the viewport has nodes.
///
/// Nested list structure is a Shell concept, so what reaches Core is the block
/// sequence it produces plus the objects inside it.
fn projection(blocks: u32) -> Vec<DocumentBlockRecord> {
    (0..blocks)
        .map(|index| {
            let atomic = index % 17 == 16;
            DocumentBlockRecord {
                key: block_key(index),
                node_id: if index < MATERIALIZED.min(blocks) && !atomic {
                    materialized_node(index)
                } else {
                    NULL_NODE_ID
                },
                len_utf16: if atomic {
                    0
                } else {
                    u32::try_from(block_text(index).encode_utf16().count()).expect("small block")
                },
                atomic,
            }
        })
        .collect()
}

fn text_style(paint_id: u32, font_size: f32) -> Vec<u8> {
    TextStyleResource {
        paint_id,
        font_size,
        line_height: font_size * 1.4,
        weight: 400,
        family: "sans-serif".to_owned(),
        font_style: StyleKeyword::Normal,
        text_align: StyleKeyword::Start,
        white_space: StyleKeyword::Normal,
        overflow_wrap: StyleKeyword::Normal,
        text_overflow: StyleKeyword::Clip,
    }
    .encode()
    .expect("text style")
}

fn percentile(samples: &[f64], numerator: usize) -> f64 {
    if samples.is_empty() {
        return 0.0;
    }
    let rank = (samples.len() * numerator).div_ceil(100);
    samples[rank.saturating_sub(1).min(samples.len() - 1)]
}
