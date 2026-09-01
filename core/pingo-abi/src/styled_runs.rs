const MALFORMED: &str = "styled run table is malformed";

use crate::{
    AbiError, MAX_RESOURCE_BYTES, MAX_STYLED_RUNS, RESOURCE_ENCODING_VERSION,
    STYLED_RUN_FLAG_ATOMIC, STYLED_RUN_FLAGS_OFFSET, STYLED_RUN_FONT_ID_OFFSET,
    STYLED_RUN_MINIMUM_BYTES, STYLED_RUN_RESERVED_OFFSET, STYLED_RUN_STYLE_ID_OFFSET,
    STYLED_RUN_UTF8_LENGTH_OFFSET, STYLED_RUN_UTF8_START_OFFSET, STYLED_RUNS_RESOURCE_MINIMUM_BYTES,
    STYLED_RUNS_RESOURCE_VARIANT, STYLED_RUNS_RUN_COUNT_OFFSET, STYLED_RUNS_RUNS_OFFSET,
    STYLED_RUNS_VARIANT_OFFSET, STYLED_RUNS_VERSION_OFFSET,
};

/// One contiguous styled span of a text node's UTF-8 value.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct StyledRun {
    /// UTF-8 byte offset where the run starts.
    pub utf8_start: u32,
    /// UTF-8 byte length of the run.
    pub utf8_length: u32,
    /// Text style resource identifier for this run.
    pub style_id: u32,
    /// Font resource identifier, or zero to inherit the node's font.
    pub font_id: u32,
    /// Run flags; see [`STYLED_RUN_FLAG_ATOMIC`].
    pub flags: u32,
}

impl StyledRun {
    /// Returns whether the caret must step over this run as one object.
    #[must_use]
    pub const fn is_atomic(self) -> bool {
        self.flags & STYLED_RUN_FLAG_ATOMIC != 0
    }

    /// Returns the exclusive UTF-8 end offset.
    ///
    /// # Errors
    ///
    /// Returns [`AbiError::ArithmeticOverflow`] when the span wraps `u32`.
    pub fn utf8_end(self) -> Result<u32, AbiError> {
        self.utf8_start
            .checked_add(self.utf8_length)
            .ok_or(AbiError::ArithmeticOverflow)
    }
}

/// A validated run table describing how one text node's value is styled.
///
/// The table is the only thing that makes a text node more than one style. It
/// is deliberately a resource rather than a stream of per-run mutations: a run
/// table is immutable for the frame it is committed in, so paint and layout can
/// both read it without a second copy.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StyledRunsResource {
    /// Runs in ascending, contiguous, non-overlapping UTF-8 order.
    pub runs: Vec<StyledRun>,
}

impl StyledRunsResource {
    /// Encodes the aligned v1 resource payload.
    ///
    /// # Errors
    ///
    /// Returns [`AbiError::ArithmeticOverflow`] when the table exceeds the
    /// protocol's run or byte budget.
    pub fn encode(&self) -> Result<Vec<u8>, AbiError> {
        let count = u32::try_from(self.runs.len()).map_err(|_| AbiError::ArithmeticOverflow)?;
        if count > MAX_STYLED_RUNS {
            return Err(AbiError::ArithmeticOverflow);
        }
        let mut bytes = vec![0_u8; STYLED_RUNS_RUNS_OFFSET];
        bytes[STYLED_RUNS_VERSION_OFFSET] = RESOURCE_ENCODING_VERSION;
        bytes[STYLED_RUNS_VARIANT_OFFSET] = STYLED_RUNS_RESOURCE_VARIANT;
        bytes[STYLED_RUNS_RUN_COUNT_OFFSET..STYLED_RUNS_RUN_COUNT_OFFSET + 4]
            .copy_from_slice(&count.to_le_bytes());
        for run in &self.runs {
            let mut record = [0_u8; STYLED_RUN_MINIMUM_BYTES];
            write_u32(&mut record, STYLED_RUN_UTF8_START_OFFSET, run.utf8_start);
            write_u32(&mut record, STYLED_RUN_UTF8_LENGTH_OFFSET, run.utf8_length);
            write_u32(&mut record, STYLED_RUN_STYLE_ID_OFFSET, run.style_id);
            write_u32(&mut record, STYLED_RUN_FONT_ID_OFFSET, run.font_id);
            write_u32(&mut record, STYLED_RUN_FLAGS_OFFSET, run.flags);
            write_u32(&mut record, STYLED_RUN_RESERVED_OFFSET, 0);
            bytes.extend_from_slice(&record);
        }
        if bytes.len() > MAX_RESOURCE_BYTES {
            return Err(AbiError::ResourceTooLarge {
                actual: bytes.len(),
                maximum: MAX_RESOURCE_BYTES,
            });
        }
        Ok(bytes)
    }

