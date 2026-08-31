/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 320,
  render: (context): PingoNode =>
    stage(context, [
      <Sidebar defaultValue="stats" onValueChange={() => {}}>
        <SidebarSection title="工作区">
          <SidebarItem value="home" label="首页" />
          <SidebarItem value="stats" label="统计" />
          <SidebarItem value="projects" label="项目" />
        </SidebarSection>
        <SidebarSection title="系统">
          <SidebarItem value="members" label="成员" />
          <SidebarItem value="settings" label="设置" />
        </SidebarSection>
      </Sidebar>,
    ]),
};

export default demo;
