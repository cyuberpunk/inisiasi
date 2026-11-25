// Direct tests of inspectPlan and validateDocs. Uses temp fixtures plus the live fuu repo (read-only).
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectPlan } from "../dist/inspectPlan.js";
import { validateDocs } from "../dist/validateDocs.js";

const dir = mkdtempSync(join(tmpdir(), "inisiasi-docs-"));
const write = (root, rel, body) => {
  const path = join(root, rel);
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, body);
  return path;
};

const readyPlan = `# Plan

## Goals
A personal CLI that greets the owner by name.

## MVP
- Print a greeting from a config file.

## Constraints
- Offline, no account, TypeScript.

## Non-goals
- No web UI and no sync.

## Open questions
- Notarization and signed distribution: later, not v1.
`;

const openPlan = `# Plan

## Goals
Personal macOS app to lock folders.

## MVP (v1)
- Menubar and a required Finder extension.

## Constraints
- Minimum macOS 15. Swift and SwiftUI.

## Non-goals
- No App Store and no auto-lock in v1.

## Open questions
- Which folders should v1 lock? Not answered yet.
- How should the passphrase be stored in Keychain?
- Notarization: later, not v1.
`;

const validArch = `# Architecture

## Summary
Personal CLI greeter. Single binary, no network.

## Stack
| Layer | Choice | Why | Rejected |
|---|---|---|---|
| Language | TypeScript | Owner already uses it | Python: slower startup for a CLI |
| UI | CLI | Scope is a greeting | Web UI: non-goal |
| Storage | Local JSON | Enough for a name | SQLite: too much |
| Build/CI | Node test script | Tiny surface | Full CI matrix: later |

## Architecture
One package: a CLI entry and a config reader.

## System design
- **Data model:** a Config with a display name.
- **Data flow:** read config, print greeting, exit.
- **Storage:** config.json next to the binary.
- **Trust boundaries:** config is local and owner-owned.
- **Failure modes:** missing config prints a default and exits 0.
- **Scale:** one user.

## Agent skills
| Skill | Why | Install | Verified |
|---|---|---|---|
| typescript | Language default | npx skills add example/x -g -s typescript | true |

\`\`\`sh
npx skills add example/x -g -s typescript
\`\`\`

## Rejected alternatives
- Python: owner is already in TypeScript.

## Risks
- **Riskiest assumption:** config path resolution on first run → spike: write and read a temp config in a test.
`;

const validTasks = `# Tasks

- [ ] 1. Spike: config path resolution → verify: test writes and reads a temp config
- [ ] 2. Scaffold the CLI package → verify: \`node dist/cli.js --help\` prints usage
- [ ] 3. Read config.json → verify: missing file uses the default name
- [ ] 4. Print the greeting → verify: output contains the name from config
- [ ] 5. Add a unit test for the greeting → verify: tests pass
`;

const validLog = `# Agent Worklogs

## Entries

## 2026-11-16 12:00:00 WIB - test - inisiasi
- **Status:** \`completed\`
- **Update:** Wrote architecture and tasks.
- **Files:** \`docs/ARCHITECTURE.md\`, \`docs/TASKS.md\`
- **Validation:** \`validate_docs\` ok
- **Next:** Task 1 spike.
`;

