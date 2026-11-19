# Infrastructure and deployment

> Last verified: 2026-11-16

Scope: compute, hosting, edge, serverless, IaC, deploy strategies. CI: [ci-cd.md](ci-cd.md).

## Defaults

Start simple: a single binary or Docker Compose / PaaS. Grow step by step: a self-hosted VPS (Coolify, Dokploy, Kamal), then managed containers (Cloud Run, ECS Fargate), and only then Kubernetes when there are many teams and services.

| Need | Use |
|-----------|-----|
| Fullstack TS, frontend | Vercel (Node Functions + Fluid compute) or Cloudflare (Workers) |
| Fast containers | Fly.io, Railway, Render |
| Edge + data | Cloudflare Workers + D1, KV, R2, Durable Objects, Hyperdrive (Postgres), Containers |
| Managed backend | Convex |
| IaC | OpenTofu. Terraform if you need HCP. Cloudflare: Alchemy. Alternative: Pulumi |
| Reverse proxy | Caddy (automatic TLS), Traefik (containers) |
| CDN | Cloudflare |

## Runtimes

- Node: widest compatibility. Bun: fast dev, Elysia. Workers: use a framework built on Web APIs (Hono); Node APIs are a subset (`nodejs_compat` is default since compat date 2026-08-04).
- Workers limits: CPU time per request (Free 10 ms, Paid default 30 seconds). Heavy work: Durable Objects, Queues, or Containers.

## Serverless

Good for spiky traffic, event-driven work, webhooks, and cron. Steady high traffic or heavy compute: containers. Reuse DB connections outside the handler, use a pooler. Handlers must be idempotent because of retries. Long workflows: Inngest, Trigger.dev, Temporal, Cloudflare Workflows.

## Deploy strategies

| Stage | Strategy |
|-------|----------|
| Small | Recreate or rolling |
| Growing | Rolling + readiness probe |
| Critical | Blue-green or canary |
| Mature Kubernetes | Automated canary (Argo Rollouts, Flagger) |

Zero-downtime requirements: health checks (liveness, readiness, startup), graceful shutdown, connection draining, the API and DB schema stay compatible with both old and new versions during the transition. Rollback must be tested. Artifacts are immutable.

## Avoid

- Vercel Edge Functions (deprecated) and `runtime = 'edge'` in new Next.js apps.
- Deno Deploy for new projects (shutting down around Apr 2027).
- MinIO (repository archived).
- Kubernetes for one team with a few services.
