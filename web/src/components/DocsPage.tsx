import { marked } from "marked";
import { useMemo, useState } from "react";
import { docs, resolveLink, type Section } from "@/lib/docs";
import { Chip } from "./Chip";
import { Quote } from "./Quote";

export function DocsPage({ label, sections, gaps = [] }: { label: string; sections: Section[]; gaps?: string[] }) {
  const [key, setKey] = useState(sections[0]?.docs[0]?.key ?? "");
  const doc = docs.get(key);
  // Local repo files, so the rendered HTML is trusted.
  const html = useMemo(() => doc ? marked.parse(doc.body.replace(/^# .+\n/m, "").replace(/^> Last verified: .+\n/m, ""), { async: false }) : "", [doc]);

  // Links between known docs switch the page instead of navigating away.
  const onClick = (e: React.MouseEvent) => {
    const href = (e.target as HTMLElement).closest("a")?.getAttribute("href");
    const target = doc && href ? resolveLink(doc.key, href) : undefined;
    if (target) { e.preventDefault(); setKey(target); window.scrollTo({ top: 0 }); }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
      <nav aria-label={label} className="space-y-4 md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:self-start md:overflow-y-auto">
        {sections.map((s) => (
          <div key={s.name}>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">{s.name}</h2>
            <ul>
              {s.docs.map((d) => (
                <li key={d.key}>
                  <button type="button" aria-current={d.key === key ? "page" : undefined} onClick={() => setKey(d.key)}
                    className="w-full rounded-md px-2 py-1 text-start text-sm hover:bg-slate-100 focus-visible:outline-2 aria-[current=page]:bg-slate-900 aria-[current=page]:text-white dark:hover:bg-slate-800 dark:aria-[current=page]:bg-slate-100 dark:aria-[current=page]:text-slate-900">
                    {d.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {gaps.length > 0 && (
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Not written yet</h2>
            <ul className="space-y-1 px-2 text-sm opacity-70">{gaps.map((g) => <li key={g}>{g}</li>)}</ul>
          </div>
        )}
      </nav>
      {doc && (
        <article className="min-w-0">
          <header className="mb-4 space-y-2">
            <h2 className="text-2xl font-semibold">{doc.title}</h2>
            <div className="flex flex-wrap gap-1.5">
              <Chip>{doc.key}</Chip>
              {doc.verified && <Chip tone="emerald">verified {doc.verified}</Chip>}
            </div>
          </header>
          {key === sections[0]?.docs[0]?.key && gaps.length > 0 && (
            <div className="mb-4"><Quote tone="amber" label="Gaps">No source file covers {gaps.join(", ")} yet. The SoT rule is to mark a gap and ask the owner, not to invent one.</Quote></div>
          )}
          <div className="md" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      )}
    </div>
  );
}
