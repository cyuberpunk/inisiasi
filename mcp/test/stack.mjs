// Tests for detect_stack, select_references, and recommend_bundle.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = fileURLToPath(new URL(".", import.meta.url));
import { detectStack } from "../dist/detectStack.js";
import { selectReferences, isStale } from "../dist/selectReferences.js";
import { recommendBundle } from "../dist/recommendBundle.js";

const jsApp = fileURLToPath(new URL("./fixtures/js-app", import.meta.url));
const fuu = process.env.INISIASI_FUU ?? join(HERE, "fixtures/fuu");

// --- detect_stack: JS fixture ---
const js = detectStack(jsApp);
assert.equal(js.missing_root, false);
assert.equal(js.language, "TypeScript");
assert.ok(js.languages.includes("TypeScript"));
assert.ok(js.package_managers.includes("npm"));
assert.ok(js.manifests.some((m) => m.kind === "package.json"));
assert.ok(js.manifests.some((m) => m.kind === "package-lock.json" || m.path.endsWith("package-lock.json")));
assert.ok(js.frameworks.includes("react"));
assert.ok(js.frameworks.includes("vite"));
assert.ok(js.frameworks.includes("vitest"));
assert.equal(js.docs.PLAN.exists, true);
assert.equal(js.docs.PLAN.stub, false);
assert.equal(js.docs.ARCHITECTURE.exists, false);
assert.ok(Array.isArray(js.installed_skills));

const missing = detectStack(join(jsApp, "no-such-root"));
assert.equal(missing.missing_root, true);

// --- select_references: TS web vs macOS, plus stale fixture ---
const web = selectReferences({ project_description: "React Vite TypeScript web app for service history" });
assert.ok(web.files.length >= 3 && web.files.length <= 8);
const webFiles = web.files.map((f) => f.file);
assert.ok(webFiles.includes("toolchain-ts.md"), webFiles.join(","));
assert.ok(webFiles.includes("frontend-architecture.md") || webFiles.includes("frontend.md"), webFiles.join(","));
assert.ok(webFiles.includes("architecture.md"));
assert.ok(web.files.every((f) => f.verified_at && f.stale === false && f.reason));
assert.equal(web.gaps.length, 0);

const mac = selectReferences({
  project_description: "macOS menubar SwiftUI app that encrypts folders with Touch ID and Keychain",
});
const macFiles = mac.files.map((f) => f.file);
assert.ok(macFiles.includes("architecture.md"));
assert.ok(macFiles.includes("security.md"), macFiles.join(","));
assert.ok(!macFiles.includes("toolchain-ts.md"), macFiles.join(","));
assert.ok(macFiles.includes("apple-macos-swift.md"), macFiles.join(","));
assert.equal(mac.gaps.length, 0);
assert.ok(mac.files.every((f) => typeof f.stale === "boolean"));

const cli = selectReferences({ project_description: "CLI tool in Rust to batch rename files" });
const cliFiles = cli.files.map((f) => f.file);
assert.ok(cliFiles.includes("cli.md"), cliFiles.join(","));
assert.equal(cli.gaps.length, 0);

const ai = selectReferences({ project_description: "AI chatbot with RAG over my documents" });
assert.ok(ai.files.some((f) => f.file === "ai-llm.md"), ai.files.map((f) => f.file).join(","));

assert.equal(isStale("2026-11-16", new Date("2026-11-16T00:00:00")), false);
assert.equal(isStale("2025-11-17", new Date("2026-11-16T00:00:00")), false);
assert.equal(isStale("2025-11-15", new Date("2026-11-16T00:00:00")), true);
assert.equal(isStale(null), true);

