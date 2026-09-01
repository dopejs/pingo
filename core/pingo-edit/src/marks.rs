use crate::{EditError, Utf16Range};

/// One contiguous span of an editing value carrying a single mark style.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct MarkRun {
    /// UTF-16 code-unit length of the span. Never zero in a normalized table.
    pub length: u32,
    /// Text style resource identity, or zero for the value's base style.
    ///
    /// Core never interprets what the style means: whether it reads as bold, a
    /// link, or a code span is a schema question, and the schema lives in the
    /// Shell. Core only owns where the styled span sits and how it moves.
    pub style: u32,
    /// Font resource for the span, or zero to inherit the node's font.
    pub font: u32,
}

/// The mark table for one editing value, in ascending order without gaps.
///
/// The table always tiles the whole value. An untiled table would leave code
/// units whose style depends on which side happened to ask, which is exactly
/// the kind of ambiguity that makes a caret land in the wrong run.
#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct MarkRuns {
    runs: Vec<MarkRun>,
}

/// Which side of a boundary a query or an insertion belongs to.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub enum MarkSide {
    /// The run ending at the offset.
    #[default]
    Before,
    /// The run starting at the offset.
    After,
}

impl MarkRuns {
    /// Creates a table where the whole value carries the base style.
    #[must_use]
    pub fn plain(length: u32) -> Self {
        Self {
            runs: if length == 0 {
                Vec::new()
            } else {
                vec![MarkRun {
                    length,
                    style: 0,
                    font: 0,
                }]
            },
        }
    }

    /// Builds a normalized table from raw spans, checking that it tiles `length`.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::InvalidMarkRuns`] when the spans do not sum to
    /// `length` or a span overflows the offset space.
    pub fn from_runs(runs: &[MarkRun], length: u32) -> Result<Self, EditError> {
        let mut table = Self { runs: Vec::new() };
        let mut total = 0_u32;
        for run in runs {
            total = total
                .checked_add(run.length)
                .ok_or(EditError::OffsetOverflow)?;
            table.push(*run);
        }
        if total != length {
            return Err(EditError::InvalidMarkRuns {
                covered: total,
                text_len: length,
            });
        }
        Ok(table)
    }

    /// Returns the normalized spans.
    #[must_use]
    pub fn runs(&self) -> &[MarkRun] {
        &self.runs
    }

    /// Returns the total UTF-16 length the table covers.
    #[must_use]
    pub fn length(&self) -> u32 {
        self.runs.iter().map(|run| run.length).sum()
    }

