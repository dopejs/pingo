import { createElement, type PingoNode } from "@dopejs/pingo";
import { Form, FormField, Input } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Form, {
        children: createElement("container", {
          style: { flexDirection: "column" },
          children: [
            createElement(FormField, {
              label: "邮箱",
              required: true,
              error: "邮箱格式不正确",
              children: createElement(Input, {
                semanticLabel: "邮箱",
                width: 320,
                value: "not-an-email",
                onValueChange: () => {},
              }),
            }),
            createElement("container", { height: 16 }),
            createElement(FormField, {
              label: "昵称",
              description: "昵称会展示在个人主页。",
              children: createElement(Input, {
                semanticLabel: "昵称",
                width: 320,
                onValueChange: () => {},
              }),
            }),
          ],
        }),
      }),
    ]),
};

export default demo;
