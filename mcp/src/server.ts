#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getSkill, listDomainSkills, listDomains, loadCatalog, recommendSkills, searchSkills } from "./catalog.js";
import { inspectPlan } from "./inspectPlan.js";
import { validateDocs } from "./validateDocs.js";
import { detectStack } from "./detectStack.js";
import { selectReferences } from "./selectReferences.js";
import { recommendBundle } from "./recommendBundle.js";

const READONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const limit = { type: "number", description: "Maximum skills to return (default 8, max 25)." };

// Names, descriptions and schemas mirror skill-issue.in's MCP so agents can swap between them.
const TOOLS = [
  {
    annotations: READONLY,
    name: "get_skill",
    description: "Fetch the full record for one skill by id, including its source link, install command, popularity signal, and whether the link has been verified. Ids come from recommend_skills, search_skills, or list_domain_skills.",
    inputSchema: { type: "object", properties: { id: { type: "string", description: "The skill id." } }, required: ["id"] },
  },
  {
    annotations: READONLY,
    name: "list_domain_skills",
    description: "List the skills in one domain, most popular first. Use list_domains to find valid domain slugs.",
    inputSchema: { type: "object", properties: { domain: { type: "string", description: "Domain slug, e.g. 'frontend'." }, limit }, required: ["domain"] },
  },
  {
    annotations: READONLY,
    name: "list_domains",
    description: "List every domain in the catalogue with how many skills it holds and the niches inside it. Cheap orientation call, use it first to see what kinds of agent skills exist before searching.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    annotations: READONLY,
    name: "recommend_skills",
    description: "Given a description of a project (its stack, domain, and what is being built), return the agent skills from the inisiasi catalogue most relevant to it, ranked, with install commands. Use this when you want to find skills that fit the codebase you are working in. Describe the project in plain language, e.g. 'Next.js dashboard using Tailwind and Supabase auth' or 'Unity 3D platformer'.",
    inputSchema: {
      type: "object",
      properties: {
        project_description: { type: "string", description: "Plain-language description of the project: frameworks, languages, domain, and what is being built." },
        limit,
      },
      required: ["project_description"],
    },
  },
  {
    annotations: READONLY,
    name: "search_skills",
    description: "Fuzzy-search the skill catalogue by keyword across skill names, use cases, creators, and niches. Optionally restrict to one domain. Use this when you already know what you are looking for; use recommend_skills when you want matches for a whole project.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword or phrase to search for." },
        domain: { type: "string", description: "Optional domain slug to filter by (see list_domains)." },
        limit,
      },
      required: ["query"],
    },
  },
  {
    annotations: READONLY,
    name: "inspect_plan",
    description: "Read a docs/PLAN.md (or a project root) and return whether it is ready to move on: present and missing sections, unresolved open questions, facts already known, and up to 5 questions to ask. Use this at the plan gate before proposing a stack. Does not write files.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to docs/PLAN.md or to the project root that contains it." },
        max_questions: { type: "number", description: "Maximum questions to return (default 5, max 10)." },
      },
      required: ["path"],
    },
  },
  {
    annotations: READONLY,
    name: "validate_docs",
    description: "Check a project root against the inisiasi doc templates: required ARCHITECTURE sections, TASKS 5 to 12 with a spike as task 1 and a verify check on each, no em dashes in PLAN/ARCHITECTURE/TASKS, worklog shape, and whether DESIGN.md and ARCHITECTURE are stubs. Read-only. Use this after writing the docs.",
    inputSchema: {
      type: "object",
      properties: {
        root: { type: "string", description: "Project root that contains docs/ and optionally AGENTS_WORKLOG.md." },
      },
      required: ["root"],
    },
  },
  {
    annotations: READONLY,
    name: "detect_stack",
    description: "Scan a project root for manifests (package.json, Package.swift, lockfiles, xcodeproj, and similar), inferred languages and frameworks, docs status (PLAN, ARCHITECTURE, TASKS, DESIGN, AGENTS), and skill ids already installed under ~/.agents/skills. Read-only. Use this at the detect step so the interview does not re-ask known facts.",
    inputSchema: {
      type: "object",
      properties: {
        root: { type: "string", description: "Project root to scan." },
      },
      required: ["root"],
    },
  },
  {
    annotations: READONLY,
    name: "select_references",
    description: "Pick a short reading list from the inisiasi SoT (skill/inisiasi/references/sot) for this project. Returns file names, a one-line reason, Last verified date, a stale flag (missing header or older than 12 months), and gaps such as a missing Apple/macOS SoT file. Read-only. Use this instead of loading all reference files.",
    inputSchema: {
      type: "object",
      properties: {
        project_description: { type: "string", description: "Plain-language description of the project." },
        plan_path: { type: "string", description: "Optional path to docs/PLAN.md or the project root, merged into the query." },
        limit: { type: "number", description: "Maximum files to return (default 8, max 8)." },
      },
    },
  },
  {
    annotations: READONLY,
    name: "recommend_bundle",
    description: "Single bootstrap context call: inspect_plan + detect_stack + select_references + recommend_skills, with installed flags and coverage holes (testing, security, design, writing). Provide a project_description and/or a project root. Read-only.",
    inputSchema: {
      type: "object",
      properties: {
        project_description: { type: "string", description: "Plain-language description. Optional if root is set; then it is derived from the stack and PLAN." },
        root: { type: "string", description: "Optional project root for detect_stack and, if plan_path is omitted, inspect_plan." },
        plan_path: { type: "string", description: "Optional path to PLAN.md. Defaults to docs/PLAN.md under root." },
        limit: { type: "number", description: "Maximum skills to return (default 10, max 25)." },
      },
    },
  },
];

