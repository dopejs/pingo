import { createElement, type PingoNode } from "@dopejs/pingo";
import { Pagination } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

// siblingCount 0 shows only the edge pages plus the current one; at page 1
// the previous control renders disabled.
const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [createElement(Pagination, { page: 1, pageCount: 24, siblingCount: 0 })]),
};

export default demo;
