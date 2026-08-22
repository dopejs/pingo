import { createElement, type PingoNode } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 240,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          createElement(Input, {
            semanticLabel: "金额",
            width: 320,
            value: "128",
            prefix: createElement("text", { value: "¥" }),
            suffix: createElement("text", { value: "CNY" }),
            onValueChange: () => {},
          }),
          createElement(Input, {
            semanticLabel: "密码",
            width: 320,
            password: true,
            value: "secret",
            onValueChange: () => {},
          }),
          createElement(Input, {
            semanticLabel: "邀请码",
            width: 320,
            value: "已锁定",
            disabled: true,
          }),
        ],
        12,
      ),
    ]),
};

export default demo;
