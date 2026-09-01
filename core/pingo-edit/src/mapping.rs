use crate::{EditDelta, EditError, Utf16Range};

/// Which edge a position collapses to when it falls inside replaced text.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub enum MapBias {
    /// Collapse to the start of the replacement.
    #[default]
    Left,
    /// Collapse to the end of the replacement.
    Right,
}

/// One old-space span and where it lands in the new value.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct MapSegment {
    /// Inclusive start in the old value.
    pub old_start: u32,
    /// Exclusive end in the old value.
    pub old_end: u32,
    /// Inclusive start in the new value.
    pub new_start: u32,
    /// Exclusive end in the new value.
    pub new_end: u32,
    /// Whether the span survived unchanged.
    ///
    /// A surviving span maps offset for offset. A replaced span has no interior
    /// left to land in, so an interior position collapses to one of its edges.
    pub kept: bool,
}

/// The transformation from one revision's offsets to the next revision's.
///
/// This is the only range-transform implementation in the repository. Anything
/// the Shell anchors to text -- a link's extent, a comment, a remote cursor --
/// moves by consuming this table, so there is no second implementation to
/// disagree with the first.
///
/// The table is total over the old offset space, `0..=old_length`, so every
/// query has an answer and no caller has to invent one.
#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct PositionMap {
    segments: Vec<MapSegment>,
    old_length: u32,
    new_length: u32,
}

impl PositionMap {
    /// Creates the identity map for a value of `length` code units.
    #[must_use]
    pub fn identity(length: u32) -> Self {
        Self {
            segments: vec![MapSegment {
                old_start: 0,
                old_end: length,
                new_start: 0,
                new_end: length,
                kept: true,
            }],
            old_length: length,
            new_length: length,
        }
    }

    /// Builds the map for one replacement applied to a value of `old_length`.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::InvalidRange`] when the delta leaves the value, or
    /// [`EditError::OffsetOverflow`] when the result would not fit.
    pub fn from_delta(delta: &EditDelta, old_length: u32) -> Result<Self, EditError> {
        let inserted = u32::try_from(delta.text.encode_utf16().count())
            .map_err(|_| EditError::OffsetOverflow)?;
        Self::from_replacement(delta.range, inserted, old_length)
    }

    /// Builds the map for replacing `range` with `inserted` code units.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::InvalidRange`] when the range leaves the value, or
    /// [`EditError::OffsetOverflow`] when the result would not fit.
    pub fn from_replacement(
        range: Utf16Range,
        inserted: u32,
        old_length: u32,
    ) -> Result<Self, EditError> {
        if range.start > range.end || range.end > old_length {
            return Err(EditError::InvalidRange {
                start: range.start,
                end: range.end,
                text_len: old_length,
            });
        }
        let replacement_end = range
            .start
            .checked_add(inserted)
            .ok_or(EditError::OffsetOverflow)?;
        let new_length = old_length
            .checked_sub(range.end - range.start)
            .and_then(|kept| kept.checked_add(inserted))
            .ok_or(EditError::OffsetOverflow)?;
        let mut segments = Vec::with_capacity(3);
        if range.start > 0 {
            segments.push(MapSegment {
                old_start: 0,
                old_end: range.start,
                new_start: 0,
                new_end: range.start,
                kept: true,
            });
        }
        segments.push(MapSegment {
            old_start: range.start,
            old_end: range.end,
            new_start: range.start,
            new_end: replacement_end,
            kept: false,
        });
        if range.end < old_length {
            segments.push(MapSegment {
                old_start: range.end,
                old_end: old_length,
                new_start: replacement_end,
                new_end: new_length,
                kept: true,
            });
        }
        Ok(Self {
            segments,
            old_length,
            new_length,
        })
    }

    /// Returns the ascending, gapless segments covering the old offset space.
    #[must_use]
    pub fn segments(&self) -> &[MapSegment] {
        &self.segments
    }

    /// Returns the length of the value this map starts from.
    #[must_use]
    pub const fn old_length(&self) -> u32 {
        self.old_length
    }

    /// Returns the length of the value this map produces.
    #[must_use]
    pub const fn new_length(&self) -> u32 {
        self.new_length
    }

    /// Returns whether the map changes nothing.
    #[must_use]
    pub fn is_identity(&self) -> bool {
        self.old_length == self.new_length && self.segments.iter().all(|segment| segment.kept)
    }

    /// Maps one old offset into the new value.
    ///
    /// Boundaries are unambiguous and ignore the bias: an offset at the start
    /// of a replaced span stays at the start, and one at its end lands after
    /// the replacement. Only an offset strictly inside a replaced span, or one
    /// sitting exactly where text was inserted, has to choose a side.
    ///
    /// Offsets past the old end clamp rather than failing: a stale anchor is a
    /// normal consequence of concurrent editing, and dropping it would lose the
    /// annotation instead of moving it.
    #[must_use]
    pub fn map_offset(&self, offset: u32, bias: MapBias) -> u32 {
        let offset = offset.min(self.old_length);
        // A pure insertion is a zero-width replaced span, and the kept span
        // ending at the same offset would otherwise answer for it and make the
        // bias unreachable.
        if let Some(segment) = self.segments.iter().find(|segment| {
            !segment.kept && segment.old_start == segment.old_end && segment.old_start == offset
        }) {
            return match bias {
                MapBias::Left => segment.new_start,
                MapBias::Right => segment.new_end,
            };
        }
        for segment in &self.segments {
            if offset < segment.old_start {
                break;
            }
            if offset > segment.old_end {
                continue;
            }
            if segment.kept {
                return segment.new_start + (offset - segment.old_start);
            }
            if offset == segment.old_start {
                return segment.new_start;
            }
            if offset == segment.old_end {
                return segment.new_end;
            }
            return match bias {
                MapBias::Left => segment.new_start,
                MapBias::Right => segment.new_end,
            };
        }
        self.new_length
    }

