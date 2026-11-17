import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// Compare the recorded selera profile with the project's ARCHITECTURE and TASKS.
// Reports only what can be checked mechanically. Never writes anything.
export type DriftItem = { key: string; selera: string; status: "missing_in_architecture" | "missing_in_tasks" | "ok"; note: string };
export type DriftResult = { root: string; profile_path: string | null; items: DriftItem[]; sources: Record<string, boolean> };

const PROFILE_KEYS = ["packageManager", "validation", "ui", "db", "test", "lint", "format", "fetch", "state"];

export function loadProfile(path?: string): { path: string | null; data: Record<string, string> } {
  const candidates = [path, join(process.cwd(), ".selera", "profile.json"), join(homedir(), ".config", "inisiasi", "selera", "profile.json")].filter(Boolean) as string[];
  for (const p of candidates) {
    if (existsSync(p)) return { path: p, data: JSON.parse(readFileSync(p, "utf8")) };
  }
  return { path: null, data: {} };
}

export function checkDrift(root: string, profilePath?: string): DriftResult {
  const archPath = join(root, "docs", "ARCHITECTURE.md");
  const tasksPath = join(root, "docs", "TASKS.md");
  const arch = existsSync(archPath) ? readFileSync(archPath, "utf8").toLowerCase() : null;
  const tasks = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8").toLowerCase() : null;
  const profile = loadProfile(profilePath);
  const items: DriftItem[] = [];
  for (const key of PROFILE_KEYS) {
    const value = profile.data[key];
    if (!value) continue;
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
