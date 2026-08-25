import { memo, Text, View, type PingoNode } from "@dopejs/pingo-jsx";

import { classes, skin } from "../theme";

// Type aliases (not interfaces) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type CardSectionProps = {
  readonly children: PingoNode;
  readonly className?: string;
};

export type CardTextProps = {
  readonly children: string;
  readonly className?: string;
};

// `themed` is false for the slots that carry no colour of their own: header,
// footer and content sit on the card's surface, so marking them would add a
// class no rule matches.
function section(base: string, props: CardSectionProps, themed: boolean): PingoNode {
  return View({
    className: themed ? skin(base, props.className) : classes(base, props.className),
    children: props.children,
  });
}

function text(base: string, props: CardTextProps, themed: boolean): PingoNode {
  return Text({
    className: themed ? skin(base, props.className) : classes(base, props.className),
    value: props.children,
  });
}

function CardImpl(props: CardSectionProps): PingoNode {
  return section("pui-card", props, true);
}

function CardHeaderImpl(props: CardSectionProps): PingoNode {
  return section("pui-card-header", props, false);
}

function CardTitleImpl(props: CardTextProps): PingoNode {
  return text("pui-card-title", props, false);
}

function CardDescriptionImpl(props: CardTextProps): PingoNode {
  return text("pui-card-description", props, true);
}

function CardContentImpl(props: CardSectionProps): PingoNode {
  return section("pui-card-content", props, false);
}

function CardFooterImpl(props: CardSectionProps): PingoNode {
  return section("pui-card-footer", props, false);
}

/**
 * shadcn-style Card composition family. Slots pass through untouched.
 * Memoized: re-renders only when props change.
 */
export const Card = memo(CardImpl);
export const CardHeader = memo(CardHeaderImpl);
export const CardTitle = memo(CardTitleImpl);
export const CardDescription = memo(CardDescriptionImpl);
export const CardContent = memo(CardContentImpl);
export const CardFooter = memo(CardFooterImpl);
