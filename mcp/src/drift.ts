import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { detectStack, type DetectStackResult } from "./detectStack.js";
import { splitSections } from "./md.js";

// Compare the recorded selera profile with the project's ARCHITECTURE and TASKS.
// Reports only what can be checked mechanically. Never writes anything.
export type DriftItem = { key: string; selera: string; status: "missing_in_architecture" | "missing_in_tasks" | "deviation" | "ok"; note: string };
export type DriftSkip = { key: string; selera: string; reason: string };
export type DriftResult = { root: string; profile_path: string | null; items: DriftItem[]; skipped: DriftSkip[]; sources: Record<string, boolean> };

// Roles whose value is a tool name, so its presence in the docs can be checked as text.
// Scoped keys such as "fe.ui" or "be.fetch" match on their last segment.
export const TOOL_KEYS: Record<string, true> = { packageManager: true, validation: true, ui: true, db: true, test: true, lint: true, format: true, fetch: true, state: true, bundler: true, styling: true, form: true, queue: true, framework: true, api: true, orm: true, auth: true, i18n: true, router: true, observability: true, e2e: true };

// A scoped key ("fe.ui") applies only when detectStack finds that platform. Scopes without a reliable
// signal (cli, infra) always apply. Mobile errs toward checking: a Swift macOS app counts.
const FE = ["react", "next", "vue", "nuxt", "svelte", "sveltekit", "angular", "solid", "remix", "astro", "wxt", "electron"];
const BE = ["hono", "express", "fastify", "elysia", "nestjs", "trpc", "graphql", "prisma", "drizzle", "next", "nuxt", "sveltekit", "remix", "orpc"];
const BE_LANGS = ["Go", "Rust", "Python", "Ruby", "PHP", "Java"];
export const PLATFORMS: Record<string, (s: DetectStackResult) => boolean> = {
  fe: (s) => s.frameworks.some((f) => FE.includes(f)),
  be: (s) => s.frameworks.some((f) => BE.includes(f)) || s.languages.some((l) => BE_LANGS.includes(l)),
  mobile: (s) => s.frameworks.some((f) => f === "React Native" || f === "expo") || s.languages.some((l) => l === "Swift" || l === "Kotlin"),
};

// Nothing detected (no manifests, no hints): platform unknown, so every key applies.
export const isUnknownStack = (s: DetectStackResult) =>
  s.missing_root || (!s.manifests.length && !s.frameworks.length && !s.languages.length);

// A scoped key ("fe.ui") applies only when the detected stack has that platform.
export function appliesTo(key: string, stack: DetectStackResult): boolean {
  const scope = key.includes(".") ? key.split(".")[0] : null;
  if (!scope || !PLATFORMS[scope]) return true;
  return isUnknownStack(stack) || PLATFORMS[scope](stack);
}

// The profile is Markdown: "## Web" sections hold "- key: value" entries, everything else is free text.
// Same parser as selera.mjs; the skill and the MCP ship separately so the duplication is intended.
export const SECTION_SCOPES: Record<string, string | null> = {
  umum: "default", general: "default", default: "default",
  web: "fe", frontend: "fe", fe: "fe",
  backend: "be", be: "be",
  mobile: "mobile", cli: "cli", infra: "infra", infrastructure: "infra",
};
export const SCOPE_PREFIXES = new Set(["fe", "be", "mobile", "cli", "infra"]);
const PROFILE_HEADING = /^##\s+(.+?)\s*$/;
const PROFILE_ENTRY = /^\s*[-*]\s+([A-Za-z][\w-]*(?:\.[\w-]+)*)\s*:\s*(.+?)\s*$/;

