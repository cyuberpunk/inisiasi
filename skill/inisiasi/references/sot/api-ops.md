# Rate limits and webhooks

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: RateLimit headers draft status, Standard Webhooks spec headers and signing, library status (rate-limiter-flexible, redis_rate, slowapi, Svix, Hookdeck).

Scope: rate limiting, inbound and outbound webhooks.

## Rate limits

- Key: user ID or API key after login. Use IP only for anonymous traffic (NAT and IPv6 make IP unfair).
- Algorithm: GCRA or a sliding window in Redis/Valkey for multiple instances. Token bucket if bursts are allowed. Cost-based for GraphQL or expensive endpoints.
- Layers: app (Redis/Valkey), gateway/proxy, CDN.
- Response: `429` + `Retry-After`. `RateLimit` / `RateLimit-Policy` headers (IETF draft), plus `X-RateLimit-*` for older clients.
- Libraries: `rate-limiter-flexible` (Node), `go-redis/redis_rate` (Go, GCRA), `slowapi` (Python).
- Starting point: login 5/minute per IP, API 100/minute per user, public 30/minute per IP. Tune with real data.

## Outbound webhooks

- Contract: Standard Webhooks (headers `webhook-id`, `webhook-timestamp`, `webhook-signature`, HMAC SHA256 over `{id}.{timestamp}.{body}`).
- Do not send synchronously. Enqueue, send from a worker, timeout 5-10 seconds, retry with backoff, dead letter, log deliveries.
- SSRF: block private IPs, loopback, link-local, and cloud metadata addresses. Do not follow redirects. Check the IP at connection time (DNS rebinding).
- Secret rotation: dual signatures (old + new) during the transition.
- If you do not want to build the infrastructure: Svix or Hookdeck.

## Inbound webhooks

Verify the signature and the timestamp window, store the event ID (idempotent), reply `200` quickly, process asynchronously.
