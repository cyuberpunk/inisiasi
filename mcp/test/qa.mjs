// QA cases for quality and usability. Run: node test/qa.mjs (after npm run build).
// Not part of npm test: FAIL lines are known defects, PASS lines guard behavior that already works.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const MCP = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(MCP, "..");

async function withServer(fn, ms = 3000) {
  const client = new Client({ name: "qa", version: "0" });
  await client.connect(new StdioClientTransport({ command: "node", args: [join(MCP, "dist/server.js")] }));
  const call = async (name, args = {}) => {
    let timer;
    const timeout = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(`timeout>${ms}ms`)), ms); });
    try {
      const r = await Promise.race([client.callTool({ name, arguments: args }), timeout]);
      const text = r.content?.[0]?.text ?? "";
      let data = text;
      try { data = JSON.parse(text); } catch {}
      return { error: !!r.isError, text, data };
    } finally { clearTimeout(timer); }
  };
  try { return await fn(call); } finally { await client.close().catch(() => {}); }
}

const project = (files) => {
  const root = mkdtempSync(join(tmpdir(), "qa-"));
  for (const [p, body] of Object.entries(files)) { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), body); }
  return root;
};

const snapshot = (dir) => {
  const h = createHash("sha1");
  const walk = (d) => { for (const n of readdirSync(d).sort()) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : h.update(p + readFileSync(p)); } };
  walk(dir);
  return h.digest("hex");
};

const cases = [];
const qa = (id, dim, name, run) => cases.push({ id, dim, name, run });
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

// Starter docs in the shape the repo itself ships today (bullet list, plain "Goal:" lines).
const LOOSE_PLAN = "# Project: Motorbike Tracker\n\nGoal: Build a small web app to track service history.\n\nRequirements:\n- Log service events.\n- View history.\n";
const LOOSE_ARCH = "# Architecture: Motorbike Tracker\n\nStack:\n- Frontend: React + Vite\n- Backend: Node.js + Express\n- Database: SQLite\n";
const LOOSE_TASKS = "# Tasks\n\n- [ ] 1. Initialize project structure.\n- [ ] 2. Setup server with SQLite.\n";

// ---- usability: onboarding with docs a new owner would naturally write
qa("U1", "usability", "inspect_plan sees content in a plain 'Goal:' PLAN", () => withServer(async (call) => {
  const r = await call("inspect_plan", { path: join(project({ "docs/PLAN.md": LOOSE_PLAN }), "docs/PLAN.md") });
  ok(r.data.title_only === false, "PLAN with a Goal line and requirements is reported title_only=true");
}));

