# Infrastruktur dan deploy

> Terakhir diverifikasi: 2026-11-16

Scope: compute, hosting, edge, serverless, IaC, strategi deploy. CI: [ci-cd.md](ci-cd.md).

## Default

Mulai sederhana: single binary atau Docker Compose / PaaS. Naik bertahap: self-host VPS (Coolify, Dokploy, Kamal), lalu container managed (Cloud Run, ECS Fargate), baru Kubernetes jika banyak tim dan service.

| Kebutuhan | Pakai |
|-----------|-------|
| Fullstack TS, frontend | Vercel (Functions Node + Fluid compute) atau Cloudflare (Workers) |
| Container cepat | Fly.io, Railway, Render |
| Edge + data | Cloudflare Workers + D1, KV, R2, Durable Objects, Hyperdrive (Postgres), Containers |
| Backend terkelola | Convex |
| IaC | OpenTofu. Terraform jika butuh HCP. Cloudflare: Alchemy. Alternatif: Pulumi |
| Reverse proxy | Caddy (TLS otomatis), Traefik (container) |
| CDN | Cloudflare |

## Runtime

- Node: kompatibilitas paling luas. Bun: dev cepat, Elysia. Workers: pakai framework berbasis Web API (Hono), Node API hanya subset (`nodejs_compat` default sejak compat date 2026-08-04).
- Batas Workers: CPU time per request (Free 10 ms, Paid default 30 detik). Kerja berat: Durable Objects, Queues, atau Containers.

## Serverless

Cocok untuk traffic spiky, event-driven, webhook, cron. Traffic stabil tinggi atau compute berat: container. Reuse koneksi DB di luar handler, pakai pooler. Handler idempotent karena retry. Workflow panjang: Inngest, Trigger.dev, Temporal, Cloudflare Workflows.

## Strategi deploy

| Tahap | Strategi |
|-------|----------|
| Kecil | Recreate atau rolling |
| Berkembang | Rolling + readiness probe |
| Kritis | Blue-green atau canary |
| Kubernetes matang | Canary otomatis (Argo Rollouts, Flagger) |

Syarat zero-downtime: health check (liveness, readiness, startup), graceful shutdown, connection draining, API dan skema DB kompatibel lama dan baru selama transisi. Rollback harus pernah dites. Artefak immutable.

## Hindari

- Vercel Edge Functions (deprecated) dan `runtime = 'edge'` di Next.js baru.
- Deno Deploy untuk project baru (tutup sekitar Apr 2027).
- MinIO (repo diarsipkan).
- Kubernetes untuk satu tim dengan beberapa service.
