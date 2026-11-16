# Kompatibilitas stack TypeScript

> Terakhir diverifikasi: 2026-11-16

Scope: kombinasi frontend, backend, runtime, database, ORM, API yang aman dirakit. Baca sebelum menulis ARCHITECTURE.md untuk stack TS.

## Default

- Prototipe: TanStack Router atau TanStack Start + Hono + SQLite + Drizzle + Better Auth + pnpm workspaces.
- Produksi: ganti SQLite ke Postgres (Neon, Supabase, atau Postgres sendiri).
- Edge di Cloudflare: Workers + Hono + D1 (SQLite) + Drizzle.

## Aturan kombinasi

| Kalau | Maka | Jangan |
|-------|------|--------|
| MongoDB | Mongoose atau Prisma | Drizzle (tidak mendukung MongoDB) |
| SQLite, Postgres, MySQL | Drizzle atau Prisma | Mongoose |
| Cloudflare Workers | Hono, Drizzle atau Prisma, D1, Turso, atau Postgres via Hyperdrive | Express/Fastify sebagai default (bergantung lapisan kompatibilitas Node), Mongoose |
| D1 | Database SQLite, runtime Workers | Postgres/MySQL ORM dialect |
| Vue, Svelte, Solid, Astro | oRPC | tRPC (integrasi resminya untuk React/Next) |
| React, Next, TanStack, Expo | tRPC atau oRPC | |
| Convex | Convex menggantikan DB, ORM, dan API layer | Menambah Drizzle/Prisma/tRPC di atasnya |
| Better Auth | Butuh server dan, jika ada DB, adapter ORM | Dipakai tanpa backend |
| Desktop (Tauri, Electrobun) | Frontend web yang bisa di-export statis | App SSR-only tanpa export |

## Pilihan cepat

- SEO, RSC: Next.js. API boleh di dalam app (route handler) jika kecil.
- SPA, kontrol routing: TanStack Router. Fullstack: TanStack Start.
- Web + mobile share kode: TanStack/Next + Expo + Uniwind, tipe dan schema di `packages/`.
- Pembayaran/subscription: Polar atau Stripe. Polar punya plugin Better Auth.
- Realtime + backend terkelola: Convex.

## Hindari

- SolidStart untuk project baru (dihentikan di siklus Solid 2.0).
- Auth.js untuk project baru (sekarang bagian dari Better Auth).
- Vercel Edge Functions (deprecated). Pakai Vercel Functions (Node, Fluid compute).
