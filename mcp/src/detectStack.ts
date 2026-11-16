import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { isStubMarkdown, readText } from "./md.js";

export type DocInfo = { exists: boolean; stub: boolean; path?: string };

export type Manifest = { path: string; kind: string };

export type DetectStackResult = {
  root: string;
  missing_root: boolean;
  language: string | null;
  languages: string[];
  package_managers: string[];
  manifests: Manifest[];
  frameworks: string[];
  hints: string[];
  docs: { PLAN: DocInfo; ARCHITECTURE: DocInfo; TASKS: DocInfo; DESIGN: DocInfo; AGENTS: DocInfo };
  installed_skills: string[];
};

const SKIP = new Set(["node_modules", ".git", "dist", "build", ".build", "DerivedData", "Pods", "vendor", "target", "coverage", ".next", ".turbo"]);

const LOCKS: { file: string; manager: string }[] = [
  { file: "package-lock.json", manager: "npm" },
  { file: "pnpm-lock.yaml", manager: "pnpm" },
  { file: "yarn.lock", manager: "yarn" },
  { file: "bun.lock", manager: "bun" },
  { file: "bun.lockb", manager: "bun" },
  { file: "Cargo.lock", manager: "cargo" },
  { file: "go.sum", manager: "go" },
  { file: "poetry.lock", manager: "poetry" },
  { file: "uv.lock", manager: "uv" },
  { file: "Pipfile.lock", manager: "pipenv" },
  { file: "Gemfile.lock", manager: "bundler" },
  { file: "composer.lock", manager: "composer" },
];

const FRAMEWORK_PKGS: Record<string, string> = {
  react: "react", "react-dom": "react", next: "next", vue: "vue", nuxt: "nuxt",
  svelte: "svelte", "@sveltejs/kit": "sveltekit", "@angular/core": "angular",
  "solid-js": "solid", hono: "hono", express: "express", fastify: "fastify",
  elysia: "elysia", "@nestjs/core": "nestjs", "@remix-run/node": "remix",
  astro: "astro", vite: "vite", vitest: "vitest", tailwindcss: "tailwindcss",
  prisma: "prisma", "drizzle-orm": "drizzle", "better-auth": "better-auth",
  "@clerk/nextjs": "clerk", zustand: "zustand", "@reduxjs/toolkit": "redux",
  "@trpc/server": "trpc", "@trpc/client": "trpc", graphql: "graphql",
  wrangler: "wrangler", firebase: "firebase", "@supabase/supabase-js": "supabase",
};

const HINTS: { re: RegExp; label: string; kind: "language" | "framework" }[] = [
  { re: /\bswiftui\b/i, label: "SwiftUI", kind: "framework" },
  { re: /\bswift\b/i, label: "Swift", kind: "language" },
  { re: /\bobjective-?c\b/i, label: "Objective-C", kind: "language" },
  { re: /\btypescript\b/i, label: "TypeScript", kind: "language" },
  { re: /\bjavascript\b/i, label: "JavaScript", kind: "language" },
  { re: /\bpython\b/i, label: "Python", kind: "language" },
  { re: /\brust\b/i, label: "Rust", kind: "language" },
  { re: /\bgolang\b|\bgo lang\b/i, label: "Go", kind: "language" },
  { re: /\bkotlin\b/i, label: "Kotlin", kind: "language" },
  { re: /\breact native\b/i, label: "React Native", kind: "framework" },
  { re: /\breact\b/i, label: "react", kind: "framework" },
  { re: /\bnext\.?js\b/i, label: "next", kind: "framework" },
  { re: /\bvite\+?\b/i, label: "vite", kind: "framework" },
  { re: /\bsvelte\b/i, label: "svelte", kind: "framework" },
  { re: /\bvue\b/i, label: "vue", kind: "framework" },
  { re: /\bhono\b/i, label: "hono", kind: "framework" },
  { re: /\bmenubarextra\b|\bmenubar\b/i, label: "MenuBarExtra", kind: "framework" },
  { re: /\bfinder sync\b|\bfinder extension\b/i, label: "Finder Sync", kind: "framework" },
  { re: /\bmacos\b/i, label: "macOS", kind: "framework" },
];

const LANGUAGE_RANK = ["Swift", "TypeScript", "JavaScript", "Kotlin", "Python", "Go", "Rust", "Ruby", "PHP", "Java", "Objective-C"];

export const skillsDir = () => process.env.INISIASI_SKILLS_DIR ?? join(homedir(), ".agents/skills");

export function listInstalledSkills(dir = skillsDir()): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() || e.isSymbolicLink())
    .map((e) => e.name)
    .filter((n) => !n.startsWith("."))
    .sort();
}

export const isSkillInstalled = (id: string, dir = skillsDir()) =>
  existsSync(join(dir, id));

function walk(root: string, depth: number, rel = ""): string[] {
  const out: string[] = [];
  const abs = rel ? join(root, rel) : root;
  let entries;
  try { entries = readdirSync(abs, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith(".") && e.name !== ".gitignore") continue;
    if (SKIP.has(e.name)) continue;
    const child = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory() || (e.isSymbolicLink() && extname(e.name) === ".xcodeproj")) {
      if (e.name.endsWith(".xcodeproj") || e.name.endsWith(".xcworkspace")) out.push(child);
      else if (depth > 0 && e.isDirectory()) out.push(...walk(root, depth - 1, child));
    } else if (e.isFile()) out.push(child);
  }
  return out;
}