    /// Returns whether the table has no spans.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.runs.is_empty()
    }

    /// Returns the run covering `offset` on the requested side.
    ///
    /// # Panics
    ///
    /// Never; an empty table answers with the base style.
    #[must_use]
    pub fn run_at(&self, offset: u32, side: MarkSide) -> MarkRun {
        let mut cursor = 0_u32;
        let mut previous = MarkRun {
            length: 0,
            style: 0,
            font: 0,
        };
        for run in &self.runs {
            let end = cursor.saturating_add(run.length);
            if offset < end || (offset == end && side == MarkSide::Before) {
                return *run;
            }
            previous = *run;
            cursor = end;
        }
        previous
    }

    /// Returns the style covering `offset` on the requested side.
    ///
    /// At a boundary the caller decides: typing continues the run it was
    /// touching, so insertion asks for [`MarkSide::Before`]. At offset zero
    /// there is no preceding run, so the following one answers; a Shell whose
    /// schema wants plain text there arms the base style explicitly instead.
    #[must_use]
    pub fn style_at(&self, offset: u32, side: MarkSide) -> u32 {
        self.run_at(offset, side).style
    }

    /// Returns the sub-table covering `range`.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::InvalidRange`] when the range leaves the table.
    pub fn slice(&self, range: Utf16Range) -> Result<Self, EditError> {
        let length = self.length();
        if range.start > range.end || range.end > length {
            return Err(EditError::InvalidRange {
                start: range.start,
                end: range.end,
                text_len: length,
            });
        }
        let mut result = Self { runs: Vec::new() };
        let mut cursor = 0_u32;
        for run in &self.runs {
            let end = cursor.saturating_add(run.length);
            let overlap_start = cursor.max(range.start);
            let overlap_end = end.min(range.end);
            if overlap_start < overlap_end {
                result.push(MarkRun {
                    length: overlap_end - overlap_start,
                    style: run.style,
                    font: run.font,
                });
            }
            cursor = end;
        }
        Ok(result)
    }

    /// Replaces `range` with `inserted`, returning the transformed table.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::InvalidRange`] when the range leaves the table, or
    /// [`EditError::OffsetOverflow`] when the result would not fit.
    pub fn replace(&self, range: Utf16Range, inserted: &Self) -> Result<Self, EditError> {
        let length = self.length();
        if range.start > range.end || range.end > length {
            return Err(EditError::InvalidRange {
                start: range.start,
                end: range.end,
                text_len: length,
            });
        }
        let mut result = self.slice(Utf16Range::new(0, range.start))?;
        for run in &inserted.runs {
            result.push(*run);
        }
        for run in &self.slice(Utf16Range::new(range.end, length))?.runs {
            result.push(*run);
        }
        let expected = length
            .checked_sub(range.end - range.start)
            .and_then(|kept| kept.checked_add(inserted.length()))
            .ok_or(EditError::OffsetOverflow)?;
        if result.length() != expected {
            return Err(EditError::OffsetOverflow);
        }
        Ok(result)
    }

    /// Returns a table where `range` carries `style` and `font`.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::InvalidRange`] when the range leaves the table.
    pub fn set_style(&self, range: Utf16Range, style: u32, font: u32) -> Result<Self, EditError> {
        if range.is_collapsed() {
            return Ok(self.clone());
        }
        self.replace(range, &Self::uniform(range.end - range.start, style, font))
    }

    /// Returns a uniform table of `length` carrying `style` and `font`.
    #[must_use]
    pub fn uniform(length: u32, style: u32, font: u32) -> Self {
        Self {
            runs: if length == 0 {
                Vec::new()
            } else {
                vec![MarkRun {
                    length,
                    style,
                    font,
                }]
            },
        }
    }

    /// Returns whether every code unit in `range` carries `style`.
    ///
    /// # Errors
    ///
    /// Returns [`EditError::InvalidRange`] when the range leaves the table.
    pub fn is_uniformly(&self, range: Utf16Range, style: u32) -> Result<bool, EditError> {
        let slice = self.slice(range)?;
        Ok(slice.runs.iter().all(|run| run.style == style))
    }

    fn push(&mut self, run: MarkRun) {
        if run.length == 0 {
            return;
        }
        match self.runs.last_mut() {
            Some(last) if last.style == run.style && last.font == run.font => {
                last.length = last.length.saturating_add(run.length);
            }
            _ => self.runs.push(run),
        }
    }
}

#[cfg(test)]
mod tests {
    use proptest::prelude::*;

    use super::*;

    fn table(spans: &[(u32, u32)]) -> MarkRuns {
        let runs = spans
            .iter()
            .map(|(length, style)| MarkRun {
                length: *length,
                style: *style,
                font: 0,
            })
            .collect::<Vec<_>>();
        let length = runs.iter().map(|run| run.length).sum();
        MarkRuns::from_runs(&runs, length).expect("table")
    }

    #[test]
    fn normalizes_adjacent_and_empty_spans() {
        let normalized = table(&[(2, 1), (0, 7), (3, 1), (1, 0)]);
        assert_eq!(
            normalized.runs(),
            &[
                MarkRun {
                    length: 5,
                    style: 1,
                    font: 0,
                },
                MarkRun {
                    length: 1,
                    style: 0,
                    font: 0,
                },
            ]
        );
        assert_eq!(normalized.length(), 6);
    }

    #[test]
    fn rejects_a_table_that_does_not_tile_the_value() {
        assert_eq!(
            MarkRuns::from_runs(
                &[MarkRun {
                    length: 3,
                    style: 1,
                    font: 0,
                }],
                4
            ),
            Err(EditError::InvalidMarkRuns {
                covered: 3,
                text_len: 4,
            })
        );
    }

