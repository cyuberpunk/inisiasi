# Observability

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: repo activity for the OpenTelemetry Collector, Alloy, Loki, Jaeger, Pyroscope, Beyla, Sentry JS and pino, current versions of pino 10.4, `@sentry/node` 11.15, `@opentelemetry/sdk-node` 0.301 (still 0.x, pre-1.0), semantic-conventions 1.45, and the GenAI semantic conventions move to their own repository, analytics SDK versions (Segment 1.84, Amplitude 2.49, Snowplow 4.10) and Avo repo activity. Not checked: the alerting math in the multi-window rules, on-call vendor pricing, and the logger list outside TypeScript.

Scope: logs, metrics, traces, error tracking, alerts, on-call, tracking plan.

## Defaults

| Layer | Use |
|-------|-----|
| Instrumentation | OpenTelemetry SDK + OTLP, following semantic conventions. SDKs are still pre-1.0 (`@opentelemetry/sdk-node` 0.301), so pin the version. GenAI conventions live in their own repo since 2026 (`open-telemetry/semantic-conventions-genai`) |
| Collector | OpenTelemetry Collector, or Grafana Alloy if you use the Grafana stack |
| Error tracking | Sentry (also enough for tracing a small app) |
| Metrics | Prometheus + Grafana |
| Logs | Loki, Grafana Cloud, CloudWatch, or Axiom (managed) |
| Traces | Tempo or Jaeger v2 |
| Zero-code (legacy services) | OBI (OpenTelemetry eBPF) / Grafana Beyla |
| Logger | pino (TS), slog (Go), structlog (Python), tracing (Rust), Monolog JSON (PHP), SLF4J + Logback (Java), semantic_logger (Ruby), Serilog or `ILogger` (C#) |

MVP: Sentry + structured logs + OTel traces to one backend. Profiling (Pyroscope) is not required yet.

## Logging

- Structured JSON with the fields `timestamp`, `level`, `message`, `service`, `trace_id`, `span_id`, `request_id`.
- Levels: DEBUG, INFO, WARN, ERROR. DEBUG/INFO may be sampled in production, ERROR never is.
- Log at the boundary: incoming requests, external calls, errors.
- Never log passwords, tokens, API keys, full card numbers, unnecessary PII, or large payloads.
- Tiered retention (for example 7 days hot, 30-90 days cheap).

## Alerts

- SLI/SLO per main journey. Alerts from SLOs with multi-window, multi-burn-rate rules (page: 1h/5m at burn 14.4 and 6h/30m at burn 6; ticket: 3h/6h at burn 1). Generate them with Sloth or Pyrra.
- Alert on user symptoms. Alerts must be actionable and link to a runbook. Raw thresholds are a fallback only.
- On-call: PagerDuty, Grafana Cloud IRM, incident.io, Rootly, or Jira Service Management. Status pages: Better Stack, Instatus.
- Blameless post-mortems.

## Product analytics

Checked on the web 2026-11-20: `@segment/analytics-next` 1.84, `@amplitude/analytics-browser` 2.49, `@snowplow/browser-tracker` 4.10, Avo repo activity. Carried over from 2026-11-19: PostHog feature flags, Plausible, Umami.

- Product analytics (funnels, retention): PostHog, which also serves feature flags ([engineering-practices.md](engineering-practices.md)). Privacy-friendly page analytics only: Plausible or Umami.
- Event names: `object_action` in snake_case (`order_created`), with a small typed list in code, not free strings.
- Revenue and other critical events are sent from the server, not the browser.
- Consent and personal data follow [compliance.md](compliance.md). No PII in event properties.

### Tracking plan

One file in the repo lists every event. Without it, two teams invent `signup`, `sign_up`, and `user_registered` for the same thing and the funnel is wrong.

| Column | Content |
|--------|---------|
| Event | `object_action`, snake_case, past tense, one meaning only |
| Description | The user action it records, in one line |
| Properties | Name, type, required, enum values. No free text, no PII |
| Source | Server or client, and the exact call site |
| Owner | The team or person who keeps it true |
| Version | Bumped on a breaking change to the shape |

Rules:

- Add the event to the plan before adding the call. A code review rejects a tracked event that is not in the plan.
- Typed wrappers, not raw strings. Generate the client types from the plan schema (Zod or JSON Schema), so a typo is a type error.
- Track from the server when the action has money or state behind it. Browser events miss ad blockers and closed tabs.
- Use a contract schema for the event payload ([data-analytics.md](data-analytics.md)). Same idea, same tooling.
- Version the taxonomy. Keep old events readable for the retention window, and mark removed ones as `deprecated` rather than silently breaking dashboards and experiments.
- Audit the plan each quarter against what actually fires. The documented plan drifts from the live events.

Tools: Segment 1.84 as the router when several destinations are needed, Amplitude 2.49 or PostHog for analysis, Avo as a type-safe plan that generates the code. Pick one event pipeline and keep it.

## Avoid

Opsgenie (end of sale), Grafana OnCall OSS (archived), Grafana Agent and Promtail (EOL, use Alloy), Winston as a new default, high-cardinality metric labels.
