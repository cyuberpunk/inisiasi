#!/usr/bin/env node
// Fallback when the MCP server is not registered: same queries, printed as JSON.
import { getSkill, listDomainSkills, listDomains, loadCatalog, recommendSkills, searchSkills } from "./catalog.js";
import { inspectPlan } from "./inspectPlan.js";
import { validateDocs } from "./validateDocs.js";
import { detectStack } from "./detectStack.js";
import { selectReferences } from "./selectReferences.js";
import { recommendBundle } from "./recommendBundle.js";

const [cmd, ...rest] = process.argv.slice(2);
const usage = "usage: inisiasi <domains | domain <slug> | recommend <description> | search <query> | get <id> | inspect_plan <path> | validate_docs <root> | detect_stack <root> | select_references [--plan <path>] <description> | recommend_bundle [--root <path>] [--plan <path>] [--limit <n>] <description>>";

function flags(args: string[]): { opts: Record<string, string>; rest: string[] } {
  const opts: Record<string, string> = {};
  const out: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a.startsWith("--") && args[i + 1] && !args[i + 1]!.startsWith("--")) {
      opts[a.slice(2)] = args[++i]!;
    } else out.push(a);
  }
  return { opts, rest: out };
}

if (cmd === "inspect_plan") {
  if (!rest[0]) { console.error(usage); process.exit(1); }
  console.log(JSON.stringify(inspectPlan(rest[0], rest[1] ? Number(rest[1]) : undefined), null, 2));
} else if (cmd === "validate_docs") {
  if (!rest[0]) { console.error(usage); process.exit(1); }
  console.log(JSON.stringify(validateDocs(rest[0]), null, 2));
} else if (cmd === "detect_stack") {
  if (!rest[0]) { console.error(usage); process.exit(1); }
  console.log(JSON.stringify(detectStack(rest[0]), null, 2));
} else if (cmd === "select_references") {
  const { opts, rest: desc } = flags(rest);
  const project_description = desc.join(" ").trim();
  if (!project_description && !opts.plan) { console.error(usage); process.exit(1); }
  console.log(JSON.stringify(selectReferences({ project_description, plan_path: opts.plan, limit: opts.limit ? Number(opts.limit) : undefined }), null, 2));
} else if (cmd === "recommend_bundle") {
  const { opts, rest: desc } = flags(rest);
  const project_description = desc.join(" ").trim();
  if (!project_description && !opts.root) { console.error(usage); process.exit(1); }
  console.log(JSON.stringify(recommendBundle({
    project_description: project_description || undefined,
    root: opts.root,
    plan_path: opts.plan,
    limit: opts.limit ? Number(opts.limit) : undefined,
  }), null, 2));
} else {
  const skills = loadCatalog();
  const arg = rest.join(" ");
  const out: Record<string, () => unknown> = {
    domains: () => listDomains(skills),
    domain: () => listDomainSkills(skills, rest[0]),
    recommend: () => recommendSkills(skills, arg),
    search: () => searchSkills(skills, arg),
    get: () => getSkill(skills, rest[0]) ?? null,
  };
  if (!cmd || !out[cmd]) {
    console.error(usage);
    process.exit(1);
  }
  console.log(JSON.stringify(out[cmd](), null, 2));
}
