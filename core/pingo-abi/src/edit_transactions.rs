use crate::codec::{
    Reader, Writer, checked_padding, finish_instruction, read_header, read_instruction_header,
    validate_encode_instruction_count,
};
use crate::{
    AbiError, EDIT_MAP_SEGMENT_FLAG_KEPT, EDIT_TRANSACTIONS_MAGIC, EditTransactionOpcode,
    MAX_EDIT_MAP_SEGMENTS, MAX_EDIT_MARK_RUNS, MAX_EDIT_TRANSACTION_INSTRUCTIONS,
    MAX_EDIT_TRANSACTIONS_BYTES, MAX_RESOURCE_BYTES, StreamKind,
};

const HAS_DELTA: u8 = 1;
const HAS_COMPOSITION: u8 = 1 << 1;
const HAS_MARKS: u8 = 1 << 2;
const KNOWN_FLAGS: u8 = HAS_DELTA | HAS_COMPOSITION | HAS_MARKS;

/// Browser-facing caret affinity encoded in edit transactions.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub enum WireAffinity {
    /// Prefer the preceding visual edge.
    Upstream = 0,
    /// Prefer the following visual edge.
    Downstream = 1,
}

impl WireAffinity {
    fn decode(value: u8) -> Result<Self, AbiError> {
        match value {
            0 => Ok(Self::Upstream),
            1 => Ok(Self::Downstream),
            _ => Err(AbiError::UnknownIdentifier {
                category: "edit affinity",
                value: u32::from(value),
            }),
        }
    }
}

/// One styled span of an editing value on the reverse editing ABI.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct WireMarkRun {
    /// UTF-16 code-unit length of the span.
    pub length: u32,
    /// Text style resource identity; zero is the value's base style.
    pub style: u32,
    /// Font resource identity; zero inherits the node's font.
    pub font: u32,
}

/// One old-space span of a position map and where it lands.
///
/// The Shell moves its own anchors by looking spans up in this table rather
/// than recomputing the transformation, so there is exactly one implementation
/// of what an edit does to a range.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct WireMapSegment {
    /// Inclusive start in the old value.
    pub old_start: u32,
    /// Exclusive end in the old value.
    pub old_end: u32,
    /// Inclusive start in the new value.
    pub new_start: u32,
    /// Exclusive end in the new value.
    pub new_end: u32,
    /// Whether the span survived offset for offset.
    pub kept: bool,
}

/// Half-open UTF-16 range used by the reverse editing ABI.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct WireRange {
    /// Inclusive start offset.
    pub start: u32,
    /// Exclusive trailing offset.
    pub end: u32,
}

/// Source of a committed editing transition.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub enum EditTransactionKind {
    /// Ordinary edit or selection update.
    Edit = 1,
    /// IME composition lifecycle update.
    Composition = 2,
    /// Undo transition.
    Undo = 3,
    /// Redo transition.
    Redo = 4,
    /// Authoritative Shell correction.
    External = 5,
}

impl EditTransactionKind {
    fn decode(value: u8) -> Result<Self, AbiError> {
        match value {
            1 => Ok(Self::Edit),
            2 => Ok(Self::Composition),
            3 => Ok(Self::Undo),
            4 => Ok(Self::Redo),
            5 => Ok(Self::External),
            _ => Err(AbiError::UnknownIdentifier {
                category: "edit transaction kind",
                value: u32::from(value),
            }),
        }
    }
}

/// One validated Core-to-Host editing transition.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EditTransactionRecord {
    /// Generation-bearing editable node ID.
    pub node_id: u32,
    /// Revision observed by the accepted command.
    pub base_revision: u64,
    /// New Core revision.
    pub revision: u64,
    /// Optional replacement range and inserted UTF-8 text.
    pub delta: Option<(WireRange, String)>,
    /// Directed selection offsets after the transition.
    pub selection: [u32; 2],
    /// Affinity for the selection anchor and focus.
    pub affinities: [WireAffinity; 2],
    /// Active temporary composition range.
    pub composition: Option<WireRange>,
    /// Transition source.
    pub kind: EditTransactionKind,
    /// Mark table after the transition, present only when it changed.
    pub marks: Option<Vec<WireMarkRun>>,
    /// How base-revision offsets move into this revision.
    ///
    /// Empty means the identity: nothing the Shell anchors to has to move.
    pub map: Vec<WireMapSegment>,
}

