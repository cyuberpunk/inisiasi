# Observability

> Last verified: 2026-11-16

Scope: logs, metrics, traces, error tracking, alerts, on-call.

## Defaults

| Layer | Use |
|-------|-----|
| Instrumentation | OpenTelemetry SDK + OTLP, following semantic conventions |
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

Draft, pending owner review. Checked on the web 2026-11-19: PostHog feature flags, Plausible, Umami.

- Product analytics (funnels, retention): PostHog, which also serves feature flags ([engineering-practices.md](engineering-practices.md)). Privacy-friendly page analytics only: Plausible or Umami.
- Event names: `object_action` in snake_case (`order_created`), with a small typed list in code, not free strings.
- Revenue and other critical events are sent from the server, not the browser.
- Consent and personal data follow [compliance.md](compliance.md). No PII in event properties.

## Avoid

Opsgenie (end of sale), Grafana OnCall OSS (archived), Grafana Agent and Promtail (EOL, use Alloy), Winston as a new default, high-cardinality metric labels.
