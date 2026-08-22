import type { PreviewDemo } from "./contract";

/**
 * Registry of documentation preview demos, keyed by file basename.
 *
 * Both the demo modules and their TypeScript source are loaded lazily: the
 * module is fetched when the preview scrolls into view, the source when the
 * reader opens the Code tab. `content.mjs` independently validates that every
 * `:::preview <id>` reference maps to a file in `src/demos/`, so a missing
 * entry here means the id was renamed without updating the markdown.
 */
type DemoLoader = () => Promise<{ readonly default: PreviewDemo }>;
type SourceLoader = () => Promise<string>;

function indexById<T>(entries: Record<string, T>): Record<string, T | undefined> {
  const indexed: Record<string, T | undefined> = {};
  for (const [path, value] of Object.entries(entries)) {
    indexed[(path.split("/").pop() ?? path).replace(/\.tsx?$/u, "")] = value;
  }
  return indexed;
}

const loaderById = indexById(
  import.meta.glob<{ readonly default: PreviewDemo }>(["../demos/**/*.tsx", "../demos/**/*.ts"]),
);
const sourceLoaderById = indexById(
  import.meta.glob<string>(["../demos/**/*.tsx", "../demos/**/*.ts"], {
    query: "?raw",
    import: "default",
  }),
);

/** Loads the demo module for an id, or undefined when the id is unknown. */
export async function loadPreviewDemo(id: string): Promise<PreviewDemo | undefined> {
  const loader: DemoLoader | undefined = loaderById[id];
  if (loader === undefined) return undefined;
  return (await loader()).default;
}

/** Loads the TypeScript source shown in the Code tab. */
export async function loadPreviewSource(id: string): Promise<string | undefined> {
  const loader: SourceLoader | undefined = sourceLoaderById[id];
  return loader?.();
}