export function parseProfileMd(md: string): Record<string, string> {
  const flat: Record<string, string> = {};
  let scope: string | null | undefined;
  for (const line of md.split(/\r?\n/)) {
    const h = PROFILE_HEADING.exec(line);
    if (h) { scope = SECTION_SCOPES[h[1].trim().toLowerCase()] ?? null; continue; }
    if (scope === undefined || scope === null) continue;
    const m = PROFILE_ENTRY.exec(line);
    if (!m) continue;
    const key = m[1];
    const flatKey = scope === "default" || SCOPE_PREFIXES.has(key.split(".")[0]) ? key : `${scope}.${key}`;
    flat[flatKey] = m[2].replace(/`/g, "");
  }
  return flat;
}

// Same sources and precedence as selera.mjs: global (SELERA_CONFIG or XDG), then the project's .selera, which wins.
export function loadProfile(root: string, path?: string): { path: string | null; data: Record<string, string> } {
  const global = process.env.SELERA_CONFIG ?? join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "inisiasi", "selera", "profile.md");
  const found = (path ? [path] : [global, join(root, ".selera", "profile.md")]).filter(existsSync);
  const data: Record<string, string> = Object.assign({}, ...found.map((p) => parseProfileMd(readFileSync(p, "utf8"))));
  return { path: found.at(-1) ?? null, data };
}

// "pnpm,bun" means pick one; "oxlint+oxfmt" means both are used.
export const named = (doc: string, value: string) =>
  value.split(",").map((s) => s.trim()).filter(Boolean)
    .some((alt) => alt.split("+").every((t) => {
      const term = t.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return term !== "" && new RegExp(`(?<![\\w])${term}`).test(doc);
    }));

function stackChosen(arch: string): string | null {
  const section = splitSections(arch).find((s) => s.title.toLowerCase() === "stack");
  if (!section) return null;
  const rows = section.body.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|"));
  if (rows.length < 2) return null;
  const cells = (row: string) => row.split("|").slice(1, -1).map((c) => c.trim().replace(/`/g, ""));
  const idx = cells(rows[0]).findIndex((h) => /^choice$/i.test(h));
  if (idx < 0) return null;
  const data = rows.slice(1).filter((r) => cells(r).some((c) => c && !/^:?-+:?$/.test(c)));
  return data.flatMap((r) => (cells(r)[idx] ?? "").split(/[.,;()]/))
    .filter((c) => !/\b(not|no|without)\b/.test(c)).join(" ");
}

export function checkDrift(root: string, profilePath?: string): DriftResult {
  const archPath = join(root, "docs", "ARCHITECTURE.md");
  const tasksPath = join(root, "docs", "TASKS.md");
  const arch = existsSync(archPath) ? readFileSync(archPath, "utf8").toLowerCase() : null;
  const tasks = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8").toLowerCase() : null;
  const profile = loadProfile(root, profilePath);
  const stack = detectStack(root);
  const chosen = arch === null ? null : stackChosen(arch);
  const items: DriftItem[] = [];
  const skipped: DriftSkip[] = [];
  for (const [key, value] of Object.entries(profile.data)) {
    if (!TOOL_KEYS[key.split(".").at(-1)!] || typeof value !== "string" || !value) continue;
    if (!appliesTo(key, stack)) {
      const scope = key.split(".")[0];
      skipped.push({ key, selera: value, reason: `no ${scope} platform detected (frameworks: ${stack.frameworks.join(", ") || "none"})` });
      continue;
    }
    const v = String(value).toLowerCase();
    if (arch === null) {
      items.push({ key, selera: value, status: "missing_in_architecture", note: "docs/ARCHITECTURE.md not found" });
      continue;
    }
    if (chosen !== null && !named(chosen, v) && named(arch, v)) {
      items.push({ key, selera: value, status: "deviation", note: "named in ARCHITECTURE but not as a Stack choice (rejected or not applied)" });
    } else if (!named(chosen ?? arch, v)) {
      items.push({ key, selera: value, status: "missing_in_architecture", note: "recorded in selera but not named in ARCHITECTURE" });
    } else if (tasks !== null && !named(tasks, v)) {
      items.push({ key, selera: value, status: "missing_in_tasks", note: "in ARCHITECTURE but no TASKS line mentions it" });
    } else {
      items.push({ key, selera: value, status: "ok", note: "" });
    }
  }
  return { root, profile_path: profile.path, items, skipped, sources: { architecture: arch !== null, tasks: tasks !== null, profile: profile.path !== null } };
}
