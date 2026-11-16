# Import dan export

> Terakhir diverifikasi: 2026-11-16

Scope: path, alias, bentuk export, barrel, arah dependensi.

## Path

Default alias absolut: `@/` untuk `src/`. Relative import hanya untuk sibling dalam folder yang sama.

Jangan lebih dari dua level relative (`../../`). Kalau perlu naik tiga, alias atau struktur yang salah.

## Export

- Default: named export. Memudahkan rename, pencarian pemakaian, dan tree shaking.
- Default export hanya untuk file yang dituntut framework (page, layout Next.js) dan file config.
- `export *` dilarang di luar barrel modul publik.
- Type: `import type` / `export type` supaya hilang saat compile.

## Barrel dan batas publik

Barrel (`index.ts`) hanya di batas modul publik: `packages/ui/index.ts`, `modules/order/index.ts`. Di dalam modul, import langsung ke file.

Yang diekspor dari index adalah API; sisanya internal. Linter batas (`eslint-plugin-boundaries`, `dependency-cruiser`) menegakkan ini di CI.

## Urutan dan arah

1. Node builtin, 2. dependency eksternal, 3. paket internal, 4. alias lokal, 5. relative, 6. style. Satu baris kosong antar grup, alfabetis di dalam grup. Formatter atau `eslint-plugin-import` yang mengurutkan.

Arah satu arah: `app -> features -> shared`. Tidak ada import balik. Siklus dilarang; deteksi dengan `madge` atau `dependency-cruiser`.