try {
  // missing file
  const missing = inspectPlan(join(dir, "no-such-plan.md"));
  assert.equal(missing.ready, false);
  assert.equal(missing.missing_file, true);
  assert.deepEqual(missing.sections_missing, ["Goals", "MVP", "Constraints", "Non-goals"]);
  assert.equal(missing.questions_to_ask.length, 5);

  // title-only
  const stubRoot = join(dir, "stub");
  write(stubRoot, "docs/PLAN.md", "# Plan\n");
  const stub = inspectPlan(stubRoot);
  assert.equal(stub.ready, false);
  assert.equal(stub.title_only, true);
  assert.ok(stub.sections_missing.includes("Goals"));

  // missing sections
  write(join(dir, "partial"), "docs/PLAN.md", "# Plan\n\n## Goals\nA thing.\n");
  const partial = inspectPlan(join(dir, "partial"));
  assert.equal(partial.ready, false);
  assert.deepEqual(partial.sections_present, ["Goals"]);
  assert.ok(partial.sections_missing.includes("MVP"));
  assert.ok(partial.questions_to_ask.length >= 1 && partial.questions_to_ask.length <= 5);

  // open questions: two open, one deferred
  write(join(dir, "open"), "docs/PLAN.md", openPlan);
  const open = inspectPlan(join(dir, "open"), 5);
  assert.equal(open.ready, false);
  assert.equal(open.title_only, false);
  assert.deepEqual(open.sections_missing, []);
  assert.equal(open.open_questions.length, 2);
  assert.equal(open.deferred_questions.length, 1);
  assert.ok(open.open_questions[0].includes("Which folders"));
  assert.ok(open.deferred_questions[0].toLowerCase().includes("notarization"));
  assert.equal(open.questions_to_ask.length, 3);
  assert.ok(!open.questions_to_ask[0].match(/not answered yet/i));
  assert.equal(inspectPlan(join(dir, "open"), 1).questions_to_ask.length, 1);

  // ready plan, deferred only
  const readyRoot = join(dir, "ready");
  write(readyRoot, "docs/PLAN.md", readyPlan);
  write(readyRoot, "docs/ARCHITECTURE.md", validArch);
  write(readyRoot, "docs/TASKS.md", validTasks);
  write(readyRoot, "docs/DESIGN.md", "# Design\n");
  write(readyRoot, "AGENTS_WORKLOG.md", validLog);
  const ready = inspectPlan(readyRoot);
  assert.equal(ready.ready, true);
  assert.equal(ready.open_questions.length, 0);
  assert.equal(ready.deferred_questions.length, 1);
  assert.ok(ready.facts_already_known.some((f) => f.section === "Goals"));
  assert.deepEqual(ready.non_negotiables, []);
  assert.ok(ready.questions_to_ask.some((q) => /non-negotiables/i.test(q)));

  // Non-negotiables: optional, normalized from "## Larangan", never affects ready.
  const nnRoot = join(dir, "nn");
  write(nnRoot, "docs/PLAN.md", readyPlan + "\n## Larangan\n- Never sync to a server.\n- Never log secrets.\n");
  const nn = inspectPlan(nnRoot);
  assert.equal(nn.ready, true);
  assert.equal(nn.non_negotiables.length, 2);
  assert.ok(nn.sections_present.includes("Non-negotiables"));
  assert.ok(!nn.questions_to_ask.some((q) => /non-negotiables/i.test(q)));

  const nnDoc = join(dir, "nn-docs");
  write(nnDoc, "docs/PLAN.md", readyPlan + "\n## Non-negotiables\n- Never sync.\n");
  write(nnDoc, "docs/ARCHITECTURE.md", validArch);
  write(nnDoc, "docs/TASKS.md", validTasks);
  write(nnDoc, "AGENTS_WORKLOG.md", validLog);
  const noNN = validateDocs(nnDoc);
  assert.ok(noNN.errors.some((e) => e.includes("missing '## Non-negotiables'")), noNN.errors.join("\n"));
  write(nnDoc, "docs/ARCHITECTURE.md", validArch + "\n## Non-negotiables\n- Never sync.\n");
  const hasNN = validateDocs(nnDoc);
  assert.ok(!hasNN.errors.some((e) => /Non-negotiables/.test(e)), hasNN.errors.join("\n"));

  const valid = validateDocs(readyRoot);
  assert.equal(valid.ok, true, valid.errors.join("\n"));
  assert.equal(valid.architecture_stub, false);
  assert.equal(valid.task_count, 5);
  assert.equal(valid.design_md.exists, true);
  assert.equal(valid.design_md.stub, true);

  // short tasks, no spike, no verify
  const bad = join(dir, "bad");
  write(bad, "docs/ARCHITECTURE.md", validArch);
  write(bad, "docs/TASKS.md", `# Tasks\n\n- [ ] 1. Scaffold the app\n- [ ] 2. Add a button\n- [ ] 3. Ship it\n`);
  write(bad, "AGENTS_WORKLOG.md", validLog);
  const badV = validateDocs(bad);
  assert.equal(badV.ok, false);
  assert.ok(badV.errors.some((e) => /5 to 12/.test(e)));
  assert.ok(badV.errors.some((e) => /spike/i.test(e)));
  assert.ok(badV.errors.some((e) => /verify/i.test(e)));

  // em dash in ARCHITECTURE
  const dash = join(dir, "dash");
  write(dash, "docs/ARCHITECTURE.md", validArch.replace("Single binary, no network.", "Single binary \u2014 no network."));
  write(dash, "docs/TASKS.md", validTasks);
  write(dash, "AGENTS_WORKLOG.md", validLog);
  const dashV = validateDocs(dash);
  assert.equal(dashV.ok, false);
  assert.ok(dashV.errors.some((e) => /em dash or en dash/.test(e)));

  // missing root
  const gone = validateDocs(join(dir, "no-root"));
  assert.equal(gone.ok, false);
  assert.ok(gone.errors[0].includes("not found"));

  // Live fuu fixture (read-only). Assertions stay loose so a later PLAN update does not brick the suite.
  const fuu = join(process.env.HOME, "project/fuu");
  const fuuPlan = inspectPlan(fuu);
  assert.equal(fuuPlan.missing_file, false);
  assert.ok(fuuPlan.sections_present.includes("Goals"));
  assert.ok(fuuPlan.sections_present.includes("MVP"));
  assert.ok(fuuPlan.facts_already_known.length >= 3);
  if (fuuPlan.open_questions.some((q) => /not answered yet/i.test(q))) {
    assert.equal(fuuPlan.ready, false);
    assert.ok(fuuPlan.questions_to_ask.length >= 1);
  }
  const fuuDocs = validateDocs(fuu);
  assert.equal(fuuDocs.design_md.exists, true);
  if (fuuDocs.architecture_stub) {
    assert.equal(fuuDocs.ok, false);
    assert.ok(fuuDocs.errors.some((e) => /ARCHITECTURE/.test(e)));
  }
  // Worklog uses the kura fields; do not fail the live fixture on historical em dashes in worklog headings.
  assert.ok(fuuDocs.warnings.every((w) => !/em dash/.test(w)));

  console.log("OK: inspect_plan and validate_docs fixtures plus live fuu");
  console.log(JSON.stringify({
    ready: { ready: ready.ready, deferred: ready.deferred_questions.length },
    open: { ready: open.ready, open: open.open_questions.length, deferred: open.deferred_questions.length, ask: open.questions_to_ask },
    fuu: { ready: fuuPlan.ready, open: fuuPlan.open_questions, ask: fuuPlan.questions_to_ask, sections: fuuPlan.sections_present },
    fuu_docs: { ok: fuuDocs.ok, errors: fuuDocs.errors, warnings: fuuDocs.warnings, stub: fuuDocs.architecture_stub, tasks: fuuDocs.task_count, design: fuuDocs.design_md },
  }, null, 2));
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// placeholder open questions: "None" and friends mean the section is empty.
for (const v of ["- None", "- None.", "- Tidak ada", "- (none)", "None", "- n/a"]) {
  const d = mkdtempSync(join(tmpdir(), "plan-none-"));
  try {
    mkdirSync(join(d, "docs"));
    writeFileSync(join(d, "docs/PLAN.md"), "# Plan\n\n## Goals\nx\n\n## MVP\n- a\n\n## Constraints\n- b\n\n## Non-goals\n- c\n\n## Open questions\n" + v + "\n");
    const r = inspectPlan(d);
    assert.deepEqual(r.open_questions, [], "placeholder counted as question: " + v);
    assert.equal(r.ready, true, "not ready with placeholder: " + v);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
console.log("OK: placeholder open questions ignored");
