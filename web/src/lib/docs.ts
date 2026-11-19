// Markdown references from the inisiasi and selera skills, bundled at build time. Keys are paths under skill/.
const raw = import.meta.glob(
  ["../../../skill/inisiasi/references/**/*.md", "../../../skill/selera/references/**/*.md"],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

export interface Doc { key: string; title: string; verified?: string; body: string }
export interface Section { name: string; docs: Doc[] }

const frontmatter = /^---\n[\s\S]*?\n---\n/;
export const docs = new Map<string, Doc>(
  Object.entries(raw).map(([path, text]) => {
    const key = path.replace("../../../skill/", "");
    const body = text.replace(frontmatter, "");
    return [key, { key, body, title: body.match(/^# (.+)$/m)?.[1] ?? key.split("/").pop()!, verified: body.match(/Last verified: (\S+)/)?.[1] }];
  }),
);

// A relative link inside a doc, resolved to a doc key, or undefined when it points elsewhere.
export function resolveLink(from: string, href: string): string | undefined {
  if (/^[a-z]+:|^#/.test(href)) return undefined;
  const parts = from.split("/").slice(0, -1);
  for (const p of href.split("#")[0].split("/")) p === ".." ? parts.pop() : p !== "." && parts.push(p);
  const key = parts.join("/");
  return docs.has(key) ? key : undefined;
}

const pick = (keys: string[]) => keys.map((k) => docs.get(k)).filter((d): d is Doc => !!d);
const under = (dir: string, skip: string[] = []) =>
  [...docs.values()].filter((d) => d.key.startsWith(dir) && !d.key.slice(dir.length).includes("/") && !skip.includes(d.key));
const linkedFrom = (readme: string) => {
  const dir = readme.split("/").slice(0, -1).join("/");
  return pick([...(docs.get(readme)?.body ?? "").matchAll(/\]\(([\w./-]+\.md)\)/g)].map((m) => `${dir}/${m[1]}`));
};

const SOT = "inisiasi/references/sot/";
// Stack tab: README sections in README order; unlinked files go last.
export const stackSections: Section[] = (() => {
  const readme = docs.get(SOT + "README.md");
  const seen = new Set([SOT + "README.md"]);
  const out: Section[] = [{ name: "Overview", docs: readme ? [readme] : [] }];
  for (const part of (readme?.body ?? "").split(/^## /m).slice(1)) {
    const ds = pick([...part.matchAll(/\]\(([\w.-]+\.md)\)/g)].map((m) => SOT + m[1])).filter((d) => !seen.has(d.key));
    ds.forEach((d) => seen.add(d.key));
    if (ds.length) out.push({ name: part.split("\n")[0].trim(), docs: ds });
  }
  const rest = under(SOT).filter((d) => !seen.has(d.key)).sort((a, b) => a.title.localeCompare(b.title));
  if (rest.length) out.push({ name: "Other", docs: rest });
  return out;
})();

const SELERA = "selera/references/sot/";
const PATTERN_KEYS = [SELERA + "design.md", SOT + "architecture.md", SOT + "frontend-architecture.md", SOT + "engineering-practices.md"];
// Standards tab: code standards, patterns, strategies, diagram prompts.
export const standardsSections: Section[] = [
  { name: "Coding standards", docs: [...pick([SELERA + "README.md"]), ...linkedFrom(SELERA + "README.md").filter((d) => !PATTERN_KEYS.includes(d.key))] },
  { name: "Patterns and principles", docs: pick(PATTERN_KEYS) },
  { name: "Strategies and practices", docs: pick(["inisiasi/references/addy-index.md"]) },
  { name: "Agentic engineering", docs: pick([SOT + "agentic-engineering.md", SOT + "agent-loops.md", SOT + "agent-graphs.md"]) },
  { name: "Idioms and mechanisms", docs: pick([SOT + "idioms.md", SOT + "mechanisms.md"]) },
  { name: "Diagrams (C4)", docs: pick([SOT + "diagrams.md", "inisiasi/references/prompts.md"]) },
].filter((s) => s.docs.length);

// Topics asked for with no source file yet. The SoT rule: mark a gap, do not invent it.
export const standardsGaps: string[] = [];

// Use cases: each skill's evals.json rendered as one markdown doc, so DocsPage shows it like any reference.
interface Eval { id: number; name?: string; prompt: string; expected_output: string; assertions?: string | string[]; should_trigger?: boolean }
const evalFiles = import.meta.glob("../../../skill/*/evals/evals.json", { import: "default", eager: true }) as Record<string, { skill_name: string; evals: Eval[] }>;

// Some evals store a single assertion as a plain string.
const checks = (e: Eval) => [e.assertions ?? []].flat();

const evalDoc = ({ skill_name, evals }: { skill_name: string; evals: Eval[] }, negative: boolean): Doc => {
  const list = evals.filter((e) => (e.should_trigger === false) === negative);
  const body = list.map((e) => [
    `## ${e.id}. ${e.name ?? e.prompt.slice(0, 60).replace(/\s+\S*$/, "") + "…"}`,
    `> ${e.prompt.replace(/\n/g, "\n> ")}`,
    `**Expected.** ${e.expected_output}`,
    checks(e).length ? `**Checks**\n\n${checks(e).map((a) => `- ${a}`).join("\n")}` : "",
  ].filter(Boolean).join("\n\n")).join("\n\n");
  const key = `${skill_name}/evals/${negative ? "should-not-trigger" : "use-cases"}`;
  const title = negative ? `${skill_name}: should not trigger` : `${skill_name}: use cases`;
  const intro = negative ? `Requests that look similar but must not start \`${skill_name}\`. ${list.length} cases.` : `Requests \`${skill_name}\` must handle, with the expected behavior and the checks the eval runs. ${list.length} cases.`;
  return { key, title, body: `${intro}\n\n${body}` };
};
for (const set of Object.values(evalFiles)) for (const neg of [false, true]) { const d = evalDoc(set, neg); docs.set(d.key, d); }

// Cases tab: use cases from evals, problem cases from the SoT problem files.
export const casesSections: Section[] = [
  { name: "Use cases", docs: [...docs.values()].filter((d) => d.key.endsWith("/evals/use-cases")) },
  { name: "Backend scenarios", docs: pick([SOT + "scenarios.md", SOT + "scaling.md", SOT + "concurrency.md"]) },
  { name: "Near misses", docs: [...docs.values()].filter((d) => d.key.endsWith("/evals/should-not-trigger")) },
  { name: "Problem cases", docs: pick([SOT + "problems-critical.md", SOT + "problems-data.md", SOT + "problems-performance.md", SOT + "problems-ops.md"]) },
  { name: "Incidents", docs: pick([SOT + "diagnosis.md"]) },
].filter((s) => s.docs.length);