function docAt(root: string, rel: string): DocInfo {
  const path = join(root, rel);
  if (!existsSync(path) || !statSync(path).isFile()) return { exists: false, stub: true };
  return { exists: true, stub: isStubMarkdown(readText(path)), path };
}

function add(set: string[], value: string) {
  if (value && !set.includes(value)) set.push(value);
}

function parsePackageJson(abs: string, languages: string[], frameworks: string[], manifests: Manifest[], rel: string) {
  manifests.push({ path: rel, kind: "package.json" });
  try {
    const pkg = JSON.parse(readFileSync(abs, "utf8")) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.typescript) add(languages, "TypeScript");
    for (const [name, fw] of Object.entries(FRAMEWORK_PKGS)) if (deps[name]) add(frameworks, fw);
  } catch { /* still recorded as a manifest */ }
}

export function detectStack(root: string): DetectStackResult {
  const abs = resolve(root);
  const emptyDocs = {
    PLAN: { exists: false, stub: true } as DocInfo,
    ARCHITECTURE: { exists: false, stub: true } as DocInfo,
    TASKS: { exists: false, stub: true } as DocInfo,
    DESIGN: { exists: false, stub: true } as DocInfo,
    AGENTS: { exists: false, stub: true } as DocInfo,
  };
  if (!existsSync(abs) || !statSync(abs).isDirectory()) {
    return {
      root: abs, missing_root: true, language: null, languages: [], package_managers: [],
      manifests: [], frameworks: [], hints: [], docs: emptyDocs, installed_skills: listInstalledSkills(),
    };
  }

  const files = walk(abs, 2);
  const languages: string[] = [];
  const managers: string[] = [];
  const manifests: Manifest[] = [];
  const frameworks: string[] = [];

  const has = (name: string) => files.some((f) => f === name || f.endsWith("/" + name));

  for (const rel of files) {
    const full = join(abs, rel);
    const base = basename(rel);
    if (base === "package.json") parsePackageJson(full, languages, frameworks, manifests, rel);
    else if (base === "Package.swift") { manifests.push({ path: rel, kind: "Package.swift" }); add(languages, "Swift"); add(managers, "spm"); }
    else if (base.endsWith(".xcodeproj")) { manifests.push({ path: rel, kind: "xcodeproj" }); add(languages, "Swift"); add(managers, "xcode"); }
    else if (base.endsWith(".xcworkspace")) { manifests.push({ path: rel, kind: "xcworkspace" }); add(languages, "Swift"); add(managers, "xcode"); }
    else if (base === "Cargo.toml") { manifests.push({ path: rel, kind: "Cargo.toml" }); add(languages, "Rust"); add(managers, "cargo"); }
    else if (base === "go.mod") { manifests.push({ path: rel, kind: "go.mod" }); add(languages, "Go"); add(managers, "go"); }
    else if (base === "pyproject.toml" || base === "requirements.txt" || base === "Pipfile") {
      manifests.push({ path: rel, kind: base }); add(languages, "Python");
      if (base === "requirements.txt") add(managers, "pip");
      if (base === "pyproject.toml") add(managers, "pip");
    }
    else if (base === "tsconfig.json") { manifests.push({ path: rel, kind: "tsconfig.json" }); add(languages, "TypeScript"); }
    else if (base === "Gemfile") { manifests.push({ path: rel, kind: "Gemfile" }); add(languages, "Ruby"); add(managers, "bundler"); }
    else if (base === "composer.json") { manifests.push({ path: rel, kind: "composer.json" }); add(languages, "PHP"); add(managers, "composer"); }
    else if (base === "deno.json" || base === "deno.jsonc") { manifests.push({ path: rel, kind: base }); add(languages, "TypeScript"); add(managers, "deno"); }
  }

  for (const { file, manager } of LOCKS) if (has(file)) {
    add(managers, manager);
    if (!manifests.some((m) => m.path === file || m.path.endsWith("/" + file))) manifests.push({ path: file, kind: file });
  }

  if (has("package.json") && !managers.some((m) => ["npm", "pnpm", "yarn", "bun"].includes(m))) add(managers, "npm");

  const hintText = [readText(join(abs, "AGENTS.md")), readText(join(abs, "README.md")), readText(join(abs, "docs", "PLAN.md"))]
    .filter(Boolean).join("\n");
  const hints: string[] = [];
  for (const h of HINTS) if (h.re.test(hintText)) add(hints, h.label);
  for (const h of HINTS) {
    if (!hints.includes(h.label)) continue;
    if (h.kind === "language") add(languages, h.label);
    else add(frameworks, h.label);
  }

  languages.sort((a, b) => (LANGUAGE_RANK.indexOf(a) === -1 ? 99 : LANGUAGE_RANK.indexOf(a)) - (LANGUAGE_RANK.indexOf(b) === -1 ? 99 : LANGUAGE_RANK.indexOf(b)));
  const language = languages[0] ?? null;

  return {
    root: abs,
    missing_root: false,
    language,
    languages,
    package_managers: managers,
    manifests,
    frameworks,
    hints,
    docs: {
      PLAN: docAt(abs, "docs/PLAN.md"),
      ARCHITECTURE: docAt(abs, "docs/ARCHITECTURE.md"),
      TASKS: docAt(abs, "docs/TASKS.md"),
      DESIGN: docAt(abs, "docs/DESIGN.md"),
      AGENTS: docAt(abs, "AGENTS.md"),
    },
    installed_skills: listInstalledSkills(),
  };
}
