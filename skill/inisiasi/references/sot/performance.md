# Performance

> Terakhir diverifikasi: 2026-11-16

Scope: Core Web Vitals, teknik FE dan BE, urutan optimasi. Masalah umum: [problems-performance.md](problems-performance.md).

## Target (p75 data lapangan)

| Metrik | Good | Poor |
|--------|------|------|
| LCP | <= 2.5s | > 4s |
| INP | <= 200ms | > 500ms |
| CLS | <= 0.1 | > 0.25 |

Lulus dinilai dari data lapangan (CrUX, Search Console, RUM `web-vitals`), mobile dan desktop terpisah. Lighthouse hanya untuk diagnosis.

## Prinsip

Kurangi JS awal, perpendek critical path, lazy load yang tidak kritis, lindungi main thread, jaga layout stabil, optimasi media, kendalikan script pihak ketiga, cache aset ber-fingerprint, optimasi journey penting dulu.

## Teknik

- INP: pecah long task, `scheduler.yield()` (fallback `setTimeout`), `useTransition` / `useDeferredValue`, debug dengan Long Animation Frames.
- Gambar: AVIF/WebP, ukuran atau `aspect-ratio` eksplisit. Font: subset, preload, `font-display`.
- Navigasi: Speculation Rules, preconnect. Jangan rusak bfcache (hindari `unload`).
- Backend: index, connection pooling, cegah N+1, pagination, cache, kompresi.
- DB: `EXPLAIN ANALYZE`, `pg_stat_statements`.
- Profiling: Chrome DevTools, `node --cpu-prof`, pprof (Go), py-spy (Python).

## Urutan

Ukur (lapangan, lalu lab), perbaiki yang jelas (N+1, index, bundle besar), cache, lalu critical path dan INP. Jangan micro-optimasi tanpa data.
