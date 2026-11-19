# API

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: OpenAPI client generators (`openapi-typescript` 7.13, orval 8.48, `@hey-api/openapi-ts` 0.99), docs site packages (Docusaurus 3.10, Starlight 0.43, Fumadocs 16.19, Mintlify CLI 4.1), Buf 1.75. Carried over from 2026-11-19: OpenAPI editions, RFC 9457, RFC 9745, RFC 8594, Idempotency-Key draft codes, tool and repo status (tRPC, oRPC, Scalar, Yoga, gqlgen, Connect, Buf, gateways). Not checked: generator output quality per language, Mintlify pricing.

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

## Docs and SDKs

Checked on the web 2026-11-20: `openapi-typescript` 7.13, orval 8.48, `@hey-api/openapi-ts` 0.99, `@docusaurus/core` 3.10, `@astrojs/starlight` 0.43, `fumadocs-core` 16.19, `@mintlify/cli` 4.1, `@bufbuild/buf` 1.75, and their download counts.

The spec is the source. Every artifact below is generated from it in CI, and a hand-edited client is a bug.

| Need | Use | Note |
|------|-----|------|
| Typed client from an OpenAPI 3.1 spec | `openapi-typescript` 7.13 | Types only, no runtime. 17.8M/wk |
| Client plus TanStack Query hooks | orval 8.48 | 4.1M/wk. Also generates Zod and MSW mocks |
| Full SDK, fastest runtime | `@hey-api/openapi-ts` 0.99 | Pre-1.0 but 8.2M/wk. Generates a fetch client, Zod schemas, and TanStack Query or SWR plugins |
| Protobuf clients | Buf `protoc-gen-es` 2.17 | With `buf generate`, same as the Connect stack above |
| Docs site, product with a brand | Docusaurus 3.10, Starlight 0.43, or Fumadocs 16.19 | Match the framework. Fumadocs is fastest to set up on Next.js |
| Hosted API docs | Mintlify (`@mintlify/cli` 4.1) | Paid. Git-synced, MDX, built-in endpoint playground |
| Private or internal API | Scalar | Renders from the OpenAPI document inside the repo |

Rules:

- The spec is committed. CI fails if the generated output differs from what is committed, so a spec change cannot ship without regenerating the client.
- Validate responses against the spec in tests. A generated client only proves the types match the spec, not that the server follows it.
- One version of a public client per API version, published under the matching major.
- New endpoints get an example and an error case in the doc. An endpoint with no example is undocumented in practice.

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
