import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { RELEASE_PACKAGES } from "./check-npm-release.mjs";

// The same releases are recorded in three places at different levels of detail:
// the repository changelog for engineers, the site changelog for users, and its
// nine translations. They drifted once -- 0.3.0 closed out the site copy and
// left the repository copy still calling the shipped work "Unreleased", and the
// package count went stale in both -- so the release procedure now names every
// copy and this test holds them to the same version list.
const contentRoot = new URL("../apps/site/content/", import.meta.url);
const repositoryChangelog = await readFile(new URL("../CHANGELOG.md", import.meta.url), "utf8");
const siteChangelog = await readFile(new URL("changelog.md", contentRoot), "utf8");
const localeChangelogs = await readLocaleChangelogs();

async function readLocaleChangelogs() {
  const entries = await readdir(contentRoot, { withFileTypes: true });
  const locales = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = new URL(path.posix.join(entry.name, "changelog.md"), contentRoot);
    const text = await readFile(file, "utf8").catch(() => undefined);
    if (text !== undefined) locales.push([entry.name, text]);
  }
  return locales;
}

function releasedVersions(changelog) {
  return [...changelog.matchAll(/^## (\d+\.\d+\.\d+)/gmu)].map((match) => match[1]);
}

function declaredPackageCount(changelog) {
  return Number(/：(\d+) 个包同版本原子发布/u.exec(changelog)?.[1]);
}

describe("changelog sync", () => {
  const released = releasedVersions(repositoryChangelog);

  it("records the same releases in the repository and site copies", () => {
    expect(released.length).toBeGreaterThan(0);
    expect(released).toStrictEqual(releasedVersions(siteChangelog));
  });

  // A release that reaches the default-language site but not the translations
  // leaves nine locales silently claiming the previous version is the newest.
  it("translates every release", () => {
    expect(localeChangelogs.length).toBeGreaterThan(0);
    for (const [locale, changelog] of localeChangelogs) {
      expect(releasedVersions(changelog), locale).toStrictEqual(released);
    }
  });

  it("lists releases newest first", () => {
    const descending = [...released].sort((left, right) => {
      const [a, b] = [left.split("."), right.split(".")].map((parts) => parts.map(Number));
      return b[0] - a[0] || b[1] - a[1] || b[2] - a[2];
    });
    expect(released).toStrictEqual(descending);
  });

  it("states the real size of the release set", () => {
    for (const changelog of [repositoryChangelog, siteChangelog]) {
      expect(declaredPackageCount(changelog)).toBe(RELEASE_PACKAGES.length);
    }
  });
});
