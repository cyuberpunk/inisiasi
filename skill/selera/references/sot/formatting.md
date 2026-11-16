# Formatting

> Terakhir diverifikasi: 2026-11-16

Scope: indentasi, lebar baris, kutip, semicolon, brace. Diputuskan formatter, bukan debat.

## Aturan mesin

Formatter memutuskan, bukan reviewer. Nilai di bawah contoh, bukan wajib: yang penting satu nilai dipilih, ditulis di config, dan dipatuhi semua orang. Konfigurasi di repo, jalan di pre-commit dan CI.

| Item | Contoh pilihan (satu per repo, tulis di config) |
|------|---------|
| Indentasi | 2 spasi (TS/JS/JSON/CSS), tab untuk Go, 4 spasi untuk Python/Rust |
| Lebar baris | 100. 80 hanya kode lama, 120 untuk repo yang sudah begitu |
| Kutip | Double untuk TS/JS, single untuk Python |
| Semicolon | Wajib di TS/JS |
| Trailing comma | `all` |
| Akhir file | Satu newline, tanpa trailing whitespace |
| Brace | K&R. Allman hanya jika bahasa menuntut |

## Aturan manusia

- Jangan memecah baris manual kalau formatter bisa.
- Chained call panjang: satu method per baris setelah titik pertama.
- Parameter lebih dari 3: satu per baris.
- String multi-baris pakai template literal, bukan konkatenasi.
- Diff besar karena reformat dipisah dari commit logika.
