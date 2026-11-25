import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCatalog, recommendSkills } from "../dist/catalog.js";
import { recommendBundle } from "../dist/recommendBundle.js";

const skills = loadCatalog();

// scope: a research request finds deep-research in general scope and never in tech scope
const general = recommendSkills(skills, "deep research a topic thoroughly", 5, { scope: "general" }).map((s) => s.id);
assert.ok(general.includes("deep-research"), `deep-research missing from general scope: ${general}`);
const tech = recommendSkills(skills, "deep research a topic thoroughly", 8, { scope: "tech" });
assert.ok(tech.every((s) => s.scope === "tech"), "tech scope returned a general skill");
const hyphen = recommendSkills(skills, "react-native app with expo", 5);
assert.ok(hyphen.some((s) => s.matched.includes("react-native")), `hyphenated query lost the react-native tag: ${JSON.stringify(hyphen.map((s) => s.matched))}`);
console.log("OK: scope filter");

// unverified entries are never recommended, even when their words match exactly
// the catalog may hold no unverified entry, so add a synthetic one that matches its own words exactly
const flagged = [{ ...skills[0], id: "synthetic-unverified", name: "synthetic-unverified", tags: ["synthetic", "unverified"], use_cases: ["synthetic unverified"], verified: false, note: "test" }];
const withFlagged = [...skills, ...flagged];
for (const s of flagged) {
  const ids = recommendSkills(withFlagged, `${s.name} ${s.tags.join(" ")}`, 25).map((r) => r.id);
  assert.ok(!ids.includes(s.id), `unverified ${s.id} was recommended`);
}
console.log("OK: unverified entries excluded");

// selera: a recorded tool choice boosts a matching skill and labels why; no profile, no label
const dir = mkdtempSync(join(tmpdir(), "selera-"));
const profile = join(dir, "profile.md");
writeFileSync(profile, "# selera\n\n## General\n- packageManager: pnpm\n\n## Web\n- ui: shadcn\n");
const desc = "React dashboard with shadcn components and Tailwind";
process.env.SELERA_CONFIG = join(dir, "missing.json");
const plain = recommendBundle({ project_description: desc, root: dir }, skills).skills;
assert.ok(plain.every((s) => !s.selera), "label appeared without a profile");
process.env.SELERA_CONFIG = profile;
const steered = recommendBundle({ project_description: desc, root: dir }, skills);
const hit = steered.skills.find((s) => s.id === "shadcn");
assert.ok(hit?.selera?.includes("fe.ui=shadcn"), `shadcn not labeled: ${JSON.stringify(hit)}`);
assert.equal(steered.selera_profile, profile);
assert.ok(steered.skills.every((s) => s.scope === "tech"), "bundle returned a general-scope skill");
const docs = recommendBundle({ project_description: "deep research a topic thoroughly", root: dir }, skills).skills;
assert.ok(docs.every((s) => s.scope === "tech") && !docs.some((s) => s.id === "deep-research"), "bundle leaked a general-scope skill");
console.log("OK: selera boost and tech-only bundle");
