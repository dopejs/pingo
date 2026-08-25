import { readFileSync } from "node:fs";

import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

/**
 * The released version, read from the single source the release gate checks.
 *
 * Not imported from the facade: the home page would then pull the engine into
 * its bundle to render four characters. Not hand-written either -- a hardcoded
 * version is how the site came to advertise 0.2.1 after 0.3.0 was on npm.
 */
function engineVersion(): string {
  const source = readFileSync(
    new URL("../../packages/facade/src/version.ts", import.meta.url),
    "utf8",
  );
  const version = /ENGINE_VERSION = "([^"]+)"/u.exec(source)?.[1];
  if (version === undefined) throw new Error("ENGINE_VERSION is missing from the facade");
  return version;
}

const PAGE_ENDPOINT = "/__pingo/site-page";
const SEARCH_ENDPOINT = "/__pingo/search-index.json";

interface DevelopmentContent {
  payloadForPath(pathname: string): unknown;
  readonly searchIndex: unknown;
}

interface JsonResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(value: string): void;
}

function developmentContent(): Plugin {
  let contentPromise: Promise<DevelopmentContent> | undefined;
  const content = async (): Promise<DevelopmentContent> => {
    contentPromise ??= import("./content.mjs").then(
      async ({ loadSiteContent }) => (await loadSiteContent()) as DevelopmentContent,
    );
    return contentPromise;
  };

  const json = (response: JsonResponse, value: unknown): void => {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(value));
  };

  return {
    name: "pingo-site-content",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const requestUrl = (request as { readonly url?: string }).url;
        const url = new URL(requestUrl ?? "/", "http://pingo.local");
        if (url.pathname === PAGE_ENDPOINT) {
          void content()
            .then((site) =>
              json(
                response as unknown as JsonResponse,
                site.payloadForPath(url.searchParams.get("path") ?? "/"),
              ),
            )
            .catch(next);
          return;
        }
        if (url.pathname === SEARCH_ENDPOINT) {
          void content()
            .then((site) => json(response as unknown as JsonResponse, site.searchIndex))
            .catch(next);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  define: {
    __PINGO_VERSION__: JSON.stringify(engineVersion()),
  },
  plugins: [react(), developmentContent()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