/// Transactional batch drained after one accepted Core operation.
#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct EditTransactionBatch {
    /// Records in exact Core commit order.
    pub records: Vec<EditTransactionRecord>,
}

impl EditTransactionBatch {
    /// Fully decodes and validates an untrusted reverse editing stream.
    /// Decodes without reporting what the decoder had to tolerate.
    ///
    /// # Errors
    ///
    /// Returns the same errors as [`Self::decode_with_report`].
    pub fn decode(bytes: &[u8]) -> Result<Self, AbiError> {
        Self::decode_with_report(bytes).map(|(value, _)| value)
    }

    /// Decodes and reports what this build had to tolerate to read the stream.
    ///
    /// Instructions with an opcode this build does not know are stepped over
    /// when the producer marked them optional, and counted in the report.
    ///
    /// # Errors
    ///
    /// Returns an [`AbiError`] for a malformed, truncated, oversized, or
    /// too-old stream, and for an unknown instruction that was not marked
    /// optional.
    pub fn decode_with_report(bytes: &[u8]) -> Result<(Self, crate::DecodeReport), AbiError> {
        let mut reader = Reader::new(bytes);
        let stream = read_header(
            &mut reader,
            EDIT_TRANSACTIONS_MAGIC,
            MAX_EDIT_TRANSACTIONS_BYTES,
        )?;
        let declared = stream.declared_count;
        let mut skipped = 0_u32;
        if declared > MAX_EDIT_TRANSACTION_INSTRUCTIONS {
            return Err(AbiError::InstructionCountTooLarge {
                declared,
                maximum: MAX_EDIT_TRANSACTION_INSTRUCTIONS,
            });
        }
        let maximum =
            u32::try_from(reader.remaining() / EditTransactionOpcode::Transaction.minimum_bytes())
                .map_err(|_| AbiError::ArithmeticOverflow)?;
        if declared > maximum {
            return Err(AbiError::InstructionCountTooLarge { declared, maximum });
        }
        let mut records = Vec::with_capacity(
            usize::try_from(declared).map_err(|_| AbiError::ArithmeticOverflow)?,
        );
        while reader.remaining() != 0 {
            let header = read_instruction_header(&mut reader)?;
            let (offset, raw_opcode) = (header.offset, header.opcode);
            // A stream from a newer build may carry instructions this decoder has
            // never heard of. Skipping one is only safe when the producer marked it
            // optional, so an unmarked unknown instruction is still fatal.
            let Some(opcode) = EditTransactionOpcode::from_u8(raw_opcode) else {
                if header.optional() {
                    skipped = skipped.saturating_add(1);
                    reader.seek_to(header.end)?;
                    continue;
                }
                return Err(AbiError::UnknownOpcode {
                    stream: StreamKind::EditTransactions,
                    opcode: raw_opcode,
                    offset,
                });
            };
            let record = decode_record(&mut reader)?;
            validate_instruction_size(opcode, offset, reader.offset())?;
            finish_instruction(&reader, header)?;
            records.push(record);
        }
        // A skipped record was still in the stream, so it counts toward the
        // declared total; otherwise the count check rejects every downgrade.
        let actual = u32::try_from(records.len())
            .map_err(|_| AbiError::ArithmeticOverflow)?
            .checked_add(skipped)
            .ok_or(AbiError::ArithmeticOverflow)?;
        if actual != declared {
            return Err(AbiError::InstructionCountMismatch { declared, actual });
        }
        Ok((
            Self { records },
            crate::DecodeReport {
                skipped_instructions: skipped,
                producer_abi_version: stream.producer_version,
            },
        ))
    }

