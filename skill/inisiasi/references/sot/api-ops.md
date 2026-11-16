# Rate limit dan webhook

> Terakhir diverifikasi: 2026-11-16

Scope: rate limiting, webhook masuk dan keluar.

## Rate limit

- Kunci: user ID atau API key setelah login. IP hanya untuk anonim (NAT, IPv6 membuat IP tidak adil).
- Algoritma: GCRA atau sliding window di Redis/Valkey untuk multi-instance. Token bucket jika burst boleh. Berbasis biaya untuk GraphQL atau endpoint mahal.
- Lapisan: app (Redis/Valkey), gateway/proxy, CDN.
- Respons: `429` + `Retry-After`. Header `RateLimit` / `RateLimit-Policy` (draft IETF), plus `X-RateLimit-*` untuk klien lama.
- Library: `rate-limiter-flexible` (Node), `go-redis/redis_rate` (Go, GCRA), `slowapi` (Python).
- Titik awal: login 5/menit/IP, API 100/menit/user, publik 30/menit/IP. Sesuaikan dengan data.

## Webhook keluar

- Kontrak: Standard Webhooks (header `webhook-id`, `webhook-timestamp`, `webhook-signature`, HMAC SHA256 atas `{id}.{timestamp}.{body}`).
- Jangan kirim sinkron. Enqueue, kirim dari worker, timeout 5-10 detik, retry backoff, dead letter, log delivery.
- SSRF: blokir IP privat, loopback, link-local, metadata cloud. Jangan ikuti redirect. Cek IP saat koneksi (DNS rebinding).
- Rotasi secret: tanda tangan ganda (lama + baru) selama transisi.
- Tidak mau bangun infrastruktur: Svix atau Hookdeck.

## Webhook masuk

Verifikasi signature dan jendela timestamp, simpan event ID (idempotent), balas `200` cepat, proses async.
