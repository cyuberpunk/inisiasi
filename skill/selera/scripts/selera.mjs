#!/usr/bin/env node
// selera: record the owner's habits and render them as code standards.
// Profile lands in ~/.config/inisiasi/selera/profile.json, project override in ./.selera/profile.json.
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

const CONFIG_HOME = process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
const GLOBAL = process.env.SELERA_CONFIG ?? join(CONFIG_HOME, "inisiasi", "selera", "profile.json");
const LEGACY = join(CONFIG_HOME, "selera", "profile.json");
const PROJECT = join(process.cwd(), ".selera", "profile.json");

const SCOPES = ["default", "fe", "be", "mobile", "cli", "infra"];

// Key = role, never a tool name. A value is one choice, or a comma list in preference order.
const KEYS = [
  "fetch", "state", "form", "validation", "ui", "styling", "db", "queue", "test", "lint", "format",
  "structure", "imports", "exports", "errors", "git", "testing", "formatting", "immutability", "packageManager",
  "pythonEnv", "commit", "branching", "merge", "quotes", "semicolons", "lineWidth",
  "naming.file", "naming.folder", "naming.component", "naming.hook", "naming.function", "naming.class",
  "naming.module", "naming.package", "naming.constant", "naming.type", "naming.dbTable", "naming.cssClass",
  "bundler", "structure.repo", "structure.topology", "structure.folders", "structure.layers", "structure.boundaries",
  "structure.packages", "structure.tests", "structure.docs", "structure.config", "structure.assets",
  "structure.scripts", "structure.build", "structure.schema", "structure.api", "structure.pkgname",
];

const QUESTIONS = [
  { key: "packageManager", q: "Package manager", options: ["pnpm", "npm", "bun", "yarn"] },
  { key: "pythonEnv", q: "Python environment", options: ["uv", "poetry", "pip+venv", "conda"] },
  { key: "validation", q: "Schema and validation", options: ["zod", "valibot", "typebox", "pydantic", "manual"] },
  { key: "fe.ui", q: "UI kit (frontend)", options: ["heroui", "shadcn", "chakra", "mantine", "none"] },
  { key: "fe.fetch", q: "Data fetching (frontend)", options: ["tanstack-query", "axios", "gql", "swr", "fetch"] },
  { key: "be.fetch", q: "HTTP client (backend)", options: ["axios", "fetch", "got", "undici"] },
  { key: "lint", q: "Lint and format", options: ["oxlint+oxfmt", "biome", "eslint+prettier", "ruff"] },
  { key: "test", q: "Test runner", options: ["vitest", "jest", "node:test", "pytest"] },
  { key: "quotes", q: "Quotes", options: ["double", "single"] },
  { key: "semicolons", q: "Semicolons", options: ["always", "never"] },
  { key: "lineWidth", q: "Max line length", options: ["80", "100", "120"] },
  { key: "commit", q: "Commit style", options: ["conventional", "minimal-tags", "gitmoji"] },
  { key: "branching", q: "Branching", options: ["trunk-based", "github-flow", "git-flow"] },
  { key: "merge", q: "Merge strategy", options: ["squash", "rebase", "merge-commit"] },
  { key: "exports", q: "Exports", options: ["named", "default-ok", "mixed"] },
  { key: "imports", q: "Import style", options: ["alias", "relative", "mixed"] },
  { key: "structure.folders", q: "Folder organization", options: ["feature", "layer", "fsd", "atomic"] },
  { key: "errors", q: "Error style", options: ["exceptions", "result", "mixed"] },
  { key: "naming.file", q: "File naming", options: ["kebab-case", "camelCase", "PascalCase"] },
  { key: "naming.function", q: "Function naming", options: ["camelCase", "snake_case", "PascalCase"] },
  { key: "immutability", q: "Mutation policy", options: ["strict", "pragmatic"] },
  { key: "bundler", q: "Bundler (frontend build)", options: ["vite", "webpack", "turbopack", "esbuild", "none"] },
  { key: "structure.repo", q: "Repo shape", options: ["monorepo", "single", "polyrepo"] },
  { key: "structure.topology", q: "App topology", options: ["modular-monolith", "monolith", "services", "serverless"] },
  { key: "structure.layers", q: "Layering", options: ["flat", "domain/application/infrastructure"] },
  { key: "structure.boundaries", q: "Boundary enforcement", options: ["dependency-cruiser", "eslint-boundaries", "tsconfig-refs", "none"] },
  { key: "structure.tests", q: "Test placement", options: ["co-located", "separate", "mirrored"] },
  { key: "structure.build", q: "Build orchestration", options: ["turbo", "nx", "vp", "none"] },
];

