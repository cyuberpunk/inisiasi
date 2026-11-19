# Realtime

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: `livekit-client` 2.24, `@livekit/components-react` 2.9, `mediasoup-client` 3.26, `@daily-co/daily-js` 0.95, LiveKit repo activity, and their download counts. Carried over from 2026-11-19: library and service status (coder/websocket, ws, Socket.io, Reverb, SignalR, TypedResults.ServerSentEvents, Yjs, Liveblocks, Electric, PartyKit, Convex, Supabase Realtime). Not checked: coturn versions and TURN provider pricing.

Scope: SSE, WebSocket, pub/sub, collaboration, voice and video.

## Defaults

| Need | Use |
|-----------|-----|
| Notifications, live feeds, status, AI streaming | SSE |
| Chat, games, two-way traffic | WebSocket |
| Scaling across instances | Redis/Valkey pub/sub or NATS |
| Backend already on Convex | Convex's built-in subscriptions |
| Rooms at the edge | Cloudflare Durable Objects, PartyKit |
| Syncing lists from Postgres | Electric (read path), self-hosted. Electric Cloud is winding down |
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
| PHP (Laravel) | Streamed responses | Laravel Reverb + Echo |
| Java (Spring) | `SseEmitter` | Spring WebSocket (STOMP) |
| Ruby (Rails) | `ActionController::Live` | Action Cable |
| C# (.NET) | `TypedResults.ServerSentEvents` or a streamed response | SignalR |

## Voice and video

Checked on the web 2026-11-20: `livekit-client` 2.24, `@livekit/components-react` 2.9, `mediasoup-client` 3.26, `@daily-co/daily-js` 0.95, and their download counts.

| Need | Use | Note |
|------|-----|------|
| Video or voice in the product | LiveKit (`livekit-client` 2.24, 8.4M/wk, 22.3k stars; self-host or LiveKit Cloud) | The SFU carries the media, not your backend |
| Small group call, managed | Daily (`@daily-co/daily-js` 0.95) | Fastest path when paying per minute beats operating an SFU |
| Rooms and recording you operate | mediasoup 3.26 | SFU you run. Only with media engineering time |
| One-to-one call, no recording | A plain WebSocket for signaling, no media server | Peer-to-peer fits one listener |
| Live streaming to many viewers | LiveKit, or HLS through a CDN | Interactive needs WebRTC. One-way scales on HLS |

WebRTC does not replace your realtime layer. Signaling goes over WebSocket or SSE, media goes peer to peer or through an SFU, and TURN relays the connections that fail direct. The media never passes through your application server.

Rules:

- TURN is required in production, not optional. Without it, calls fail on some corporate and mobile networks. Run coturn or use the vendor's TURN.
- Ask for camera and microphone only when the user joins, with a plain reason shown before the browser prompt.
- Percent of calls that fail to connect is the metric to watch. Track it per network and per platform, not as a total.
- Recordings and transcripts are personal data. Retention and consent go through [compliance.md](compliance.md).
- Never put media content in your application database. Store keys and metadata, and put the object in storage.

Avoid: building the SFU yourself, WebRTC for text chat, and peer-to-peer for more than a small-group call.

## Rules

Heartbeats, reconnects + a message queue on the client, auth at connect time, connection rate limits, backpressure, lifecycle logs. SSE: `text/event-stream`, flush after each event. WebSocket behind a proxy: set idle timeouts and use sticky sessions or pub/sub.

## Avoid

`nhooyr.io/websocket` (moved to `coder/websocket`). `gorilla/websocket` for legacy code only. Polling for realtime, except as a fallback.
