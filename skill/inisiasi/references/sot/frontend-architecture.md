# Arsitektur frontend

> Terakhir diverifikasi: 2026-11-16

Scope: aturan keputusan FE dan checklist system design untuk ARCHITECTURE.md. Performa: [performance.md](performance.md).

## Aturan

- Satu framework per tim. Jangan merakit stack dari katalog tool.
- Pilih rendering per jenis halaman: static, SSR, streaming, islands, atau client-only.
- Keputusan lintas tim atau rilis butuh artefak: peta sistem, batas state, rendering, design system, a11y, budget performa, ADR.
- Pisahkan intent (action) dari perubahan state agar test, reuse, dan undo mudah.
- Kode hasil AI wajib lewat review performa dan a11y. Pemilik kode harus paham trade-off dan failure mode.
- a11y masuk ke API komponen (WCAG 2.2), bukan checklist di akhir.

| Jenis state | Tempat |
|-------------|--------|
| Navigasi yang bisa dibagikan | URL / route state |
| Data server | Query cache atau route loader |
| Form | Form library |
| UI sesaat (menu, dialog) | State komponen |
| Lintas fitur | Store sempit, atau pindah ke backend |

## Checklist system design

1. Requirements: user journey, platform, read vs write heavy, realtime, SEO, offline, a11y, latency, privacy.
2. Arsitektur: CSR/SSR/SSG/streaming, SPA vs MPA, BFF vs direct, REST vs RPC vs GraphQL, polling/SSE/WebSocket.
3. Building blocks: app shell, router, UI, API client, cache, auth/session, realtime, persistence lokal, analytics.
4. Data: source of truth, cache dan invalidasi, optimistic update, cursor pagination, URL state. Tanya: survive refresh? boleh stale? konflik?
5. UI: code splitting, virtualization, lazy load media. State wajib: loading, success, error, empty, offline, unauthorized.
6. Network: retry + backoff, abort request usang, dedupe, idempotency, reconnect, urutan event. Bedakan error transport vs domain.
7. Performa: LCP, INP, CLS, bundle size. Detail di [performance.md](performance.md).
8. Reliability: error boundary, autosave draft, feature flag / kill switch, mismatch versi FE/BE.
9. Security: cookie vs token, CSRF/XSS, UI berbasis permission, data sensitif di log.

## Micro-frontend

Default: monorepo dengan shared packages atau feature folders. Pecah hanya jika banyak tim butuh rilis independen. Urutan coba: islands, Next.js multi-zones, lalu Module Federation 2.0 (`@module-federation/enhanced` atau `@module-federation/vite`) atau Native Federation (ESM + import maps). Shell memegang navigasi, auth, dan fallback.

## AI di frontend

Kemampuan yang dibutuhkan: streaming LLM, tool calling, structured output, retry dan cancel, alur approval, state percakapan. Desain UI untuk state streaming, gagal sebagian, dan pembatalan.
