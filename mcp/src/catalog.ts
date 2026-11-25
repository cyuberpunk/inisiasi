import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Fuse from "fuse.js";

export type Skill = {
  id: string;
  name: string;
  domain: string;
  niche: string;
  creator: string;
  use_cases: string[];
  tags: string[];
  source_url: string;
  install_command: string;
  popularity: number;
  verified: boolean;
  tier?: "main" | "support";
  unscored?: boolean;
  // "tech" skills help build software; "general" ones cover writing, research, productivity and the like.
  scope?: Scope;
  last_pushed?: string;
  note?: string;
  ui_skills_count?: number;
};

export type Scope = "tech" | "general";
export type Prefer = { word: string; key: string };

export type Domain = { domain: string; skill_count: number; niches: string[] };

const DEFAULT_PATH = fileURLToPath(new URL("../catalog.json", import.meta.url));

export function loadCatalog(path = process.env.INISIASI_CATALOG ?? DEFAULT_PATH): Skill[] {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(raw?.skills)) throw new Error(`catalog at ${path} has no "skills" array`);
  return raw.skills as Skill[];
}

export const clampLimit = (limit: unknown) =>
  Math.min(25, Math.max(1, Math.floor(typeof limit === "number" && Number.isFinite(limit) ? limit : 8)));

const byPopularity = (a: Skill, b: Skill) => b.popularity - a.popularity;

