/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { anchorStage, frame } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 300,
  render: (context): PingoNode =>
    anchorStage(context, [
      // The trigger takes its width from its container, so the preview gives it
      // a definite one instead of leaving it to fill the whole stage.
      frame(280, [
        <Select value="pingo-ui" onValueChange={() => {}}>
          <SelectTrigger placeholder="选择一个包" />
          <SelectContent>
            <SelectItem value="pingo">@dopejs/pingo</SelectItem>
            <SelectItem value="pingo-ui">@dopejs/pingo-ui</SelectItem>
            <SelectItem value="pingo-editing">@dopejs/pingo-editing</SelectItem>
            <SelectItem value="pingo-style">@dopejs/pingo-style</SelectItem>
          </SelectContent>
        </Select>,
      ]),
    ]),
};

export default demo;
