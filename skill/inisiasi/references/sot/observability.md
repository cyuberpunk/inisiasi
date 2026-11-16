# Observability

> Terakhir diverifikasi: 2026-11-16

Scope: log, metrik, trace, error tracking, alert, on-call.

## Default

| Layer | Pakai |
|-------|-------|
| Instrumentasi | OpenTelemetry SDK + OTLP, ikut semantic conventions |
| Collector | OpenTelemetry Collector, atau Grafana Alloy jika stack Grafana |
| Error tracking | Sentry (cukup juga untuk tracing app kecil) |
| Metrik | Prometheus + Grafana |
| Log | Loki, Grafana Cloud, CloudWatch, atau Axiom (managed) |
| Trace | Tempo atau Jaeger v2 |
| Zero-code (service lama) | OBI (OpenTelemetry eBPF) / Grafana Beyla |
| Logger | pino (TS), slog (Go), structlog (Python), tracing (Rust) |

MVP: Sentry + log terstruktur + OTel trace ke satu backend. Profiling (Pyroscope) belum wajib.

## Logging

- JSON terstruktur, field `timestamp`, `level`, `message`, `service`, `trace_id`, `span_id`, `request_id`.
- Level: DEBUG, INFO, WARN, ERROR. DEBUG/INFO boleh di-sample di produksi, ERROR tidak.
- Log di boundary: request masuk, call eksternal, error.
- Jangan log password, token, API key, kartu penuh, PII yang tidak perlu, payload besar.
- Retensi bertingkat (misal 7 hari hot, 30-90 hari murah).

## Alert

- SLI/SLO per journey utama. Alert dari SLO dengan multi-window multi-burn-rate (page: 1j/5m burn 14.4 dan 6j/30m burn 6; ticket: 3h/6j burn 1). Generate dengan Sloth atau Pyrra.
- Alert pada gejala user, harus actionable, ada link runbook. Threshold mentah hanya cadangan.
- On-call: PagerDuty, Grafana Cloud IRM, incident.io, Rootly, atau Jira Service Management. Status page: Better Stack, Instatus.
- Post-mortem tanpa menyalahkan.

## Hindari

Opsgenie (end of sale), Grafana OnCall OSS (diarsipkan), Grafana Agent dan Promtail (EOL, pakai Alloy), Winston sebagai default baru, label metrik high-cardinality.
