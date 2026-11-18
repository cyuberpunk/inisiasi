import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// Compare the recorded selera profile with the project's ARCHITECTURE and TASKS.
// Reports only what can be checked mechanically. Never writes anything.
export type DriftItem = { key: string; selera: string; status: "missing_in_architecture" | "missing_in_tasks" | "ok"; note: string };
export type DriftResult = { root: string; profile_path: string | null; items: DriftItem[]; sources: Record<string, boolean> };

// Roles whose value is a tool name, so its presence in the docs can be checked as text.
// Scoped keys such as "fe.ui" or "be.fetch" match on their last segment.
export const TOOL_KEYS: Record<string, true> = { packageManager: true, validation: true, ui: true, db: true, test: true, lint: true, format: true, fetch: true, state: true, bundler: true, styling: true, form: true, queue: true };

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
  const items: DriftItem[] = [];
  for (const [key, value] of Object.entries(profile.data)) {
    if (!TOOL_KEYS[key.split(".").at(-1)!] || typeof value !== "string" || !value) continue;
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
  return { root, profile_path: profile.path, items, sources: { architecture: arch !== null, tasks: tasks !== null, profile: profile.path !== null } };
}
