import catalog from "../../../mcp/catalog.json";

export interface Skill {
  id: string; name: string; domain: string; niche: string; creator: string;
  use_cases: string[]; tags: string[]; source_url: string; install_command: string;
  popularity: number; ui_skills_count?: number; verified?: boolean; note?: string;
  tier: "main" | "support"; scope?: "tech" | "general"; last_pushed?: string;
}
export interface Node { id: string; name: string; trailing?: string; skill?: Skill; children?: Node[] }

export const skills = catalog.skills as Skill[];
export const byId = new Map(skills.map((s) => [s.id, s]));

// Bundle = the repo in the install command, so skills installed from one repo sit together.
export const bundleOf = (s: Skill) => s.install_command.match(/skills add (\S+)/)?.[1] ?? "unknown";

const group = <T,>(items: T[], key: (t: T) => string) => {
  const m = new Map<string, T[]>();
  for (const i of items) m.set(key(i), [...(m.get(key(i)) ?? []), i]);
  return [...m].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
};
const leaf = (s: Skill): Node => ({ id: s.id, name: s.name, skill: s });

// domain > niche > skill
export const domainTree = (): Node[] =>
  group(skills, (s) => s.domain).map(([d, l]) => ({
    id: `d:${d}`, name: d, trailing: String(l.length),
    children: group(l, (s) => s.niche).map(([n, nl]) => ({ id: `n:${d}:${n}`, name: n, trailing: String(nl.length), children: nl.map(leaf) })),
  }));

// creator > bundle (repo) > skill
export const creatorTree = (): Node[] =>
  group(skills, (s) => s.creator).map(([c, l]) => ({
    id: `c:${c}`, name: c, trailing: String(l.length),
    children: group(l, bundleOf).map(([b, bl]) => ({ id: `b:${c}:${b}`, name: b, trailing: String(bl.length), children: bl.map(leaf) })),
  }));
