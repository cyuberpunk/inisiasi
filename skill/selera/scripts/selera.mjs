#!/usr/bin/env node
// selera: record the owner's habits and render them as code standards.
// Profile lands in ~/.config/inisiasi/selera/profile.md, project override in ./.selera/profile.md.
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

const CONFIG_HOME = process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
const GLOBAL = process.env.SELERA_CONFIG ?? join(CONFIG_HOME, "inisiasi", "selera", "profile.md");
const PROJECT = join(process.cwd(), ".selera", "profile.md");

const SCOPES = ["default", "fe", "be", "mobile", "cli", "infra"];

// "## Web" sections hold "- key: value" entries; any other heading and free text is prose for the agent only.
const SECTION_SCOPES = {
  umum: "default", general: "default", default: "default",
  web: "fe", frontend: "fe", fe: "fe",
  backend: "be", be: "be",
  mobile: "mobile", cli: "cli", infra: "infra", infrastructure: "infra",
};
const SCOPE_PREFIXES = new Set(["fe", "be", "mobile", "cli", "infra"]);
const SECTION_NAME = { default: "Umum", fe: "Web", be: "Backend", mobile: "Mobile", cli: "CLI", infra: "Infra" };
const PROFILE_HEADING = /^##\s+(.+?)\s*$/;
const PROFILE_ENTRY = /^\s*[-*]\s+([A-Za-z][\w-]*(?:\.[\w-]+)*)\s*:\s*(.+?)\s*$/;
const KEY_SHAPE = /^[A-Za-z][\w-]*(\.[\w-]+)*$/;

function parseSections(md) {
  const sections = [];
  let cur = null;
  for (const line of md.split(/\r?\n/)) {
    const h = PROFILE_HEADING.exec(line);
    if (h) { cur = { title: h[1].trim(), scope: SECTION_SCOPES[h[1].trim().toLowerCase()] ?? null, lines: [] }; sections.push(cur); }
    else if (cur) cur.lines.push(line);
  }
  for (const s of sections) s.body = s.lines.join("\n").trim();
  return sections;
}

