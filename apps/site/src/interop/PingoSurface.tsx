import { type ReactNode } from "react";
import type { PaintedTextSnapshot } from "@dopejs/pingo";
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

interface PingoSurfaceProps {
  readonly label: string;
  readonly onPaintedText?: (snapshot: PaintedTextSnapshot) => void;
}

/**
 * A React component hosting a pingo scene.
 *
 * This file's JSX is React's -- no pragma, so it takes the project's
 * `jsxImportSource`, and it therefore cannot contain pingo tags. The scene
 * comes from `./scene.pingo`, and that import is the whole boundary.
 */
export function PingoSurface({ label, onPaintedText }: PingoSurfaceProps): ReactNode {
  return (
    <PingoContainer
      scene={scene(label)}
      style={{ height: 80, width: 240 }}
      {...(onPaintedText === undefined ? {} : { options: { onPaintedText } })}
    />
  );
}
