/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { ContextMenu } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 160,
  render: (context): PingoNode =>
    stage(context, [
      <ContextMenu
        items={[
          { value: "copy", label: "复制" },
          { value: "paste", label: "粘贴", disabled: true },
          { value: "delete", label: "删除" },
        ]}
        onSelect={() => {}}
      >
        <container padding={24}>
          <text value="在此右键打开菜单" />
        </container>
      </ContextMenu>,
    ]),
};

export default demo;
