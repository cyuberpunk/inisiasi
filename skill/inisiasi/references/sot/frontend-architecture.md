# Frontend architecture

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: WCAG 2.2 reference, Module Federation packages. Rest is design guidance, not checkable.

Scope: FE decision rules and the system design checklist for ARCHITECTURE.md. Performance: [performance.md](performance.md).

## Rules

- One framework per team. Do not assemble a stack from a catalog of tools.
- Choose rendering per page type: static, SSR, streaming, islands, or client-only.
- Cross-team or release-level decisions need artifacts: a system map, state boundaries, rendering, design system, a11y, performance budget, ADRs.
- Separate intent (actions) from state changes so tests, reuse, and undo are easy.
- AI-generated code must pass performance and a11y review. The code owner must understand the trade-offs and failure modes.
- a11y belongs in the component API (WCAG 2.2), not in a checklist at the end.

| Kind of state | Where it lives |
|-------------|--------|
| Shareable navigation | URL / route state |
| Server data | Query cache or route loader |
| Forms | Form library |
| Transient UI (menus, dialogs) | Component state |
| Cross-feature | A narrow store, or move it to the backend |

## System design checklist

1. Requirements: user journey, platform, read vs write heavy, realtime, SEO, offline, a11y, latency, privacy.
2. Architecture: CSR/SSR/SSG/streaming, SPA vs MPA, BFF vs direct, REST vs RPC vs GraphQL, polling/SSE/WebSocket.
3. Building blocks: app shell, router, UI, API client, cache, auth/session, realtime, local persistence, analytics.
4. Data: source of truth, cache and invalidation, optimistic updates, cursor pagination, URL state. Ask: must it survive a refresh? Can it be stale? What about conflicts?
5. UI: code splitting, virtualization, lazy-loaded media. Required states: loading, success, error, empty, offline, unauthorized.
6. Network: retry + backoff, abort stale requests, dedupe, idempotency, reconnect, event ordering. Separate transport errors from domain errors.
7. Performance: LCP, INP, CLS, bundle size. Details in [performance.md](performance.md).
8. Reliability: error boundaries, draft autosave, feature flags / kill switch, FE/BE version mismatch.
9. Security: cookies vs tokens, CSRF/XSS, permission-based UI, sensitive data in logs.

## Micro-frontends

Default: a monorepo with shared packages or feature folders. Split only when many teams need independent releases. Try in this order: islands, Next.js multi-zones, then Module Federation 2.0 (`@module-federation/enhanced` or `@module-federation/vite`) or Native Federation (ESM + import maps). The shell owns navigation, auth, and fallbacks.

## AI in the frontend

Required capabilities: LLM streaming, tool calling, structured output, retry and cancel, approval flows, conversation state. Design the UI for streaming states, partial failures, and cancellation.