    /// Encodes one canonical reverse editing batch.
    pub fn encode(&self) -> Result<Vec<u8>, AbiError> {
        validate_encode_instruction_count(
            self.records.len(),
            0,
            MAX_EDIT_TRANSACTION_INSTRUCTIONS,
        )?;
        let mut writer = Writer::new(EDIT_TRANSACTIONS_MAGIC);
        for record in &self.records {
            validate_record(record)?;
            writer.instruction(EditTransactionOpcode::Transaction as u8, 0);
            writer.u32(record.node_id);
            write_u64(&mut writer, record.base_revision);
            write_u64(&mut writer, record.revision);
            let (delta_range, text) = record
                .delta
                .as_ref()
                .map_or((WireRange { start: 0, end: 0 }, ""), |(range, text)| {
                    (*range, text.as_str())
                });
            writer.u32(delta_range.start);
            writer.u32(delta_range.end);
            writer.u32(record.selection[0]);
            writer.u32(record.selection[1]);
            let composition = record.composition.unwrap_or(WireRange { start: 0, end: 0 });
            writer.u32(composition.start);
            writer.u32(composition.end);
            writer.u8(record.kind as u8);
            writer.u8((u8::from(record.delta.is_some()) * HAS_DELTA)
                | (u8::from(record.composition.is_some()) * HAS_COMPOSITION)
                | (u8::from(record.marks.is_some()) * HAS_MARKS));
            writer.u8(record.affinities[0] as u8);
            writer.u8(record.affinities[1] as u8);
            writer.u32(u32::try_from(text.len()).map_err(|_| AbiError::ArithmeticOverflow)?);
            let marks = record.marks.as_deref().unwrap_or_default();
            writer.u32(u32::try_from(marks.len()).map_err(|_| AbiError::ArithmeticOverflow)?);
            writer.u32(u32::try_from(record.map.len()).map_err(|_| AbiError::ArithmeticOverflow)?);
            writer.bytes(text.as_bytes());
            writer.pad();
            for run in marks {
                writer.u32(run.length);
                writer.u32(run.style);
                writer.u32(run.font);
            }
            for segment in &record.map {
                writer.u32(segment.old_start);
                writer.u32(segment.old_end);
                writer.u32(segment.new_start);
                writer.u32(segment.new_end);
                writer.u32(if segment.kept {
                    EDIT_MAP_SEGMENT_FLAG_KEPT
                } else {
                    0
                });
            }
        }
        writer.finish(MAX_EDIT_TRANSACTIONS_BYTES)
    }
}