function parseProfileMd(md) {
  const flat = {};
  for (const s of parseSections(md)) {
    if (s.scope === null) continue;
    for (const line of s.body.split("\n")) {
      const m = PROFILE_ENTRY.exec(line);
      if (!m) continue;
      const key = m[1];
      flat[s.scope === "default" || SCOPE_PREFIXES.has(key.split(".")[0]) ? key : `${s.scope}.${key}`] = m[2].replace(/`/g, "");
    }
  }
  return flat;
}

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
  return KEY_SHAPE.test(key);
}

function flatOf(p) {
  return existsSync(p) ? parseProfileMd(readFileSync(p, "utf8")) : {};
}

function readProfile() {
  return { ...flatOf(GLOBAL), ...flatOf(PROJECT) };
}

// A flat key routes to its scope's section; everything else lands in Umum.
function sectionFor(key) {
  const first = key.split(".")[0];
  return key.includes(".") && SCOPE_PREFIXES.has(first) ? first : "default";
}

// Writes entries in place: replace the existing "- key:" line in the section, else append after its
// last entry line, else create the section at the end. All other text (headings, prose) is kept.
function writeProfile(kind, data) {
  const target = kind === "project" ? PROJECT : GLOBAL;
  let lines = existsSync(target) ? readFileSync(target, "utf8").split("\n") : ["# selera"];
  for (const [key, value] of Object.entries(data)) {
    const scope = sectionFor(key);
    const entryKey = scope === "default" ? key : key.split(".").slice(1).join(".");
    const bounds = (() => {
      let start = -1, end = lines.length;
      for (let i = 0; i <= lines.length; i++) {
        const h = i < lines.length ? PROFILE_HEADING.exec(lines[i]) : null;
        if (h) {
          if (start >= 0) { end = i; break; }
          if ((SECTION_SCOPES[h[1].trim().toLowerCase()] ?? null) === scope) start = i;
        }
      }
      return { start, end };
    })();
    if (bounds.start < 0) {
      if (lines.length && lines[lines.length - 1].trim() !== "") lines.push("");
      lines.push(`## ${SECTION_NAME[scope]}`, `- ${entryKey}: ${value}`);
      continue;
    }
    let replaced = false;
    let lastEntry = bounds.start;
    for (let i = bounds.start + 1; i < bounds.end; i++) {
      const m = PROFILE_ENTRY.exec(lines[i]);
      if (!m) continue;
      lastEntry = i;
      if (m[1] === entryKey && !replaced) { lines[i] = `- ${entryKey}: ${value}`; replaced = true; }
    }
    if (!replaced) lines.splice(lastEntry + 1, 0, `- ${entryKey}: ${value}`);
  }
  mkdirSync(join(target, ".."), { recursive: true });
  writeFileSync(target, lines.join("\n").replace(/\n*$/, "\n"));
  return target;
}

// Compares with the file being written, not the merged view, so a project value that shadows a global write is named instead of hidden.
function reportChanges(kind, data) {
  const own = flatOf(kind === "project" ? PROJECT : GLOBAL);
  const shadow = kind === "global" ? flatOf(PROJECT) : {};
  for (const [k, v] of Object.entries(data)) {
    if (own[k] !== undefined && String(own[k]) !== v) console.log(`replaced ${k}: ${own[k]} -> ${v}`);
    if (shadow[k] !== undefined && String(shadow[k]) !== v) console.log(`note ${k}: project profile keeps ${shadow[k]}`);
  }
}

async function setup(kind, prefill) {
  const answers = {};
  if (prefill) {
    prefill.split(",").map((v) => v.trim()).forEach((v, i) => { if (QUESTIONS[i] && v && v !== "-") answers[QUESTIONS[i].key] = v; });
    reportChanges(kind, answers);
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
  reportChanges(kind, answers);
  const target = writeProfile(kind, answers);
  console.log(`wrote ${target}`);
}

function render(profile) {
  const byScope = new Map();
  for (const [key, value] of Object.entries(profile)) {
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
  for (const p of [GLOBAL, PROJECT]) {
    if (!existsSync(p)) continue;
    for (const s of parseSections(readFileSync(p, "utf8"))) {
      if (s.scope !== null || !s.body) continue;
      lines.push("## " + s.title, "", s.body, "");
    }
  }
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
  const note = (key, value, evidence) => { if (value && !out[key]) out[key] = { value, evidence }; };
  const readJson = (rel) => { try { return JSON.parse(readText(rel)); } catch { return null; } };
  const pkg = readJson("package.json") ?? {};

  // Package set: the root package.json plus every workspace package, classified fe/be/mobile.
  const globs = [];
  const wsSection = readText("pnpm-workspace.yaml").match(/packages:\s*\n((?:\s*-\s*[^\n]*\n?)+)/);
  if (wsSection) {
    for (const line of wsSection[1].split("\n")) {
      const g = line.match(/-\s*["']?([^"'\s]+)["']?\s*$/);
      if (g && !g[1].startsWith("!")) globs.push(g[1]);
    }
  }
  const ws = pkg.workspaces;
  if (Array.isArray(ws)) globs.push(...ws);
  else if (ws && Array.isArray(ws.packages)) globs.push(...ws.packages);

  const pkgDirs = ["."];
  const hasPkg = (dir) => existsSync(join(process.cwd(), dir, "package.json"));
  const pkgsUnder = (base, maxDepth) => {
    const found = [];
    const visit = (dir, depth) => {
      if (depth > maxDepth) return;
      let entries = [];
      try { entries = readdirSync(join(process.cwd(), dir), { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        if (!e.isDirectory() || SKIP.test(e.name)) continue;
        const sub = join(dir, e.name);
        if (hasPkg(sub)) { found.push(sub); continue; }
        visit(sub, depth + 1);
      }
    };
    visit(base, 1);
    return found;
  };
  for (const g of globs) {
    if (g.endsWith("/**")) pkgDirs.push(...pkgsUnder(g.slice(0, -3), 3));
    else if (g.endsWith("/*")) pkgDirs.push(...pkgsUnder(g.slice(0, -2), 1));
    else if (hasPkg(g)) pkgDirs.push(g);
  }
  const pkgs = pkgDirs.map((dir) => {
    const p = dir === "." ? pkg : (readJson(join(dir, "package.json")) ?? {});
    return { dir, deps: { ...(p.dependencies ?? {}), ...(p.devDependencies ?? {}) } };
  });
  const MOBILE = ["expo", "react-native"];
  const FE = ["react", "vue", "svelte", "solid-js", "@angular/core", "next"];
  const BE = ["hono", "express", "fastify", "elysia", "@nestjs/core", "@orpc/server", "@trpc/server", "prisma", "@prisma/client", "drizzle-orm", "graphile-worker"];
  const hasAny = (p, names) => names.some((n) => p.deps[n]);
  const mobilePkgs = pkgs.filter((p) => hasAny(p, MOBILE));
  const fePkgs = pkgs.filter((p) => hasAny(p, FE) && !hasAny(p, MOBILE));
  const bePkgs = pkgs.filter((p) => hasAny(p, BE));
  // First match in the listed dep order, across the given packages.
  const findDep = (list, names) => { for (const n of names) { const p = list.find((x) => x.deps[n]); if (p) return `${p.dir}: dependency ${n}`; } return null; };
  const depRe = (list, re) => { for (const p of list) { const k = Object.keys(p.deps).find((x) => re.test(x)); if (k) return `${p.dir}: dependency ${k}`; } return null; };

  if (has("pnpm-lock.yaml")) note("packageManager", "pnpm", "pnpm-lock.yaml");
  else if (has("bun.lockb") || has("bun.lock")) note("packageManager", "bun", "bun lockfile");
  else if (has("yarn.lock")) note("packageManager", "yarn", "yarn.lock");
  else if (has("package-lock.json")) note("packageManager", "npm", "package-lock.json");

  if (has("uv.lock")) note("pythonEnv", "uv", "uv.lock");
  else if (has("poetry.lock")) note("pythonEnv", "poetry", "poetry.lock");

  const vZod = findDep(pkgs, ["zod"]);
  const vValibot = findDep(pkgs, ["valibot"]);
  const vTypebox = findDep(pkgs, ["@sinclair/typebox", "typebox"]);
  if (vZod) note("validation", "zod", vZod);
  else if (vValibot) note("validation", "valibot", vValibot);
  else if (vTypebox) note("validation", "typebox", vTypebox);
  else if (readText("pyproject.toml").includes("pydantic")) note("validation", "pydantic", "pyproject pydantic");

  const tVitest = findDep(pkgs, ["vitest"]);
  const tJest = findDep(pkgs, ["jest"]);
  if (tVitest) note("test", "vitest", tVitest);
  else if (tJest) note("test", "jest", tJest);
  else if (has("pytest.ini") || readText("pyproject.toml").includes("pytest")) note("test", "pytest", "pytest config");

  const lOxlint = findDep(pkgs, ["oxlint"]);
  const lBiome = findDep(pkgs, ["@biomejs/biome"]);
  const lEslint = findDep(pkgs, ["eslint"]);
  if (lOxlint || has(".oxlintrc.json")) note("lint", "oxlint", lOxlint ?? ".oxlintrc.json");
  else if (lBiome || has("biome.json") || has("biome.jsonc")) note("lint", "biome", lBiome ?? "biome config");
  else if (lEslint || has("eslint.config.js") || has("eslint.config.mjs") || has(".eslintrc.json")) note("lint", "eslint", lEslint ?? "eslint config");

  const fOxfmt = findDep(pkgs, ["oxfmt"]);
  const fPrettier = findDep(pkgs, ["prettier"]);
  const prettierRc = [".prettierrc", ".prettierrc.json", ".prettierrc.jsonc", ".prettierrc.yaml", ".prettierrc.yml", ".prettierrc.js", ".prettierrc.mjs"].find(has);
  if (fOxfmt || has(".oxfmtrc.json") || has(".oxfmtrc.jsonc")) note("format", "oxfmt", fOxfmt ?? ".oxfmtrc");
  else if (lBiome || has("biome.json") || has("biome.jsonc")) note("format", "biome", lBiome ?? "biome config");
  else if (fPrettier || prettierRc) note("format", "prettier", fPrettier ?? prettierRc);

  const ePlaywright = findDep(pkgs, ["@playwright/test", "playwright"]);
  const eCypress = findDep(pkgs, ["cypress"]);
  if (ePlaywright) note("e2e", "playwright", ePlaywright);
  else if (eCypress) note("e2e", "cypress", eCypress);

  const iLingui = findDep(pkgs, ["@lingui/core"]);
  const iI18next = findDep(pkgs, ["i18next"]);
  if (iLingui) note("i18n", "lingui", iLingui);
  else if (iI18next) note("i18n", "i18next", iI18next);

  const aBetter = findDep(pkgs, ["better-auth"]);
  const aClerk = depRe(pkgs, /^@clerk\//);
  if (aBetter) note("auth", "better-auth", aBetter);
  else if (aClerk) note("auth", "clerk", aClerk);

  const oSentry = depRe(pkgs, /^@sentry\//);
  const oOtel = findDep(pkgs, ["@opentelemetry/api"]);
  if (oSentry && oOtel) note("observability", "sentry+opentelemetry", oSentry + "; " + oOtel);
  else if (oSentry) note("observability", "sentry", oSentry);
  else if (oOtel) note("observability", "opentelemetry", oOtel);

  if (fePkgs.length) {
    const uiMap = [["@heroui/react", "heroui"], ["@chakra-ui/react", "chakra"], ["@mantine/core", "mantine"], ["@mui/material", "mui"]];
    for (const [dep, name] of uiMap) { const ev = findDep(fePkgs, [dep]); if (ev) { note("fe.ui", name, ev); break; } }
    if (!out["fe.ui"]) {
      const dir = fePkgs.find((p) => existsSync(join(process.cwd(), p.dir, "components.json")))?.dir;
      if (dir || has("components.json")) note("fe.ui", "shadcn", (dir ?? ".") + ": components.json");
    }
    const styling = findDep(fePkgs, ["tailwindcss"]);
    if (styling) note("fe.styling", "tailwind", styling);
    const fetchMap = [["@tanstack/react-query", "tanstack-query"], ["swr", "swr"], ["axios", "axios"]];
    for (const [dep, name] of fetchMap) { const ev = findDep(fePkgs, [dep]); if (ev) { note("fe.fetch", name, ev); break; } }
    if (!out["fe.fetch"]) { const ev = findDep(fePkgs, ["graphql", "@apollo/client"]); if (ev) note("fe.fetch", "gql", ev); }
    const rr = findDep(fePkgs, ["react-router", "react-router-dom"]);
    const tr = findDep(fePkgs, ["@tanstack/react-router"]);
    if (rr) note("fe.router", "react-router", rr);
    else if (tr) note("fe.router", "tanstack-router", tr);
    const stateMap = [["zustand", "zustand"], ["@reduxjs/toolkit", "redux"], ["jotai", "jotai"]];
    for (const [dep, name] of stateMap) { const ev = findDep(fePkgs, [dep]); if (ev) { note("fe.state", name, ev); break; } }
    const vite = findDep(fePkgs, ["vite"]);
    const webpack = findDep(fePkgs, ["webpack"]);
    const viteCfg = fePkgs.find((p) => ["vite.config.ts", "vite.config.js"].some((f) => existsSync(join(process.cwd(), p.dir, f))))?.dir;
    if (vite || viteCfg || has("vite.config.ts") || has("vite.config.js")) note("fe.bundler", "vite", vite ?? (viteCfg ? viteCfg + ": vite config" : "vite config"));
    else if (webpack || has("webpack.config.js")) note("fe.bundler", "webpack", webpack ?? "webpack config");
  }

  if (bePkgs.length) {
    const fwMap = [["hono", "hono"], ["express", "express"], ["fastify", "fastify"], ["elysia", "elysia"], ["@nestjs/core", "nestjs"]];
    for (const [dep, name] of fwMap) { const ev = findDep(bePkgs, [dep]); if (ev) { note("be.framework", name, ev); break; } }
    const orpc = findDep(bePkgs, ["@orpc/server", "@orpc/contract"]);
    const trpc = findDep(bePkgs, ["@trpc/server"]);
    if (orpc) note("be.api", "orpc", orpc);
    else if (trpc) note("be.api", "trpc", trpc);
    const prisma = findDep(bePkgs, ["prisma", "@prisma/client"]);
    const drizzle = findDep(bePkgs, ["drizzle-orm"]);
    if (prisma) note("be.orm", "prisma", prisma);
    else if (drizzle) note("be.orm", "drizzle", drizzle);
    const dbMap = [[["pg", "postgres", "@prisma/adapter-pg", "@neondatabase/serverless"], "postgres"], [["mysql2"], "mysql"], [["better-sqlite3"], "sqlite"]];
    for (const [deps, name] of dbMap) { const ev = findDep(bePkgs, deps); if (ev) { note("be.db", name, ev); break; } }
    const queueMap = [["graphile-worker", "graphile-worker"], ["bullmq", "bullmq"], ["pg-boss", "pg-boss"]];
    for (const [dep, name] of queueMap) { const ev = findDep(bePkgs, [dep]); if (ev) { note("be.queue", name, ev); break; } }
  }

  if (mobilePkgs.length) {
    const expo = findDep(mobilePkgs, ["expo"]);
    const rn = findDep(mobilePkgs, ["react-native"]);
    note("mobile.framework", expo ? "expo" : "react-native", expo ?? rn);
  }

  note("structure.repo", globs.length ? "monorepo" : "single", globs.length ? "workspace globs " + globs.join(", ") : "no workspace config");
  if (has("turbo.json")) note("structure.build", "turbo", "turbo.json");
  else if (has("nx.json")) note("structure.build", "nx", "nx.json");

  // Formatting, config first: each property comes from the first file that sets it.
  for (const f of ["biome.json", "biome.jsonc", ".prettierrc", ".prettierrc.json", ".oxfmtrc.json", ".oxfmtrc.jsonc", ".editorconfig"]) {
    const t = readText(f);
    if (!t) continue;
    if (!out.quotes) {
      const q = t.match(/"quoteStyle"\s*:\s*"(single|double)"/);
      if (q) note("quotes", q[1], f);
      else if (/"singleQuote"\s*:\s*true/.test(t)) note("quotes", "single", f);
      else if (/"singleQuote"\s*:\s*false/.test(t)) note("quotes", "double", f);
    }
    if (!out.semicolons) {
      const s = t.match(/"semicolons"\s*:\s*"(always|asNeeded)"/);
      if (s) note("semicolons", s[1] === "always" ? "always" : "never", f);
      else if (/"semi"\s*:\s*true/.test(t)) note("semicolons", "always", f);
      else if (/"semi"\s*:\s*false/.test(t)) note("semicolons", "never", f);
    }
    if (!out.lineWidth) {
      const w = t.match(/"lineWidth"\s*:\s*(\d+)/) ?? t.match(/"printWidth"\s*:\s*(\d+)/) ?? t.match(/max_line_length\s*=\s*(\d+)/);
      if (w) note("lineWidth", w[1], f);
    }
  }

  // Source fallback for quotes/semicolons, plus the import style the code actually uses.
  const importLines = [];
  const srcSkip = /^(node_modules|\.git|dist|build|coverage|\.next|\.turbo|\.cache|\.output|\.wxt|\.codebase-memory|\.agent-teams|\.selera|\.DS_Store)$/;
  let filesSeen = 0;
  const sampleSrc = (dir) => {
    if (filesSeen >= 300) return;
    let entries = [];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (filesSeen >= 300) return;
      if (srcSkip.test(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) { sampleSrc(p); continue; }
      if (!/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) continue;
      filesSeen++;
      let text = "";
      try { text = readFileSync(p, "utf8"); } catch { continue; }
      for (const l of text.split("\n")) {
        const m = l.match(/^import .* from (['"])([^'"]+)\1(;?)\s*$/);
        if (m) importLines.push({ q: m[1], semi: m[3] === ";", spec: m[2] });
      }
    }
  };
  sampleSrc(process.cwd());
  if (importLines.length >= 20) {
    const dq = importLines.filter((l) => l.q === '"').length;
    const sc = importLines.filter((l) => l.semi).length;
    if (!out.quotes) {
      const maj = Math.max(dq, importLines.length - dq);
      if (maj / importLines.length >= 0.8) note("quotes", dq * 2 >= importLines.length ? "double" : "single", `${maj} of ${importLines.length} imports in source`);
    }
    if (!out.semicolons) {
      if (sc / importLines.length >= 0.8) note("semicolons", "always", `${sc} of ${importLines.length} imports in source`);
      else if (sc / importLines.length <= 0.2) note("semicolons", "never", `${sc} of ${importLines.length} imports in source`);
    }
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

  let aliasEv = null;
  for (const dir of pkgDirs) {
    let names = [];
    try { names = readdirSync(join(process.cwd(), dir)).filter((n) => /^tsconfig.*\.json$/.test(n)); } catch { continue; }
    for (const n of names) {
      const rel = join(dir, n);
      if (/"(paths|baseUrl)"/.test(readText(rel))) { aliasEv = rel; break; }
    }
    if (aliasEv) break;
  }
  const aliased = importLines.filter((l) => l.spec.startsWith("@/") || l.spec.startsWith("~/")).length;
  if (aliasEv) note("imports", "alias", aliasEv);
  else if (aliased >= 5) note("imports", "alias", `${aliased} imports from @/ or ~/`);
  else note("imports", "relative", aliased ? `${aliased} imports from @/ or ~/` : "no paths or aliases");

  const counts = { "kebab-case": 0, camelCase: 0, PascalCase: 0 };
  const scan = (dir, depth) => {
    if (depth > 4) return;
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
else if (cmd === "show") {
  const out = [];
  for (const [label, p] of [["global", GLOBAL], ["project", PROJECT]]) {
    if (!existsSync(p)) continue;
    out.push(`# ${label}: ${p}`, readFileSync(p, "utf8").trimEnd());
  }
  if (!out.length) console.log("Empty profile. The SoT defaults apply.");
  else console.log(out.join("\n\n") + "\n\n# merged\n" + JSON.stringify(readProfile(), null, 2));
}
else if (cmd === "apply") process.stdout.write(render(readProfile()));
else if (cmd === "set") {
  const [key, ...valueParts] = rest.filter((r) => !r.startsWith("--"));
  if (!key || !valueParts.length) { console.error("usage: selera set <key> <value> [--project]"); process.exit(1); }
  if (!validKey(key)) { console.error(`bad key "${key}". Shape: role or scope.role, e.g. validation, fe.ui`); process.exit(1); }
  const value = valueParts.join(" ");
  reportChanges(kind, { [key]: value });
  console.log("wrote " + writeProfile(kind, { [key]: value }));
} else {
  console.error("usage: selera <tree [depth]|learn [--write]|setup|show|set <key> <value>|apply> [--project]");
  process.exit(1);
}
