# CI/CD

> Last verified: 2026-11-16

Scope: pipelines, environments, CI secrets, releases. TS toolchain: [toolchain-ts.md](toolchain-ts.md).

## Defaults

| Category | Use |
|----------|-----|
| CI | GitHub Actions. GitLab CI if the repo is on GitLab. Self-hosted: Woodpecker |
| Containers | Docker. Podman on RHEL/rootless |
| Previews | Vercel or Cloudflare per PR |
| Releases | Changesets (TS monorepos) or semantic-release |

## Pipeline

- PR: lint + format check + typecheck + unit + integration (Testcontainers) + build + dependency and SAST scans. Target under 10 minutes, parallel jobs, fail fast.
- Lint per language: `vp check` or Oxlint + Oxfmt (TS), golangci-lint (Go), ruff + mypy (Python), clippy + rustfmt (Rust).
- Main: full tests, build the image with artifact attestation / SLSA provenance, deploy to staging, smoke/E2E, promote to production.
- Monorepo: run only the packages that changed.
- Cache: pnpm/bun store, Go modules, cargo, Docker layers.
- Merge queue for busy repos. Required status checks before merge.
- DB migrations are part of the deploy. Health checks after deploy, automatic rollback if the error rate rises.

## Environments

Local (seeded), Preview (seeded or anonymous), Staging (anonymous, production-like), Production. Never put raw production data in preview or staging.

## Secrets

OIDC to the cloud (AWS, GCP, Azure), not long-lived keys. GitHub Secrets for static secrets. Never echo secrets to logs. Pin third-party actions to a SHA.
