// Checks catalog.json: required fields and types, unique ids, slug format, install command shape.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? new URL("./catalog.json", import.meta.url).pathname;
const { skills } = JSON.parse(readFileSync(path, "utf8"));
const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const errors = [];
const ids = new Set();
const str = (v) => typeof v === "string" && v.trim().length > 0;
const strArr = (v) => Array.isArray(v) && v.length > 0 && v.every(str);

for (const [i, s] of skills.entries()) {
  const at = `#${i} ${s?.id ?? "?"}`;
  for (const k of ["id", "name", "domain", "niche", "creator", "source_url", "install_command"]) if (!str(s[k])) errors.push(`${at}: ${k} missing`);
  if (!strArr(s.use_cases)) errors.push(`${at}: use_cases must be a non-empty string array`);
  if (!strArr(s.tags)) errors.push(`${at}: tags must be a non-empty string array`);
  else if (s.tags.some((t) => t !== t.toLowerCase())) errors.push(`${at}: tags must be lowercase`);
  if (typeof s.popularity !== "number" || s.popularity < 0) errors.push(`${at}: popularity must be a number >= 0`);
  if (typeof s.verified !== "boolean") errors.push(`${at}: verified must be boolean`);
  if (str(s.domain) && !slug.test(s.domain)) errors.push(`${at}: domain '${s.domain}' is not a slug`);
  if (str(s.niche) && !slug.test(s.niche)) errors.push(`${at}: niche '${s.niche}' is not a slug`);
  if (str(s.source_url) && !s.source_url.startsWith("https://")) errors.push(`${at}: source_url must be https`);
  if (str(s.install_command) && s.source_url?.startsWith("https://github.com/") && !/^npx skills add [\w.-]+\/[\w.-]+ -g -s [\w.:-]+$/.test(s.install_command))
    errors.push(`${at}: install_command should be 'npx skills add <owner/repo> -g -s <name>'`);
  if (ids.has(s.id)) errors.push(`${at}: duplicate id`);
  ids.add(s.id);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
const domains = new Map();
for (const s of skills) domains.set(s.domain, (domains.get(s.domain) ?? 0) + 1);
console.log(`catalog ok: ${skills.length} skills, ${domains.size} domains (${[...domains].map(([d, n]) => `${d} ${n}`).join(", ")}), ${skills.filter((s) => !s.verified).length} unverified`);
