/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { IconButton } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const star = (): PingoNode => <text value="★" />;

const demo: PreviewDemo = {
  height: 140,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          <IconButton icon={star()} semanticLabel="收藏" onPress={() => {}} />,
          <IconButton icon={star()} semanticLabel="收藏" variant="secondary" onPress={() => {}} />,
          <IconButton icon={star()} semanticLabel="收藏" variant="outline" onPress={() => {}} />,
          <IconButton icon={star()} semanticLabel="收藏" variant="ghost" onPress={() => {}} />,
          <IconButton
            icon={star()}
            semanticLabel="收藏"
            variant="destructive"
            onPress={() => {}}
          />,
          <IconButton icon={star()} semanticLabel="收藏" disabled onPress={() => {}} />,
        ],
        12,
      ),
    ]),
};

export default demo;
