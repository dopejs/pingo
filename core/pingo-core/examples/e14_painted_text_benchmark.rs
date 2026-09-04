//! Cost of the painted-text render oracle, against the frame it describes.
//!
//! Two claims from docs/e14-painted-text-probe-design.md are measured here.
//!
//! Nothing is recorded during paint and no field was added to the paint cache,
//! so a frame that never asks costs the same as before the probe existed --
//! `frameP95Micros` is reported for both `probe: false` and `probe: true` runs
//! of the identical workload so a regression in the frame path would show.
//!
//! And the query itself has to stay cheap enough to poll from an end-to-end
//! test, which is what `probeP50Micros`/`probeP95Micros` bound.
//!
//! Printing its report is the whole point.
#![allow(clippy::print_stdout, clippy::print_stderr)]

use std::hint::black_box;
use std::time::Instant;

use pingo_abi::{
    Mutation, MutationBatch, MutationInstruction, NULL_NODE_ID, NodeKind, Prop, StyleKeyword,
};
use pingo_core::CoreEngine;
use pingo_paint::{SolidPaint, TextStyleResource};
use pingo_scene::NodeId;

const ROW_COUNTS: [u32; 2] = [400, 4_000];
const WARMUP_FRAMES: u32 = 20;
const SAMPLE_FRAMES: u32 = 200;

fn main() {
    let mut cases = Vec::new();
    for rows in ROW_COUNTS {
        for pictures in [false, true] {
            cases.push(measure(rows, pictures));
        }
    }
    let report = cases
        .iter()
        .map(|case| {
            format!(
                "{{\"rows\":{},\"pictures\":{},\"records\":{},\"probeP50Micros\":{:.4},\"probeP95Micros\":{:.4},\"frameP95Micros\":{:.4},\"frameWithProbeP95Micros\":{:.4}}}",
                case.rows,
                case.pictures,
                case.records,
                case.probe_p50,
                case.probe_p95,
                case.frame_p95,
                case.frame_with_probe_p95
            )
        })
        .collect::<Vec<_>>()
        .join(",");
    println!(
        "{{\"version\":1,\"scenario\":\"e14-painted-text\",\"samples\":{SAMPLE_FRAMES},\"cases\":[{report}]}}"
    );
}

struct Case {
    rows: u32,
    pictures: bool,
    records: u32,
    probe_p50: f64,
    probe_p95: f64,
    frame_p95: f64,
    frame_with_probe_p95: f64,
}

fn measure(rows: u32, pictures: bool) -> Case {
    let mut engine = CoreEngine::new(1280.0, 720.0).expect("benchmark viewport");
    engine
        .set_incremental_pictures_enabled(pictures)
        .expect("picture mode");
    let initial = engine.commit(&initial_frame(rows)).expect("initial frame");
    acknowledge(&mut engine, initial.frame_seq);

    let records = decode_record_count(&engine.painted_text().expect("painted text"));
    assert!(records > 0, "the workload must actually paint text");

    let mut probe_samples = Vec::with_capacity(SAMPLE_FRAMES as usize);
    for sample in 0..(WARMUP_FRAMES + SAMPLE_FRAMES) {
        let start = Instant::now();
        let bytes = engine.painted_text().expect("painted text");
        let elapsed = start.elapsed();
        black_box(&bytes);
        if sample >= WARMUP_FRAMES {
            probe_samples.push(elapsed.as_secs_f64() * 1e6);
        }
    }

    let frame_p95 = frame_cost(rows, pictures, false);
    let frame_with_probe_p95 = frame_cost(rows, pictures, true);

    probe_samples.sort_by(f64::total_cmp);
    Case {
        rows,
        pictures,
        records,
        probe_p50: percentile(&probe_samples, 50),
        probe_p95: percentile(&probe_samples, 95),
        frame_p95,
        frame_with_probe_p95,
    }
}

