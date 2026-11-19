import { bundleOf, type Skill } from "@/lib/catalog";
import { Chip } from "./Chip";
import { Quote } from "./Quote";

const fmt = new Intl.NumberFormat("en");

export function SkillDetail({ skill: s }: { skill: Skill }) {
  const unverified = s.verified === false;
  const [purpose, ...rest] = s.use_cases;
  const rows: [string, React.ReactNode][] = [
    ["Creator", s.creator],
    ["Bundle", bundleOf(s)],
    ["Domain", s.domain],
    ["Category", s.niche],
    ["Scope", s.scope ?? "tech"],
    ["Tier", s.tier],
    ["Stars", s.popularity ? fmt.format(s.popularity) : "n/a"],
    ["Last pushed", s.last_pushed ?? "unknown"],
    ...(s.ui_skills_count ? [["ui-skills installs", fmt.format(s.ui_skills_count)] as [string, string]] : []),
  ];
  return (
    <article className="space-y-5">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">{s.name}</h2>
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="indigo">{s.domain}</Chip>
          <Chip>{s.niche}</Chip>
          <Chip tone={s.scope === "general" ? "emerald" : "slate"}>{s.scope ?? "tech"}</Chip>
          {unverified && <Chip tone="amber">unverified</Chip>}
        </div>
      </header>

      {unverified && <Quote tone="amber" label="Not installable as written">{s.note}</Quote>}
      {purpose && <Quote tone={s.scope === "general" ? "emerald" : "indigo"} label="Purpose">{purpose}</Quote>}
      {rest.length > 0 && (
        <section>
          <h3 className="mb-1 text-sm font-semibold">Use when</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">{rest.map((u) => <li key={u}>{u}</li>)}</ul>
        </section>
      )}

      <section>
        <h3 className="mb-1 text-sm font-semibold">Install</h3>
        <pre className="overflow-x-auto rounded-lg border p-3 text-sm">{s.install_command}</pre>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold">Details</h3>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
          {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="opacity-60">{k}</dt><dd className="break-all">{v}</dd></div>))}
        </dl>
      </section>

      {s.tags.length > 0 && (
        <section>
          <h3 className="mb-1 text-sm font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-1.5">{s.tags.map((t) => <Chip key={t}>{t}</Chip>)}</div>
        </section>
      )}

      <a className="inline-block text-sm underline" href={s.source_url} target="_blank" rel="noreferrer">Open source</a>
    </article>
  );
}
