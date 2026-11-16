# Fungsi, variabel, alur

> Terakhir diverifikasi: 2026-11-16

Scope: bentuk fungsi, batas ukuran, early return, immutability, ternary.

## Bentuk

- Arrow function untuk callback dan komponen. `function` untuk deklarasi bernama yang di-hoist.
- IIFE hanya untuk top-level await di skrip sekali jalan.
- `async/await` di atas promise chain. `.then` hanya untuk transformasi satu baris.

## Batas

| Batas | Angka |
|---|---|
| Parameter | 3, lebih dari itu pakai options object |
| Panjang fungsi | 40 baris atau satu layar |
| Level indentasi | 3 |
| Cyclomatic | 10 |

Early return dan guard clause di atas. Fungsi tanpa efek samping diutamakan; efek samping dinyatakan di nama.

## Variabel dan alur

- `const` default, `let` hanya kalau diubah. Reassign parameter dilarang.
- Method non-mutating: `map`, `filter`, `toSorted`. Mutasi hanya di objek lokal baru.
- `===` dan `!==`. `==` hanya untuk `x == null`.
- Tanpa magic number atau string. Angkat ke konstanta bernama.
- Deklaratif untuk transformasi. `for` hanya untuk `break`, indeks, atau performa terukur.
- Ternary untuk dua pilihan pendek. Ternary bersarang dilarang.
