# Realtime

> Last verified: 2026-11-16

Scope: SSE, WebSocket, pub/sub, collaboration.

## Defaults

| Need | Use |
|-----------|-----|
| Notifications, live feeds, status, AI streaming | SSE |
| Chat, games, two-way traffic | WebSocket |
| Scaling across instances | Redis/Valkey pub/sub or NATS |
| Backend already on Convex | Convex's built-in subscriptions |
| Rooms at the edge | Cloudflare Durable Objects, PartyKit |
| Syncing lists from Postgres | Electric (read path) |
| Document collaboration, presence | Yjs + WebSocket, or Liveblocks |
| Simple managed | Supabase Realtime, Firebase |

WebTransport only for advanced cases, with a WebSocket fallback.

## Libraries

| Language | SSE | WebSocket |
|--------|-----|-----------|
| TypeScript | Hono streaming, EventSource | `ws`. Socket.io only if you need automatic fallbacks |
| Go | `net/http` + flush | `github.com/coder/websocket` |
| Python | FastAPI StreamingResponse | FastAPI WebSocket |
| Rust | Axum | tokio-tungstenite |

## Rules

Heartbeats, reconnects + a message queue on the client, auth at connect time, connection rate limits, backpressure, lifecycle logs. SSE: `text/event-stream`, flush after each event. WebSocket behind a proxy: set idle timeouts and use sticky sessions or pub/sub.

## Avoid

`nhooyr.io/websocket` (moved to `coder/websocket`). `gorilla/websocket` for legacy code only. Polling for realtime, except as a fallback.
