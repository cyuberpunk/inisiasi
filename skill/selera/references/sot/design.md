# Prinsip desain

> Terakhir diverifikasi: 2026-11-16

Scope: SOLID, DRY/KISS/YAGNI, komposisi, pemisahan tanggung jawab.

## SOLID

- SRP: satu alasan untuk berubah, per fungsi, modul, file.
- OCP: perluas dengan kode baru, bukan menambah cabang di kode stabil.
- LSP: implementasi tidak boleh melanggar kontrak induk.
- ISP: interface kecil sesuai pemakai.
- DIP: logika bisnis bergantung pada abstraksi, I/O di adapter.

## Sehari-hari

- DRY setelah dua kemunculan nyata. Abstraksi prematur lebih mahal daripada duplikasi kecil.
- KISS: pilih yang paling mudah dihapus, bukan paling umum.
- YAGNI: tanpa parameter, cabang, atau lapisan untuk kebutuhan yang belum ada.
- Komposisi di atas inheritance. Inheritance maksimal satu level.
- SoC: parsing, aturan bisnis, I/O, presentasi tidak dalam satu fungsi.

## Tanda perlu dipecah

Nama mengandung "dan". Komentar panjang menjelaskan blok di dalam fungsi. Test butuh setup besar untuk satu cabang. Perubahan kecil menyentuh banyak file.

## Hindari

Utilitas generik tanpa pemakai. Factory untuk satu produk. Singleton untuk state yang bisa diteruskan. Wrapper yang hanya meneruskan parameter.
