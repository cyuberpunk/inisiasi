# API

> Terakhir diverifikasi: 2026-11-16

Scope: gaya API, REST, error, pagination, versi, idempotency, GraphQL, gRPC, gateway. Rate limit dan webhook: [api-ops.md](api-ops.md).

## Pilih gaya

| Situasi | Pakai |
|---------|-------|
| TS fullstack, React/Next/TanStack/Expo | tRPC |
| TS + butuh OpenAPI publik, atau Vue/Svelte/Solid/Astro | oRPC |
| API publik atau klien multi-bahasa | REST + OpenAPI 3.1 |
| Service internal polyglot, Protobuf | gRPC. Connect RPC jika ada klien web |
| Banyak klien dengan bentuk data berbeda, data nested | GraphQL |
| Edge / Workers ringan | Hono RPC |

## REST

- Resource jamak, method HTTP benar, cursor pagination (offset hanya list kecil).
- Error: RFC 9457 Problem Details, `application/problem+json`, `type` berupa URI.
- Status: 201 create, 202 async, 204 no content, 400/401/403/404/409/422/429, 503 + `Retry-After`.
- Request ID di setiap response. Allowlist field output. Cek authorization per objek (BOLA/IDOR).
- Docs: OpenAPI + Scalar atau Swagger UI.

## Versi

- Package: SemVer. HTTP API publik: `/v1` (default) atau versi tanggal (header `API-Version`). Hindari `?version=`.
- tRPC/oRPC internal: evolusi additive. Breaking = procedure baru, deprecate yang lama.
- Breaking: hapus field, ubah tipe, jadikan required. Additive: field opsional, endpoint baru. Enum baru bisa merusak klien dengan exhaustive switch.
- Deprecation: umumkan, header `Deprecation` (RFC 9745) dan `Sunset` (RFC 8594) + `Link` panduan migrasi, lalu hapus setelah tanggal sunset.

## Idempotency

`Idempotency-Key` untuk POST/PATCH kritis. Simpan key + response. Key sama body beda: 422. Request pertama masih diproses: 409.

## GraphQL

Server: GraphQL Yoga (TS), gqlgen (Go). Klien: urql, Apollo Client, Relay. Wajib: DataLoader (cegah N+1), batas depth dan complexity, persisted queries, auth di resolver. Mulai satu schema. Federation (Apollo, Hive, Cosmo) hanya jika banyak tim.

## gRPC

Connect RPC (connect-go, Connect-ES + Buf) melayani Connect, gRPC, dan gRPC-Web dari satu server. Buf + protovalidate untuk lint dan cek breaking change. Selalu pakai deadline. Jangan gRPC biner untuk API browser publik.

## Gateway

Satu backend: reverse proxy (Caddy, Traefik) + middleware app. Banyak service atau API publik dikelola: Kong, Apache APISIX, atau managed (AWS HTTP API). Kubernetes: Envoy Gateway. Gateway tetap tipis, tanpa business logic.
