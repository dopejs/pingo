/** @jsxImportSource @dopejs/pingo */
import { Text, useState, View, type PingoNode } from "@dopejs/pingo";

/**
 * The pingo half of the boundary, in a file of its own.
 *
 * `jsxImportSource` is per file, so every tag in one file compiles to one
 * runtime. A React component cannot also contain pingo tags; it imports from
 * here instead, and that import is the entire boundary.
 */
function Panel({ label }: { readonly label: string }): PingoNode {
  const [seen] = useState(label);
  return (
    <View width={240} height={80} padding={12} backgroundColor="#ffffffff">
      <Text value={seen} fontSize={14} lineHeight={20} color="#1f2329ff" />
    </View>
  );
}

/**
 * What the React side calls.
 *
 * It returns an element rather than the result of calling `Panel`, because a
 * component that uses hooks has to be mounted by the reconciler: calling it
 * directly throws "hooks may only run in a function component". Exporting the
 * element keeps that rule on this side of the boundary, where the tag is in
 * the runtime that understands it.
 */
export function scene(label: string): PingoNode {
  return <Panel label={label} />;
}
