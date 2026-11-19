// A/B eval for the inisiasi and selera skills. Each case runs in fresh project dirs outside the repo,
// once with the skill installed and once without. Agents (subagents or `claude -p`) run each
// prepared prompt and record its transcript path in runs.json. Snapshot then writes blind packets
// for two judges, and score aggregates their grades.
// usage: node evals/harness.mjs kit | prepare [filter] [--reps N] | snapshot | score <grades.json>...
// env: EVAL_WORK (default $TMPDIR/inisiasi-evals), EVAL_OUT (run name, default "run").
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORK = process.env.EVAL_WORK ?? join(tmpdir(), "inisiasi-evals");
assert.ok(!resolve(WORK).startsWith(REPO + "/"), "EVAL_WORK must be outside the repo, or runs can read the skill source");
const KIT = join(WORK, "toolkit");
const PROJECTS = join(WORK, "projects");
const OUT = join(WORK, "runs", process.env.EVAL_OUT ?? "run");

// ---------- fixtures: one declarative entry per case ----------
const git5 = ["chore: init", "feat(cart): add totals", "fix(cart): round cents", "test(cart): cover discounts", "docs: readme"];
const tsPkg = (deps = {}) => JSON.stringify({ name: "app", private: true, type: "module", scripts: { test: "vitest" }, dependencies: deps, devDependencies: { vitest: "^3.0.0", typescript: "^5.6.0" } }, null, 2);
const reactPkg = JSON.stringify({ name: "web", private: true, type: "module", dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" }, devDependencies: { vite: "^6.0.0", typescript: "^5.6.0" } }, null, 2);
const authCode = {
  "package.json": tsPkg({ hono: "^4.6.0", "better-auth": "^1.2.0", "drizzle-orm": "^0.36.0" }),
  "src/auth/session.ts": "import { betterAuth } from \"better-auth\";\nimport { db } from \"../db\";\n\nexport const auth = betterAuth({\n  database: db,\n  emailAndPassword: { enabled: true },\n  session: { expiresIn: 60 * 60 * 24 * 7 },\n});\n",
  "src/auth/middleware.ts": "import type { MiddlewareHandler } from \"hono\";\nimport { auth } from \"./session\";\n\nexport const requireUser: MiddlewareHandler = async (c, next) => {\n  const session = await auth.api.getSession({ headers: c.req.raw.headers });\n  if (!session) return c.json({ error: \"unauthorized\" }, 401);\n  c.set(\"user\", session.user);\n  await next();\n};\n",
  "src/auth/routes.ts": "import { Hono } from \"hono\";\nimport { auth } from \"./session\";\n\nexport const authRoutes = new Hono().on([\"GET\", \"POST\"], \"/api/auth/*\", (c) => auth.handler(c.req.raw));\n",
  "src/db.ts": "import { drizzle } from \"drizzle-orm/node-postgres\";\nexport const db = drizzle(process.env.DATABASE_URL!);\n",
  "src/index.ts": "import { Hono } from \"hono\";\nimport { authRoutes } from \"./auth/routes\";\nimport { requireUser } from \"./auth/middleware\";\n\nconst app = new Hono();\napp.route(\"/\", authRoutes);\napp.get(\"/me\", requireUser, (c) => c.json(c.get(\"user\")));\nexport default app;\n",
};

/** @type {Record<string, {name: string, files: Record<string,string>, commits?: string[], projectProfile?: object, globalProfile?: object, mcp?: boolean}>} */
const FIXTURES = {
  "inisiasi#1": { name: "fuu", files: {
    "README.md": "# fuu\n\nPersonal macOS folder locker.\n",
    "docs/PLAN.md": "# Plan\n## Goals\n- Lock any folder I pick so nobody else on this Mac can open it.\n- Unlock with Touch ID, with the account password as fallback.\n## MVP (v1)\n- Menu bar app with a list of locked folders.\n- Finder extension: lock or unlock from the right-click menu (required).\n- Encrypted storage with hdiutil AES-256 disk images.\n## Constraints\n- Personal use, one Mac.\n## Non-goals\n- Distribution outside this Mac.\n## Open questions\n- Which macOS version is the minimum?\n- Do auto-lock and app locking belong in v1?\n" } },
  "inisiasi#2": { name: "motolog", files: {} },
  "inisiasi#3": { name: "linkpad", mcp: false, files: {
    "README.md": "# linkpad\n",
    "docs/PLAN.md": "# Plan\n## Goals\n- Short links for my team, with click counts.\n## MVP (v1)\n- Create a short link, redirect, count clicks, list my links.\n## Constraints\n- Team of 10, Google login.\n## Non-goals\n- Public signups, custom domains.\n" } },
  "inisiasi#4": { name: "tally", files: {
    "docs/PLAN.md": "# Plan\n## Goals\n- Shared expense tracker for a household.\n## MVP (v1)\n- Add expenses, split them, monthly summary.\n## Constraints\n- Web first, 2 to 5 users per household.\n## Non-goals\n- Bank sync.\n",
    "docs/ARCHITECTURE.md": "# Architecture\n\n## Summary\nWeb app for shared household expenses.\n\n## Stack\n| Layer | Choice | Why | Rejected |\n|---|---|---|---|\n| Language | TypeScript | One language end to end | Python |\n| UI | TanStack Start + shadcn/ui | Fullstack React with SSR | Next.js |\n| Storage | Postgres (Neon) + Drizzle | Relational splits, branching | SQLite |\n| Build/CI | Vite+ and GitHub Actions | Owner default | Turborepo only |\n\n## Architecture\nOne app, modules: expenses, households, auth.\n\n## Risks\n- **Riskiest assumption:** split rounding stays exact -> spike: integer cents property test.\n",
    "docs/TASKS.md": "# Tasks\n\n- [ ] 1. Spike: split rounding with integer cents -> verify: property test passes\n- [ ] 2. Household model -> verify: migration runs\n- [ ] 3. Add expense form -> verify: e2e creates one\n- [ ] 4. Monthly summary -> verify: totals match fixture\n- [ ] 5. Invite member -> verify: second user sees household\n" } },
  "inisiasi#5": { name: "syncbox", files: {
    "docs/PLAN.md": "# Plan\n## Goals\n- File sync between a desktop folder and a mobile app.\n## MVP (v1)\n- Upload, download, conflict copy.\n## Constraints\n- Small team, low budget.\n## Non-goals\n- Real-time collaborative editing.\n",
    "docs/ARCHITECTURE.md": "# Architecture\n\n## Summary\nSync service with a mobile client.\n\n## Stack\n| Layer | Choice | Why | Rejected |\n|---|---|---|---|\n| Language | TypeScript | Shared types | Go |\n| API | Hono on Node | Small, portable | Express |\n| Mobile | Expo | One codebase | Flutter |\n| Storage | Postgres for metadata | Default | MongoDB |\n\n## Architecture\nAPI stores metadata in Postgres. File bytes go to object storage (not chosen yet). Mobile app updates: not chosen yet.\n" } },
  "inisiasi#6": { name: "habitly", files: {
    "docs/PLAN.md": "# Plan\n## Goals\n- Habit tracker for a small team: daily check-ins and a weekly streak view.\n## MVP (v1)\n- Sign in with Google, create habits, daily check-in, team streak board.\n## Constraints\n- Web only, under 50 users, TypeScript.\n## Non-goals\n- Mobile apps, notifications.\n",
    "docs/ARCHITECTURE.md": "# Architecture\n",
    "docs/TASKS.md": "# Tasks\n",
    "docs/DESIGN.md": "# Design\n\nCalm palette, one accent color, streak board as a grid of days.\n",
    "AGENTS_WORKLOG.md": "# Worklog\n\n## 2026-11-10 09:00:00 WIB | owner | plan\n- **Status:** `completed`\n- **Update:** PLAN settled, no open questions.\n" } },
  "inisiasi#7": { name: "gatekeep", files: authCode },
  "inisiasi#8": { name: "webapp", files: { "package.json": reactPkg } },
  "inisiasi#9": { name: "streaks", files: {} },
  "inisiasi#10": { name: "counter", files: { "package.json": reactPkg, "src/Counter.tsx": "import { useState } from \"react\";\n\nexport function Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n + 1)}>{n}</button>;\n}\n" } },
  "inisiasi#11": { name: "gatekeep", files: authCode },
  "selera#1": { name: "orders", files: { "package.json": tsPkg() } },
  "selera#2": { name: "orders", files: { "package.json": tsPkg() } },
  "selera#3": { name: "storefront", files: { "package.json": reactPkg } },
  "selera#4": { name: "orders", files: { "package.json": tsPkg() } },
  "selera#5": { name: "orders", files: { "package.json": tsPkg() }, projectProfile: { "naming.file": "kebab-case" } },
  "selera#6": { name: "cartkit", commits: git5, files: {
    "package.json": tsPkg({ zod: "^3.23.0" }), "pnpm-lock.yaml": "lockfileVersion: '9.0'\n",
    "tsconfig.json": JSON.stringify({ compilerOptions: { strict: true, baseUrl: ".", paths: { "@/*": ["src/*"] } } }, null, 2),
    ".prettierrc": JSON.stringify({ singleQuote: true, semi: false, printWidth: 100 }),
    "src/cart-total.ts": "export const cartTotal = (items: { cents: number }[]) => items.reduce((s, i) => s + i.cents, 0)\n",
    "src/order-service.ts": "export const placeOrder = () => 'ok'\n", "src/price-format.ts": "export const fmt = (c: number) => (c / 100).toFixed(2)\n" } },
  "selera#7": { name: "csvtool", files: { "package.json": tsPkg(), "src/parse.ts": "// Parses \"a,b,c\" lines into rows. Header row is skipped.\nexport function parse(text: string): string[][] {\n  const lines = text.split(\"\\n\");\n  const rows: string[][] = [];\n  for (let i = 1; i < lines.length - 1; i++) {\n    rows.push(lines[i].split(\",\"));\n  }\n  return rows;\n}\n" } },
  "selera#8": { name: "orders", files: { "package.json": tsPkg() }, projectProfile: { packageManager: "pnpm" } },
  "selera#9": { name: "orders", files: { "package.json": tsPkg(), "vitest.config.ts": "import { defineConfig } from \"vitest/config\";\nexport default defineConfig({ test: {} });\n" } },
  "selera#10": { name: "cartkit", files: { "package.json": tsPkg(),
    "src/cart.ts": "export type Item = { sku: string; qty: number };\n\nexport function countItems(items: Item[]): number {\n  return new Set(items.map((i) => i.sku)).size;\n}\n",
    "src/cart.test.ts": "import { expect, test } from \"vitest\";\nimport { countItems } from \"./cart\";\n\ntest(\"counts every unit\", () => {\n  expect(countItems([{ sku: \"a\", qty: 1 }, { sku: \"a\", qty: 1 }, { sku: \"b\", qty: 1 }])).toBe(3);\n});\n" } },
};

// ---------- cases ----------
/** @returns {{skill: string, id: number, key: string, prompt: string, should_trigger: boolean, assertions: string[], expected_output: string}[]} */
function loadCases() {
  return ["inisiasi", "selera"].flatMap((skill) => {
    const raw = JSON.parse(readFileSync(join(REPO, "skill", skill, "evals", "evals.json"), "utf8"));
    return (raw.evals ?? raw).map((c) => ({ skill, ...c, key: `${skill}#${c.id}` }));
  });
}

// ---------- kit: the skills and MCP as installed, without the case files ----------
function buildKit() {
  rmSync(KIT, { recursive: true, force: true });
  for (const s of ["inisiasi", "selera"]) cpSync(join(REPO, "skill", s), join(KIT, "skill", s), { recursive: true, filter: (src) => !src.includes(`${s}/evals`) });
  for (const f of ["dist", "catalog.json", "package.json"]) cpSync(join(REPO, "mcp", f), join(KIT, "mcp", f), { recursive: true });
  symlinkSync(join(REPO, "mcp", "node_modules"), join(KIT, "mcp", "node_modules"));
  const leaked = execFileSync("find", [KIT, "-not", "-path", "*/node_modules/*", "-iname", "*eval*"], { encoding: "utf8" }).trim();
  assert.equal(leaked, "", "kit holds no case files: " + leaked);
  console.log("kit ready", KIT);
}

// ---------- one run: a sanitized project dir plus the prompt a subagent candidate receives ----------
const sh = (cwd, cmd, args) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
const describe = (skill) => readFileSync(join(KIT, "skill", skill, "SKILL.md"), "utf8").match(/^description:\s*(?:>-\n)?([\s\S]*?)\n---/m)[1].replace(/\s+/g, " ").trim();

function setup(c, arm) {
  const fx = FIXTURES[c.key];
  assert.ok(fx, "fixture for " + c.key);
  const label = randomBytes(4).toString("hex");
  const root = join(PROJECTS, label);
  const dir = join(root, fx.name);
  mkdirSync(dir, { recursive: true });
  for (const [p, body] of Object.entries(fx.files)) { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), body); }
  // A repo without the skill would never hold a selera profile, so only the skill arm gets one.
  if (fx.projectProfile && arm === "with") { mkdirSync(join(dir, ".selera"), { recursive: true }); writeFileSync(join(dir, ".selera", "profile.json"), JSON.stringify(fx.projectProfile, null, 2)); }
  const globalProfile = join(root, ".config", "inisiasi", "selera", "profile.json");
  if (fx.globalProfile) { mkdirSync(dirname(globalProfile), { recursive: true }); writeFileSync(globalProfile, JSON.stringify(fx.globalProfile, null, 2)); }
  const id = ["-c", "user.name=owner", "-c", "user.email=owner@example.com"];
  sh(dir, "git", ["init", "-q"]);
  sh(dir, "git", [...id, "add", "-A"]);
  for (const m of fx.commits ?? ["chore: init"]) sh(dir, "git", [...id, "commit", "-q", "--allow-empty", "-m", m]);
  let skillNote = "";
  if (arm === "with") {
    const target = join(dir, ".claude", "skills", c.skill);
    cpSync(join(KIT, "skill", c.skill), target, { recursive: true });
    symlinkSync(join(KIT, "mcp"), join(dir, ".claude", "mcp"));
    // The copy writes its user-level profile inside this run, never to the real home config.
    const script = join(target, "scripts", "selera.mjs");
    if (existsSync(script)) {
      const src = readFileSync(script, "utf8");
      const patched = src.replace('const CONFIG_HOME = process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config");', `const CONFIG_HOME = ${JSON.stringify(join(root, ".config"))};`)
        .replace('const GLOBAL = process.env.SELERA_CONFIG ?? join(CONFIG_HOME, "inisiasi", "selera", "profile.json");', `const GLOBAL = ${JSON.stringify(globalProfile)};`);
      assert.notEqual(patched, src, "selera profile path patched");
      writeFileSync(script, patched);
    }
    skillNote = `\n\nAgent skills installed for this project. When a skill's description matches the request, read its SKILL.md first and follow it:\n- ${c.skill}: ${describe(c.skill)} (${join(target, "SKILL.md")})`;
  }
  // Subagent candidates inherit the host's MCP servers, so the baseline is told off them and snapshot flags any use.
  const fence = arm === "without" ? ` Do not call any mcp__inisiasi__ tool and do not read anything under ${REPO}: neither is part of this project.` : "";
  const prompt = `You are working in the project at ${dir}. Treat it as the current repository: run every command from there and keep all file changes inside it.${fence} Reply to the user as you would in a normal session; this turn ends with your reply.${skillNote}\n\nThe user says:\n${c.prompt}`;
  return { key: c.key, arm, label, root, dir, globalProfile, prompt };
}