function validKey(key) {
  if (KEYS.includes(key)) return true;
  const [scope, ...rest] = key.split(".");
  return SCOPES.includes(scope) && rest.length && KEYS.includes(rest.join("."));
}

function readProfile() {
  const pick = (p) => (existsSync(p) ? parseProfile(p) : {});
  const legacy = existsSync(LEGACY) && !existsSync(GLOBAL) ? pick(LEGACY) : {};
  const merged = { ...legacy, ...pick(GLOBAL), ...pick(PROJECT) };
  // "schema" was the old name for "validation". Read it as the alias so old profiles keep working.
  if (merged.schema !== undefined) { merged.validation ??= merged.schema; delete merged.schema; }
  // "folders" was the old name for "structure.folders".
  if (merged.folders !== undefined) { merged["structure.folders"] ??= merged.folders; delete merged.folders; }
  return merged;
}

function parseProfile(p) {
  try { return JSON.parse(readFileSync(p, "utf8")); }
  catch { console.error(`selera profile ${p} is not valid JSON. Fix or delete it.`); process.exit(1); }
}

function writeProfile(kind, data) {
  const target = kind === "project" ? PROJECT : GLOBAL;
  mkdirSync(join(target, ".."), { recursive: true });
  const prev = existsSync(target) ? parseProfile(target) : {};
  writeFileSync(target, JSON.stringify({ ...prev, ...data, updated: new Date().toISOString().slice(0, 10) }, null, 2));
  return target;
}

