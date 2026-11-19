// Audits catalog.json against GitHub and the `skills` CLI. Needs `gh` (logged in) and network.
//   node check-catalog.mjs            report only
//   node check-catalog.mjs --write    also refresh popularity (repo stars), last_pushed, and verified/note
//   node check-catalog.mjs --no-install   skip the slow `skills add --list` check
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";

const run = promisify(execFile);
const file = new URL("./catalog.json", import.meta.url).pathname;
const catalog = JSON.parse(readFileSync(file, "utf8"));
const write = process.argv.includes("--write");
const installCheck = !process.argv.includes("--no-install");
const STALE_MONTHS = 6;
const NOTE = "not listed by `skills add --list`";

// "-s name" and "--skill name" both appear in older entries.
const parse = (s) => {
  const c = s.install_command;
  const repo = (c.match(/github\.com\/([^/\s]+\/[^/\s]+)/) ?? c.match(/add\s+([\w.-]+\/[\w.-]+)/) ?? [])[1]?.replace(/\.git$/, "");
  const name = (c.match(/(?:-s|--skill)\s+(\S+)/) ?? [])[1] ?? s.id;
  return { repo, name };
};
const gh = async (path) => {
  try { return JSON.parse((await run("gh", ["api", path], { maxBuffer: 64e6 })).stdout); } catch { return null; }
};
const pool = async (items, n, fn) => { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); })); };

const repos = [...new Set(catalog.skills.map((s) => parse(s).repo).filter(Boolean))];
const meta = {};
const listed = {};
await pool(repos, 8, async (r) => { meta[r] = await gh(`repos/${r}`); });
if (installCheck) {
  await pool(repos.filter((r) => meta[r]), 4, async (r) => {
    try {
      const { stdout } = await run("npx", ["-y", "skills", "add", r, "--list"], { timeout: 150000, maxBuffer: 32e6, env: { ...process.env, NO_COLOR: "1", CI: "1" } });
      const lines = stdout.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "").split("\n");
      const at = lines.findIndex((l) => /Available Skills/.test(l));
      listed[r] = lines.slice(at + 1).map((l) => l.match(/^│\s{2,}([\w:.-]+)\s*$/)?.[1]).filter(Boolean);
    } catch { listed[r] = null; }
  });
}

const cutoff = new Date(catalog.updated ?? Date.now());
cutoff.setMonth(cutoff.getMonth() - STALE_MONTHS);
const problems = { missing_repo: [], archived: [], stale: [], not_installable: [], unchecked: [] };
for (const s of catalog.skills) {
  const { repo, name } = parse(s);
  const m = meta[repo];
  if (!m) { problems.missing_repo.push(s.id); if (write) { s.verified = false; s.note = "source repo not found"; } continue; }
  if (m.archived) problems.archived.push(s.id);
  if (new Date(m.pushed_at) < cutoff) problems.stale.push(`${s.id} (${m.pushed_at.slice(0, 10)})`);
  let ok = true;
  if (installCheck) {
    const l = listed[repo];
    if (l === null || l === undefined) { problems.unchecked.push(s.id); ok = null; }
    else if (!l.includes(name)) { problems.not_installable.push(`${s.id} (-s ${name})`); ok = false; }
  }
  if (!write) continue;
  // The directory's own number is not GitHub stars; keep it under its own name before popularity becomes stars.
  if (s.source_url.includes("ui-skills.com") && s.ui_skills_count === undefined) s.ui_skills_count = s.popularity;
  s.popularity = m.stargazers_count;
  s.last_pushed = m.pushed_at.slice(0, 10);
  s.install_command = `npx skills add ${repo} -g -s ${name}`;
  if (m.archived) { s.verified = false; s.note = "source repo is archived"; }
  else if (ok === false) { s.verified = false; s.note = NOTE; }
  else if (ok === true && s.note === NOTE) { s.verified = true; delete s.note; }
}

for (const [k, v] of Object.entries(problems)) console.log(`${k}: ${v.length}${v.length ? "\n  " + v.join("\n  ") : ""}`);
if (write) {
  catalog.updated = new Date().toISOString().slice(0, 10);
  catalog.count = catalog.skills.length;
  writeFileSync(file, JSON.stringify(catalog, null, 2) + "\n");
  console.log("catalog.json updated");
}
