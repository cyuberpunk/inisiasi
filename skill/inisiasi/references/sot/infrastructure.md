# Infrastructure and deployment

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: OpenTofu 1.13.9 and Terraform 1.17.2 latest releases and repo activity. Carried over from 2026-11-19: Workers CPU limits and nodejs_compat default, Vercel Edge deprecation, Deno Deploy sunset, MinIO, OpenTofu, Alchemy, Cloudflare Containers. Not checked: state backend behaviour per provider, Argo CD and Flux versions.

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

## Infrastructure as code

| Need | Use | Note |
|------|-----|------|
| Manage cloud resources from the repo | OpenTofu 1.13 or Terraform 1.17 | OpenTofu is the MPL fork with no license risk, and supports the Terraform 1.x provider set |
| Cloudflare resources | Alchemy, or the Cloudflare provider | Alchemy is TS-native, and the provider works under OpenTofu |
| General-purpose programming | Pulumi | Use when the team wants TS, Go, or Python instead of HCL |
| Kubernetes manifests | Helm, or Kustomize for plain overlays | Argo CD or Flux to reconcile from git |

Rules:

- The state backend is remote and locked before the second person runs `apply`: S3, GCS, or a Terraform Cloud workspace. Local state in git is a data leak and a race.
- State contains secrets in plaintext. Encrypt it at rest, restrict read access, and never commit it. Do not put secret values in resources, reference the secret manager instead.
- `plan` in CI on every PR, `apply` only from a merged commit on the main branch. The plan output is the review.
- A single account and a single environment are acceptable early. From the second environment, separate state per environment: a directory each, or `terraform.workspace`, over the same modules. One shared state for two environments means a mistake in one can destroy the other.
- Drift is a finding, not a nuisance. Run a scheduled `plan` and alert when it is not empty. Someone changed the console and the next apply will revert it, or the console change is real and the code is wrong. Either way you need to know.
- Pin the provider versions and commit the lock file (`.terraform.lock.hcl`).

Avoid: hand-clicked changes outside the code, state in git, `apply` from a laptop in production, and a module without a version constraint.

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
