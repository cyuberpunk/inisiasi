# Toolchain TypeScript

> Terakhir diverifikasi: 2026-11-16

Scope: lint, format, test, typecheck, build, monorepo, git hooks untuk project TS/JS. Default owner.

## Default

| Layer | Pakai | Catatan |
|-------|-------|---------|
| Toolchain | Vite+ (CLI `vp`) | Satu pintu: `vp dev`, `vp build`, `vp test`, `vp check` (lint, format, typecheck, test). Stabil sejak 1.0 |
| Bundler | Vite 8 (Rolldown default) | Stabil |
| Test | Vitest | Lewat Vite+ |
| Lint | Oxlint | Stabil. Type-aware lewat `oxlint-tsgolint` |
| Format | Oxfmt | Masih beta, Prettier-compatible |
| Typecheck | `tsc` atau `vp check` | Default tetap `tsc` |
| Monorepo | pnpm workspaces + Turborepo, atau Vite+ (`--recursive`, `--filter`) | Nx hanya monorepo enterprise besar |
| Package manager | pnpm. Alternatif: bun | npm boleh, lebih lambat. Yarn jangan untuk project baru |
| Git hooks | Lefthook, atau `vp` hooks bila pakai Vite+ | Husky + lint-staged hanya repo lama |
| Secret scan | gitleaks atau trufflehog | Di hook dan CI |

## Pakai kalau

- Biome: tim mau satu binary lint+format di luar Oxc. Bukan default.
- ESLint + Prettier: repo lama, atau butuh plugin yang belum ada di Oxlint.
- Next.js: Oxlint + Oxfmt saja. Jangan paksa Vite+ sebagai bundler Next.
- TypeScript 7 native preview (`tsgo`, `@typescript/native-preview`) atau `tsrs` (port Rust): eksperimen saja, bukan default.

## Data dan ekosistem VoidZero terkait

| Nama | Apa | Status di inisiasi |
|------|-----|--------------------|
| fate (`react-fate`) | Data client React/Vue, gaya Relay: normalized cache, data masking, live view SSE. Template: `vp create fate` | Pilih jika backend tRPC, GraphQL, atau Void dan butuh normalized cache. Selain itu TanStack Query |
| Void (void.cloud) | CLI, platform, dan SDK fullstack yang deploy ke Cloudflare | Opsional, bukan default |
| fbtee | i18n inline berbasis compiler, penerus `fbt` | Opsi i18n, lihat [frontend.md](frontend.md) |

Paket npm `void` tidak terkait. Jangan dipasang.

## Aturan

1. CI menjalankan `vp check` (atau lint + format check + typecheck + test) dan gagal bila ada error lint.
2. Monorepo: `apps/web`, `apps/server`, `apps/native`, `packages/*` (ui, db, auth, config). Paket internal pakai workspace protocol, nama `@repo/*`.
3. CI hanya menjalankan paket yang berubah (`turbo run build test --filter=...[origin/main]` atau `vp --filter`).
4. Commit lockfile. Bun pakai `bun.lock` (teks), bukan `bun.lockb`.
5. Conventional Commits.

## Hindari

- Menumpuk ESLint + Prettier + Biome + Oxlint di satu repo.
- Monorepo untuk satu app kecil atau proyek yang tidak saling terkait.
- Git submodules untuk berbagi kode.
