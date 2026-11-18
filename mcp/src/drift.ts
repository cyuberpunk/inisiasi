import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { detectStack, type DetectStackResult } from "./detectStack.js";

// Compare the recorded selera profile with the project's ARCHITECTURE and TASKS.
// Reports only what can be checked mechanically. Never writes anything.
export type DriftItem = { key: string; selera: string; status: "missing_in_architecture" | "missing_in_tasks" | "ok"; note: string };
export type DriftSkip = { key: string; selera: string; reason: string };
export type DriftResult = { root: string; profile_path: string | null; items: DriftItem[]; skipped: DriftSkip[]; sources: Record<string, boolean> };

// Roles whose value is a tool name, so its presence in the docs can be checked as text.
// Scoped keys such as "fe.ui" or "be.fetch" match on their last segment.
export const TOOL_KEYS: Record<string, true> = { packageManager: true, validation: true, ui: true, db: true, test: true, lint: true, format: true, fetch: true, state: true, bundler: true, styling: true, form: true, queue: true };

// A scoped key ("fe.ui") applies only when detectStack finds that platform. Scopes without a reliable
// signal (cli, infra) always apply. Mobile errs toward checking: a Swift macOS app counts.
const FE = ["react", "next", "vue", "nuxt", "svelte", "sveltekit", "angular", "solid", "remix", "astro"];
const BE = ["hono", "express", "fastify", "elysia", "nestjs", "trpc", "graphql", "prisma", "drizzle", "next", "nuxt", "sveltekit", "remix"];
const BE_LANGS = ["Go", "Rust", "Python", "Ruby", "PHP", "Java"];
export const PLATFORMS: Record<string, (s: DetectStackResult) => boolean> = {
  fe: (s) => s.frameworks.some((f) => FE.includes(f)),
  be: (s) => s.frameworks.some((f) => BE.includes(f)) || s.languages.some((l) => BE_LANGS.includes(l)),
  mobile: (s) => s.frameworks.includes("React Native") || s.languages.some((l) => l === "Swift" || l === "Kotlin"),
};

// Same sources and precedence as selera.mjs: global (SELERA_CONFIG or XDG), then the project's .selera, which wins.
export function loadProfile(root: string, path?: string): { path: string | null; data: Record<string, string> } {
  const global = process.env.SELERA_CONFIG ?? join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "inisiasi", "selera", "profile.json");
  const found = (path ? [path] : [global, join(root, ".selera", "profile.json")]).filter(existsSync);
  const data: Record<string, string> = Object.assign({}, ...found.map((p) => JSON.parse(readFileSync(p, "utf8"))));
  return { path: found.at(-1) ?? null, data };
}

export function checkDrift(root: string, profilePath?: string): DriftResult {
  const archPath = join(root, "docs", "ARCHITECTURE.md");
  const tasksPath = join(root, "docs", "TASKS.md");
  const arch = existsSync(archPath) ? readFileSync(archPath, "utf8").toLowerCase() : null;
  const tasks = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8").toLowerCase() : null;
  const profile = loadProfile(root, profilePath);
  const stack = detectStack(root);
  // Nothing detected (no manifests, no hints): platform unknown, so every key applies as before.
  const unknown = stack.missing_root || (!stack.manifests.length && !stack.frameworks.length && !stack.languages.length);
  const items: DriftItem[] = [];
  const skipped: DriftSkip[] = [];
  for (const [key, value] of Object.entries(profile.data)) {
    if (!TOOL_KEYS[key.split(".").at(-1)!] || typeof value !== "string" || !value) continue;
    const scope = key.includes(".") ? key.split(".")[0] : null;
    if (scope && PLATFORMS[scope] && !unknown && !PLATFORMS[scope](stack)) {
      skipped.push({ key, selera: value, reason: `no ${scope} platform detected (frameworks: ${stack.frameworks.join(", ") || "none"})` });
      continue;
    }
    const v = String(value).toLowerCase();
    if (arch === null) {
      items.push({ key, selera: value, status: "missing_in_architecture", note: "docs/ARCHITECTURE.md not found" });
      continue;
    }
    if (!arch.includes(v)) {
      items.push({ key, selera: value, status: "missing_in_architecture", note: "recorded in selera but not named in ARCHITECTURE" });
    } else if (tasks !== null && !tasks.includes(v)) {
      items.push({ key, selera: value, status: "missing_in_tasks", note: "in ARCHITECTURE but no TASKS line mentions it" });
    } else {
      items.push({ key, selera: value, status: "ok", note: "" });
    }
  }
  return { root, profile_path: profile.path, items, skipped, sources: { architecture: arch !== null, tasks: tasks !== null, profile: profile.path !== null } };
}