const STOP = new Set("a an and app apps the of for with to in on using use build building built is it my our that this from by or as".split(" "));
// Keeps "next.js" and adds "nextjs"; trims sentence dots ("supabase." -> "supabase").
const tokens = (s: string) =>
  s.toLowerCase().split(/[^a-z0-9+#.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .flatMap((t) => (t.includes(".") ? [t, t.replace(/\./g, "")] : [t]))
    .filter((t) => t.length > 1 && !STOP.has(t));

export function listDomains(skills: Skill[]): Domain[] {
  const map = new Map<string, Set<string>>();
  const counts = new Map<string, number>();
  for (const s of skills) {
    if (!map.has(s.domain)) map.set(s.domain, new Set());
    map.get(s.domain)!.add(s.niche);
    counts.set(s.domain, (counts.get(s.domain) ?? 0) + 1);
  }
  return [...map].map(([domain, niches]) => ({ domain, skill_count: counts.get(domain)!, niches: [...niches].sort() }))
    .sort((a, b) => b.skill_count - a.skill_count || a.domain.localeCompare(b.domain));
}

export const getSkill = (skills: Skill[], id: string) => skills.find((s) => s.id === id);

export const listDomainSkills = (skills: Skill[], domain: string, limit?: number) =>
  skills.filter((s) => s.domain === domain).sort(byPopularity).slice(0, clampLimit(limit));

// Words that appear in almost every description carry no signal, and a lone generic tag hit
// like "cli" or "api" pulls in unrelated skills, so both are ignored unless something specific matches.
const GENERIC = new Set([
  "tool", "tools", "cli", "api", "app", "apps", "project", "projects", "code", "write", "build",
  "create", "make", "using", "use", "used", "with", "for", "the", "and", "my", "our", "new",
  "agent", "agents", "small", "simple", "personal", "test", "tests", "data", "user", "users", "file", "files",
]);
const MIN_SCORE = 3;

// Keyword scoring: tag hits weigh most, then niche/domain/name, then use-case words. Popularity breaks ties.
// Loose stem match: "encrypts" hits "encryption", "menubar" hits "menubar".
const stemHit = (words: Set<string>, t: string) =>
  words.has(t) || (t.length >= 5 && [...words].some((w) => w.length >= 5 && w.slice(0, 5) === t.slice(0, 5) && (w.startsWith(t.slice(0, 7)) || t.startsWith(w.slice(0, 7)))));


// Main before support on equal relevance; unscored rows sink below scored ones.
const tierRank = (s: Skill) => (s.tier === "main" ? 0 : 1);
const unscoredLast = (a: Skill, b: Skill) => Number(!!(a as Skill & { unscored?: boolean }).unscored) - Number(!!(b as Skill & { unscored?: boolean }).unscored);

// Inverse document frequency over the catalog: a word on most skills says little about one skill.
// Weight is 1 for a word on a single skill and falls toward 0 as the word spreads.
const idfCache = new WeakMap<Skill[], Map<string, number>>();
function idfWeights(skills: Skill[]): Map<string, number> {
  const cached = idfCache.get(skills);
  if (cached) return cached;
  const df = new Map<string, number>();
  for (const s of skills) {
    const words = new Set([...s.tags, s.niche, s.name, ...s.use_cases].flatMap(tokens));
    for (const w of words) df.set(w, (df.get(w) ?? 0) + 1);
  }
  const n = skills.length + 1;
  const weights = new Map([...df].map(([w, d]) => [w, Math.log((n + 1) / (d + 1)) / Math.log(n + 1)]));
  idfCache.set(skills, weights);
  return weights;
}

// Unverified entries are listed but never recommended: their install command did not resolve.
// A recorded preference (selera) steers ranking only among skills that already fit the project, so it never drags in unrelated ones.
const PREFER_BOOST = 4;

export function recommendSkills(skills: Skill[], description: string, limit?: number, opts: { scope?: Scope; prefer?: Prefer[] } = {}) {
  skills = skills.filter((s) => s.verified !== false && (!opts.scope || (s.scope ?? "tech") === opts.scope));
  const words = new Set(tokens(description));
  const text = description.toLowerCase();
  const spaced = text.replace(/-/g, " ");
  const idf = idfWeights(skills);
  const w = (t: string) => idf.get(t) ?? 1;
  const scored = skills.map((s) => {
    let score = 0;
    const matched = new Set<string>();
    for (const tag of s.tags) {
      if (GENERIC.has(tag)) continue;
      // A hyphenated tag names one thing ("react-native" is not "react"): match it whole or not at all.
      const hit = tag.includes("-") ? spaced.includes(tag.replace(/-/g, " ")) : stemHit(words, tag);
      if (hit) { score += 3 * w(tag); matched.add(tag); }
    }
    for (const t of [...tokens(s.niche.replace(/-/g, " ")), s.domain, ...tokens(s.name.replace(/-/g, " "))]) {
      if (!GENERIC.has(t) && words.has(t)) { score += 2 * w(t); matched.add(t); }
    }
    for (const t of new Set(s.use_cases.flatMap(tokens))) if (words.has(t)) { score += 1 * w(t); matched.add(t); }
    const selera: string[] = [];
    if (score >= MIN_SCORE) {
      const own = new Set([...s.tags, ...tokens(s.name.replace(/-/g, " ")), s.id]);
      for (const p of opts.prefer ?? []) if (own.has(p.word)) { score += PREFER_BOOST; selera.push(`${p.key}=${p.word}`); }
    }
    return { skill: s, score, matched: [...matched], selera };
  });
  return scored
    .filter((r) => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || unscoredLast(a.skill, b.skill) || tierRank(a.skill) - tierRank(b.skill) || byPopularity(a.skill, b.skill))
    .slice(0, clampLimit(limit))
    .map((r) => ({ ...summary(r.skill), score: Number(r.score.toFixed(2)), matched: r.matched, ...(r.selera.length ? { selera: r.selera } : {}) }));
}

const MAX_QUERY = 200;
const MAX_TERMS = 12;

// One Fuse pass per term, then rank by how many terms hit, then by best score.
// A multi-word query used to be one fuzzy pattern, so a long phrase matched nothing.
export function searchSkills(skills: Skill[], query: string, domain?: string, limit?: number) {
  const pool = domain ? skills.filter((s) => s.domain === domain) : skills;
  const fuse = new Fuse(pool, {
    keys: [
      { name: "name", weight: 3 },
      { name: "tags", weight: 2 },
      { name: "niche", weight: 2 },
      { name: "use_cases", weight: 1.5 },
      { name: "creator", weight: 1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  });
  const terms = [...new Set(query.slice(0, MAX_QUERY).toLowerCase().split(/[^\p{L}\p{N}+#.-]+/u)
    .filter((t) => t.length >= 2))].slice(0, MAX_TERMS);
  const hits = new Map<string, { item: Skill; count: number; best: number }>();
  for (const term of terms) {
    for (const r of fuse.search(term)) {
      const prev = hits.get(r.item.id) ?? { item: r.item, count: 0, best: 0 };
      prev.count += 1;
      prev.best = Math.max(prev.best, 1 - (r.score ?? 1));
      hits.set(r.item.id, prev);
    }
  }
  return [...hits.values()]
    .sort((a, b) => b.count - a.count || b.best - a.best)
    .slice(0, clampLimit(limit))
    .map((h) => ({ ...summary(h.item), match: Number(h.best.toFixed(3)) }));
}

export const summary = (s: Skill) => ({
  id: s.id, name: s.name, domain: s.domain, niche: s.niche, creator: s.creator,
  install_command: s.install_command, popularity: s.popularity, verified: s.verified,
  tier: s.tier ?? null, unscored: !!s.unscored, scope: s.scope ?? "tech", last_pushed: s.last_pushed ?? null,
});