qa("U2", "usability", "validate_docs error says what format is expected", () => withServer(async (call) => {
  const r = await call("validate_docs", { root: project({ "docs/ARCHITECTURE.md": LOOSE_ARCH, "docs/TASKS.md": LOOSE_TASKS }) });
  const msg = r.data.errors.find((e) => /ARCHITECTURE/.test(e)) ?? "";
  ok(/\|\s*Layer|## Stack|table/i.test(msg), `error "${msg}" gives no hint of the expected '## Stack' table`);
}));

qa("U3", "usability", "tilde path is expanded", () => withServer(async (call) => {
  const rel = relative(homedir(), REPO);
  ok(!rel.startsWith(".."), "repo not under home, case not applicable");
  const r = await call("validate_docs", { root: `~/${rel}` });
  ok(!r.data.errors.some((e) => /not found/i.test(e)), `"~/${rel}" reported as: ${r.data.errors[0]}`);
}));

qa("U4", "usability", "search_skills rejects an unknown domain like list_domain_skills does", () => withServer(async (call) => {
  const r = await call("search_skills", { query: "react", domain: "nope" });
  ok(r.error, "unknown domain returns [] silently, the two tools disagree");
}));

// ---- relevance: real requests, Indonesian and English
qa("R1", "relevance", "'bot WhatsApp pakai AI agent' does not lead with document skills", () => withServer(async (call) => {
  const r = await call("recommend_skills", { project_description: "bot WhatsApp pakai AI agent", limit: 4 });
  const bad = r.data.filter((s) => s.domain === "document").map((s) => s.id);
  ok(bad.length === 0, `top 4 contains document skills: ${bad.join(", ")}`);
}));

qa("R2", "relevance", "'tools CLI untuk rename file' does not return vendor-specific CLIs", () => withServer(async (call) => {
  const r = await call("recommend_skills", { project_description: "tools CLI untuk rename file", limit: 4 });
  const bad = r.data.filter((s) => /^google-agents-cli|^android-cli/.test(s.id)).map((s) => s.id);
  ok(bad.length === 0, `vendor CLIs in top 4: ${bad.join(", ")}`);
}));

qa("R3", "relevance", "Next.js + Postgres request surfaces a postgres and a next skill", () => withServer(async (call) => {
  const r = await call("recommend_skills", { project_description: "aplikasi kasir toko pakai Next.js dan Postgres", limit: 6 });
  const ids = r.data.map((s) => s.id).join(" ");
  ok(/next/.test(ids) && /postg/.test(ids), ids);
}));

// ---- robustness
qa("B1", "boundary", "search_skills answers a 50k-char query within 2s", () => withServer(async (call) => {
  const t = Date.now();
  await call("search_skills", { query: "a".repeat(50000) }).catch((e) => { throw new Error(`${e.message}, no input length cap (measured 25s unbounded)`); });
  ok(Date.now() - t < 2000, `took ${Date.now() - t}ms`);
}, 5000));

qa("B2", "boundary", "limit is clamped to 1..25", () => withServer(async (call) => {
  const one = await call("recommend_skills", { project_description: "react app", limit: 1 });
  const many = await call("recommend_skills", { project_description: "react app", limit: 99 });
  ok(one.data.length === 1 && many.data.length <= 25, `${one.data.length}, ${many.data.length}`);
}));

qa("B3", "boundary", "required args missing returns isError, not a crash", () => withServer(async (call) => {
  for (const [n, a] of [["recommend_skills", {}], ["search_skills", { query: "" }], ["get_skill", { id: "" }], ["validate_docs", { root: "" }], ["inspect_plan", { path: "" }]]) {
    ok((await call(n, a)).error, `${n} ${JSON.stringify(a)} did not return isError`);
  }
}));

qa("B4", "boundary", "unknown domain error lists valid domains", () => withServer(async (call) => {
  const r = await call("list_domain_skills", { domain: "nope" });
  ok(r.error && /Valid:.*frontend/.test(r.text), r.text);
}));

qa("B5", "boundary", "unknown skill id error names the next step", () => withServer(async (call) => {
  const r = await call("get_skill", { id: "SwiftUI-Pro" });
  ok(r.error && /search_skills|recommend_skills/.test(r.text), r.text);
}));

// ---- safety
qa("S1", "safety", "read-only tools leave the project untouched", () => withServer(async (call) => {
  const root = project({ "docs/PLAN.md": LOOSE_PLAN, "docs/ARCHITECTURE.md": LOOSE_ARCH, "docs/TASKS.md": LOOSE_TASKS, "package.json": "{}" });
  const before = snapshot(root);
  await call("validate_docs", { root });
  await call("detect_stack", { root });
  await call("inspect_plan", { path: root });
  await call("recommend_bundle", { root, project_description: "web app" });
  ok(snapshot(root) === before, "a tool changed files under the project root");
}));

qa("S2", "safety", "path traversal and missing roots return a result, never a crash", () => withServer(async (call) => {
  for (const p of ["../../../etc", "/nonexistent", "docs/PLAN.md"]) {
    const r = await call("validate_docs", { root: p });
    ok(!r.error && r.data.ok === false, `${p}: ${r.text.slice(0, 80)}`);
  }
}));

// ---- scripts
qa("C1", "cli", "selera check.sh runs from the repo root with a relative path", async () => {
  const r = spawnSync("sh", ["skill/selera/scripts/check.sh"], { cwd: REPO, encoding: "utf8" });
  ok(r.status === 0, (r.stdout + r.stderr).split("\n").find((l) => /FAIL|Cannot find/.test(l)) ?? `exit ${r.status}`);
});

qa("C2", "cli", "selera check.sh runs with an absolute path", async () => {
  const r = spawnSync("sh", [join(REPO, "skill/selera/scripts/check.sh")], { encoding: "utf8" });
  ok(r.status === 0, (r.stdout + r.stderr).slice(-120));
});

// ---- skill structure
qa("K1", "skill", "every skill's name equals its folder and its referenced files exist", async () => {
  const bad = [];
  for (const d of readdirSync(join(REPO, "skill"))) {
    const md = join(REPO, "skill", d, "SKILL.md");
    let text; try { text = readFileSync(md, "utf8"); } catch { continue; }
    if (text.match(/^name: (.+)$/m)?.[1] !== d) bad.push(`${d}: name mismatch`);
    for (const m of text.matchAll(/`((?:references|scripts)\/[\w./-]+\.(?:md|mjs|sh))`/g)) {
      try { statSync(join(REPO, "skill", d, m[1])); } catch { bad.push(`${d}: missing ${m[1]}`); }
    }
    if (text.includes("\u2014")) bad.push(`${d}: em dash`);
  }
  ok(bad.length === 0, bad.join("; "));
});

qa("K2", "skill", "README lists every skill folder", async () => {
  const readme = readFileSync(join(REPO, "README.md"), "utf8");
  const missing = readdirSync(join(REPO, "skill")).filter((d) => !readme.includes(`skill/${d}/`));
  ok(missing.length === 0, `not in README: ${missing.join(", ")}`);
});

const results = [];
for (const c of cases) {
  try { await c.run(); results.push({ ...c, pass: true }); console.log(`PASS ${c.id} [${c.dim}] ${c.name}`); }
  catch (e) { results.push({ ...c, pass: false, why: e.message }); console.log(`FAIL ${c.id} [${c.dim}] ${c.name}\n       ${e.message}`); }
}
const dims = [...new Set(results.map((r) => r.dim))];
console.log("\n" + dims.map((d) => { const rs = results.filter((r) => r.dim === d); return `${d}: ${rs.filter((r) => r.pass).length}/${rs.length}`; }).join("  "));
console.log(`total: ${results.filter((r) => r.pass).length}/${results.length} passed`);
process.exit(results.every((r) => r.pass) ? 0 : 1);
