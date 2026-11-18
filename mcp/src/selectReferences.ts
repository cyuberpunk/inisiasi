import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readText, resolvePlanPath } from "./md.js";

export type ReferenceHit = { file: string; path: string; reason: string; verified_at: string | null; stale: boolean; score: number };

export type SelectReferencesResult = {
  references_root: string | null;
  files: ReferenceHit[];
  gaps: string[];
};

type Rule = { file: string; keywords: string[]; reason: string; weight: number; always?: boolean };

const RULES: Rule[] = [
  { file: "architecture.md", keywords: ["architecture", "system", "design", "tenant", "multi-tenant", "saas"], reason: "System design baseline and default decisions", weight: 2, always: true },
  { file: "testing.md", keywords: ["test", "testing", "e2e", "vitest", "unit", "qa"], reason: "Testing baseline", weight: 2, always: true },
  { file: "problems-critical.md", keywords: ["payment", "checkout", "stock", "inventory", "order", "webhook", "tenant", "multi-tenant", "auth", "idempotency"], reason: "Expensive-to-fix mistakes for risks and spike task", weight: 3, always: true },
  { file: "diagnosis.md", keywords: ["error", "slow", "incident", "timeout", "debug", "bug"], reason: "Symptom to cause lookup", weight: 2 },
  { file: "problems-data.md", keywords: ["migration", "transaction", "sql", "postgres", "database", "schema"], reason: "Transactions, migrations, deadlocks", weight: 2 },
  { file: "problems-performance.md", keywords: ["slow", "performance", "latency", "scale", "query", "index"], reason: "Slowness and resource exhaustion", weight: 2 },
  { file: "problems-ops.md", keywords: ["deploy", "worker", "queue", "job", "cron", "k8s"], reason: "Deploy, dependency, queue failures", weight: 2 },
  { file: "multi-tenancy.md", keywords: ["tenant", "multi-tenant", "saas", "rls", "organization", "workspace"], reason: "Tenant isolation and RLS", weight: 5 },
  { file: "toolchain-ts.md", keywords: ["typescript", "javascript", "ts", "js", "vite", "vitest", "oxlint", "oxfmt", "oxc", "monorepo", "turborepo", "pnpm", "react", "nextjs", "next", "frontend", "web", "node", "nodejs", "bun"], reason: "TypeScript toolchain default (Vite+, Oxlint, Oxfmt, Vitest)", weight: 6 },
  { file: "stack-compat-ts.md", keywords: ["typescript", "javascript", "hono", "elysia", "drizzle", "prisma", "trpc", "orpc", "workers", "cloudflare", "convex", "fullstack"], reason: "Valid TypeScript stack combinations", weight: 4 },
  { file: "frontend.md", keywords: ["frontend", "react", "vue", "svelte", "next", "nextjs", "ui", "web", "tailwind", "css", "shadcn", "dashboard"], reason: "Frontend framework, UI, state", weight: 5 },
  { file: "frontend-architecture.md", keywords: ["frontend", "react", "vue", "svelte", "next", "nextjs", "spa", "ssr", "web"], reason: "FE system design checklist for ARCHITECTURE.md", weight: 4 },
  { file: "backend.md", keywords: ["backend", "hono", "elysia", "express", "fastify", "nestjs", "server", "go", "golang", "python", "fastapi", "django", "rust", "axum"], reason: "Backend frameworks, ORM, queues per language", weight: 4 },
  { file: "database.md", keywords: ["database", "postgres", "postgresql", "sqlite", "mysql", "prisma", "drizzle", "orm", "sql", "mongodb", "migration"], reason: "Database, hosting, migrations", weight: 4 },
  { file: "cli.md", keywords: ["cli", "command", "command-line", "terminal", "shell", "tui", "binary", "argv", "cobra", "clap"], reason: "CLI and terminal tool rules", weight: 6 },
  { file: "ai-llm.md", keywords: ["llm", "ai", "agent", "agents", "rag", "embedding", "embeddings", "prompt", "prompts", "chatbot", "openai", "anthropic", "gemini", "vector", "inference", "model"], reason: "LLM product defaults, cost, safety, evals", weight: 6 },
  { file: "api.md", keywords: ["api", "rest", "trpc", "orpc", "openapi", "endpoint", "graphql", "grpc", "gateway"], reason: "API style, errors, versioning", weight: 4 },
  { file: "mobile.md", keywords: ["mobile", "ios", "android", "react-native", "expo", "flutter", "ota"], reason: "Mobile frameworks and app updates", weight: 5 },
  { file: "apple-macos-swift.md", keywords: ["macos", "osx", "swift", "swiftui", "xcode", "menubar", "finder", "apple", "appkit", "keychain", "notarization", "ios"], reason: "Native Apple stack, Keychain, notarization", weight: 6 },
  { file: "auth.md", keywords: ["auth", "login", "jwt", "clerk", "session", "oauth", "sso", "passkey", "signup"], reason: "Authentication options", weight: 5 },
  { file: "security.md", keywords: ["security", "encrypt", "encryption", "aes", "keychain", "touch", "privacy", "lock", "crypto", "secret", "password", "hdiutil", "llm", "ai"], reason: "Security controls and secrets", weight: 5 },
  { file: "compliance.md", keywords: ["gdpr", "pdp", "privacy", "compliance", "personal", "indonesia", "health", "pci", "payment"], reason: "Privacy law and compliance triggers", weight: 4 },
  { file: "data-services.md", keywords: ["cache", "redis", "valkey", "queue", "job", "worker", "cron", "kafka", "nats", "s3", "upload", "storage", "r2", "search", "file"], reason: "Cache, queue, jobs, storage, search", weight: 4 },
  { file: "realtime.md", keywords: ["realtime", "websocket", "sse", "pubsub", "chat", "collaboration", "live"], reason: "Realtime options", weight: 4 },
  { file: "offline-sync.md", keywords: ["offline", "offline-first", "crdt", "sync", "local-first"], reason: "Offline-first and sync", weight: 4 },
  { file: "api-ops.md", keywords: ["webhook", "rate", "ratelimit", "throttle"], reason: "Rate limiting and webhooks", weight: 4 },
  { file: "email-notifications.md", keywords: ["email", "notification", "push", "newsletter", "sms"], reason: "Email and notifications", weight: 4 },
  { file: "accessibility.md", keywords: ["a11y", "accessibility", "wcag"], reason: "Accessibility rules", weight: 5 },
  { file: "i18n.md", keywords: ["i18n", "l10n", "locale", "translation", "multilingual"], reason: "Internationalization", weight: 5 },
  { file: "performance.md", keywords: ["performance", "vital", "lcp", "inp", "cls", "latency", "seo"], reason: "Performance targets and techniques", weight: 4 },
  { file: "infrastructure.md", keywords: ["docker", "deploy", "k8s", "kubernetes", "infra", "hosting", "serverless", "edge", "vercel"], reason: "Hosting, edge, deploy strategy", weight: 3 },
  { file: "ci-cd.md", keywords: ["ci", "cd", "actions", "pipeline", "release"], reason: "CI and release pipelines", weight: 3 },
  { file: "observability.md", keywords: ["observability", "metrics", "tracing", "otel", "monitor", "logging", "alert"], reason: "Logs, metrics, traces, alerting", weight: 3 },
  { file: "reliability.md", keywords: ["backup", "disaster", "recovery", "load", "scale", "cost", "chaos"], reason: "Backup, DR, load test, cost", weight: 3 },
  { file: "engineering-practices.md", keywords: ["adr", "docs", "documentation", "config", "flag", "feature-flag", "onboarding", "error"], reason: "Error handling, config, flags, docs, ADR", weight: 2 },
];

