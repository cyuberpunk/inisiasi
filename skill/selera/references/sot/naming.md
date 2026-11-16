# Naming

> Terakhir diverifikasi: 2026-11-16

Scope: nama variabel, fungsi, file, folder, objek database, kelas CSS.

## Case style

| Bentuk | Pakai untuk |
|---|---|
| `camelCase` | Variabel, fungsi, properti, parameter |
| `PascalCase` | Tipe, kelas, komponen, enum |
| `SCREAMING_SNAKE_CASE` | Konstanta modul yang benar-benar tetap |
| `kebab-case` | Nama file, folder, route, paket, CSS class |
| `snake_case` | Kolom database, kunci JSON API eksternal |

Jangan campur dalam satu lapisan. Kalau API mengirim `snake_case`, ubah di boundary, bukan di seluruh app. Hungarian notation: jangan.

## Nama semantik

- Boolean: `is`, `has`, `can`, `should`, `did`. `isLoading`, bukan `loading`.
- Fungsi: kata kerja + objek. `fetchOrders`, `parsePlan`, `canRetry`.
- Handler: `handleSubmit` (internal), `onSubmit` (prop).
- Larangan: singkatan yang tidak umum, angka ajaib di nama (`data2`), awalan tipe (`strName`), negasi ganda (`isNotDisabled`).
- Koleksi jamak, elemen tunggal: `orders` / `order`.
- Nama harus bisa dibaca sebagai kalimat tanpa komentar.

## File dan folder

- Nama file mengikuti yang diekspor: `OrderCard.tsx`, `order-service.ts`.
- Satu konsep per file. `utils.ts` dan `helpers.ts` dilarang sebagai keranjang.
- Index sebagai barrel hanya di batas modul publik.

## Database dan CSS

Tabel jamak `orders`. Foreign key `<tabel>_id`. Index `idx_<tabel>_<kolom>`. Constraint `<tabel>_<kolom>_<jenis>`. CSS: satu metodologi per project. Tailwind utility-first untuk React baru; BEM hanya untuk CSS biasa.
