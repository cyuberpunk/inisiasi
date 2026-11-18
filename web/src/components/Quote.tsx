const tones = {
  indigo: "border-indigo-500 bg-indigo-50 text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-100",
  emerald: "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-100",
  amber: "border-amber-500 bg-amber-50 text-amber-950 dark:bg-amber-950/60 dark:text-amber-100",
};

export function Quote({ tone = "indigo", label, children }: { tone?: keyof typeof tones; label: string; children: React.ReactNode }) {
  return (
    <figure className={`rounded-lg border-l-4 p-4 ${tones[tone]}`}>
      <figcaption className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">{label}</figcaption>
      <blockquote className="text-base leading-relaxed">{children}</blockquote>
    </figure>
  );
}
