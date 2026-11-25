import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { dashHits, isStubMarkdown, readText, splitSections, resolveExisting } from "./md.js";

export type DesignInfo = { exists: boolean; stub: boolean; size: number; path?: string };

export type ValidateDocsResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  architecture_stub: boolean;
  task_count: number;
  design_md: DesignInfo;
};

const ARCH_REQUIRED = ["Summary", "Stack", "Architecture", "System design", "Agent skills", "Rejected alternatives", "Risks"];
const DESIGN_LABELS = ["Data model", "Data flow", "Storage", "Trust boundaries", "Failure modes", "Scale"];
const WORKLOG_FIELDS = ["Status", "Update", "Files", "Validation", "Next"];

function normalizeArch(title: string): string | undefined {
  const t = title.toLowerCase();
  for (const name of ARCH_REQUIRED) if (t === name.toLowerCase()) return name;
  if (t === "rejected alternative") return "Rejected alternatives";
  if (t === "agent skill") return "Agent skills";
  if (t === "risk") return "Risks";
  return undefined;
}

function sectionMap(md: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const s of splitSections(md)) {
    const name = normalizeArch(s.title);
    if (name) map.set(name, s.body);
  }
  return map;
}

function isSepOrHeader(cells: string[]): boolean {
  if (cells.every((c) => /^:?-{3,}:?$/.test(c))) return true;
  const headers = ["layer", "choice", "why", "rejected"];
  return cells.length > 0 && cells.every((c) => headers.includes(c.toLowerCase()) || !c);
}

function stackHasChoice(body: string): boolean {
  for (const line of body.split(/\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 2 || isSepOrHeader(cells)) continue;
    const choice = cells[1] ?? "";
    if (choice && choice !== "-" && choice.toLowerCase() !== "choice") return true;
  }
  return false;
}

function parseTasks(md: string): { text: string; hasVerify: boolean; isSpike: boolean }[] {
  const tasks: { text: string; body: string }[] = [];
  let cur: { text: string; body: string } | undefined;
  for (const line of md.split(/\r?\n/)) {
    const m = /^\s*[-*]\s+\[(?: |x|X)\]\s+(?:\d+\.\s+)?(.+)$/.exec(line);
    if (m) {
      if (cur) tasks.push(cur);
      cur = { text: m[1].trim(), body: m[1] };
    } else if (cur) cur.body += "\n" + line;
  }
  if (cur) tasks.push(cur);
  return tasks.map((t) => ({
    text: t.text,
    hasVerify: /verify\s*:/i.test(t.body) || /(?:\u2192|->)\s*verify\b/i.test(t.body),
    isSpike: /^\s*spike\b/i.test(t.text) || /\bspike\s*:/i.test(t.text),
  }));
}

function designInfo(root: string): DesignInfo {
  const path = join(root, "docs", "DESIGN.md");
  if (!existsSync(path) || !statSync(path).isFile()) return { exists: false, stub: true, size: 0 };
  const md = readText(path) ?? "";
  return { exists: true, stub: isStubMarkdown(md), size: statSync(path).size, path };
}

function stripFences(md: string): string {
  return md.replace(/```[\s\S]*?```/g, "");
}

function validateWorklog(root: string, errors: string[], warnings: string[]): void {
  const typo = join(root, "AGENTS_WORKLOGS.md");
  const path = join(root, "AGENTS_WORKLOG.md");
  if (!existsSync(path)) {
    if (existsSync(typo)) warnings.push("Found AGENTS_WORKLOGS.md; expected AGENTS_WORKLOG.md");
    else warnings.push("AGENTS_WORKLOG.md is missing");
    return;
  }
  const raw = readText(path) ?? "";
  const body = stripFences(raw);
  const entryRe = /^##\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\b.*)$/gm;
  const entries: { heading: string; start: number; date: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(body))) {
    entries.push({ heading: m[1], start: m.index, date: m[1].slice(0, 19) });
  }
  if (!entries.length) {
    warnings.push("AGENTS_WORKLOG.md has no dated entries");
    return;
  }
  const dates = entries.map((e) => e.date);
  if (dates[0] !== [...dates].sort().reverse()[0]) {
    warnings.push("AGENTS_WORKLOG.md entries are not newest first");
  }
  const first = entries[0];
  const end = entries[1]?.start ?? body.length;
  const block = body.slice(first.start, end);
  for (const field of WORKLOG_FIELDS) {
    if (!new RegExp(`^\\s*[-*]\\s+\\*\\*${field}:\\*\\*`, "m").test(block)) {
      errors.push(`Latest worklog entry is missing **${field}:**`);
    }
  }
}

