// Tests checkDrift against the profile keys selera.mjs really writes (scoped "fe.ui", "bundler").
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { checkDrift, loadProfile } from "../dist/drift.js";

const SECTION_NAMES = { fe: "Web", be: "Backend", mobile: "Mobile", cli: "CLI", infra: "Infra" };
const profileMd = (obj) => {
  const umum = [];
  const scoped = {};
  for (const [k, v] of Object.entries(obj)) {
    const s = k.includes(".") && SECTION_NAMES[k.split(".")[0]] ? k.split(".")[0] : null;
    if (s) (scoped[s] ??= []).push(`- ${k.split(".").slice(1).join(".")}: ${v}`);
    else umum.push(`- ${k}: ${v}`);
  }
  let md = "# selera\n\n## Umum\n" + umum.join("\n") + "\n";
  for (const [s, name] of Object.entries(SECTION_NAMES)) if (scoped[s]) md += `\n## ${name}\n${scoped[s].join("\n")}\n`;
  return md;
};

const write = (root, rel, text) => {
  mkdirSync(join(root, rel, ".."), { recursive: true });
  writeFileSync(join(root, rel), text);
};
const project = (arch, tasks, profile) => {
  const root = mkdtempSync(join(tmpdir(), "drift-"));
  write(root, "docs/ARCHITECTURE.md", arch);
  write(root, "docs/TASKS.md", tasks);
  write(root, ".selera/profile.md", typeof profile === "string" ? profile : profileMd(profile));
  return root;
};
const status = (r) => Object.fromEntries(r.items.map((i) => [i.key, i.status]));

process.env.SELERA_CONFIG = join(tmpdir(), "drift-no-global.json");

const profile = { "fe.ui": "shadcn", bundler: "vite", packageManager: "bun", quotes: "double" };

const ok = checkDrift(project("shadcn, vite, bun", "shadcn vite bun", profile));
assert.deepEqual(status(ok), { "fe.ui": "ok", bundler: "ok", packageManager: "ok" });

const drifted = checkDrift(project("shadcn only", "shadcn", profile));
assert.deepEqual(status(drifted), { "fe.ui": "ok", bundler: "missing_in_architecture", packageManager: "missing_in_architecture" });

const noTask = checkDrift(project("shadcn vite bun", "nothing here", profile));
assert.deepEqual(status(noTask), { "fe.ui": "missing_in_tasks", bundler: "missing_in_tasks", packageManager: "missing_in_tasks" });

const scoped = { "fe.ui": "shadcn", "fe.fetch": "tanstack-query", "cli.test": "vitest", validation: "zod" };
const noFe = project("zod vitest", "zod vitest", scoped);
write(noFe, "package.json", JSON.stringify({ dependencies: { "@modelcontextprotocol/sdk": "1", zod: "3" } }));
const backend = checkDrift(noFe);
assert.deepEqual(status(backend), { "cli.test": "ok", validation: "ok" });
assert.deepEqual(backend.skipped.map((s) => s.key), ["fe.ui", "fe.fetch"]);
assert.match(backend.skipped[0].reason, /no fe platform detected/);

const withFe = project("zod vitest", "zod vitest", scoped);
write(withFe, "package.json", JSON.stringify({ dependencies: { react: "19", zod: "3" } }));
const frontend = checkDrift(withFe);
assert.deepEqual(status(frontend), { "fe.ui": "missing_in_architecture", "fe.fetch": "missing_in_architecture", "cli.test": "ok", validation: "ok" });
assert.deepEqual(frontend.skipped, []);

const stack = (choice, extra = "") => `## Stack\n\n| Concern | Choice | Why | Rejected |\n|---|---|---|---|\n| X | ${choice} | y | ${extra} |\n`;
const allTasks = "pnpm npm zod oxlint oxfmt shadcn vite";

const picked = checkDrift(project(stack("pnpm 12", "npm: lockfile it replaced"), allTasks, { packageManager: "pnpm" }));
assert.deepEqual(status(picked), { packageManager: "ok" });

