// Tests checkDrift against the profile keys selera.mjs really writes (scoped "fe.ui", "bundler").
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkDrift } from "../dist/drift.js";

const write = (root, rel, text) => {
  mkdirSync(join(root, rel, ".."), { recursive: true });
  writeFileSync(join(root, rel), text);
};
const project = (arch, tasks, profile) => {
  const root = mkdtempSync(join(tmpdir(), "drift-"));
  write(root, "docs/ARCHITECTURE.md", arch);
  write(root, "docs/TASKS.md", tasks);
  write(root, ".selera/profile.json", JSON.stringify(profile));
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

const globalProfile =join(tmpdir(), `drift-global-${process.pid}.json`);
writeFileSync(globalProfile, JSON.stringify({ bundler: "webpack", db: "postgres" }));
process.env.SELERA_CONFIG = globalProfile;
const merged = checkDrift(project("vite postgres", "vite postgres", { bundler: "vite" }));
assert.deepEqual(status(merged), { bundler: "ok", db: "ok" });
assert.ok(merged.profile_path.endsWith(join(".selera", "profile.json")), merged.profile_path);

console.log("OK: drift");