    /// Maps a range, keeping it normalized and never inverted.
    ///
    /// The edges use outward bias so a span that brackets an edit still
    /// brackets its replacement instead of collapsing onto one side of it.
    #[must_use]
    pub fn map_range(&self, range: Utf16Range) -> Utf16Range {
        let start = self.map_offset(range.start, MapBias::Left);
        let end = self.map_offset(range.end, MapBias::Right);
        Utf16Range::new(start, end.max(start))
    }
}

#[cfg(test)]
mod tests {
    use proptest::prelude::*;

    use super::*;

    fn map(start: u32, end: u32, inserted: u32, length: u32) -> PositionMap {
        PositionMap::from_replacement(Utf16Range::new(start, end), inserted, length)
            .expect("valid replacement")
    }

    #[test]
    fn positions_move_by_the_text_inserted_before_them() {
        // "abcdef", replacing "cd" with "XYZ".
        let moved = map(2, 4, 3, 6);
        assert_eq!(moved.new_length(), 7);
        assert_eq!(moved.map_offset(0, MapBias::Left), 0);
        assert_eq!(moved.map_offset(2, MapBias::Left), 2);
        assert_eq!(moved.map_offset(4, MapBias::Left), 5);
        assert_eq!(moved.map_offset(6, MapBias::Left), 7);
        // Inside the replaced span there is no interior to land in.
        assert_eq!(moved.map_offset(3, MapBias::Left), 2);
        assert_eq!(moved.map_offset(3, MapBias::Right), 5);
        // Both edges of a replaced span are unambiguous and ignore the bias.
        assert_eq!(moved.map_offset(2, MapBias::Right), 2);
        assert_eq!(moved.map_offset(4, MapBias::Left), 5);
        // A pure insertion is the one place the bias decides at a boundary.
        let inserted = map(3, 3, 2, 6);
        assert_eq!(inserted.map_offset(3, MapBias::Left), 3);
        assert_eq!(inserted.map_offset(3, MapBias::Right), 5);
        // A range whose edge sits exactly on an insertion grows to contain it:
        // typing at the end of a link extends the link.
        assert_eq!(
            inserted.map_range(Utf16Range::new(1, 3)),
            Utf16Range::new(1, 5)
        );
        assert_eq!(
            inserted.map_range(Utf16Range::new(3, 4)),
            Utf16Range::new(3, 6)
        );
        // A span bracketing the edit still brackets its replacement.
        assert_eq!(
            moved.map_range(Utf16Range::new(1, 5)),
            Utf16Range::new(1, 6)
        );
    }

    #[test]
    fn a_stale_anchor_clamps_instead_of_disappearing() {
        let shrunk = map(0, 6, 1, 6);
        assert_eq!(shrunk.map_offset(99, MapBias::Left), 1);
        assert_eq!(
            shrunk.map_range(Utf16Range::new(4, 99)),
            Utf16Range::new(0, 1)
        );
        assert!(PositionMap::identity(5).is_identity());
        assert!(!shrunk.is_identity());
    }

    #[test]
    fn segments_tile_the_old_space_without_gaps() {
        for (start, end, inserted, length) in
            [(0, 0, 3, 0), (0, 4, 0, 4), (2, 2, 1, 5), (0, 5, 5, 5)]
        {
            let table = map(start, end, inserted, length);
            let mut cursor = 0;
            for segment in table.segments() {
                assert_eq!(segment.old_start, cursor);
                cursor = segment.old_end;
            }
            assert_eq!(cursor, length);
        }
    }

    proptest! {
        #[test]
        fn mapping_is_monotone_total_and_bounded(
            length in 0_u32..40,
            start in 0_u32..40,
            span in 0_u32..40,
            inserted in 0_u32..10,
        ) {
            let start = if length == 0 { 0 } else { start % (length + 1) };
            let end = start + span % (length + 1 - start);
            let table = map(start, end, inserted, length);
            let mut previous = 0;
            for offset in 0..=length {
                let mapped = table.map_offset(offset, MapBias::Left);
                prop_assert!(mapped <= table.new_length());
                prop_assert!(mapped >= previous, "mapping went backwards");
                previous = mapped;
                let right = table.map_offset(offset, MapBias::Right);
                prop_assert!(right >= mapped);
                prop_assert!(right <= table.new_length());
            }
            // Everything outside the replaced span keeps its exact distance to
            // the value's edges, which is what an anchor relies on.
            for offset in 0..=start {
                prop_assert_eq!(table.map_offset(offset, MapBias::Left), offset);
            }
            for offset in end..=length {
                prop_assert_eq!(
                    table.map_offset(offset, MapBias::Right),
                    offset + inserted - (end - start)
                );
            }
        }

    }
}
