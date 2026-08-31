/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Skeleton } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, row, stage } from "../../preview/layout";

// A card-shaped loading placeholder: avatar block + two text lines + body.
const demo: PreviewDemo = {
  height: 220,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          row(
            [
              <Skeleton width={48} height={48} />,
              column(
                [<Skeleton width={120} height={14} />, <Skeleton width={200} height={14} />],
                10,
              ),
            ],
            12,
          ),
          <Skeleton width={320} height={14} />,
          <Skeleton width={280} height={14} />,
        ],
        14,
      ),
    ]),
};

export default demo;