const staleDir = mkdtempSync(join(tmpdir(), "inisiasi-refs-"));
try {
  writeFileSync(join(staleDir, "architecture.md"), "# Architecture\n\n> Terakhir diverifikasi: 2024-01-01\n\nBody.\n");
  writeFileSync(join(staleDir, "testing.md"), "# Testing\n\nNo header here, just body.\n");
  const prev = process.env.INISIASI_REFERENCES;
  process.env.INISIASI_REFERENCES = staleDir;
  const stale = selectReferences({ project_description: "any project" });
  if (prev === undefined) delete process.env.INISIASI_REFERENCES;
  else process.env.INISIASI_REFERENCES = prev;
  const byFile = Object.fromEntries(stale.files.map((f) => [f.file, f]));
  assert.equal(byFile["architecture.md"]?.verified_at, "2024-01-01");
  assert.equal(byFile["architecture.md"]?.stale, true);
  assert.equal(byFile["testing.md"]?.verified_at, null);
  assert.equal(byFile["testing.md"]?.stale, true);
} finally {
  rmSync(staleDir, { recursive: true, force: true });
}

// --- recommend_bundle: JS fixture ---
const bundle = recommendBundle({
  project_description: "React Vite TypeScript web app to track motorbike service history",
  root: jsApp,
  limit: 8,
});
assert.ok(bundle.description.length > 0);
assert.equal(bundle.plan?.ready, true);
assert.equal(bundle.stack?.language, "TypeScript");
assert.ok(bundle.references.files.some((f) => f.file === "toolchain-ts.md"));
assert.ok(bundle.skills.length > 0 && bundle.skills.length <= 8);
assert.ok(bundle.skills.every((s) => typeof s.installed === "boolean" && s.install_command));
assert.ok(Array.isArray(bundle.coverage_holes));
assert.ok(bundle.coverage_holes.every((h) => ["testing", "security", "design", "writing"].includes(h)));

// --- live fuu (read-only) ---
const fuuStack = detectStack(fuu);
assert.equal(fuuStack.missing_root, false);
assert.equal(fuuStack.docs.AGENTS.exists, true);
assert.equal(fuuStack.docs.PLAN.exists, true);
assert.equal(fuuStack.docs.PLAN.stub, false);
assert.equal(fuuStack.docs.ARCHITECTURE.stub, true);
assert.ok(fuuStack.hints.includes("Swift") || fuuStack.languages.includes("Swift"));
assert.ok(fuuStack.hints.includes("SwiftUI") || fuuStack.frameworks.includes("SwiftUI"));
assert.ok(fuuStack.hints.includes("macOS") || fuuStack.frameworks.includes("macOS"));
assert.ok(fuuStack.manifests.length === 0);

const fuuBundle = recommendBundle({ root: fuu, limit: 10 });
assert.equal(fuuBundle.plan?.ready, false);
assert.ok(fuuBundle.plan?.open_questions.length >= 1);
assert.ok(fuuBundle.references.files.some((f) => f.file === "apple-macos-swift.md"));
assert.ok(fuuBundle.references.files.some((f) => f.file === "security.md"));
assert.ok(fuuBundle.skills.length > 0);
assert.ok(fuuBundle.skills.some((s) => /swift|apple|macos|xcode/i.test(s.id)));
assert.ok(fuuBundle.skills.every((s) => typeof s.installed === "boolean"));
assert.ok(fuuBundle.coverage_holes.length >= 1);

console.log("OK: detect_stack, select_references, recommend_bundle");
console.log(JSON.stringify({
  js: { language: js.language, managers: js.package_managers, frameworks: js.frameworks, plan_ready: js.docs.PLAN.stub === false },
  web_refs: web.files.map((f) => f.file),
  mac_refs: { files: mac.files.map((f) => f.file), gaps: mac.gaps },
  js_bundle: { skills: bundle.skills.map((s) => `${s.id}${s.installed ? " (installed)" : ""}`), holes: bundle.coverage_holes },
  fuu: {
    language: fuuStack.language,
    languages: fuuStack.languages,
    frameworks: fuuStack.frameworks,
    hints: fuuStack.hints,
    docs: Object.fromEntries(Object.entries(fuuStack.docs).map(([k, v]) => [k, { exists: v.exists, stub: v.stub }])),
    plan_ready: fuuBundle.plan?.ready,
    refs: fuuBundle.references.files.map((f) => `${f.file}${f.stale ? " stale" : ""}`),
    gaps: fuuBundle.references.gaps,
    skills: fuuBundle.skills.map((s) => `${s.id} ${s.domain}${s.installed ? " installed" : ""}`),
    holes: fuuBundle.coverage_holes,
    description: fuuBundle.description,
  },
}, null, 2));