export function validateDocs(root: string): ValidateDocsResult {
  const abs = resolveExisting(root);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!existsSync(abs)) {
    return {
      ok: false,
      errors: [`Project root not found: ${abs}`],
      warnings: [],
      architecture_stub: true,
      task_count: 0,
      design_md: { exists: false, stub: true, size: 0 },
    };
  }

  const archPath = join(abs, "docs", "ARCHITECTURE.md");
  const tasksPath = join(abs, "docs", "TASKS.md");
  const planPath = join(abs, "docs", "PLAN.md");
  const archMd = readText(archPath);
  const tasksMd = readText(tasksPath);
  const planMd = readText(planPath);

  if (archMd === undefined) errors.push("docs/ARCHITECTURE.md is missing");
  if (tasksMd === undefined) errors.push("docs/TASKS.md is missing");

  const architectureStub = isStubMarkdown(archMd) || !stackHasChoice(sectionMap(archMd ?? "").get("Stack") ?? "");
  if (archMd !== undefined && architectureStub) {
    errors.push("docs/ARCHITECTURE.md is a stub or has no Stack choice (expected a '## Stack' section with a table: | Layer | Choice | Why | Rejected |)");
  }

  if (archMd !== undefined && !architectureStub) {
    const map = sectionMap(archMd);
    for (const name of ARCH_REQUIRED) {
      if (!map.has(name) || !map.get(name)!.trim()) errors.push(`ARCHITECTURE.md missing section: ${name}`);
    }
    const sys = map.get("System design") ?? "";
    for (const label of DESIGN_LABELS) {
      const re = new RegExp(label.replace(" ", "\\s+"), "i");
      if (!re.test(sys)) errors.push(`System design is missing ${label}`);
    }
  }

  if (planMd !== undefined) {
    const planHasRules = splitSections(planMd).some((s) => /^non[-\s]?negotiables?$/i.test(s.title.trim()) && s.body.trim().length > 0);
    const archHasRules = archMd !== undefined && splitSections(archMd).some((s) => /^non[-\s]?negotiables?$/i.test(s.title.trim()));
    if (planHasRules && !archHasRules) errors.push("docs/ARCHITECTURE.md is missing '## Non-negotiables' (PLAN.md lists rules the build must never break)");
  }

  const tasks = parseTasks(tasksMd ?? "");
  const taskCount = tasks.length;
  if (tasksMd !== undefined) {
    if (isStubMarkdown(tasksMd) || taskCount === 0) errors.push("docs/TASKS.md is a stub or has no checklist tasks");
    else {
      if (taskCount < 5 || taskCount > 12) errors.push(`TASKS.md must have 5 to 12 tasks, found ${taskCount}`);
      if (tasks[0] && !tasks[0].isSpike) errors.push("Task 1 must be the risk spike");
      const missingVerify = tasks.flatMap((t, i) => (t.hasVerify ? [] : [String(i + 1)]));
      if (missingVerify.length) errors.push(`Tasks missing a verify check: ${missingVerify.join(", ")}`);
    }
  }

  for (const [md, file] of [
    [planMd, "docs/PLAN.md"],
    [archMd, "docs/ARCHITECTURE.md"],
    [tasksMd, "docs/TASKS.md"],
  ] as const) {
    if (md) errors.push(...dashHits(md, file));
  }

  validateWorklog(abs, errors, warnings);
  const design = designInfo(abs);

  return { ok: errors.length === 0, errors, warnings, architecture_stub: architectureStub, task_count: taskCount, design_md: design };
}
