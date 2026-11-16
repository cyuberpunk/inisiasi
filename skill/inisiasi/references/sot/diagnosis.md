# Diagnosis cepat

> Terakhir diverifikasi: 2026-11-16

Scope: gejala ke penyebab, urutan cek. Detail cegah: [problems-critical.md](problems-critical.md), [problems-performance.md](problems-performance.md), [problems-data.md](problems-data.md), [problems-ops.md](problems-ops.md).

| Gejala | Cek dulu |
|--------|----------|
| Lambat hanya di produksi | N+1, index hilang |
| Data salah intermiten di beban | Lost update, race |
| Pulih setelah restart lalu menurun lagi | Leak |
| Lonjakan setelah deploy atau cache expire | Stampede, thundering herd |
| Request putus saat deploy | Graceful shutdown, readiness |
| User melihat data user lain | IDOR, RLS |
| Instance sehat tapi dependency mati | Readiness vs liveness |
| Error deadlock atau serialization | Transaksi panjang, urutan lock |
| Timeout ambil koneksi, CPU DB rendah | Pool exhaustion, query lambat |

Urutan: pastikan gejalanya, cek metrik dan log, lihat perubahan terakhir, baru ubah satu hal.