async function setup(kind, prefill) {
  const answers = {};
  if (prefill) {
    prefill.split(",").map((v) => v.trim()).forEach((v, i) => { if (QUESTIONS[i] && v && v !== "-") answers[QUESTIONS[i].key] = v; });
    console.log("wrote " + writeProfile(kind, answers));
    return;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  // Piped input ends before every question is asked, so read it all first; a TTY asks live.
  const piped = process.stdin.isTTY ? null : (await Array.fromAsync(rl)).map((l) => l.trim());
  if (piped) rl.close();
  console.log("selera setup. Enter skips a question (no assumption). Pick a number, or type a value.");
  for (const item of QUESTIONS) {
    const shown = item.options.map((o, i) => `${i + 1}.${o}`).join(" ");
    const prompt = `${item.q} [${shown}] > `;
    const answer = piped ? (piped.shift() ?? "") : await rl.question(prompt);
    const raw = answer.trim().toLowerCase();
    if (!raw) continue;
    const byNumber = /^\d+$/.test(raw) ? item.options[Number(raw) - 1] : undefined;
    answers[item.key] = byNumber ?? raw;
  }
  if (!piped) rl.close();
  const target = writeProfile(kind, answers);
  console.log(`wrote ${target}`);
}

function render(profile) {
  const byScope = new Map();
  for (const [key, value] of Object.entries(profile)) {
    if (key === "updated") continue;
    const [first, ...rest] = key.split(".");
    const scope = SCOPES.includes(first) && rest.length ? first : "default";
    const name = scope === "default" ? key : rest.join(".");
    if (!byScope.has(scope)) byScope.set(scope, []);
    byScope.get(scope).push([name, value]);
  }
  const lines = ["# Selera", "", "> Recorded habits. A list value is preference order: pick one per project.", ""];
  for (const scope of SCOPES) {
    const rows = byScope.get(scope);
    if (!rows?.length) continue;
    lines.push("## " + scope, "", "| Key | Choice |", "|-----|--------|");
    for (const [k, v] of rows.sort((a, b) => a[0].localeCompare(b[0]))) lines.push(`| ${k} | ${v} |`);
    lines.push("");
  }
  if (lines.length === 4) lines.push("Empty profile. The SoT defaults apply.", "");
  return lines.join("\n");
}


// tree: ASCII skeleton of the real repo, annotated with the recorded structure keys.
// Walks the working tree (no node_modules, .git, dist). Depth-limited so it stays readable.
import { readdirSync as readdir, statSync as statOf } from "node:fs";

const SKIP = /^(node_modules|\.git|dist|build|coverage|\.next|\.turbo|\.cache|\.output|\.codebase-memory|\.agent-teams|\.selera|\.DS_Store)$/;
const NOTES = {
  apps: "deployables", packages: "shared packages", src: "application code", tests: "integration and e2e",
  test: "tests", docs: "documentation", scripts: "automation", public: "static assets served as is",
  assets: "static assets", components: "UI components", entrypoints: "app entry points", config: "configuration",
};

function walk(dir, prefix, depth, maxDepth, rows) {
  if (depth > maxDepth) return;
  let entries;
  try { entries = readdir(dir).filter((n) => !SKIP.test(n)).sort(); } catch { return; }
  const dirs = entries.filter((n) => statOf(join(dir, n)).isDirectory());
  const files = entries.filter((n) => !dirs.includes(n));
  const shown = [...dirs.map((n) => [n, true]), ...files.map((n) => [n, false])];
  shown.forEach(([name, isDir], i) => {
    const last = i === shown.length - 1;
    const note = isDir && NOTES[name] ? NOTES[name] : "";
    rows.push(prefix + (last ? "└── " : "├── ") + name + (isDir ? "/" : "") + (note ? "  # " + note : ""));
    if (isDir) walk(join(dir, name), prefix + (last ? "    " : "│   "), depth + 1, maxDepth, rows);
  });
}

function cmdTree(depthArg) {
  const maxDepth = Number(depthArg) || 2;
  const rows = [];
  walk(process.cwd(), "", 1, maxDepth, rows);
  const p = readProfile();
  const repo = p["structure.repo"] ?? "unset";
  const topo = p["structure.topology"] ?? "unset";
  console.log(process.cwd().split("/").pop() + "/");
  console.log(rows.join("\n"));
  console.log("\nrecorded: structure.repo=" + repo + ", structure.topology=" + topo);
  console.log("depth " + maxDepth + ". Use: selera tree <depth>");
}

// learn: infer habits from what the repo already does (lockfiles, deps, configs, git log).
// Deterministic heuristics only. Every key reports its evidence so the owner can reject it.
const cwdPath = (rel) => join(process.cwd(), rel);
const has = (rel) => existsSync(cwdPath(rel));
const readText = (rel) => { try { return readFileSync(cwdPath(rel), "utf8"); } catch { return ""; } };
const git = (cmd) => { try { return execSync("git " + cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString(); } catch { return ""; } };

export function infer() {
  const out = {};
  const note = (key, value, evidence) => { if (value) out[key] = { value, evidence }; };
  let pkg = {};
  try { pkg = JSON.parse(readText("package.json") || "{}"); } catch { pkg = {}; }
  const d = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

  if (has("pnpm-lock.yaml")) note("packageManager", "pnpm", "pnpm-lock.yaml");
  else if (has("bun.lockb") || has("bun.lock")) note("packageManager", "bun", "bun lockfile");
  else if (has("yarn.lock")) note("packageManager", "yarn", "yarn.lock");
  else if (has("package-lock.json")) note("packageManager", "npm", "package-lock.json");

  if (has("uv.lock")) note("pythonEnv", "uv", "uv.lock");
  else if (has("poetry.lock")) note("pythonEnv", "poetry", "poetry.lock");

  if (d.zod) note("validation", "zod", "dependency zod");
  else if (d.valibot) note("validation", "valibot", "dependency valibot");
  else if (d["@sinclair/typebox"]) note("validation", "typebox", "dependency typebox");
  else if (readText("pyproject.toml").includes("pydantic")) note("validation", "pydantic", "pyproject pydantic");

  const uiMap = { "@heroui/react": "heroui", "@chakra-ui/react": "chakra", "@mantine/core": "mantine", "@mui/material": "mui" };
  for (const [dep, name] of Object.entries(uiMap)) if (d[dep]) { note("ui", name, "dependency " + dep); break; }
  if (!out.ui && has("components.json")) note("ui", "shadcn", "components.json");

  if (d["@tanstack/react-query"]) note("fetch", "tanstack-query", "dependency @tanstack/react-query");
  else if (d.axios) note("fetch", "axios", "dependency axios");
  else if (d["@apollo/client"] || d.graphql) note("fetch", "gql", "dependency graphql");

  if (d.vite || has("vite.config.ts") || has("vite.config.js")) note("bundler", "vite", "vite config or dependency");
  else if (d.webpack || has("webpack.config.js")) note("bundler", "webpack", "webpack config or dependency");

  if (d.oxlint || has(".oxlintrc.json")) note("lint", "oxlint", "oxlint config");
  else if (d["@biomejs/biome"] || has("biome.json") || has("biome.jsonc")) note("lint", "biome", "biome config");
  else if (d.eslint || has("eslint.config.js") || has("eslint.config.mjs") || has(".eslintrc.json")) note("lint", "eslint", "eslint config");

  if (d.vitest) note("test", "vitest", "dependency vitest");
  else if (d.jest) note("test", "jest", "dependency jest");
  else if (has("pytest.ini") || readText("pyproject.toml").includes("pytest")) note("test", "pytest", "pytest config");

  for (const f of [".prettierrc", ".prettierrc.json", "biome.json", ".editorconfig"]) {
    const t = readText(f);
    if (!t) continue;
    if (/"singleQuote"\s*:\s*true/.test(t)) note("quotes", "single", f);
    if (/"singleQuote"\s*:\s*false/.test(t)) note("quotes", "double", f);
    if (/"semi"\s*:\s*false/.test(t)) note("semicolons", "never", f);
    if (/"semi"\s*:\s*true/.test(t)) note("semicolons", "always", f);
    const w = t.match(/"printWidth"\s*:\s*(\d+)/);
    if (w) note("lineWidth", w[1], f);
    break;
  }

  const subjects = git("log --format=%s -n 200").trim().split("\n").filter(Boolean);
  if (subjects.length >= 5) {
    const conv = subjects.filter((x) => /^[a-z]+(\([^)]+\))?!?: /.test(x)).length;
    if (conv / subjects.length > 0.6) note("commit", "conventional", Math.round((conv / subjects.length) * 100) + "% of " + subjects.length + " commits");
    else {
      // Shape, not a verb list: Capitalized first word, no "type:" prefix, no trailing period, under 72 chars.
      const sentence = subjects.filter((x) => /^[A-Z][a-z]+\b/.test(x) && !/^[A-Za-z]+(\([^)]+\))?!?:/.test(x) && !x.endsWith(".") && x.length <= 72).length;
      if (sentence / subjects.length > 0.6) note("commit", "imperative-sentence", Math.round((sentence / subjects.length) * 100) + "% capitalized sentences, no type prefix");
    }
    const merges = git("log --merges --format=%h -n 200").trim();
    note("merge", merges ? "merge-commit" : "squash", merges ? "merge commits present" : "linear history");
  }

  if (has("tsconfig.json")) note("imports", /"(paths|baseUrl)"/.test(readText("tsconfig.json")) ? "alias" : "relative", "tsconfig.json");

  const counts = { "kebab-case": 0, camelCase: 0, PascalCase: 0 };
  const scan = (dir, depth) => {
    if (depth > 2) return;
    let entries = [];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (SKIP.test(e.name)) continue;
      if (e.isDirectory()) { scan(join(dir, e.name), depth + 1); continue; }
      const base = e.name.replace(/\.(ts|tsx|js|jsx|mjs|py|go|rs|swift)$/, "");
      if (base === e.name) continue;
      if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(base)) counts["kebab-case"]++;
      else if (/^[A-Z][A-Za-z0-9]*$/.test(base)) counts.PascalCase++;
      else if (/^[a-z][A-Za-z0-9]*$/.test(base)) counts.camelCase++;
    }
  };
  scan(process.cwd(), 0);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 3) note("naming.file", top[0], top[1] + " files");
  return out;
}

