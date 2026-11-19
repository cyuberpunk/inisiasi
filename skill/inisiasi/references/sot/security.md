# Security

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: OWASP password storage parameters, OWASP Top 10:2025 names, secrets tools status (gitleaks frozen), npm/pnpm/PyPI supply chain controls. Not checked: cookie guidance, header list, Trusted Types.

Scope: application security controls. Auth: [auth.md](auth.md). Regulations: [compliance.md](compliance.md). Scanning tools: [ci-cd.md](ci-cd.md).

## Required

| Area | Rule |
|------|--------|
| Passwords | Argon2id (m=19 MiB, t=2, p=1). Fallback scrypt. bcrypt only for legacy systems (cost >= 10, 72-byte limit), rehash to Argon2id |
| Sessions | `HttpOnly` + `Secure` + `SameSite` cookies, `__Host-` prefix, plus a CSRF token |
| MFA | Passkeys/WebAuthn first. Required for privileged accounts. TOTP as fallback, not SMS alone |
| Authorization | Deny by default, checked per path and per object |
| Input | Validate at the boundary. Parameterized queries. Request size limits |
| Output | Auto-escaping + CSP. Consider Trusted Types |
| Uploads | Check contents (magic bytes) and size, store outside the web root |
| Transport | HTTPS + HSTS |
| Personal data | Encrypt in transit and at rest |
| Logs | Audit log for sensitive actions, without secrets or excess PII |

Headers: `Strict-Transport-Security`, `Content-Security-Policy` with `frame-ancestors`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. CORS allowlist, never `*` with credentials. Middleware: `hono/secure-headers`, helmet.

## Secrets

`.env` locally only, never in git. Teams: Infisical or Doppler. Production: a cloud secrets manager with OIDC, not long-lived keys. SOPS + age for git. Betterleaks (gitleaks successor; gitleaks is feature-frozen) scans in pre-commit and CI.

## Supply chain

Lockfiles. Renovate or Dependabot with a release-age cooldown (npm `min-release-age`, pnpm `minimumReleaseAge`). Dependency install scripts off except an allowlist (default in npm 12 and pnpm: `npm approve-scripts`, pnpm `allowBuilds`). SBOM (CycloneDX/SPDX) for serious projects. Pin GitHub Actions to a SHA, never run fork code in `pull_request_target`, do not share caches with untrusted workflows. Publish with trusted publishing (OIDC, npm and PyPI) and provenance, no long-lived publish tokens. Before adding a dependency, ask: is it still maintained? What is the license? What is its security history? What does it add to the bundle?

## OWASP Top 10:2025

| Risk | Mitigation |
|------|----------|
| A01 Broken Access Control (including SSRF) | Authorization on every path, outbound allowlist |
| A02 Security Misconfiguration | Secure defaults, no stack traces |
| A03 Software Supply Chain Failures | Lockfiles, SBOM, provenance, pinned CI |
| A04 Cryptographic Failures | Argon2id, HTTPS, encryption at rest |
| A05 Injection | Parameterized queries, encoding, CSP |
| A06 Insecure Design | Threat modeling before risky features |
| A07 Authentication Failures | Rate limits, passkeys/MFA |
| A08 Software or Data Integrity Failures | Artifact integrity, avoid deserializing untrusted data |
| A09 Security Logging and Alerting Failures | Audit logs + alerts |
| A10 Mishandling of Exceptional Conditions | Fail closed, consistent errors |