fn decode_record(reader: &mut Reader<'_>) -> Result<EditTransactionRecord, AbiError> {
    let node_id = reader.read_u32()?;
    let base_revision = read_u64(reader)?;
    let revision = read_u64(reader)?;
    let delta_range = WireRange {
        start: reader.read_u32()?,
        end: reader.read_u32()?,
    };
    let selection = [reader.read_u32()?, reader.read_u32()?];
    let composition_range = WireRange {
        start: reader.read_u32()?,
        end: reader.read_u32()?,
    };
    let kind = EditTransactionKind::decode(reader.read_u8()?)?;
    let flags = reader.read_u8()?;
    if flags & !KNOWN_FLAGS != 0 {
        return Err(AbiError::InvalidValue(
            "edit transaction flags contain reserved bits",
        ));
    }
    let affinities = [
        WireAffinity::decode(reader.read_u8()?)?,
        WireAffinity::decode(reader.read_u8()?)?,
    ];
    let length = usize::try_from(reader.read_u32()?).map_err(|_| AbiError::ArithmeticOverflow)?;
    if length > MAX_RESOURCE_BYTES {
        return Err(AbiError::ResourceTooLarge {
            actual: length,
            maximum: MAX_RESOURCE_BYTES,
        });
    }
    let mark_count = reader.read_u32()?;
    let map_count = reader.read_u32()?;
    if mark_count > MAX_EDIT_MARK_RUNS || map_count > MAX_EDIT_MAP_SEGMENTS {
        return Err(AbiError::InvalidValue(
            "edit transaction payload exceeds its protocol budget",
        ));
    }
    let text = std::str::from_utf8(reader.read_bytes(length)?)
        .map_err(|_| AbiError::InvalidValue("edit transaction delta is not UTF-8"))?
        .to_owned();
    reader.read_zeroes(checked_padding(length)?)?;
    let mut marks =
        Vec::with_capacity(usize::try_from(mark_count).map_err(|_| AbiError::ArithmeticOverflow)?);
    for _ in 0..mark_count {
        marks.push(WireMarkRun {
            length: reader.read_u32()?,
            style: reader.read_u32()?,
            font: reader.read_u32()?,
        });
    }
    let mut map =
        Vec::with_capacity(usize::try_from(map_count).map_err(|_| AbiError::ArithmeticOverflow)?);
    for _ in 0..map_count {
        let old_start = reader.read_u32()?;
        let old_end = reader.read_u32()?;
        let new_start = reader.read_u32()?;
        let new_end = reader.read_u32()?;
        let flags = reader.read_u32()?;
        if flags & !EDIT_MAP_SEGMENT_FLAG_KEPT != 0 {
            return Err(AbiError::InvalidValue(
                "position map segment flags contain reserved bits",
            ));
        }
        map.push(WireMapSegment {
            old_start,
            old_end,
            new_start,
            new_end,
            kept: flags & EDIT_MAP_SEGMENT_FLAG_KEPT != 0,
        });
    }
    if flags & HAS_DELTA == 0
        && (!text.is_empty() || delta_range.start != 0 || delta_range.end != 0)
    {
        return Err(AbiError::InvalidValue(
            "absent edit delta has non-zero payload",
        ));
    }
    if flags & HAS_COMPOSITION == 0 && (composition_range.start != 0 || composition_range.end != 0)
    {
        return Err(AbiError::InvalidValue(
            "absent composition has non-zero range",
        ));
    }
    let record = EditTransactionRecord {
        node_id,
        base_revision,
        revision,
        delta: (flags & HAS_DELTA != 0).then_some((delta_range, text)),
        selection,
        affinities,
        composition: (flags & HAS_COMPOSITION != 0).then_some(composition_range),
        kind,
        marks: (flags & HAS_MARKS != 0).then_some(marks),
        map,
    };
    if flags & HAS_MARKS == 0 && mark_count != 0 {
        return Err(AbiError::InvalidValue(
            "absent mark table has a non-empty payload",
        ));
    }
    validate_record(&record)?;
    Ok(record)
}

fn validate_record(record: &EditTransactionRecord) -> Result<(), AbiError> {
    if record.revision <= record.base_revision {
        return Err(AbiError::InvalidValue(
            "edit transaction revision must increase",
        ));
    }
    if let Some((range, text)) = &record.delta {
        validate_range(*range)?;
        if text.len() > MAX_RESOURCE_BYTES {
            return Err(AbiError::ResourceTooLarge {
                actual: text.len(),
                maximum: MAX_RESOURCE_BYTES,
            });
        }
    }
    if let Some(range) = record.composition {
        validate_range(range)?;
    }
    if record.marks.as_ref().is_some_and(|marks| {
        marks.len() > MAX_EDIT_MARK_RUNS as usize || marks.iter().any(|run| run.length == 0)
    }) {
        return Err(AbiError::InvalidValue(
            "mark table has an empty or oversized span",
        ));
    }
    if record.map.len() > MAX_EDIT_MAP_SEGMENTS as usize {
        return Err(AbiError::InvalidValue("position map exceeds its budget"));
    }
    // The table has to tile the old offset space, or a lookup can miss.
    let mut cursor = 0_u32;
    for segment in &record.map {
        if segment.old_start != cursor
            || segment.old_end < segment.old_start
            || segment.new_end < segment.new_start
        {
            return Err(AbiError::InvalidValue(
                "position map segments are not ordered",
            ));
        }
        cursor = segment.old_end;
    }
    Ok(())
}

