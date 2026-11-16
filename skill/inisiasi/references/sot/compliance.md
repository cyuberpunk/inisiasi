# Compliance dan privasi

> Terakhir diverifikasi: 2026-11-16

Scope: regulasi data pribadi dan sertifikasi yang memicu kewajiban teknis. Bukan nasihat hukum.

## Trigger

| Regulasi | Kena kalau |
|----------|-----------|
| UU PDP (UU 27/2022) + PP 33/2026 | Memproses data pribadi di Indonesia, atau berakibat hukum bagi WNI |
| GDPR / UK GDPR | Pengguna atau establishment di UE/UK |
| CCPA/CPRA | Konsumen California di atas ambang |
| HIPAA | Data kesehatan AS |
| EU AI Act | Fitur AI dipasarkan atau dipakai di UE |
| PCI DSS | Menerima kartu. Pakai processor (Stripe dsb.), jangan simpan PAN/CVV |
| SOC 2, ISO 27001 | Diminta pelanggan enterprise |

Indonesia sektoral: registrasi PSE (Komdigi), aturan OJK untuk keuangan.

## UU PDP

- Status: transisi selesai 17 Okt 2024. PP 33/2026 (diundangkan 16 Jul 2026) aturan pelaksana. Wewenang pengawasan lembaga berlaku 16 Jan 2027, lembaga belum terbentuk. Kewajiban pengendali sudah berlaku.
- Data spesifik (Pasal 4): kesehatan, biometrik, genetika, catatan kejahatan, data anak, keuangan pribadi. Kumpulkan hanya jika perlu.
- Data anak: persetujuan orang tua/wali (Pasal 25).
- Dasar pemrosesan (Pasal 20): consent eksplisit, kontrak, kewajiban hukum, kepentingan vital, tugas publik, atau kepentingan sah. Jangan semuanya consent. Simpan bukti consent.
- Hak subjek: akses dan salinan, perbaikan, hapus, tarik consent, batasi pemrosesan, keberatan atas keputusan otomatis, portabilitas. Banyak permintaan wajib ditindak dalam 3x24 jam.
- Hapus: hard delete atau anonimisasi tak terbalik. Dokumentasikan jeda backup dan legal hold.
- Catat aktivitas pemrosesan (Pasal 31). DPIA untuk risiko tinggi (Pasal 34): data spesifik, skala besar, profiling, teknologi baru.
- Prosesor (vendor) wajib kontrak tertulis (Pasal 51).
- Kebocoran (Pasal 46): pemberitahuan tertulis paling lambat 3x24 jam ke subjek dan lembaga. GDPR: 72 jam ke otoritas.
- Transfer ke luar negeri (Pasal 56): negara tujuan setara, atau pelindungan memadai dan mengikat (kontrak), atau consent. Relevan untuk SaaS luar negeri (hosting DB, auth, analytics).
- Pejabat pelindungan data/DPO (Pasal 53): wajib untuk pelayanan publik, pemantauan sistematis skala besar, atau data spesifik skala besar.
- Sanksi: administratif sampai 2% pendapatan tahunan (Pasal 57); pidana sampai 6 tahun / Rp6 miliar.

## Praktik teknis

Data minimization, retensi terdefinisi, enkripsi in transit dan at rest, least privilege, audit log akses data sensitif, privacy notice jelas, alur ekspor dan hapus data, runbook insiden dengan jam 3x24 dan 72. Cookie non-esensial di UE butuh consent. Di Indonesia, cookie yang memproses data pribadi butuh dasar Pasal 20.

## EU AI Act

Larangan dan kewajiban transparansi sudah berlaku. Kewajiban high-risk mundur lewat Digital Omnibus: sistem standalone 2 Des 2027, komponen produk 2 Agu 2028.