function prepare(filter, reps) {
  const cases = loadCases().filter((c) => !filter || c.key === filter || c.skill === filter);
  assert.ok(cases.length, "no case matches " + filter);
  mkdirSync(OUT, { recursive: true });
  const runs = cases.flatMap((c) => Array.from({ length: reps }, () => ["with", "without"].map((arm) => setup(c, arm))).flat());
  writeFileSync(join(OUT, "runs.json"), JSON.stringify(runs, null, 1));
  console.log(`prepared ${runs.length} runs in ${OUT}/runs.json`);
}

// ---------- snapshot: evidence a judge can read without the arm name ----------
function walk(dir, base = dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules" || (e.name === ".claude" && dir === base)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out); else out.push(relative(base, p));
  }
  return out;
}

function evidence(rec, c) {
  const events = readFileSync(rec.transcript, "utf8").split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
  const actions = [];
  let final = "";
  let lastSay = "";
  let skillUsed = false;
  const leaks = [];
  for (const ev of events) {
    if (ev.type === "assistant" || ev.message?.role === "assistant") for (const b of ev.message?.content ?? []) {
      if (b.type === "text") { actions.push({ say: b.text.slice(0, 3000) }); lastSay = b.text; }
      if (b.type === "tool_use" && b.name === "SubagentHandback") { final = String(b.input?.message ?? ""); continue; }
      if (b.type === "tool_use") {
        const input = JSON.stringify(b.input);
        actions.push({ tool: b.name, input: input.slice(0, 1500) });
        if ((b.name === "Skill" && input.includes(c.skill)) || input.includes(`.claude/skills/${c.skill}`)) skillUsed = true;
        if (b.name.startsWith("mcp__inisiasi__") || input.includes(REPO + "/")) leaks.push(b.name);
      }
    }
    if (ev.type === "result") final = ev.result ?? "";
  }
  // A handback can carry a stub ("placeholder", "done") while the real reply sits in the last text block.
  if (final.trim().length < 40 && lastSay.trim().length > final.trim().length) final = lastSay;
  const fx = FIXTURES[c.key];
  const files = {};
  for (const f of walk(rec.dir)) {
    const before = fx.files[f] ?? (f === ".selera/profile.json" && fx.projectProfile && rec.arm === "with" ? JSON.stringify(fx.projectProfile, null, 2) : undefined);
    const now = readFileSync(join(rec.dir, f), "utf8");
    if (before !== now) files[f] = before === undefined ? { created: now.slice(0, 6000) } : { changed: now.slice(0, 6000) };
  }
  for (const f of Object.keys(fx.files)) if (!existsSync(join(rec.dir, f))) files[f] = { deleted: true };
  const profile = existsSync(rec.globalProfile) ? readFileSync(rec.globalProfile, "utf8") : null;
  const log = execFileSync("git", ["log", "--oneline"], { cwd: rec.dir, encoding: "utf8" }).trim().split("\n");
  // The with-arm may use the MCP; only a baseline that reached the skill's own sources is contaminated.
  const contaminated = rec.arm === "without" && leaks.length > 0 ? leaks : null;
  return { final_reply: final.slice(0, 6000), actions, files_changed: files, user_level_profile_after: profile, git_log: log, skill_loaded: skillUsed, contaminated };
}

