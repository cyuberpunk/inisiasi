import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

export const DASH_RE = /[\u2012\u2013\u2014]/;

export const isDashLine = (s: string) => DASH_RE.test(s);

export function readText(path: string): string | undefined {
  if (!existsSync(path) || !statSync(path).isFile()) return undefined;
  return readFileSync(path, "utf8");
}

export function resolveExisting(path: string): string {
  return resolve(path);
}

export function resolvePlanPath(input: string): string {
  const abs = resolve(input);
  if (existsSync(abs) && statSync(abs).isDirectory()) {
    const inDocs = join(abs, "docs", "PLAN.md");
    if (existsSync(inDocs)) return inDocs;
    const atRoot = join(abs, "PLAN.md");
    if (existsSync(atRoot)) return atRoot;
    return inDocs;
  }
  return abs;
}

export type Section = { title: string; body: string };

export function splitSections(md: string): Section[] {
  const sections: Section[] = [];
  let title = "";
  let buf: string[] = [];
  const flush = () => {
    if (title) sections.push({ title, body: buf.join("\n").trim() });
    buf = [];
  };
  for (const line of md.split(/\r?\n/)) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      title = m[1].trim();
    } else if (title) buf.push(line);
  }
  flush();
  return sections;
}

export const isStubMarkdown = (md: string | undefined): boolean => {
  if (md === undefined) return true;
  const trimmed = md.trim();
  if (!trimmed) return true;
  const sections = splitSections(trimmed);
  if (sections.some((s) => s.body.length > 0)) return false;
  // H1-only, or heading plus whitespace / placeholder.
  const withoutHeadings = trimmed.replace(/^#+\s+.*$/gm, "").trim();
  return withoutHeadings.length === 0;
};

const PLACEHOLDER = /^(tbd|todo|tba|\.{3}|…|n\/?a|not answered yet|tbd\.|todo\.)$/i;

export const isEmptyBody = (body: string): boolean => {
  const t = body.trim();
  if (!t) return true;
  const lines = t.split(/\n/).map((l) => l.replace(/^\s*[-*]\s+/, "").trim()).filter(Boolean);
  return lines.length > 0 && lines.every((l) => PLACEHOLDER.test(l));
};

export function dashHits(md: string, file: string): string[] {
  const hits: string[] = [];
  for (const [i, line] of md.split(/\r?\n/).entries()) {
    if (DASH_RE.test(line)) hits.push(`${file}:${i + 1}: em dash or en dash`);
  }
  return hits;
}

export function listItems(body: string): string[] {
  const items: string[] = [];
  let cur: string | undefined;
  for (const line of body.split(/\r?\n/)) {
    const m = /^\s*(?:[-*]|\d+\.)\s+(.+)$/.exec(line);
    if (m) {
      if (cur) items.push(cur.trim());
      cur = m[1].trim();
    } else if (cur && line.trim()) {
      cur += " " + line.trim();
    }
  }
  if (cur) items.push(cur.trim());
  return items;
}

export function firstFact(body: string, max = 160): string {
  const bullets = listItems(body);
  const raw = bullets.length ? bullets.slice(0, 2).join("; ") : body.split(/\n\n/)[0] ?? body;
  const sentence = raw.replace(/\s+/g, " ").trim();
  const cut = sentence.split(/(?<=\.)\s/)[0] ?? sentence;
  return cut.length > max ? cut.slice(0, max - 1).trimEnd() + "…" : cut;
}
