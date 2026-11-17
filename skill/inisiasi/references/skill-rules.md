# Aturan inisiasi, MCP, dan selera

Tiga pilar. Tiap pilar punya satu tugas. Jangan campur.

| Pilar | Tugas |
|---|---|
| MCP | Cari dan rekomendasikan skill |
| inisiasi | Blueprint: PLAN menjadi ARCHITECTURE dan TASKS, berjalan sepanjang proyek |
| selera | Rekam preferensi, keputusan tech, dan standar kode owner |

Target owner: generalis untuk web app, platform digital, integrasi, dashboard, AI agent, SaaS, tools. Platform: web, desktop (Linux, Windows, macOS), iOS, iPadOS, Android, hybrid. Bukan specialist, bukan korporat.

## 1. Memilih skill (MCP)

1. Batas aktif: 2 sampai 3 skill general dan 1 sampai 3 skill specific. Maksimal 6 sekaligus.
2. Lepas dulu yang sudah selesai dipakai sebelum memasang yang baru.
3. Skill harus relevan dengan task saat ini dan cocok dengan platform target. Tidak ada skill antisipasi.
4. Dua skill dengan peran sama tidak aktif bersamaan. Pilih satu dan sebut alasannya.
5. Urutan: `main` dulu, `support` hanya bila task punya kebutuhan konkret. Skor menjadi urutan, bukan satu-satunya alasan.
6. Cek sebelum merekomendasikan: skill hidup, `verified`, tidak tumpang tindih, platform cocok.
7. Hemat token: baca ringkasan, buka SKILL.md hanya untuk kandidat yang akan direkomendasikan.
8. Bundle (`bundle: true`): selalu `--list` dulu dan pilih per skill. Jangan pasang utuh.

## 2. Format rekomendasi

Setiap rekomendasi memuat:
- Opsi, minimal dua bila ada pilihan nyata.
- Risiko tiap opsi: biaya token, tumpang tindih, perawatan, keamanan.
- Satu rekomendasi dengan alasan satu kalimat.
- Perintah install, tidak dijalankan sebelum owner mengonfirmasi.

Bersikap seperti asisten keputusan tech: cegah masalah sebelum terjadi, bukan hanya menjawab.

## 3. inisiasi berjalan sepanjang proyek

Tidak sekali di kickoff. Tugas diulang saat dipicu.

| Pemicu | Tindakan |
|---|---|
| PLAN, TASKS, atau selera berubah | Cek drift antara selera, ARCHITECTURE, dan TASKS |
| Owner menjalankan perintah cek | Cek drift sekarang, lalu laporkan |
| Task butuh kemampuan baru | Rekomendasikan maksimal satu skill specific, dengan opsi dan risiko |
| Tidak ada pemicu | Diam. Tidak ada rekomendasi |

Tidak ada cek otomatis tiap sesi.

## 4. Menulis ke selera

Tiga jalur:

| Jalur | Kapan | Izin |
|---|---|---|
| Owner menyatakan preferensi | Kapan saja dalam sesi | Tidak minta izin, langsung `set` dan konfirmasi satu baris |
| `selera setup` | Owner memanggil | Owner mengisi atau melewati |
| inisiasi menyimpulkan keputusan tech baru | Saat PLAN, ARCHITECTURE, atau TASKS berubah | Mengusulkan, owner mengonfirmasi |

Nilai yang sudah tercatat tidak boleh ditimpa diam-diam. Preferensi yang tidak tercatat berarti SoT berlaku, bukan tebakan.

## 5. Bertanya

Tanya hanya bila stack atau platform belum jelas. Maksimal 3 pertanyaan, tiap pilihan disertai rekomendasi.