const ok = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] });
const fail = (message: string) => ({ isError: true, content: [{ type: "text" as const, text: message }] });
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

const server = new Server({ name: "inisiasi", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const a = (req.params.arguments ?? {}) as Record<string, unknown>;
  const name = req.params.name;
  if (name === "inspect_plan") {
    const p = str(a.path);
    if (!p) return fail("path is required.");
    return ok(inspectPlan(p, a.max_questions as number));
  }
  if (name === "validate_docs") {
    const r = str(a.root);
    if (!r) return fail("root is required.");
    return ok(validateDocs(r));
  }
  if (name === "detect_stack") {
    const r = str(a.root);
    if (!r) return fail("root is required.");
    return ok(detectStack(r));
  }
  if (name === "select_references") {
    const d = str(a.project_description);
    const plan = str(a.plan_path);
    if (!d && !plan) return fail("project_description or plan_path is required.");
    return ok(selectReferences({ project_description: d, plan_path: plan, limit: a.limit as number }));
  }
  const skills = loadCatalog(); // re-read per call so catalog edits apply without restart
  if (name === "recommend_bundle") {
    const d = str(a.project_description);
    const root = str(a.root);
    if (!d && !root) return fail("project_description or root is required.");
    return ok(recommendBundle({ project_description: d, root, plan_path: str(a.plan_path), limit: a.limit as number }, skills));
  }
  switch (name) {
    case "get_skill": {
      const id = str(a.id);
      if (!id) return fail("id is required.");
      const s = getSkill(skills, id);
      return s ? ok(s) : fail(`No skill with id '${id}'. Use search_skills or recommend_skills to find ids.`);
    }
    case "list_domain_skills": {
      const domain = str(a.domain);
      if (!domain) return fail("domain is required.");
      const list = listDomainSkills(skills, domain, a.limit as number);
      return list.length ? ok(list) : fail(`Unknown domain '${domain}'. Valid: ${listDomains(skills).map((d) => d.domain).join(", ")}`);
    }
    case "list_domains":
      return ok(listDomains(skills));
    case "recommend_skills": {
      const d = str(a.project_description);
      if (!d) return fail("project_description is required.");
      return ok(recommendSkills(skills, d, a.limit as number));
    }
    case "search_skills": {
      const q = str(a.query);
      if (!q) return fail("query is required.");
      return ok(searchSkills(skills, q, str(a.domain), a.limit as number));
    }
    default:
      return fail(`Unknown tool '${req.params.name}'.`);
  }
});

await server.connect(new StdioServerTransport());
