/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 240,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          <Input
            semanticLabel="金额"
            width={320}
            value="128"
            prefix={<text value="¥" />}
            suffix={<text value="CNY" />}
            onValueChange={() => {}}
          />,
          <Input
            semanticLabel="密码"
            width={320}
            password
            value="secret"
            onValueChange={() => {}}
          />,
          <Input semanticLabel="邀请码" width={320} value="已禁用" disabled />,
        ],
        12,
      ),
    ]),
};

export default demo;
