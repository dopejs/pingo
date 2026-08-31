/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { StatCard } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 180,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          <StatCard
            label="本月营收"
            value="¥128,400"
            delta="+12.5%"
            trend="up"
            description="较上月"
          />,
          <StatCard label="退款率" value="1.8%" delta="-0.4%" trend="down" description="较上月" />,
          <StatCard label="活跃用户" value="8,421" delta="0%" trend="flat" />,
        ],
        12,
      ),
    ]),
};

export default demo;