function snapshot() {
  const cases = new Map(loadCases().map((c) => [c.key, c]));
  const runs = JSON.parse(readFileSync(join(OUT, "runs.json"), "utf8")).filter((r) => r.transcript);
  const packets = {};
  const key = {};
  for (const rec of runs) {
    const c = cases.get(rec.key);
    const ev = evidence(rec, c);
    key[rec.label] = { case: rec.key, arm: rec.arm, skill_loaded: ev.skill_loaded, contaminated: ev.contaminated };
    const { skill_loaded, contaminated, ...blind } = ev;
    (packets[rec.key] ??= { case: rec.key, prompt: c.prompt, expected_output: c.expected_output, assertions: c.assertions, should_trigger: c.should_trigger, outputs: {} }).outputs[rec.label] = blind;
  }
  mkdirSync(join(OUT, "packets"), { recursive: true });
  for (const [k, p] of Object.entries(packets)) writeFileSync(join(OUT, "packets", k.replace("#", "-") + ".json"), JSON.stringify(p, null, 1));
  writeFileSync(join(OUT, "arm-key.json"), JSON.stringify(key, null, 1));
  const dirty = Object.entries(key).filter(([, k]) => k.contaminated);
  console.log(`packets: ${Object.keys(packets).length}, runs: ${runs.length}, contaminated baselines: ${dirty.length}`);
  for (const [label, k] of dirty) console.log(`  ${label} ${k.case}: ${[...new Set(k.contaminated)].join(", ")}`);
}

