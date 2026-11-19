# Performance

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: Core Web Vitals thresholds, scheduler.yield, Speculation Rules, web-vitals library.

Scope: Core Web Vitals, FE and BE techniques, order of optimization. Common problems: [problems-performance.md](problems-performance.md).

## Targets (p75 field data)

| Metric | Good | Poor |
|--------|------|------|
| LCP | <= 2.5s | > 4s |
| INP | <= 200ms | > 500ms |
| CLS | <= 0.1 | > 0.25 |

Pass or fail is judged on field data (CrUX, Search Console, RUM `web-vitals`), with mobile and desktop separate. Lighthouse is for diagnosis only.

## Principles

Reduce initial JS, shorten the critical path, lazy-load what is not critical, protect the main thread, keep the layout stable, optimize media, control third-party scripts, cache fingerprinted assets, optimize the important journeys first.

## Techniques

- INP: split long tasks, `scheduler.yield()` (fallback `setTimeout`), `useTransition` / `useDeferredValue`, debug with Long Animation Frames.
- Images: AVIF/WebP, explicit sizes or `aspect-ratio`. Fonts: subset, preload, `font-display`.
- Navigation: Speculation Rules, preconnect. Do not break bfcache (avoid `unload`).
- Backend: indexes, connection pooling, no N+1, pagination, caching, compression.
- DB: `EXPLAIN ANALYZE`, `pg_stat_statements`.
- Profiling: Chrome DevTools, `node --cpu-prof`, pprof (Go), py-spy (Python).

## Order

Measure (field first, then lab), fix the obvious issues (N+1, indexes, large bundles), then caching, then the critical path and INP. No micro-optimizations without data.