    /// Decodes and fully validates an untrusted run table.
    ///
    /// Validation is structural only: runs start at zero, are contiguous, carry
    /// a style, and set no reserved bits. Whether they cover a particular string
    /// is checked where the table is bound to a node, because only there is the
    /// string known.
    ///
    /// # Errors
    ///
    /// Returns [`AbiError::InvalidValue(MALFORMED)`] for any malformed, truncated,
    /// overlapping, gapped, or reserved-bit-setting table.
    pub fn decode(bytes: &[u8]) -> Result<Self, AbiError> {
        if bytes.len() < STYLED_RUNS_RESOURCE_MINIMUM_BYTES
            || !bytes.len().is_multiple_of(4)
            || bytes[STYLED_RUNS_VERSION_OFFSET] != RESOURCE_ENCODING_VERSION
            || bytes[STYLED_RUNS_VARIANT_OFFSET] != STYLED_RUNS_RESOURCE_VARIANT
            || bytes[2] != 0
            || bytes[3] != 0
        {
            return Err(AbiError::InvalidValue(MALFORMED));
        }
        let count = read_u32(bytes, STYLED_RUNS_RUN_COUNT_OFFSET);
        if count == 0 || count > MAX_STYLED_RUNS {
            return Err(AbiError::InvalidValue(MALFORMED));
        }
        let payload = &bytes[STYLED_RUNS_RUNS_OFFSET..];
        let expected = usize::try_from(count)
            .ok()
            .and_then(|count| count.checked_mul(STYLED_RUN_MINIMUM_BYTES))
            .ok_or(AbiError::ArithmeticOverflow)?;
        if payload.len() != expected {
            return Err(AbiError::InvalidValue(MALFORMED));
        }
        let mut runs = Vec::with_capacity(payload.len() / STYLED_RUN_MINIMUM_BYTES);
        let mut cursor = 0_u32;
        for record in payload.chunks_exact(STYLED_RUN_MINIMUM_BYTES) {
            let run = StyledRun {
                utf8_start: read_u32(record, STYLED_RUN_UTF8_START_OFFSET),
                utf8_length: read_u32(record, STYLED_RUN_UTF8_LENGTH_OFFSET),
                style_id: read_u32(record, STYLED_RUN_STYLE_ID_OFFSET),
                font_id: read_u32(record, STYLED_RUN_FONT_ID_OFFSET),
                flags: read_u32(record, STYLED_RUN_FLAGS_OFFSET),
            };
            if read_u32(record, STYLED_RUN_RESERVED_OFFSET) != 0
                || run.flags & !STYLED_RUN_FLAG_ATOMIC != 0
                || run.style_id == 0
                || run.utf8_start != cursor
            {
                return Err(AbiError::InvalidValue(MALFORMED));
            }
            cursor = run.utf8_end()?;
            runs.push(run);
        }
        Ok(Self { runs })
    }

    /// Returns the exclusive UTF-8 end offset the table claims to cover.
    #[must_use]
    pub fn covered_bytes(&self) -> u32 {
        self.runs.last().map_or(0, |run| {
            run.utf8_start.saturating_add(run.utf8_length)
        })
    }
}

fn read_u32(bytes: &[u8], offset: usize) -> u32 {
    u32::from_le_bytes(
        bytes[offset..offset + 4]
            .try_into()
            .expect("four-byte styled-run field"),
    )
}

fn write_u32(bytes: &mut [u8], offset: usize, value: u32) {
    bytes[offset..offset + 4].copy_from_slice(&value.to_le_bytes());
}

#[cfg(test)]
mod tests {
    use proptest::prelude::*;

    use super::*;

    fn table() -> StyledRunsResource {
        StyledRunsResource {
            runs: vec![
                StyledRun {
                    utf8_start: 0,
                    utf8_length: 5,
                    style_id: 7,
                    font_id: 0,
                    flags: 0,
                },
                StyledRun {
                    utf8_start: 5,
                    utf8_length: 3,
                    style_id: 9,
                    font_id: 4,
                    flags: STYLED_RUN_FLAG_ATOMIC,
                },
            ],
        }
    }

    #[test]
    fn round_trips_and_reports_coverage() {
        let encoded = table().encode().expect("encode");
        assert_eq!(encoded.len(), STYLED_RUNS_RUNS_OFFSET + 2 * STYLED_RUN_MINIMUM_BYTES);
        let decoded = StyledRunsResource::decode(&encoded).expect("decode");
        assert_eq!(decoded, table());
        assert_eq!(decoded.covered_bytes(), 8);
        assert!(decoded.runs[1].is_atomic());
        assert!(!decoded.runs[0].is_atomic());
    }

