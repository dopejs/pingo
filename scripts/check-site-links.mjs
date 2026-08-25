import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/**
 * Every in-site link resolves to a page the site actually publishes.
 *
 * The site's content and the repository's design corpus used to live in one
 * directory, and separating them turned a dozen cross-references into 404s
 * that nothing would have caught: the build succeeds, the page renders, and
 * only a reader finds out. Markdown links are the one thing here with no type
 * to check them.
 */
const contentRoot = path.resolve(import.meta.dirname, "../apps/site/content");

async function markdownFiles(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...(await markdownFiles(path.join(directory, entry.name), relative)));
    } else if (entry.name.endsWith(".md")) {
      files.push(relative);
    }
  }
  return files;
}

const files = await markdownFiles(contentRoot);
const routes = new Set(
  files.map((file) => {
    const withoutExtension = file.replace(/\.md$/u, "");
    return `/${withoutExtension.replace(/(^|\/)index$/u, "")}`.replace(/\/$/u, "") || "/";
  }),
);

const problems = [];
for (const file of files) {
  const source = await readFile(path.join(contentRoot, file), "utf8");
  for (const match of source.matchAll(/\]\((\/[^)\s#]*)(#[^)\s]*)?\)/gu)) {
    const route = match[1] === "/" ? "/" : match[1].replace(/\/$/u, "");
    if (!routes.has(route)) problems.push(`${file}: ${match[1]} does not resolve to a page`);
  }
}

if (problems.length > 0) {
  process.stderr.write(`${problems.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(`site links: ${String(routes.size)} pages, every in-site link resolves\n`);
