# API

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: OpenAPI editions, RFC 9457, RFC 9745, RFC 8594, Idempotency-Key draft codes, tool and repo status (tRPC, oRPC, Scalar, Yoga, gqlgen, Connect, Buf, gateways).

Scope: API style, REST, errors, pagination, versioning, idempotency, GraphQL, gRPC, gateways. Rate limits and webhooks: [api-ops.md](api-ops.md).

## Choosing a style

| Situation | Use |
|---------|-------|
| TS fullstack, React/Next/TanStack/Expo | tRPC |
| TS + need public OpenAPI, or Vue/Svelte/Solid/Astro | oRPC |
| Public API or multi-language clients | REST + OpenAPI 3.1 or 3.2 |
| Polyglot internal services, Protobuf | gRPC. Connect RPC if there are web clients |
| Many clients with different data shapes, nested data | GraphQL |
| Lightweight edge / Workers | Hono RPC |

## REST

- Plural resources, correct HTTP methods, cursor pagination (offset only for small lists).
- Errors: RFC 9457 Problem Details, `application/problem+json`, `type` as a URI.
- Status codes: 201 create, 202 async, 204 no content, 400/401/403/404/409/422/429, 503 + `Retry-After`.
- A request ID in every response. Allowlist output fields. Check authorization per object (BOLA/IDOR).
- Docs: OpenAPI + Scalar or Swagger UI.

## Versioning

- Packages: SemVer. Public HTTP API: `/v1` (default) or date-based versions (`API-Version` header). Avoid `?version=`.
- Internal tRPC/oRPC: additive evolution. Breaking change = a new procedure, deprecate the old one.
- Breaking: removing a field, changing a type, making a field required. Additive: optional fields, new endpoints. A new enum value can break clients with exhaustive switches.
- Deprecation: announce it, send the `Deprecation` header (RFC 9745), the `Sunset` header (RFC 8594), and a `Link` to the migration guide, then remove it after the sunset date.

## Idempotency

`Idempotency-Key` for critical POST/PATCH requests. Store the key and the response. Same key with a different body: 422. First request still processing: 409.

## GraphQL

Server: GraphQL Yoga (TS), gqlgen (Go). Clients: urql, Apollo Client, Relay. Required: DataLoader (prevents N+1), depth and complexity limits, persisted queries, auth in resolvers. Start with one schema. Federation (Apollo, Hive, Cosmo) only with many teams.

## gRPC

Connect RPC (connect-go, Connect-ES + Buf) serves Connect, gRPC, and gRPC-Web from one server. Buf + protovalidate for linting and breaking-change checks. Always use deadlines. Do not use binary gRPC for public browser APIs.

## Gateway

One backend: a reverse proxy (Caddy, Traefik) + app middleware. Many services or a managed public API: Kong, Apache APISIX, or managed (AWS HTTP API). Kubernetes: Envoy Gateway. The gateway stays thin, with no business logic.
