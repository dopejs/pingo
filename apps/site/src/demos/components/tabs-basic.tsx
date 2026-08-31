/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Label, Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 200,
  render: (context): PingoNode =>
    stage(context, [
      <container
        width={360}
        // A flex container with no style prop is on the direct-prop path,
        // where align-items is flex-start; the CSS initial `stretch` is what
        // makes the component inside fill this width.
        style={{ flexDirection: "column" }}
      >
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账户</TabsTrigger>
            <TabsTrigger value="password">密码</TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Label>管理你的账户信息与偏好。</Label>
          </TabsContent>
          <TabsContent value="password">
            <Label>修改你的登录密码。</Label>
          </TabsContent>
          <TabsContent value="notifications">
            <Label>选择要接收的通知类型。</Label>
          </TabsContent>
        </Tabs>
      </container>,
    ]),
};

export default demo;
