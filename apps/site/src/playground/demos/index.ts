import type { Demo } from "../demo";
import { editingDemo } from "./editing";
import { eventsDemo } from "./events";
import { richTextDemo } from "./rich-text";
import { scrollDemo } from "./scroll";
import { semanticsDemo } from "./semantics";
import { transportDemo } from "./transport";

export const demos: readonly Demo[] = [
  scrollDemo,
  editingDemo,
  richTextDemo,
  eventsDemo,
  semanticsDemo,
  transportDemo,
];
