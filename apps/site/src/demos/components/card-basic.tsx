/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 300,
  render: (context): PingoNode =>
    stage(context, [
      <container
        width={340}
        // A flex container with no style prop is on the direct-prop path,
        // where align-items is flex-start; the CSS initial `stretch` is what
        // makes the component inside fill this width.
        style={{ flexDirection: "column" }}
      >
        <Card>
          <CardHeader>
            <CardTitle>账户设置</CardTitle>
            <CardDescription>管理你的账户偏好与通知。</CardDescription>
          </CardHeader>
          <CardContent>
            <text value="将你的更改同步到所有设备，或仅保存在本地。" />
          </CardContent>
          <CardFooter>
            {row(
              [
                <Button onPress={() => {}}>保存</Button>,
                <Button variant="outline" onPress={() => {}}>
                  取消
                </Button>,
              ],
              8,
            )}
          </CardFooter>
        </Card>
      </container>,
    ]),
};

export default demo;