/// Frame cost for a workload that repaints one row per frame.
///
/// With `probe` set, the oracle is queried after every frame; without it the
/// frame path is exercised alone. The two must agree, because the probe adds
/// nothing to paint.
fn frame_cost(rows: u32, pictures: bool, probe: bool) -> f64 {
    let mut engine = CoreEngine::new(1280.0, 720.0).expect("benchmark viewport");
    engine
        .set_incremental_pictures_enabled(pictures)
        .expect("picture mode");
    let initial = engine.commit(&initial_frame(rows)).expect("initial frame");
    acknowledge(&mut engine, initial.frame_seq);
    let mut samples = Vec::with_capacity(SAMPLE_FRAMES as usize);
    for sample in 0..(WARMUP_FRAMES + SAMPLE_FRAMES) {
        let frame_seq = sample + 2;
        let mutations = vec![Mutation::SetF32 {
            node_id: node(1).raw(),
            prop: Prop::Height,
            value: 20.0 + f32::from(u16::try_from(sample % 4).expect("phase")),
        }];
        let bytes = encode(frame_seq, mutations);
        let start = Instant::now();
        let output = engine.commit(&bytes).expect("frame");
        black_box(&output.display_list);
        if probe {
            black_box(engine.painted_text().expect("painted text"));
        }
        let elapsed = start.elapsed();
        acknowledge(&mut engine, output.frame_seq);
        if sample >= WARMUP_FRAMES {
            samples.push(elapsed.as_secs_f64() * 1e6);
        }
    }
    samples.sort_by(f64::total_cmp);
    percentile(&samples, 95)
}

/// Retires the frame's published Picture generation.
///
/// Picture mode refuses to build a frame while an earlier generation is still
/// unacknowledged, which is the backend's job in production.
fn acknowledge(engine: &mut CoreEngine, frame_seq: u32) {
    // Inline frames publish nothing, and only a frame that published can be
    // acknowledged.
    if engine.take_picture_resources().is_empty() {
        return;
    }
    engine
        .acknowledge_picture_resources(frame_seq)
        .expect("acknowledge pictures");
}

/// Nearest-rank percentile over a sorted sample, matching `e8_geometry_benchmark`.
fn percentile(sorted: &[f64], numerator: usize) -> f64 {
    if sorted.is_empty() {
        return 0.0;
    }
    let rank = (sorted.len() * numerator).div_ceil(100);
    sorted[rank.saturating_sub(1).min(sorted.len() - 1)]
}

fn decode_record_count(bytes: &[u8]) -> u32 {
    let index = pingo_abi::PAINTED_TEXT_HEADER_RECORD_COUNT_INDEX * 4;
    u32::from_le_bytes(bytes[index..index + 4].try_into().expect("record count"))
}

fn node(index: u32) -> NodeId {
    NodeId::new(index, 1).expect("benchmark node id")
}

fn initial_frame(rows: u32) -> Vec<u8> {
    let mut mutations = vec![
        Mutation::DefineResource {
            resource_id: 1,
            kind: pingo_abi::ResourceKind::Paint,
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
            kind: pingo_abi::ResourceKind::TextStyle,
            bytes: TextStyleResource {
                paint_id: 1,
                font_size: 16.0,
                line_height: 20.0,
                weight: 400,
                family: "sans-serif".to_owned(),
                font_style: StyleKeyword::Normal,
                text_align: StyleKeyword::Start,
                white_space: StyleKeyword::Normal,
                overflow_wrap: StyleKeyword::Normal,
                text_overflow: StyleKeyword::Clip,
            }
            .encode()
            .expect("text style"),
        },
        Mutation::CreateNode {
            node_id: node(0).raw(),
            kind: NodeKind::Root,
            parent: NULL_NODE_ID,
            before_sibling: NULL_NODE_ID,
        },
    ];
    for row in 0..rows {
        let id = node(row + 1);
        let string_id = 100 + row;
        mutations.push(Mutation::DefineResource {
            resource_id: string_id,
            kind: pingo_abi::ResourceKind::Utf8String,
            bytes: format!("row {row}").into_bytes(),
        });
        mutations.push(Mutation::CreateNode {
            node_id: id.raw(),
            kind: NodeKind::Text,
            parent: node(0).raw(),
            before_sibling: NULL_NODE_ID,
        });
        mutations.push(Mutation::SetF32 {
            node_id: id.raw(),
            prop: Prop::Width,
            value: 200.0,
        });
        mutations.push(Mutation::SetF32 {
            node_id: id.raw(),
            prop: Prop::Height,
            value: 20.0,
        });
        mutations.push(Mutation::SetTextRun {
            node_id: id.raw(),
            string_id,
            style_id: 2,
        });
    }
    encode(1, mutations)
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
    .expect("encode frame")
}
