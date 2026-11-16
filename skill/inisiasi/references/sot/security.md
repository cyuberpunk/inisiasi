# Security

> Terakhir diverifikasi: 2026-11-16

Scope: kontrol keamanan aplikasi. Auth: [auth.md](auth.md). Regulasi: [compliance.md](compliance.md). Tooling scan: [ci-cd.md](ci-cd.md).

## Wajib

| Area | Aturan |
|------|--------|
| Password | Argon2id (m=19 MiB, t=2, p=1). Fallback scrypt. bcrypt hanya sistem lama (cost >= 10, batas 72 byte), rehash ke Argon2id |
| Session | Cookie `HttpOnly` + `Secure` + `SameSite`, prefix `__Host-`, plus CSRF token |
| MFA | Passkeys/WebAuthn dulu. Wajib untuk akun privileged. TOTP fallback, bukan SMS saja |
| Authz | Default deny, cek per path dan per objek |
| Input | Validasi di boundary. Query berparameter. Batas ukuran request |
| Output | Auto-escape + CSP. Pertimbangkan Trusted Types |
| Upload | Cek isi (magic bytes) dan ukuran, simpan di luar webroot |
| Transport | HTTPS + HSTS |
| Data pribadi | Enkripsi in transit dan at rest |
| Log | Audit log aksi sensitif, tanpa secret atau PII berlebih |

Header: `Strict-Transport-Security`, `Content-Security-Policy` dengan `frame-ancestors`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. CORS allowlist, jangan `*` dengan credentials. Middleware: `hono/secure-headers`, helmet.

## Secrets

`.env` lokal saja, tidak di git. Tim: Infisical atau Doppler. Produksi: secrets manager cloud dengan OIDC, bukan key panjang. SOPS + age untuk git. Scan gitleaks di pre-commit dan CI.

## Supply chain

Lockfile. Renovate atau Dependabot. SBOM CycloneDX/SPDX untuk project serius. Pin GitHub Actions ke SHA. Publish library dengan provenance. Sebelum tambah dependency: masih dirawat? lisensi? riwayat keamanan? dampak bundle?

## OWASP Top 10:2025

| Risk | Mitigasi |
|------|----------|
| A01 Broken Access Control (termasuk SSRF) | Authz tiap path, allowlist outbound |
| A02 Misconfiguration | Default aman, tanpa stack trace |
| A03 Supply Chain Failures | Lockfile, SBOM, provenance, pin CI |
| A04 Cryptographic Failures | Argon2id, HTTPS, enkripsi at rest |
| A05 Injection | Query berparameter, encoding, CSP |
| A06 Insecure Design | Threat modeling sebelum fitur berisiko |
| A07 Authentication Failures | Rate limit, passkeys/MFA |
| A08 Integrity Failures | Integritas artefak, hindari deserialisasi tak tepercaya |
| A09 Logging and Alerting Failures | Audit log + alert |
| A10 Exceptional Conditions | Fail closed, error konsisten |
