import type { SiteDocumentPayload } from "./types";

declare global {
  interface Window {
    __PINGO_SITE_PAYLOAD__?: SiteDocumentPayload;
  }

  /** Released engine version, substituted at build time. See vite.config.ts. */
  const __PINGO_VERSION__: string;
}

export {};