function cmdLearn(write) {
  const rows = Object.entries(infer());
  if (!rows.length) { console.log("nothing inferred from this repo."); return; }
  console.log("inferred from repo:");
  for (const [k, v] of rows) console.log("  " + k.padEnd(18) + v.value.padEnd(22) + v.evidence);
  if (!write) { console.log("\nrun with --write to store these (project scope)."); return; }
  // An inferred habit never replaces one the owner recorded.
  const recorded = readProfile();
  for (const [k] of rows) if (recorded[k] !== undefined) console.log(`skip ${k}: already ${recorded[k]}`);
  const fresh = rows.filter(([k]) => recorded[k] === undefined);
  if (!fresh.length) { console.log("nothing new to write."); return; }
  console.log("wrote " + writeProfile("project", Object.fromEntries(fresh.map(([k, v]) => [k, v.value]))));
}

const [cmd, ...rest] = process.argv.slice(2);
const kind = rest.includes("--project") ? "project" : "global";
const answersIdx = rest.indexOf("--answers");

if (cmd === "tree") cmdTree(rest.find((r) => /^\d+$/.test(r)));
else if (cmd === "learn") cmdLearn(rest.includes("--write"));
else if (cmd === "setup") await setup(kind, answersIdx >= 0 ? rest[answersIdx + 1] : undefined);
else if (cmd === "show") console.log(JSON.stringify(readProfile(), null, 2));
else if (cmd === "apply") process.stdout.write(render(readProfile()));
else if (cmd === "set") {
  const [rawKey, ...valueParts] = rest.filter((r) => !r.startsWith("--"));
  const key = rawKey === "schema" ? "validation" : rawKey;
  if (!key || !valueParts.length) { console.error("usage: selera set <key> <value> [--project]"); process.exit(1); }
  if (!validKey(key)) { console.error(`unknown key. known: ${KEYS.join(", ")}. prefix with a scope: ${SCOPES.slice(1).join(", ")}`); process.exit(1); }
  const value = valueParts.join(" ");
  const prev = readProfile()[key];
  if (prev !== undefined && prev !== value) console.log(`replaced ${key}: ${prev} -> ${value}`);
  console.log("wrote " + writeProfile(kind, { [key]: value }));
} else {
  console.error("usage: selera <tree [depth]|learn [--write]|setup|show|set <key> <value>|apply> [--project]");
  process.exit(1);
}