const notApplied = checkDrift(project(stack("Hand-written checks in mcp/src. zod not used", "zod: not applied"), allTasks, { validation: "zod" }));
assert.deepEqual(status(notApplied), { validation: "deviation" });

const partial = checkDrift(project(stack("`oxlint` in web/. `oxfmt` not used yet"), allTasks, { lint: "oxlint+oxfmt" }));
assert.deepEqual(status(partial), { lint: "deviation" });

const rejected = checkDrift(project("## Stack\n\n| Concern | Choice | Why | Rejected |\n|---|---|---|---|\n| UI | React 19, Tailwind | Not shadcn | shadcn: not applied |\n", allTasks, { "fe.ui": "shadcn" }));
assert.deepEqual(status(rejected), { "fe.ui": "deviation" });

const negated = stack("pnpm, not npm");
const npmPick = checkDrift(project(negated, allTasks, { packageManager: "npm" }));
assert.deepEqual(status(npmPick), { packageManager: "deviation" });
const pnpmPick = checkDrift(project(negated, allTasks, { packageManager: "pnpm" }));
assert.deepEqual(status(pnpmPick), { packageManager: "ok" });

const absent = checkDrift(project(stack("pnpm 12"), allTasks, { bundler: "vite" }));
assert.deepEqual(status(absent), { bundler: "missing_in_architecture" });

const noViteTask = checkDrift(project(stack("Vite in web/"), "nothing here", { bundler: "vite" }));
assert.deepEqual(status(noViteTask), { bundler: "missing_in_tasks" });

const globalProfile =join(tmpdir(), `drift-global-${process.pid}.md`);
writeFileSync(globalProfile, profileMd({ bundler: "webpack", db: "postgres" }));
process.env.SELERA_CONFIG = globalProfile;
const merged = checkDrift(project("vite postgres", "vite postgres", { bundler: "vite" }));
assert.deepEqual(status(merged), { bundler: "ok", db: "ok" });
assert.ok(merged.profile_path.endsWith(join(".selera", "profile.md")), merged.profile_path);

console.log("OK: drift");

const list = checkDrift(project("we use pnpm and oxlint, oxfmt", "pnpm oxlint oxfmt", { packageManager: "pnpm,bun", lint: "oxlint+oxfmt", format: "biome" }));
const { packageManager, lint, format } = status(list);
assert.deepEqual({ packageManager, lint, format }, { packageManager: "ok", lint: "ok", format: "missing_in_architecture" }, "comma list matches any choice, plus needs all");

process.env.SELERA_CONFIG = join(tmpdir(), "drift-no-global.md");
const prose = project("x", "x", "# selera\n\nFree text only, no entries.\n\n## Notes\nJust prose here.\n");
assert.deepEqual(status(checkDrift(prose)), {}, "a profile with only free text yields an empty map");

// selera.mjs `set` and drift's loadProfile parse the same file format.
const seleraHome = mkdtempSync(join(tmpdir(), "selera-e2e-"));
const seleraCwd = mkdtempSync(join(tmpdir(), "selera-cwd-"));
const seleraConfig = join(seleraHome, "profile.md");
const seleraScript = new URL("../../skill/selera/scripts/selera.mjs", import.meta.url).pathname;
for (const args of [["set", "fe.ui", "shadcn"], ["set", "packageManager", "pnpm"], ["set", "structure.repo", "monorepo"]]) {
  execFileSync("node", [seleraScript, ...args], { env: { ...process.env, SELERA_CONFIG: seleraConfig }, cwd: seleraCwd });
}
const prevConfig = process.env.SELERA_CONFIG;
process.env.SELERA_CONFIG = seleraConfig;
const loaded = loadProfile(seleraCwd);
process.env.SELERA_CONFIG = prevConfig;
assert.deepEqual(loaded.data, { "fe.ui": "shadcn", packageManager: "pnpm", "structure.repo": "monorepo" }, "selera set and drift loadProfile disagree");
