# Email dan notifikasi

> Terakhir diverifikasi: 2026-11-16

Scope: email transaksional, push, in-app, local testing.

## Default

| Kebutuhan | Pakai |
|-----------|-------|
| Email transaksional TS | Resend + React Email (paket `react-email`) |
| Deliverability prioritas | Postmark |
| Biaya di skala besar | Amazon SES |
| Push | APNs, FCM, Web Push. Expo: `expo-notifications` |
| Email + push + in-app + preferensi + batching | Novu (OSS), Knock, atau Courier |
| Local | Mailpit (tangkap email, jangan kirim) |

## Aturan

- Selalu kirim lewat queue, dengan idempotency key agar tidak dobel.
- Domain pengirim khusus, SPF, DKIM, DMARC. Tangani bounce dan complaint.
- Transaksional dan marketing pisah domain atau subdomain.
- Marketing/bulk: header `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click`, proses dalam 48 jam (syarat Gmail dan Yahoo).
- Notifikasi keamanan tetap terkirim meski marketing dimatikan. User mengatur kanal dan tipe.
- Template: HTML + plain text, dites rendering.
- Better Auth: sambungkan provider email untuk verifikasi dan reset password.
- In-app: simpan di DB, kirim via SSE/WebSocket, status dibaca.

## Hindari

MailHog (tidak dirawat). Provider produksi di environment lokal.
