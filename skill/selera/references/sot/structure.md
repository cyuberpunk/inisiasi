# Struktur project

> Terakhir diverifikasi: 2026-11-16

Scope: bentuk repo, root directory, penempatan tes, pola folder, higiene direktori.

## Repo

Monorepo hanya jika ada lebih dari satu deployable atau paket yang dipakai bersama. Selain itu satu repo satu app. Jangan polyrepo untuk satu produk.

Monorepo: `apps/`, `packages/`, `tools/`. Package manager satu saja. Runner: Turborepo untuk TypeScript, Nx hanya jika butuh generator dan graph besar.

## Root directory

| Path | Isi |
|------|-----|
| `src/` | Kode aplikasi. Tidak ada kode di root selain config |
| `public/` | Aset statis yang disajikan apa adanya |
| `scripts/` | Otomasi yang dijalankan manusia atau CI |
| `docs/` | Dokumen, ADR di `docs/adr/` |
| `tests/` | Hanya jika tidak co-located |

Root hanya berisi config, README, lockfile, dan file metadata.

## Tes

Default co-located: `order-service.test.ts` di sebelah sumbernya. Pisah ke `tests/` hanya untuk E2E dan fixture lintas fitur. Jangan dua pola dalam satu app.

## Pola folder

| Pola | Pakai kalau |
|------|-------------|
| Feature-based | Default. Satu folder per domain, isi komponen, hook, query, tes |
| Layer-based | App kecil, atau tim yang berpikir per teknologi |
| Feature-Sliced Design | Frontend besar, banyak tim, butuh boundary keras |
| Atomic Design | Design system, bukan app |
| Clean / Hexagonal | Domain logic kompleks yang harus lepas dari framework |

Satu pola per app. Jangan campur layer dan feature dalam satu app.

## Higiene

- Kedalaman folder maksimal 4. Lebih dari itu, ratakan.
- Rule of three: abstraksi setelah tiga kemunculan nyata, bukan dua.
- Tidak ada folder `misc`, `temp`, `old`, `backup`. Kalau tidak dipakai, hapus.
- Nama folder tunggal (`order/`), kecuali memang koleksi (`packages/`).
