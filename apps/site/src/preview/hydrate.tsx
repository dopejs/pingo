import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import { ComponentPreview } from "./ComponentPreview";

interface PreviewLabels {
  readonly preview: string;
  readonly code: string;
  readonly previewError: string;
}

/**
 * Mounts a `ComponentPreview` into every `:::preview` placeholder inside a
 * server-rendered documentation article. Returns a cleanup that unmounts all
 * previews; callers invoke it before the article HTML is replaced.
 */
export function hydratePreviews(article: HTMLElement, labels: PreviewLabels): () => void {
  const roots: Root[] = [];
  for (const placeholder of article.querySelectorAll<HTMLElement>(
    ".component-preview[data-demo]",
  )) {
    const id = placeholder.dataset.demo;
    if (id === undefined || id === "") continue;
    const root = createRoot(placeholder);
    root.render(createElement(ComponentPreview, { id, labels }));
    roots.push(root);
  }
  return () => {
    for (const root of roots) root.unmount();
  };
}
