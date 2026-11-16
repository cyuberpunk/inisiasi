# Reliability, DR, load test, biaya

> Terakhir diverifikasi: 2026-11-16

Scope: backup, disaster recovery, load testing, chaos, cost.

## Backup dan DR

- Tentukan RTO dan RPO per service.
- Baseline 3-2-1 (3 salinan, 2 media, 1 offsite). Tambah salinan immutable (object lock) jika ada risiko ransomware.
- DB: snapshot harian + PITR, region lain, terenkripsi. Object storage: versioning.
- Tes restore: produksi kritis bulanan, lainnya minimal kuartalan. Ukur RTO/RPO aktual.
- IaC agar environment bisa dibuat ulang. Runbook: deteksi, nilai dampak, rollback atau restore, verifikasi, post-mortem.
- Multi-region hanya jika syarat ketersediaan menuntut. Mulai active-passive.

## Load test

- Tool: k6 (default, termasuk k6 browser untuk journey FE), Locust (Python), ghz (gRPC), Vegeta (HTTP sederhana).
- Ukur throughput, p50/p95/p99, error rate, resource, titik saturasi.
- Lingkungan mirip produksi, data realistis, journey kritis, threshold di CI sebelum rilis besar.
- Latensi tinggi + CPU rendah biasanya DB atau dependency. Error di beban tertentu biasanya pool atau rate limit.

## Chaos

Mulai di staging: Toxiproxy dan tes timeout di integration test. Kubernetes: Chaos Mesh atau Litmus. AWS: Fault Injection Service. Azure: Chaos Studio. Jangan chaos produksi sebelum matang. Jangan Chaos Monkey untuk setup baru.

## Biaya

- Budget + alert, tag resource per tim/project.
- Compute: right-size, scale to zero, ARM (Graviton), matikan non-prod di luar jam kerja, reserved/savings plan untuk beban stabil.
- Egress sering kejutan terbesar: CDN, R2 (tanpa biaya egress).
- Observability: sample trace, retensi log pendek, hindari label high-cardinality.
- LLM: prompt caching, model kecil untuk tugas ringan, batas pemakaian + alert.
