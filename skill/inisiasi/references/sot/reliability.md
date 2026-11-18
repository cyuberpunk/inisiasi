# Reliability, DR, load testing, cost

> Last verified: 2026-11-16

Scope: backups, disaster recovery, load testing, chaos, cost.

## Backups and DR

- Define RTO and RPO per service.
- Baseline 3-2-1 (3 copies, 2 media, 1 offsite). Add immutable copies (object lock) if ransomware is a risk.
- DB: daily snapshots + PITR, another region, encrypted. Object storage: versioning.
- Restore tests: monthly for critical production, at least quarterly for the rest. Measure the actual RTO/RPO.
- IaC so environments can be rebuilt. Runbook: detect, assess impact, roll back or restore, verify, post-mortem.
- Multi-region only if the availability requirements demand it. Start active-passive.

## Load testing

- Tools: k6 (default, including k6 browser for frontend journeys), Locust (Python), ghz (gRPC), Vegeta (simple HTTP).
- Measure throughput, p50/p95/p99, error rate, resources, and the saturation point.
- Production-like environment, realistic data, critical journeys, thresholds in CI before major releases.
- High latency with low CPU usually means the DB or a dependency. Errors at a certain load are usually pool or rate-limit limits.

## Chaos

Start in staging: Toxiproxy, and timeout tests in integration tests. Kubernetes: Chaos Mesh or Litmus. AWS: Fault Injection Service. Azure: Chaos Studio. Do not run chaos in production until mature. Do not use Chaos Monkey for a new setup.

## Cost

- Budgets + alerts, tag resources per team/project.
- Compute: right-size, scale to zero, ARM (Graviton), shut down non-production outside working hours, reserved/savings plans for steady workloads.
- Egress is often the biggest surprise: CDN, R2 (no egress fees).
- Observability: sample traces, short log retention, avoid high-cardinality labels.
- LLMs: prompt caching, small models for light tasks, usage limits + alerts.
