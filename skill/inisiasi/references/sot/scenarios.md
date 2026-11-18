# System design scenarios

> Last verified: 2026-11-18
> Status: draft, pending owner review.

Scope: common backend products and the decisions that matter for each. Use as a starting point for ARCHITECTURE.md, then apply the files linked per scenario. Order of scaling moves: [scaling.md](scaling.md).

## URL shortener

- Core: a table `code -> url`, unique on `code`. Codes from a sequence encoded in base62, or random with a unique-constraint retry.
- Reads dwarf writes: cache redirects at the edge (`301` for permanent, `302` when you count clicks or may change the target).
- Click counting is async: enqueue or batch, never a write on the redirect path.
- Abuse: rate limit creation, scan targets for malware and phishing, block internal addresses (SSRF).
- Links: [data-services.md](data-services.md), [api-ops.md](api-ops.md), [security.md](security.md).

## Video processing

- Upload straight to object storage with a presigned URL, never through the app server.
- An upload-complete event enqueues a transcode job. Workers produce HLS renditions and thumbnails, or use a managed service (Mux, Cloudflare Stream).
- Job state machine: uploaded, processing, ready, failed. Idempotent workers, retries, a DLQ.
- Serve through a CDN with signed URLs for private content.
- Links: [data-services.md](data-services.md), [mechanisms.md](mechanisms.md).

## Online shop

- Catalog reads cached. Search: Postgres FTS first, Meilisearch or Typesense for typo tolerance and facets ([data-services.md](data-services.md)). Cart in the database for logged-in users.
- Stock: atomic decrement with a guard, or reservations with an expiry. Never read, compute, write.
- Checkout is a state machine: cart, pending payment, paid, fulfilled, cancelled, refunded. The order is created before payment, with an idempotency key.
- Emails and fulfillment via the outbox, not inside the checkout transaction.
- Links: [problems-critical.md](problems-critical.md), [concurrency.md](concurrency.md), [architecture.md](architecture.md).

## Payment system

- The provider (Stripe, Midtrans, Xendit) holds card data. You store references and amounts as integers.
- Every money movement is an idempotent operation with a key. Webhooks are verified, deduplicated by event ID, and processed asynchronously.
- A ledger (double entry, append-only) when you hold balances. Reconcile daily against the provider.
- Never trust the client's amount. Recompute on the server.
- Links: [problems-critical.md](problems-critical.md), [mechanisms.md](mechanisms.md), [compliance.md](compliance.md).

## Chat

- WebSocket or SSE through a managed realtime service or one realtime gateway. Messages persist first, then fan out.
- Ordering per conversation by a server-assigned sequence. Clients dedupe by message ID and resync from the last sequence after reconnect.
- Presence and typing are ephemeral (Redis, Durable Objects), never in the main database.
- Links: [realtime.md](realtime.md), [offline-sync.md](offline-sync.md).

## Notification system

- Buy first: Novu, Knock, or Courier cover channels, preferences, and batching ([email-notifications.md](email-notifications.md)). Build the shape below only when they do not fit.
- One `notify(user, event)` entry point that writes a notification row and enqueues delivery per channel (email, push, in-app).
- User preferences and quiet hours checked at delivery. Digest instead of flooding.
- Per-channel retries and DLQ, provider failover for email, delivery status stored.
- Links: [email-notifications.md](email-notifications.md), [data-services.md](data-services.md).

## High-traffic read API

- Cache at the edge first, then the app cache, then replicas. Measure the hit rate.
- Protect the origin: rate limits, request coalescing (singleflight), stampede protection.
- Degrade gracefully: serve stale data, turn off non-critical features with a kill switch.
- Load test to the target plus headroom before launch.
- Links: [scaling.md](scaling.md), [data-services.md](data-services.md), [reliability.md](reliability.md).

## Trade-offs

| Choice | Pick it when | Otherwise |
|--------|--------------|-----------|
| Modular monolith | Default ([architecture.md](architecture.md)) | Services when teams, deploy cadence, or data ownership truly diverge |
| Queue | Work is slow, retryable, or can happen after the response | Do it inline and keep it simple |
| Cache | A read is hot and tolerates staleness | Fix the query first |
| Event-driven | Several consumers react to one fact | A direct call is easier to trace |