const DEFAULT_ROOT = fileURLToPath(new URL("../../skill/inisiasi/references/sot", import.meta.url));
// Accepts "Last verified" (English) and "Terakhir diverifikasi" (older Indonesian headers).
const VERIFIED_RE = /^>\s*(?:Last verified|Terakhir diverifikasi):\s*(\d{4}-\d{2}-\d{2})\s*$/m;
const MAX_FILES = 8;

export function referencesRoot(): string {
  return process.env.INISIASI_REFERENCES ?? DEFAULT_ROOT;
}

function tokens(s: string): Set<string> {
  const out = new Set<string>();
  for (const raw of s.toLowerCase().split(/[^a-z0-9+#.]+/)) {
    const t = raw.replace(/^\.+|\.+$/g, "");
    if (t.length < 2) continue;
    out.add(t);
    if (t.endsWith(".js")) out.add(t.slice(0, -3)).add(t.replace(".", ""));
    if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) out.add(t.slice(0, -1));
  }
  return out;
}

export function isStale(iso: string | null, now = new Date()): boolean {
  if (!iso) return true;
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(+d)) return true;
  const cutoff = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
  return d < cutoff;
}

function meta(root: string, file: string): { verified_at: string | null; stale: boolean } {
  const text = readText(join(root, file)) ?? "";
  const m = VERIFIED_RE.exec(text.slice(0, 800));
  const verified_at = m?.[1] ?? null;
  return { verified_at, stale: isStale(verified_at) };
}


