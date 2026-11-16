# CI/CD

> Terakhir diverifikasi: 2026-11-16

Scope: pipeline, environment, secrets CI, release. Toolchain TS: [toolchain-ts.md](toolchain-ts.md).

## Default

| Kategori | Pakai |
|----------|-------|
| CI | GitHub Actions. GitLab CI jika repo di GitLab. Self-host: Woodpecker |
| Container | Docker. Podman di RHEL/rootless |
| Preview | Vercel atau Cloudflare per PR |
| Release | Changesets (monorepo TS) atau semantic-release |

## Pipeline

- PR: lint + format check + typecheck + unit + integration (Testcontainers) + build + scan dependency dan SAST. Target < 10 menit, job paralel, fail fast.
- Lint per bahasa: `vp check` atau Oxlint + Oxfmt (TS), golangci-lint (Go), ruff + mypy (Python), clippy + rustfmt (Rust).
- Main: tes penuh, build image dengan artifact attestation / SLSA provenance, deploy staging, smoke/E2E, promote ke produksi.
- Monorepo: hanya jalankan paket yang berubah.
- Cache: store pnpm/bun, Go modules, cargo, layer Docker.
- Merge queue untuk repo ramai. Status check wajib sebelum merge.
- Migrasi DB bagian dari deploy, health check setelah deploy, rollback otomatis bila error naik.

## Environment

Local (seed), Preview (seed / anonim), Staging (anonim, mirip produksi), Production. Jangan data produksi mentah di preview atau staging.

## Secrets

OIDC ke cloud (AWS, GCP, Azure), bukan long-lived key. GitHub Secrets untuk secret statis. Jangan echo ke log. Pin action pihak ketiga ke SHA.