// ---------- score: pass rate per skill and arm, one row per judge, contaminated runs left out ----------
// grades file: [{ label, case, grades: [{ verdict: "pass" | "fail" | "na" }] }]
export function tally(key, grades) {
  const agg = {};
  for (const e of grades) {
    const k = key[e.label];
    if (!k || k.contaminated) continue;
    const v = e.grades.map((g) => g.verdict).filter((x) => x !== "na");
    const a = (agg[`${e.case.split("#")[0]} ${k.arm}`] ??= { pass: 0, total: 0 });
    a.pass += v.filter((x) => x === "pass").length;
    a.total += v.length;
  }
  return agg;
}

function score(files) {
  assert.ok(files.length, "pass one grades file per judge");
  const key = JSON.parse(readFileSync(join(OUT, "arm-key.json"), "utf8"));
  for (const f of files) {
    console.log(f);
    for (const [k, { pass, total }] of Object.entries(tally(key, JSON.parse(readFileSync(f, "utf8")))).sort())
      console.log(`  ${k.padEnd(18)} ${pass}/${total} = ${Math.round((100 * pass) / total)}%`);
  }
}

function selfTest() {
  const key = { a: { arm: "with" }, b: { arm: "without" }, c: { arm: "without", contaminated: ["mcp__inisiasi__x"] } };
  const g = (label, ...v) => ({ label, case: "inisiasi#1", grades: v.map((verdict) => ({ verdict })) });
  assert.deepEqual(tally(key, [g("a", "pass", "fail", "na"), g("b", "fail"), g("c", "pass")]), {
    "inisiasi with": { pass: 1, total: 2 },
    "inisiasi without": { pass: 0, total: 1 },
  });
  console.log("self-test ok");
}

const [cmd, ...rest] = process.argv.slice(2);
const ri = rest.indexOf("--reps");
const reps = ri >= 0 ? Number(rest[ri + 1]) : 1;
assert.ok(Number.isInteger(reps) && reps > 0, "--reps takes a positive integer");
const args = rest.filter((r, i) => !r.startsWith("--") && rest[i - 1] !== "--reps");
if (cmd === "kit") buildKit();
else if (cmd === "prepare") prepare(args[0], reps);
else if (cmd === "snapshot") snapshot();
else if (cmd === "score") score(args);
else if (cmd === "self-test") selfTest();
else { console.error("usage: harness.mjs kit | prepare [filter] [--reps N] | snapshot | score <grades.json>... | self-test"); process.exit(2); }
