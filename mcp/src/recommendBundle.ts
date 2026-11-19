import { recommendSkills, loadCatalog, type Prefer, type Skill } from "./catalog.js";
import { TOOL_KEYS, loadProfile } from "./drift.js";
import { detectStack, isSkillInstalled } from "./detectStack.js";
import { inspectPlan, type InspectPlanResult } from "./inspectPlan.js";
import { resolvePlanPath } from "./md.js";
import { selectReferences, type SelectReferencesResult } from "./selectReferences.js";
import type { DetectStackResult } from "./detectStack.js";

const COVERAGE = ["testing", "security", "design", "writing"] as const;

export type BundleSkill = ReturnType<typeof recommendSkills>[number] & { installed: boolean };

export type RecommendBundleResult = {
  description: string;
  plan: InspectPlanResult | null;
  stack: DetectStackResult | null;
  references: SelectReferencesResult;
  skills: BundleSkill[];
  coverage_holes: string[];
  selera_profile: string | null;
};

// Tool-role values from the owner's profile ("pnpm", "shadcn", "vitest") become words that boost matching skills.
function preferences(root: string): { prefer: Prefer[]; path: string | null } {
  const { path, data } = loadProfile(root);
  const prefer: Prefer[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (!TOOL_KEYS[key.split(".").at(-1)!] || typeof value !== "string") continue;
    for (const w of value.toLowerCase().split(/[,+]/)) if (w.trim()) prefer.push({ word: w.trim(), key });
  }
  return { prefer, path };
}

function deriveDescription(stack: DetectStackResult | null, plan: InspectPlanResult | null): string {
  const parts: string[] = [];
  if (stack?.language) parts.push(stack.language);
  if (stack?.frameworks.length) parts.push(stack.frameworks.join(", "));
  if (stack?.hints.length) parts.push(stack.hints.join(", "));
  if (plan?.facts_already_known.length) parts.push(plan.facts_already_known.map((f) => f.fact).join(" "));
  return parts.join(". ").trim();
}

export function recommendBundle(input: {
  project_description?: string;
  root?: string;
  plan_path?: string;
  limit?: number;
}, skills?: Skill[]): RecommendBundleResult {
  const stack = input.root ? detectStack(input.root) : null;
  const planPath = input.plan_path ?? (input.root ? resolvePlanPath(input.root) : undefined);
  const plan = planPath ? inspectPlan(planPath) : null;
  const description = (input.project_description ?? "").trim() || deriveDescription(stack, plan);
  const catalog = skills ?? loadCatalog();
  const limit = typeof input.limit === "number" && Number.isFinite(input.limit) ? input.limit : 10;
  const references = selectReferences({ project_description: description, plan_path: planPath, limit: 8 });
  // inisiasi is about building software, so the bundle stays in the tech scope; recommend_skills can still search everything.
  const { prefer, path: selera_profile } = preferences(input.root ?? process.cwd());
  const recs = description ? recommendSkills(catalog, description, limit, { scope: "tech", prefer }) : [];
  const withInstalled: BundleSkill[] = recs.map((s) => ({ ...s, installed: isSkillInstalled(s.id) || isSkillInstalled(s.name) }));
  const have = new Set(withInstalled.map((s) => s.domain));
  const coverage_holes = COVERAGE.filter((d) => !have.has(d));
  return { description, plan, stack, references, skills: withInstalled, coverage_holes, selera_profile };
}
