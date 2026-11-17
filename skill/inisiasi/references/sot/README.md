# SoT inisiasi

> Terakhir diverifikasi: 2026-11-16

Index source of truth untuk skill `inisiasi`.

Default di file ini adalah bias owner (TypeScript dengan Vite+, Apple native, Postgres, Cloudflare), bukan hukum universal. Kalau project menuntut lain, sebut penyimpangannya dan alasannya. Jangan diam-diam ikut atau diam-diam meninggalkan. Baca hanya file yang relevan dengan PLAN. Setiap file: scope, default, pakai kalau, hindari. Kalau tidak ada di sini, jangan mengarang: tandai sebagai gap dan tanya owner.

## Selalu

| File | Isi |
|------|-----|
| [architecture.md](architecture.md) | Default arsitektur, pola, antrean |
| [multi-tenancy.md](multi-tenancy.md) | RLS dan isolasi antar tenant |
| [problems-critical.md](problems-critical.md) | Masalah mahal kalau salah sejak awal (uang, authz, RLS, secret) |
| [diagnosis.md](diagnosis.md) | Gejala ke penyebab saat incident |
| [testing.md](testing.md) | Strategi dan tool tes |

## Stack

| File | Baca kalau |
|------|-----------|
| [toolchain-ts.md](toolchain-ts.md) | Project TS/JS: Vite+, Oxlint, Oxfmt, Vitest, monorepo |
| [stack-compat-ts.md](stack-compat-ts.md) | Merakit stack TS (kombinasi valid dan terlarang) |
| [frontend.md](frontend.md) | Framework web, UI, state, form, i18n |
| [frontend-architecture.md](frontend-architecture.md) | Checklist system design FE |
| [ui-catalog.md](ui-catalog.md) | Ikon, motion, loading, chart, diagram, sound |
| [ui-catalog-scores.md](ui-catalog-scores.md) | Skor 0-10 tiap library katalog (hasil skrip) |
| [backend.md](backend.md) | Framework server, ORM, queue per bahasa |
| [database.md](database.md) | Database, host, migrasi |
| [api.md](api.md) | REST, tRPC/oRPC, GraphQL, gRPC, versi, gateway |
| [mobile.md](mobile.md) | Expo, Flutter, native, update app |
| [apple-macos-swift.md](apple-macos-swift.md) | macOS/iOS native, Swift, notarization |
| [cli.md](cli.md) | Tool command line: parser, output, distribusi, tes |
| [ai-llm.md](ai-llm.md) | Produk dengan LLM: SDK, streaming, RAG, biaya, keamanan |

## Domain

| File | Baca kalau |
|------|-----------|
| [auth.md](auth.md) | Login, SSO, session |
| [security.md](security.md) | Hampir selalu: secrets, supply chain, OWASP 2025 |
| [compliance.md](compliance.md) | Ada data pribadi (UU PDP, GDPR) |
| [data-services.md](data-services.md) | Cache, queue, job, file upload, search |
| [realtime.md](realtime.md) | SSE, WebSocket, kolaborasi |
| [offline-sync.md](offline-sync.md) | Offline-first, sync engine |
| [api-ops.md](api-ops.md) | Rate limit, webhook |
| [email-notifications.md](email-notifications.md) | Email, push, in-app |
| [accessibility.md](accessibility.md) | Ada UI |
| [i18n.md](i18n.md) | Multi bahasa |
| [performance.md](performance.md) | Web vitals, optimasi |

## Operasi

| File | Baca kalau |
|------|-----------|
| [infrastructure.md](infrastructure.md) | Hosting, edge, serverless, strategi deploy |
| [ci-cd.md](ci-cd.md) | Pipeline |
| [observability.md](observability.md) | Log, metrik, trace, alert |
| [reliability.md](reliability.md) | Backup, DR, load test, chaos, biaya |
| [engineering-practices.md](engineering-practices.md) | Error handling, config, flag, docs, ADR, local dev |

## Aturan pakai

1. Default di file adalah keputusan, bukan menu. Pilih alternatif hanya jika kondisi "Pakai kalau" terpenuhi.
2. Jangan rekomendasikan apa pun di bagian "Hindari".
3. Versi dan status tool berubah. Jika butuh angka versi pasti, cek docs resmi saat itu.
