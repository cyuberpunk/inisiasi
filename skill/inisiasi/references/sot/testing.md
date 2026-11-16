# Testing

> Terakhir diverifikasi: 2026-11-16

Scope: strategi tes, tool per bahasa. Load test: [reliability.md](reliability.md). a11y: [accessibility.md](accessibility.md).

## Aturan

- Backend: pyramid (banyak unit, integration sedang, E2E sedikit). Frontend: trophy (statis + component/integration, E2E sedikit).
- Integration pakai DB sungguhan lewat Testcontainers. Jangan mock ORM.
- E2E hanya jalur kritis. Tes perilaku user, bukan detail internal.
- Banyak service independen: contract test (Pact), bukan cuma validasi OpenAPI.
- Scaffold baru belum tentu memasang tes. Pasang eksplisit di task awal.

## Tool

| Bahasa | Unit | Integration / API | Catatan |
|--------|------|-------------------|---------|
| TypeScript | Vitest (`vp test` di Vite+) | Testcontainers, MSW, Supertest | Komponen: Testing Library. E2E: Playwright. Paket kecil: `bun test` / `node:test` |
| Go | `testing` + testify | testcontainers-go, httptest | Mock: `go.uber.org/mock` atau mockery |
| Python | pytest | testcontainers-python, httpx | |
| Rust | `cargo test` | testcontainers-rs | |

Lainnya: visual regression (Playwright screenshot, Chromatic), security (Semgrep, CodeQL, ZAP), a11y (`@axe-core/playwright`).

## Hindari

Jest untuk project Vite baru. Cypress sebagai default E2E baru. `github.com/golang/mock` (diarsipkan). Unit test dangkal demi angka coverage.