fn validate_range(range: WireRange) -> Result<(), AbiError> {
    if range.start > range.end {
        return Err(AbiError::InvalidValue("edit transaction range is reversed"));
    }
    Ok(())
}

fn read_u64(reader: &mut Reader<'_>) -> Result<u64, AbiError> {
    Ok(u64::from(reader.read_u32()?) | (u64::from(reader.read_u32()?) << 32))
}

fn write_u64(writer: &mut Writer, value: u64) {
    let bytes = value.to_le_bytes();
    writer.u32(u32::from_le_bytes(
        bytes[..4].try_into().expect("four bytes"),
    ));
    writer.u32(u32::from_le_bytes(
        bytes[4..].try_into().expect("four bytes"),
    ));
}

fn validate_instruction_size(
    opcode: EditTransactionOpcode,
    offset: usize,
    end: usize,
) -> Result<(), AbiError> {
    let actual = end
        .checked_sub(offset)
        .ok_or(AbiError::ArithmeticOverflow)?;
    if actual < opcode.minimum_bytes() || actual % crate::PROTOCOL_ALIGNMENT != 0 {
        return Err(AbiError::InstructionLengthMismatch {
            opcode: opcode as u8,
            offset,
            expected: opcode.minimum_bytes(),
            actual,
        });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unicode_delta_and_optional_composition_round_trip() {
        let batch = EditTransactionBatch {
            records: vec![EditTransactionRecord {
                node_id: 7,
                base_revision: 9,
                revision: 10,
                delta: Some((WireRange { start: 1, end: 2 }, "你🙂".to_owned())),
                selection: [4, 4],
                affinities: [WireAffinity::Upstream, WireAffinity::Downstream],
                composition: Some(WireRange { start: 1, end: 4 }),
                kind: EditTransactionKind::Composition,
                marks: Some(vec![
                    WireMarkRun {
                        length: 1,
                        style: 0,
                        font: 0,
                    },
                    WireMarkRun {
                        length: 3,
                        style: 12,
                        font: 5,
                    },
                ]),
                map: vec![
                    WireMapSegment {
                        old_start: 0,
                        old_end: 1,
                        new_start: 0,
                        new_end: 1,
                        kept: true,
                    },
                    WireMapSegment {
                        old_start: 1,
                        old_end: 2,
                        new_start: 1,
                        new_end: 4,
                        kept: false,
                    },
                ],
            }],
        };
        let bytes = batch.encode().expect("encode");
        assert_eq!(EditTransactionBatch::decode(&bytes), Ok(batch));
    }

    #[test]
    fn every_kind_round_trips_and_invalid_records_fail_closed() {
        let base = EditTransactionRecord {
            node_id: 7,
            base_revision: 9,
            revision: 10,
            delta: None,
            selection: [4, 4],
            affinities: [WireAffinity::Downstream, WireAffinity::Downstream],
            composition: None,
            kind: EditTransactionKind::Edit,
            marks: None,
            map: Vec::new(),
        };
        for kind in [
            EditTransactionKind::Edit,
            EditTransactionKind::Composition,
            EditTransactionKind::Undo,
            EditTransactionKind::Redo,
            EditTransactionKind::External,
        ] {
            let batch = EditTransactionBatch {
                records: vec![EditTransactionRecord {
                    kind,
                    ..base.clone()
                }],
            };
            let bytes = batch.encode().expect("encode kind");
            assert_eq!(EditTransactionBatch::decode(&bytes), Ok(batch));
        }

        let reject = |mutate: fn(&mut EditTransactionRecord)| {
            let mut record = base.clone();
            mutate(&mut record);
            assert!(
                EditTransactionBatch {
                    records: vec![record],
                }
                .encode()
                .is_err()
            );
        };
        reject(|record| record.revision = record.base_revision);
        reject(|record| record.delta = Some((WireRange { start: 4, end: 2 }, String::new())));
        reject(|record| record.composition = Some(WireRange { start: 9, end: 3 }));

        let bytes = EditTransactionBatch {
            records: vec![base],
        }
        .encode()
        .expect("encode");
        // Unknown kind, reserved flags, and unknown affinities fail closed.
        for (offset, value) in [(64_usize, 9_u8), (65, 0xff), (66, 7), (67, 7)] {
            let mut hostile = bytes.clone();
            hostile[offset] = value;
            assert!(
                EditTransactionBatch::decode(&hostile).is_err(),
                "byte {offset} value {value} must fail closed"
            );
        }
        for cut in 0..bytes.len() {
            let _ = EditTransactionBatch::decode(&bytes[..cut]);
        }
        for index in 0..bytes.len() {
            let mut hostile = bytes.clone();
            hostile[index] ^= 0xff;
            let _ = EditTransactionBatch::decode(&hostile);
        }
    }

    #[test]
    fn malformed_mark_tables_and_position_maps_fail_closed() {
        let record = EditTransactionRecord {
            node_id: 7,
            base_revision: 0,
            revision: 1,
            delta: None,
            selection: [0, 0],
            affinities: [WireAffinity::Downstream; 2],
            composition: None,
            kind: EditTransactionKind::Edit,
            marks: None,
            map: Vec::new(),
        };
        // An empty span would make the table ambiguous about where a run ends.
        assert!(
            EditTransactionBatch {
                records: vec![EditTransactionRecord {
                    marks: Some(vec![WireMarkRun {
                        length: 0,
                        style: 1,
                        font: 0,
                    }]),
                    ..record.clone()
                }],
            }
            .encode()
            .is_err()
        );
        // A map with a gap would let a lookup miss and silently return the end.
        assert!(
            EditTransactionBatch {
                records: vec![EditTransactionRecord {
                    map: vec![
                        WireMapSegment {
                            old_start: 0,
                            old_end: 1,
                            new_start: 0,
                            new_end: 1,
                            kept: true,
                        },
                        WireMapSegment {
                            old_start: 2,
                            old_end: 3,
                            new_start: 1,
                            new_end: 2,
                            kept: true,
                        },
                    ],
                    ..record.clone()
                }],
            }
            .encode()
            .is_err()
        );

        let bytes = EditTransactionBatch {
            records: vec![EditTransactionRecord {
                map: vec![WireMapSegment {
                    old_start: 0,
                    old_end: 2,
                    new_start: 0,
                    new_end: 3,
                    kept: false,
                }],
                ..record
            }],
        }
        .encode()
        .expect("encode");
        let mut reserved = bytes.clone();
        // The segment flags word is the last u32 of the instruction.
        let flags_at = reserved.len() - 4;
        reserved[flags_at] = 0b10;
        assert!(EditTransactionBatch::decode(&reserved).is_err());
        assert_eq!(
            EditTransactionBatch::decode(&bytes)
                .expect("decode")
                .records[0]
                .map
                .len(),
            1
        );
    }

    #[test]
    fn malformed_utf8_and_presence_bits_fail_closed() {
        let batch = EditTransactionBatch {
            records: vec![EditTransactionRecord {
                node_id: 7,
                base_revision: 0,
                revision: 1,
                delta: Some((WireRange { start: 0, end: 0 }, "a".to_owned())),
                selection: [1, 1],
                affinities: [WireAffinity::Downstream; 2],
                composition: None,
                kind: EditTransactionKind::Edit,
                marks: None,
                map: Vec::new(),
            }],
        };
        let bytes = batch.encode().expect("encode");
        let mut bad_utf8 = bytes.clone();
        bad_utf8[80] = 0xff;
        assert!(EditTransactionBatch::decode(&bad_utf8).is_err());
        let mut bad_flags = bytes;
        bad_flags[65] = 0;
        assert!(EditTransactionBatch::decode(&bad_flags).is_err());
    }
}
