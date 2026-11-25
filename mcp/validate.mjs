// Checks catalog.json: required fields and types, unique ids, slug format, install command shape.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? new URL("./catalog.json", import.meta.url).pathname;
const { skills } = JSON.parse(readFileSync(path, "utf8"));
const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const errors = [];
const ids = new Set();
const GENERAL_DOMAINS = new Set(["document", "research", "business-and-productivity", "general"]);
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
  if (s.scope !== "tech" && s.scope !== "general") errors.push(`${at}: scope must be "tech" or "general"`);
  if (s.last_pushed !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(s.last_pushed)) errors.push(`${at}: last_pushed must be YYYY-MM-DD`);
  if (s.verified === false && !str(s.note)) errors.push(`${at}: an unverified entry needs a note saying why`);
  if (str(s.domain) && !slug.test(s.domain)) errors.push(`${at}: domain '${s.domain}' is not a slug`);
  if (str(s.niche) && !slug.test(s.niche)) errors.push(`${at}: niche '${s.niche}' is not a slug`);
  if (str(s.source_url) && !s.source_url.startsWith("https://")) errors.push(`${at}: source_url must be https`);
  if (str(s.install_command) && s.source_url?.startsWith("https://github.com/") && !/^npx skills add [\w.-]+\/[\w.-]+ -g -s [\w.:-]+$/.test(s.install_command))
    errors.push(`${at}: install_command should be 'npx skills add <owner/repo> -g -s <name>'`);
  if (s.niche === "main" || s.niche === "support") errors.push(`${at}: niche is a topic inside the domain; main/support belong in tier`);
  if (str(s.domain) && s.scope !== (GENERAL_DOMAINS.has(s.domain) ? "general" : "tech")) errors.push(`${at}: domain '${s.domain}' needs scope '${GENERAL_DOMAINS.has(s.domain) ? "general" : "tech"}'`);
  if (ids.has(s.id)) errors.push(`${at}: duplicate id`);
  ids.add(s.id);
}

// One creator name per casing, and one repo owner maps to one creator, so the creator tab never splits a group.
const casings = new Map(), owners = new Map();
for (const s of skills) {
  const k = s.creator.toLowerCase();
  if (casings.has(k) && casings.get(k) !== s.creator) errors.push(`creator '${s.creator}' also spelled '${casings.get(k)}'`);
  casings.set(k, s.creator);
  const o = s.install_command.match(/skills add ([^/\s]+)\//)?.[1]?.toLowerCase();
  if (o && owners.has(o) && owners.get(o) !== s.creator) errors.push(`${s.id}: repo owner '${o}' is under creators '${owners.get(o)}' and '${s.creator}'`);
  if (o) owners.set(o, s.creator);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
const domains = new Map();
for (const s of skills) domains.set(s.domain, (domains.get(s.domain) ?? 0) + 1);
const cutoff = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().slice(0, 10);
const stale = skills.filter((s) => s.last_pushed && s.last_pushed < cutoff).length;
console.log(`catalog ok: ${skills.length} skills, ${domains.size} domains (${[...domains].map(([d, n]) => `${d} ${n}`).join(", ")}), ${skills.filter((s) => !s.verified).length} unverified, ${skills.filter((s) => s.scope === "general").length} general scope, ${stale} not pushed in 6 months`);
