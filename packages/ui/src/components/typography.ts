import { memo, Text, View, type PingoNode } from "@dopejs/pingo-jsx";

import { skin } from "../theme";

// Type aliases (not interfaces) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type TypographyProps = {
  readonly children: string;
  readonly className?: string;
};

export type HeadingProps = TypographyProps & {
  /** Overrides the announced level when the visual step and the outline differ. */
  readonly level?: 1 | 2 | 3 | 4 | 5 | 6;
};

/**
 * shadcn's typography, as components rather than a stylesheet.
 *
 * shadcn styles real `h1`/`p` elements and lets the cascade carry metrics down
 * a subtree. pingo resolves text metrics per node, so each step is a class on
 * the text node itself and a heading is a text node with a role, not a box that
 * makes its contents large.
 */
function heading(className: string, level: 1 | 2 | 3 | 4, props: HeadingProps): PingoNode {
  return Text({
    className: skin(className, props.className),
    // The level is a semantic value, not the visual step: a page may open with
    // an H2 for outline reasons and still want the H1 size, and a screen reader
    // announces an unlevelled heading as level 2 either way.
    semanticRole: "heading",
    semanticValue: String(props.level ?? level),
    value: props.children,
  });
}

function text(className: string, props: TypographyProps): PingoNode {
  return Text({ className: skin(className, props.className), value: props.children });
}

function H1Impl(props: HeadingProps): PingoNode {
  return heading("pui-h1", 1, props);
}
function H2Impl(props: HeadingProps): PingoNode {
  return heading("pui-h2", 2, props);
}
function H3Impl(props: HeadingProps): PingoNode {
  return heading("pui-h3", 3, props);
}
function H4Impl(props: HeadingProps): PingoNode {
  return heading("pui-h4", 4, props);
}
function PImpl(props: TypographyProps): PingoNode {
  return text("pui-p", props);
}
function LeadImpl(props: TypographyProps): PingoNode {
  return text("pui-lead", props);
}
function LargeImpl(props: TypographyProps): PingoNode {
  return text("pui-large", props);
}
function SmallImpl(props: TypographyProps): PingoNode {
  return text("pui-small", props);
}
function MutedImpl(props: TypographyProps): PingoNode {
  return text("pui-muted", props);
}

function BlockquoteImpl(props: TypographyProps): PingoNode {
  // A box for the rule, a text node for the words: the border belongs to the
  // wrapper and the metrics belong to the text.
  return View({
    className: skin("pui-blockquote", props.className),
    children: Text({ className: skin("pui-blockquote__text"), value: props.children }),
  });
}

function InlineCodeImpl(props: TypographyProps): PingoNode {
  return View({
    className: skin("pui-code", props.className),
    children: Text({ className: skin("pui-code__text"), value: props.children }),
  });
}

/** Page title. Announced as level 1 unless `level` says otherwise. */
export const H1 = memo(H1Impl);
/** Section heading, announced as level 2. */
export const H2 = memo(H2Impl);
/** Subsection heading, announced as level 3. */
export const H3 = memo(H3Impl);
/** Fourth-level heading. */
export const H4 = memo(H4Impl);
/** Body paragraph. */
export const P = memo(PImpl);
/** Introductory paragraph: paragraph size, muted colour. */
export const Lead = memo(LeadImpl);
/** Emphasised body text one step above the paragraph. */
export const Large = memo(LargeImpl);
/** Secondary text at label size. */
export const Small = memo(SmallImpl);
/** De-emphasised helper text. */
export const Muted = memo(MutedImpl);
/** Quotation with a hanging rule. */
export const Blockquote = memo(BlockquoteImpl);
/** Inline code chip. */
export const InlineCode = memo(InlineCodeImpl);