    #[test]
    fn a_boundary_belongs_to_the_side_the_caller_names() {
        let marks = table(&[(2, 1), (2, 2)]);
        assert_eq!(marks.style_at(0, MarkSide::After), 1);
        assert_eq!(marks.style_at(2, MarkSide::Before), 1);
        assert_eq!(marks.style_at(2, MarkSide::After), 2);
        assert_eq!(marks.style_at(4, MarkSide::Before), 2);
        // Past the end there is nothing after, so the last run answers.
        assert_eq!(marks.style_at(9, MarkSide::After), 2);
        assert_eq!(MarkRuns::default().style_at(0, MarkSide::Before), 0);
    }

    #[test]
    fn replacement_splices_the_table_and_rejoins_equal_neighbours() {
        let marks = table(&[(2, 1), (2, 2), (2, 1)]);
        let spliced = marks
            .replace(Utf16Range::new(2, 4), &MarkRuns::uniform(3, 1, 0))
            .expect("replace");
        assert_eq!(
            spliced.runs(),
            &[MarkRun {
                length: 7,
                style: 1,
                font: 0,
            }]
        );

        let deleted = marks
            .replace(Utf16Range::new(1, 5), &MarkRuns::default())
            .expect("delete");
        assert_eq!(
            deleted.runs(),
            &[MarkRun {
                length: 2,
                style: 1,
                font: 0,
            }]
        );
        assert_eq!(
            marks.replace(Utf16Range::new(0, 9), &MarkRuns::default()),
            Err(EditError::InvalidRange {
                start: 0,
                end: 9,
                text_len: 6,
            })
        );
    }

    #[test]
    fn set_style_covers_exactly_the_requested_range() {
        let marks = MarkRuns::plain(6);
        let bolded = marks.set_style(Utf16Range::new(2, 5), 1, 0).expect("style");
        assert_eq!(
            bolded.runs(),
            &[
                MarkRun {
                    length: 2,
                    style: 0,
                    font: 0,
                },
                MarkRun {
                    length: 3,
                    style: 1,
                    font: 0,
                },
                MarkRun {
                    length: 1,
                    style: 0,
                    font: 0,
                },
            ]
        );
        assert!(
            bolded
                .is_uniformly(Utf16Range::new(2, 5), 1)
                .expect("query")
        );
        assert!(
            !bolded
                .is_uniformly(Utf16Range::new(1, 5), 1)
                .expect("query")
        );
        // A collapsed range styles nothing.
        assert_eq!(
            bolded.set_style(Utf16Range::new(3, 3), 9, 0).expect("noop"),
            bolded
        );
    }

    proptest! {
        #[test]
        fn every_operation_keeps_the_table_tiling_and_normalized(
            spans in prop::collection::vec((1_u32..6, 0_u32..3), 1..12),
            operations in prop::collection::vec((0_usize..3, 0_u32..20, 0_u32..20, 0_u32..3), 0..24),
        ) {
            let mut marks = table(&spans);
            for (kind, first, second, style) in operations {
                let length = marks.length();
                if length == 0 {
                    break;
                }
                let start = first % (length + 1);
                let end = start + (second % (length + 1 - start));
                let range = Utf16Range::new(start, end);
                let next = match kind {
                    0 => marks.set_style(range, style, 0).expect("style"),
                    1 => marks
                        .replace(range, &MarkRuns::uniform(second % 5, style, 0))
                        .expect("replace"),
                    _ => marks.slice(range).expect("slice"),
                };
                // Tiling: no empty span, and no two neighbours share a style.
                prop_assert!(next.runs().iter().all(|run| run.length > 0));
                for pair in next.runs().windows(2) {
                    prop_assert_ne!(pair[0].style, pair[1].style);
                }
                if kind == 0 && !range.is_collapsed() {
                    prop_assert!(next.is_uniformly(range, style).expect("query"));
                    prop_assert_eq!(next.length(), length);
                }
                marks = next;
            }
        }
    }
}
