# Realtime

> Terakhir diverifikasi: 2026-11-16

Scope: SSE, WebSocket, pub/sub, kolaborasi.

## Default

| Kebutuhan | Pakai |
|-----------|-------|
| Notifikasi, live feed, status, streaming AI | SSE |
| Chat, game, dua arah | WebSocket |
| Scale lintas instance | Pub/sub Redis/Valkey atau NATS |
| Backend sudah Convex | Subscription bawaan Convex |
| Room di edge | Cloudflare Durable Objects, PartyKit |
| Sync list dari Postgres | Electric (read-path) |
| Kolaborasi dokumen, presence | Yjs + WebSocket, atau Liveblocks |
| Managed sederhana | Supabase Realtime, Firebase |

WebTransport hanya kasus lanjut, dengan fallback WebSocket.

## Library

| Bahasa | SSE | WebSocket |
|--------|-----|-----------|
| TypeScript | Hono streaming, EventSource | `ws`. Socket.io hanya jika butuh fallback otomatis |
| Go | `net/http` + flush | `github.com/coder/websocket` |
| Python | FastAPI StreamingResponse | FastAPI WebSocket |
| Rust | Axum | tokio-tungstenite |

## Aturan

Heartbeat, reconnect + antrean pesan di klien, auth saat connect, rate limit koneksi, backpressure, log lifecycle. SSE: `text/event-stream`, flush tiap event. WebSocket di belakang proxy: atur idle timeout dan sticky session atau pub/sub.

## Hindari

`nhooyr.io/websocket` (pindah ke `coder/websocket`). `gorilla/websocket` hanya kode lama. Polling untuk realtime kecuali fallback.
