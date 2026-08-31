/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Form, FormField, Input } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    stage(context, [
      <Form>
        <container style={{ flexDirection: "column" }}>
          <FormField label="邮箱" required error="邮箱格式不正确">
            <Input semanticLabel="邮箱" width={320} value="not-an-email" onValueChange={() => {}} />
          </FormField>
          <container height={16} />
          <FormField label="昵称" description="昵称会展示在个人主页。">
            <Input semanticLabel="昵称" width={320} onValueChange={() => {}} />
          </FormField>
        </container>
      </Form>,
    ]),
};

export default demo;
