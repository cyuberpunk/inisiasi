# SoT inisiasi

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: index entries against files in this folder, the stage rule against npm and GitHub release data, the data analytics defaults in [data-analytics.md](data-analytics.md). Not checked: OWASP Top 10:2025 and Vite+ names, still from the 2026-11-19 pass.

Source-of-truth index for the `inisiasi` skill.

The defaults in this folder reflect the owner's bias (TypeScript with Vite+, Apple native, Postgres, Cloudflare), not universal law. If a project requires something else, name the deviation and its reason. Do not silently follow or silently ignore a default. Read only the files relevant to PLAN. Each file has: scope, defaults, use when, avoid. If something is not covered here, do not make it up: mark it as a gap and ask the owner.

## Always

| File | Contents |
|------|-----|
| [architecture.md](architecture.md) | Architecture defaults, layering, patterns, Postgres queues, multi-tenancy |
| [problems-critical.md](problems-critical.md) | Expensive mistakes if wrong from day one (money, authz, RLS, secrets) |
| [testing.md](testing.md) | Test strategy and tools |
| [diagrams.md](diagrams.md) | C4 levels and notation for ARCHITECTURE.md |

## Stack

| File | Read when |
|------|-----------|
| [toolchain-ts.md](toolchain-ts.md) | TS/JS project: Vite+, Oxlint, Oxfmt, Vitest, monorepo |
| [stack-compat-ts.md](stack-compat-ts.md) | Assembling a TS stack (valid and forbidden combinations) |
| [frontend.md](frontend.md) | Web frameworks, state, forms, SEO, CMS, admin dashboards |
| [frontend-architecture.md](frontend-architecture.md) | Frontend system design checklist |
| [styling.md](styling.md) | CSS approach: utility, CSS Modules, CSS-in-JS. Foundations: Tailwind, Bootstrap, tokens |
| [ui-kits.md](ui-kits.md) | React and framework-neutral component libraries, ranked by downloads |
| [ui-kits-frameworks.md](ui-kits-frameworks.md) | Vue, Svelte, Angular, Lit kits |
| [ui-kits-native.md](ui-kits-native.md) | React Native, Expo, Flutter kits |
| [design-systems.md](design-systems.md) | Tokens and published systems: Material, Carbon, USWDS, GOV.UK, and the mandated cases |
| [ui-catalog.md](ui-catalog.md) | Icons, motion, loading, charts, diagrams, sound |
| [ui-catalog-scores.md](ui-catalog-scores.md) | 0-10 score per catalog library (hand-edited) |
| [backend.md](backend.md) | Server frameworks, ORMs, queues, payments per language: TS, Go, Python, Rust, PHP, JVM, Ruby, .NET |
| [database.md](database.md) | Databases, hosts, migrations |
| [data-analytics.md](data-analytics.md) | Pipelines, warehouse, transform, BI: dbt, Airflow, DuckDB, Polars |
| [api.md](api.md) | REST, tRPC/oRPC, GraphQL, gRPC, versioning, gateways |
| [mobile.md](mobile.md) | Expo, Flutter, native, app updates |
| [apple-macos-swift.md](apple-macos-swift.md) | macOS/iOS/iPadOS native, Swift, notarization |
| [desktop.md](desktop.md) | Windows, Linux, cross-platform desktop: Tauri, packaging, signing, updates |
| [cli.md](cli.md) | Command-line tools: parser, output, distribution, tests |
| [ai-llm.md](ai-llm.md) | LLM products: SDKs, streaming, RAG, cost, security |

## Domain

| File | Read when |
|------|-----------|
| [auth.md](auth.md) | Login, SSO, sessions |
| [multi-tenancy.md](multi-tenancy.md) | Several customers or organizations share the system (RLS, isolation) |
| [billing.md](billing.md) | Subscriptions, entitlements, in-app purchases |
| [security.md](security.md) | Almost always: secrets, supply chain, OWASP 2025 |
| [compliance.md](compliance.md) | Personal data is involved (Indonesia PDP law, GDPR) |
| [data-services.md](data-services.md) | Cache, queues, jobs, file uploads, search |
| [realtime.md](realtime.md) | SSE, WebSocket, collaboration |
| [offline-sync.md](offline-sync.md) | Offline-first, sync engines |
| [api-ops.md](api-ops.md) | Rate limits, webhooks |
| [email-notifications.md](email-notifications.md) | Email, push, in-app |
| [accessibility.md](accessibility.md) | Any UI |
| [i18n.md](i18n.md) | Multiple languages |
| [performance.md](performance.md) | Web vitals, optimization |

## Operations

| File | Read when |
|------|-----------|
| [infrastructure.md](infrastructure.md) | Hosting, edge, serverless, deployment strategy |
| [ci-cd.md](ci-cd.md) | Pipelines |
| [observability.md](observability.md) | Logs, metrics, traces, alerts, product analytics |
| [reliability.md](reliability.md) | Backups, DR, load tests, chaos, cost |
| [engineering-practices.md](engineering-practices.md) | Error handling, config, flags, docs, ADRs, local dev |
| [diagnosis.md](diagnosis.md) | Symptoms to causes during an incident |
| [problems-data.md](problems-data.md) | Transactions, migrations, deadlocks |
| [problems-performance.md](problems-performance.md) | Slowness and resource exhaustion |
| [problems-ops.md](problems-ops.md) | Deploy, dependency, and queue failures |

## Engineering

| File | Read when |
|------|-----------|
| [agentic-engineering.md](agentic-engineering.md) | The product runs agents or is an MCP server, or the work is done with coding agents |
| [agent-loops.md](agent-loops.md) | An agent loops: stop conditions, verification, retries, checkpoints |
| [agent-graphs.md](agent-graphs.md) | A multi-step AI flow with branches, parallel steps, or human pauses |
| [idioms.md](idioms.md) | Writing TypeScript, Swift, Python, or SQL |
| [mechanisms.md](mechanisms.md) | Retries, concurrency, locks, rate limits, caches |
| [scaling.md](scaling.md) | Expected load growth, high traffic, read replicas, partitioning |
| [concurrency.md](concurrency.md) | Workers, async, race conditions, isolation levels |
| [scenarios.md](scenarios.md) | The product resembles a known design: shortener, video, shop, payment, chat, notifications, high-traffic read API |

## Usage rules

1. A default in a file is a decision, not a menu. Pick an alternative only when its "Use when" condition is met.
2. Do not recommend anything listed under "Avoid".
3. Versions and tool status change. If you need an exact version number, check the official docs at that time.
4. A pre-1.0, beta or alpha tool may still be the default when it is widely used and the community keeps using it. Never drop a popular library only because it has not reached 1.0. State its stage next to the name (`0.44`, `beta`, `rc`), and do not pin a version that is not stable unless the file already does. Drop a tool only when it is archived, unmaintained (no release and no push for 12 months), shut down, or niche with no leadership.
5. Every file here is re-verified at least every 6 months. `pnpm test` in `mcp/` fails when a file is older than that, and CI runs it on every push and once a week. To clear it, check the file against the web, update `Last verified`, and say in the second line what you checked and what you did not.
