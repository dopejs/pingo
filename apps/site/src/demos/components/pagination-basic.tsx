/** @jsxImportSource @dopejs/pingo */
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Pagination } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

function PagedScene(_props: Record<string, never>): PingoNode {
  const page = useSignal(3);
  return (
    <Pagination
      page={page.get()}
      pageCount={12}
      onPageChange={(next) => {
        page.set(next);
      }}
    />
  );
}

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode => stage(context, [<PagedScene />]),
};

export default demo;