function keywordHit(words: Set<string>, text: string, kw: string): boolean {
  if (words.has(kw)) return true;
  if (!kw.includes("-") && !kw.includes(" ")) return false;
  const needle = kw.replace(/-/g, " ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${needle}(?:$|[^a-z0-9])`).test(text);
}

const NEEDS = [
  { label: "Apple/macOS/Swift", re: /\b(macos|osx|swiftui|\bswift\b|xcode|menubar|finder|apple)\b/i, files: ["apple", "macos", "swift"] },
  { label: "CLI/terminal", re: /\b(cli|command-line|command line|terminal tool|tui)\b/i, files: ["cli"] },
  { label: "AI/LLM", re: /\b(llm|rag|chatbot|embedding|inference|ai agent)\b/i, files: ["ai-llm", "llm"] },
];

export function selectReferences(input: { project_description?: string; plan_path?: string; limit?: number }): SelectReferencesResult {
  const root = referencesRoot();
  if (!existsSync(root)) return { references_root: root, files: [], gaps: ["SoT references not found"] };

  const available = new Set(readdirSync(root).filter((f) => f.endsWith(".md")));
  const plan = input.plan_path ? readText(resolvePlanPath(input.plan_path)) ?? "" : "";
  const description = [input.project_description ?? "", plan].filter(Boolean).join("\n");
  const words = tokens(description);
  const text = description.toLowerCase();

  const scored = new Map<string, { score: number; reason: string }>();
  for (const rule of RULES) {
    if (!available.has(rule.file)) continue;
    let score = rule.always ? rule.weight : 0;
    for (const kw of rule.keywords) {
      if (keywordHit(words, text, kw)) { score += rule.weight; break; }
    }
    if (score <= 0) continue;
    const prev = scored.get(rule.file);
    if (!prev || score > prev.score) scored.set(rule.file, { score, reason: rule.reason });
  }

  const limit = Math.min(MAX_FILES, Math.max(1, Math.floor(typeof input.limit === "number" && Number.isFinite(input.limit) ? input.limit : MAX_FILES)));
  const files = [...scored.entries()]
    .sort((a, b) => b[1].score - a[1].score || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([file, s]) => ({ file, path: file, reason: s.reason, score: s.score, ...meta(root, file) }));

  // A request naming a platform with no SoT file would silently get generic advice, so report it.
  const gaps: string[] = [];
  for (const want of NEEDS) {
    if (!want.re.test(description)) continue;
    const hit = [...available].some((f) => want.files.some((name) => f.toLowerCase().includes(name)));
    if (!hit) gaps.push(`No ${want.label} SoT file`);
  }

  return { references_root: root, files, gaps };
}

