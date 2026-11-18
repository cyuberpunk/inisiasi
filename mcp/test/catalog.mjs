import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCatalog, recommendSkills } from "../dist/catalog.js";
import { recommendBundle } from "../dist/recommendBundle.js";

const skills = loadCatalog();

// scope: a document request finds docx in general scope and never in tech scope
const general = recommendSkills(skills, "write a Word docx report", 5, { scope: "general" }).map((s) => s.id);
assert.ok(general.includes("docx"), `docx missing from general scope: ${general}`);
const tech = recommendSkills(skills, "write a Word docx report", 8, { scope: "tech" });
assert.ok(tech.every((s) => s.domain !== "document"), "tech scope returned a document skill");
console.log("OK: scope filter");

// unverified entries are never recommended, even when their words match exactly
const flagged = skills.filter((s) => s.verified === false);
assert.ok(flagged.length > 0, "expected flagged entries in the catalog");
for (const s of flagged.slice(0, 10)) {
  const ids = recommendSkills(skills, `${s.name} ${s.tags.join(" ")}`, 25).map((r) => r.id);
  assert.ok(!ids.includes(s.id), `unverified ${s.id} was recommended`);
}
console.log("OK: unverified entries excluded");

// selera: a recorded tool choice boosts a matching skill and labels why; no profile, no label
const dir = mkdtempSync(join(tmpdir(), "selera-"));
const profile = join(dir, "profile.json");
writeFileSync(profile, JSON.stringify({ "fe.ui": "shadcn", packageManager: "pnpm" }));
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
const docs = recommendBundle({ project_description: "write a Word docx report and a pdf", root: dir }, skills).skills;
assert.ok(docs.every((s) => s.scope === "tech") && !docs.some((s) => s.id === "docx"), "bundle leaked a general-scope skill");
console.log("OK: selera boost and tech-only bundle");
