// Spawns the built server over stdio and calls every tool once. Exits non-zero on any failure.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import assert from "node:assert/strict";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));

const client = new Client({ name: "smoke", version: "0" });
await client.connect(new StdioClientTransport({ command: "node", args: [new URL("../dist/server.js", import.meta.url).pathname] }));

const { tools } = await client.listTools();
assert.deepEqual(tools.map((t) => t.name).sort(), ["detect_stack", "get_skill", "inspect_plan", "list_domain_skills", "list_domains", "recommend_bundle", "recommend_skills", "search_skills", "select_references", "validate_docs"]);

const call = async (name, args = {}) => {
  const r = await client.callTool({ name, arguments: args });
  return { error: !!r.isError, data: r.isError ? r.content[0].text : JSON.parse(r.content[0].text) };
};

const domains = await call("list_domains");
assert.ok(domains.data.some((d) => d.domain === "frontend"));

const rec = await call("recommend_skills", { project_description: "macOS menubar app in Swift and SwiftUI that encrypts folders with Touch ID", limit: 5 });
assert.equal(rec.data.length, 5);
assert.ok(rec.data.some((s) => /swift/i.test(s.id)), rec.data.map((s) => s.id).join(","));

const dom = await call("list_domain_skills", { domain: "design", limit: 99 });
assert.ok(dom.data.length <= 25);
assert.ok(dom.data.length > 0);
assert.ok(dom.data.every((s, i, a) => i === 0 || a[i - 1].popularity >= s.popularity));

const search = await call("search_skills", { query: "swift concurency", limit: 3 });
assert.ok(search.data.slice(0, 2).some((s) => s.id === "swift-concurrency"));

const one = await call("get_skill", { id: "swiftui-pro" });
assert.match(one.data.source_url, /^https:\/\/github\.com\/twostraws\/SwiftUI-Agent-Skill\/tree\/[^/]+\/swiftui-pro$/);

const missing = await call("get_skill", { id: "nope" });
assert.ok(missing.error);
const badDomain = await call("list_domain_skills", { domain: "nope" });
assert.ok(badDomain.error);

const show = (label, v) => console.log(`\n## ${label}\n` + JSON.stringify(v, null, 1).slice(0, 900));
show("list_domains", domains.data);
show("recommend_skills (fuu)", rec.data.map((s) => `${s.id} score=${s.score} ${s.install_command}`));
show("list_domain_skills design limit=99", dom.data.map((s) => `${s.id} ${s.popularity}`));
show("search_skills 'swift concurency' in apple", search.data.map((s) => `${s.id} match=${s.match}`));
show("get_skill swiftui-pro", one.data);
show("errors", [missing.data, badDomain.data]);

const fuu = process.env.INISIASI_FUU ?? join(HERE, "fixtures/fuu");
const plan = await call("inspect_plan", { path: fuu, max_questions: 5 });
assert.equal(plan.error, false);
assert.equal(typeof plan.data.ready, "boolean");
assert.ok(Array.isArray(plan.data.open_questions));
assert.ok(plan.data.questions_to_ask.length <= 5);
if (plan.data.open_questions.some((q) => /not answered yet/i.test(q))) assert.equal(plan.data.ready, false);

const noPath = await call("inspect_plan", {});
assert.ok(noPath.error);

const docs = await call("validate_docs", { root: fuu });
assert.equal(docs.error, false);
assert.equal(typeof docs.data.ok, "boolean");
if (docs.data.architecture_stub) assert.equal(docs.data.ok, false);

const noRoot = await call("validate_docs", {});
assert.ok(noRoot.error);

show("inspect_plan (fuu)", { ready: plan.data.ready, open: plan.data.open_questions, ask: plan.data.questions_to_ask, present: plan.data.sections_present });
show("validate_docs (fuu)", { ok: docs.data.ok, errors: docs.data.errors, warnings: docs.data.warnings, stub: docs.data.architecture_stub, tasks: docs.data.task_count });

const stack = await call("detect_stack", { root: fuu });
assert.equal(stack.error, false);
assert.equal(stack.data.missing_root, false);
assert.equal(stack.data.docs.PLAN.exists, true);

const noStackRoot = await call("detect_stack", {});
assert.ok(noStackRoot.error);

const refs = await call("select_references", { project_description: "macOS menubar SwiftUI app that encrypts folders", plan_path: fuu });
assert.equal(refs.error, false);
assert.ok(refs.data.files.length >= 2);
assert.ok(refs.data.files.some((f) => f.file === "apple-macos-swift.md"));

const noRefs = await call("select_references", {});
assert.ok(noRefs.error);

const bundle = await call("recommend_bundle", { root: fuu, limit: 10 });
assert.equal(bundle.error, false);
assert.equal(bundle.data.plan.ready, false);
assert.ok(bundle.data.skills.length > 0);
assert.ok(bundle.data.skills.every((sk) => typeof sk.installed === "boolean"));
assert.ok(Array.isArray(bundle.data.coverage_holes));

const noBundle = await call("recommend_bundle", {});
assert.ok(noBundle.error);

show("detect_stack (fuu)", { language: stack.data.language, languages: stack.data.languages, frameworks: stack.data.frameworks, hints: stack.data.hints, manifests: stack.data.manifests, docs: stack.data.docs });
show("select_references (fuu)", { files: refs.data.files.map((f) => `${f.file} verified=${f.verified_at} stale=${f.stale}`), gaps: refs.data.gaps });
show("recommend_bundle (fuu)", { ready: bundle.data.plan.ready, skills: bundle.data.skills.map((sk) => `${sk.id}${sk.installed ? " installed" : ""}`), holes: bundle.data.coverage_holes, gaps: bundle.data.references.gaps });

console.log("\nOK: 10 tools, all assertions passed");


await client.close();
