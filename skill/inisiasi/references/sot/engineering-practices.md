# Praktik engineering

> Terakhir diverifikasi: 2026-11-16

Scope: error handling, config, feature flag, dokumentasi, ADR, onboarding, local dev, code review.

## Error handling

- Bedakan expected (validasi, not found) dan unexpected (bug, infra). Pesan ramah ke klien, detail di log.
- HTTP publik: RFC 9457 Problem Details. tRPC/oRPC: format bawaan + `request_id`.
- Timeout wajib (`AbortController`, Go `context`). Retry dengan backoff dan batas. Retry write hanya dengan `Idempotency-Key`. Circuit breaker opsional (opossum, gobreaker).
- Go: wrap dengan `%w`. TS: `AppError` bertipe atau Result type. Rust: thiserror (library), anyhow (app).
- Fail closed pada error auth. Jangan telan error.

## Konfigurasi

12-factor: config dari env, validasi saat startup, fail fast. Commit `.env.example`, jangan `.env`. TS: Zod, t3-env, atau varlock. Go: caarlos0/env. Secrets lewat secrets manager ([security.md](security.md)).

## Feature flag

Evaluasi lewat OpenFeature agar provider bisa diganti. Provider: PostHog (flags + analytics), GrowthBook (eksperimen), Unleash atau Flagsmith (self-host), LaunchDarkly (enterprise). Default off, punya owner dan tanggal hapus, evaluasi server-side untuk logic sensitif. Rollout: internal, persentase kecil, naik bertahap, kill switch.

## Dokumentasi dan ADR

- Docs di repo, di-update di PR yang sama. README harus bisa dijalankan: quick start, prasyarat, dev, test, deploy, env.
- API: OpenAPI + Scalar. Event: AsyncAPI. Diagram: Mermaid. Docs site: Starlight, Fumadocs, atau VitePress.
- Ringkasan untuk agent: `AGENTS.md` (cara run, struktur, keputusan stack, link ADR).
- ADR di `docs/adr/NNN-judul.md`, format: Status, Date, Context, Decision, Consequences, Alternatives. Immutable setelah Accepted, ganti dengan ADR baru. Tulis saat memilih framework, DB, auth, gaya arsitektur, atau menyimpang dari default di [architecture.md](architecture.md).
- Runbook: deploy, rollback, alert umum, akses log, kontak on-call.

## Local development dan onboarding

- Satu perintah (`make dev`, `vp dev`, atau `docker compose up`). Target clone sampai jalan < 30 menit.
- Pin versi runtime: mise, `packageManager` + corepack. Opsional: Dev Containers / Codespaces.
- Compose lokal: Postgres, Redis/Valkey, Garage atau SeaweedFS, Mailpit. Docker Compose Watch untuk reload.
- Seed idempotent, `.env.example` lengkap, pesan error jelas bila service hilang.
- Hari pertama: akses repo/CI/secrets/observability, setup lokal, jalankan tes, baca arsitektur. First task kecil: docs, bug kecil, tes.

## Code review

Conventional Commits. Cek: logic benar, tes ditambah, error handling, tanpa secret, dampak performa, docs ter-update, mengikuti pola project. CODEOWNERS dan required checks.
