import { existsSync } from "node:fs";
import { firstFact, isEmptyBody, listItems, readText, resolvePlanPath, splitSections } from "./md.js";

export type PlanFact = { section: string; fact: string };

export type InspectPlanResult = {
  ready: boolean;
  path: string;
  title_only: boolean;
  missing_file: boolean;
  sections_present: string[];
  sections_missing: string[];
  open_questions: string[];
  deferred_questions: string[];
  facts_already_known: PlanFact[];
  questions_to_ask: string[];
};

const REQUIRED = ["Goals", "MVP", "Constraints", "Non-goals"] as const;

const INTERVIEW: { need: (s: Set<string>, text: string) => boolean; q: string }[] = [
  { need: (s) => !s.has("Goals") || !s.has("MVP"), q: "What does it do and for whom? What is in the MVP?" },
  { need: (_s, text) => !/\b(web|macos|ios|android|mobile|cli|api|linux|windows|desktop)\b/i.test(text), q: "Platform and targets (web, mobile, macOS, CLI, API)?" },
  { need: (s, text) => !s.has("Goals") || !/\b(personal|solo|sold|team|owner|myself|sendiri|jual)\b/i.test(text), q: "Solo/personal, team, or sold? Scale and budget?" },
  { need: (s) => !s.has("Constraints"), q: "Hard constraints: offline, privacy, existing code, languages you know?" },
  { need: (s) => !s.has("Non-goals"), q: "What is out of scope?" },
];

const DEFERRED = /\b(later,\s+not\s+v1|out of v1|out of scope|deferred|resolved:|decided:|n\/a|won'?t do in v1)\b/i;
const UNANSWERED = /\bnot answered yet\b/i;

function normalizeTitle(title: string): string | undefined {
  const t = title.toLowerCase();
  if (/^goals?$/.test(t)) return "Goals";
  if (/^mvp\b/.test(t)) return "MVP";
  if (/^constraints?$/.test(t)) return "Constraints";
  if (/^non[-\s]?goals?$/.test(t)) return "Non-goals";
  if (/^open questions?$/.test(t)) return "Open questions";
  return undefined;
}

function clampMax(n: unknown): number {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : 5;
  return Math.min(10, Math.max(1, v));
}

function classifyQuestions(items: string[]): { open: string[]; deferred: string[] } {
  const open: string[] = [];
  const deferred: string[] = [];
  for (const item of items) {
    if (UNANSWERED.test(item) || !DEFERRED.test(item)) open.push(item);
    else deferred.push(item);
  }
  return { open, deferred };
}

function cleanQuestion(item: string): string {
  return item.replace(/\s*Not answered yet\.?\s*$/i, "").replace(/\s+/g, " ").trim();
}

export function inspectPlan(path: string, maxQuestions?: number): InspectPlanResult {
  const planPath = resolvePlanPath(path);
  const max = clampMax(maxQuestions);
  const empty = (extra: Partial<InspectPlanResult> = {}): InspectPlanResult => ({
    ready: false,
    path: planPath,
    title_only: true,
    missing_file: true,
    sections_present: [],
    sections_missing: [...REQUIRED],
    open_questions: [],
    deferred_questions: [],
    facts_already_known: [],
    questions_to_ask: INTERVIEW.map((i) => i.q).slice(0, max),
    ...extra,
  });

  const md = readText(planPath);
  if (md === undefined || !existsSync(planPath)) return empty();

  const sections = splitSections(md);
  const byName = new Map<string, string>();
  for (const s of sections) {
    const name = normalizeTitle(s.title);
    if (!name) continue;
    if (!byName.has(name) || (isEmptyBody(byName.get(name)!) && !isEmptyBody(s.body))) {
      byName.set(name, s.body);
    }
  }

  const present = REQUIRED.filter((n) => byName.has(n) && !isEmptyBody(byName.get(n)!));
  const missing = REQUIRED.filter((n) => !present.includes(n));
  const isTitleOnly = !sections.some((s) => !isEmptyBody(s.body));

  // "None", "Tidak ada", "(none)" mean the section is empty, not that a question is open.
  const NONE = /^\(?\s*(none|none yet|n\/a|na|nothing|tidak ada|belum ada|kosong|-)\s*\.?\s*\)?$/i;
  const rawItems = listItems(byName.get("Open questions") ?? "").filter((q) => !NONE.test(q.trim()));
  const { open, deferred } = classifyQuestions(rawItems);

  const facts: PlanFact[] = present.map((section) => ({ section, fact: firstFact(byName.get(section)!) }));
  const text = [md].join("\n");
  const presentSet = new Set(present);

  const questions: string[] = [];
  const seen = new Set<string>();
  const push = (q: string) => {
    const k = q.toLowerCase();
    if (!q || seen.has(k) || questions.length >= max) return;
    seen.add(k);
    questions.push(q);
  };
  for (const q of open) push(cleanQuestion(q));
  for (const row of INTERVIEW) if (row.need(presentSet, text)) push(row.q);

  const ready = missing.length === 0 && open.length === 0 && !isTitleOnly;

  return {
    ready,
    path: planPath,
    title_only: isTitleOnly,
    missing_file: false,
    sections_present: [...present, ...(byName.has("Open questions") ? ["Open questions"] as const : [])],
    sections_missing: missing,
    open_questions: open,
    deferred_questions: deferred,
    facts_already_known: facts,
    questions_to_ask: questions,
  };
}