    #[test]
    fn rejects_every_malformed_shape_without_panicking() {
        let valid = table().encode().expect("encode");
        assert!(StyledRunsResource::decode(&[]).is_err());
        assert!(StyledRunsResource::decode(&valid[..valid.len() - 1]).is_err());
        assert!(StyledRunsResource::decode(&valid[..STYLED_RUNS_RUNS_OFFSET]).is_err());

        let mut wrong_version = valid.clone();
        wrong_version[STYLED_RUNS_VERSION_OFFSET] = RESOURCE_ENCODING_VERSION + 1;
        assert!(StyledRunsResource::decode(&wrong_version).is_err());

        let mut wrong_variant = valid.clone();
        wrong_variant[STYLED_RUNS_VARIANT_OFFSET] = STYLED_RUNS_RESOURCE_VARIANT + 1;
        assert!(StyledRunsResource::decode(&wrong_variant).is_err());

        let mut dirty_padding = valid.clone();
        dirty_padding[2] = 1;
        assert!(StyledRunsResource::decode(&dirty_padding).is_err());

        let mut miscounted = valid.clone();
        write_u32(&mut miscounted, STYLED_RUNS_RUN_COUNT_OFFSET, 3);
        assert!(StyledRunsResource::decode(&miscounted).is_err());

        let mut zero_runs = valid.clone();
        write_u32(&mut zero_runs, STYLED_RUNS_RUN_COUNT_OFFSET, 0);
        assert!(StyledRunsResource::decode(&zero_runs).is_err());

        // A gap between two runs leaves bytes with no style, which would paint
        // as an invisible hole rather than fail; it must be rejected here.
        let mut gapped = valid.clone();
        write_u32(
            &mut gapped,
            STYLED_RUNS_RUNS_OFFSET + STYLED_RUN_MINIMUM_BYTES + STYLED_RUN_UTF8_START_OFFSET,
            6,
        );
        assert!(StyledRunsResource::decode(&gapped).is_err());

        let mut overlapping = valid.clone();
        write_u32(
            &mut overlapping,
            STYLED_RUNS_RUNS_OFFSET + STYLED_RUN_MINIMUM_BYTES + STYLED_RUN_UTF8_START_OFFSET,
            4,
        );
        assert!(StyledRunsResource::decode(&overlapping).is_err());

        let mut unstyled = valid.clone();
        write_u32(&mut unstyled, STYLED_RUNS_RUNS_OFFSET + STYLED_RUN_STYLE_ID_OFFSET, 0);
        assert!(StyledRunsResource::decode(&unstyled).is_err());

        let mut reserved_flag = valid.clone();
        write_u32(&mut reserved_flag, STYLED_RUNS_RUNS_OFFSET + STYLED_RUN_FLAGS_OFFSET, 2);
        assert!(StyledRunsResource::decode(&reserved_flag).is_err());

        let mut reserved_word = valid;
        write_u32(
            &mut reserved_word,
            STYLED_RUNS_RUNS_OFFSET + STYLED_RUN_RESERVED_OFFSET,
            1,
        );
        assert!(StyledRunsResource::decode(&reserved_word).is_err());
    }

    #[test]
    fn rejects_a_span_that_wraps_the_offset_space() {
        let wrapped = StyledRunsResource {
            runs: vec![StyledRun {
                utf8_start: 0,
                utf8_length: u32::MAX,
                style_id: 1,
                font_id: 0,
                flags: 0,
            }],
        }
        .encode()
        .expect("encode");
        // One run of u32::MAX bytes is decodable; a second one after it is not.
        assert!(StyledRunsResource::decode(&wrapped).is_ok());
        let mut two = wrapped;
        write_u32(&mut two, STYLED_RUNS_RUN_COUNT_OFFSET, 2);
        two.extend_from_slice(&[0_u8; STYLED_RUN_MINIMUM_BYTES]);
        assert!(StyledRunsResource::decode(&two).is_err());
    }

    proptest! {
        #[test]
        fn arbitrary_bytes_never_panic(bytes in prop::collection::vec(any::<u8>(), 0..4096)) {
            let _ = StyledRunsResource::decode(&bytes);
        }

        #[test]
        fn every_contiguous_table_round_trips(
            lengths in prop::collection::vec(0_u32..64, 1..32),
            styles in prop::collection::vec(1_u32..64, 1..32),
        ) {
            let mut start = 0_u32;
            let runs = lengths
                .iter()
                .enumerate()
                .map(|(index, length)| {
                    let run = StyledRun {
                        utf8_start: start,
                        utf8_length: *length,
                        style_id: styles[index % styles.len()],
                        font_id: u32::try_from(index).unwrap_or(0),
                        flags: 0,
                    };
                    start += *length;
                    run
                })
                .collect::<Vec<_>>();
            let table = StyledRunsResource { runs };
            let encoded = table.encode().expect("valid table encodes");
            prop_assert_eq!(StyledRunsResource::decode(&encoded), Ok(table.clone()));
            prop_assert_eq!(table.covered_bytes(), start);
        }
    }
}
