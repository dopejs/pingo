import { createElement, type PingoNode } from "@dopejs/pingo";
import { IconButton } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const star = (): PingoNode => createElement("text", { value: "★" });

const demo: PreviewDemo = {
  height: 140,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          createElement(IconButton, { icon: star(), semanticLabel: "收藏", onPress: () => {} }),
          createElement(IconButton, {
            icon: star(),
            semanticLabel: "收藏",
            variant: "secondary",
            onPress: () => {},
          }),
          createElement(IconButton, {
            icon: star(),
            semanticLabel: "收藏",
            variant: "outline",
            onPress: () => {},
          }),
          createElement(IconButton, {
            icon: star(),
            semanticLabel: "收藏",
            variant: "ghost",
            onPress: () => {},
          }),
          createElement(IconButton, {
            icon: star(),
            semanticLabel: "收藏",
            variant: "destructive",
            onPress: () => {},
          }),
          createElement(IconButton, {
            icon: star(),
            semanticLabel: "收藏",
            disabled: true,
            onPress: () => {},
          }),
        ],
        12,
      ),
    ]),
};

export default demo;
