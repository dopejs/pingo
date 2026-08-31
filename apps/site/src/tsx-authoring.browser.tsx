/** @jsxImportSource @dopejs/pingo */
import {
  createContext,
  createHostedCanvasRoot,
  Text,
  useContext,
  View,
  type PaintedTextSnapshot,
  type PingoNode,
} from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * TSX authoring, end to end, through the published entry point.
 *
 * The engine's whole pitch is writing TSX on a canvas, and nothing in this
 * repository was written that way -- so nothing caught that `memo` and
 * `context.Provider` returned plain objects, which TypeScript rejects as JSX
 * tags because it resolves a tag's props from a call signature. Every element
 * form below is one that did not compile before: an intrinsic, a foundation
 * component, a user component returning `PingoNode`, a memoized component from
 * the UI library, and a context provider.
 *
 * The assertion is the painted-text oracle rather than a snapshot: the point is
 * that these elements reached paint, not that they landed on a given pixel.
 */
describe("TSX authoring", () => {
  const roots: Array<{ close(): Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0).reverse()) await root.close();
    document.body.replaceChildren();
  });

  const Label = createContext("unset");

  function Caption({ prefix }: { readonly prefix: string }): PingoNode {
    // Returning `PingoNode` is the signature this project's own documentation
    // shows; it includes `undefined`, which is what made it an invalid JSX
    // element type until `JSX.ElementType` declared the tag vocabulary.
    return (
      <container width={200} height={20}>
        <text value={`${prefix}-${useContext(Label)}`} fontSize={12} lineHeight={16} />
      </container>
    );
  }

  it("renders every element form the runtime accepts", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    document.body.append(canvas);
    const snapshots: PaintedTextSnapshot[] = [];
    const errors: Error[] = [];
    const root = await createHostedCanvasRoot(canvas, {
      onHostError: (error) => errors.push(error),
      onPaintedText: (snapshot) => snapshots.push(snapshot),
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);

    root.render(
      <Label.Provider value="ctx">
        <View style={{ flexDirection: "column" }}>
          <Text value="foundation" fontSize={12} lineHeight={16} />
          <Caption prefix="caption" />
          <Button onPress={() => {}}>memoized</Button>
        </View>
      </Label.Provider>,
    );

    await withTimeout(
      waitUntil(() => texts().includes("memoized")),
      5_000,
      "TSX tree reaching paint",
    );

    // The intrinsic inside the user component, the foundation component, the
    // context value read through a hook, and the memoized UI component.
    expect(texts()).toContain("foundation");
    expect(texts()).toContain("caption-ctx");
    expect(texts()).toContain("memoized");
    expect(errors).toEqual([]);

    function texts(): string[] {
      return (snapshots.at(-1)?.records ?? []).map((record) => record.text);
    }
  });

  async function waitUntil(predicate: () => boolean): Promise<void> {
    while (!predicate()) await new Promise<void>((resolve) => setTimeout(resolve, 5));
  }

  async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    let handle: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<never>((_resolve, reject) => {
          handle = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
        }),
      ]);
    } finally {
      if (handle !== undefined) clearTimeout(handle);
    }
  }
});
