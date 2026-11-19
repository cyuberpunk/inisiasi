# Security

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: RFC 9116 `security.txt` fields and location, Dependabot alert and security-update settings, `osv-scanner` and `audit-ci` versions and repo activity, Trivy and Grype repo status, the GitHub Advisory Database, CVSS 4.0 metric groups and vector labels, the EPSS API response shape, the 2025 CWE Top 25 order, ASVS 5.0.0 level definitions. Carried over from 2026-11-19: OWASP password storage parameters, OWASP Top 10:2025 names, secrets tools status (gitleaks frozen), npm/pnpm/PyPI supply chain controls. Not checked: cookie guidance, header list, Trusted Types, CISA KEV feed format.

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

## Severity and standards

"Critical" is a word nothing above defines. These are the definitions to use.

- **CVSS 4.0** (current, FIRST) scores a vulnerability's technical severity. The vector has four groups: Base, Threat, Environmental, Supplemental. In v4.0 the Impact group splits into vulnerable-system (VC/VI/VA) and subsequent-system (SC/SI/SA) impacts, `Scope` is gone, Attack Requirements (AT) is new, and User Interaction has three values. A vector is labelled `CVSS-B` (base only), `CVSS-BE` (plus environmental), `CVSS-BT` (plus threat), or `CVSS-BTE`. A published base score ignores Threat and Environmental, so a CVSS-B number is not the risk to this system.
- **EPSS** (FIRST) is the probability that a published CVE is exploited in the wild in the next 30 days, `0` to `1`, published daily with a percentile. Query it per CVE at `https://api.first.org/data/v1/epss?cve=CVE-...`; the fields are `epss` and `percentile`. It estimates exploitation, not impact, and a low score is not proof of safety.
- **CWE Top 25** (2025 release) ranks weakness classes by real-world exploitation and severity. Read it when threat modeling; it tells you what attackers actually use. The top five in 2025 are CWE-79 XSS, CWE-89 SQL injection, CWE-352 CSRF, CWE-862 missing authorization, CWE-787 out-of-bounds write.
- **OWASP ASVS 5.0.0** (stable since 2025-05-30) is the requirement checklist to verify against. L1 is about 20 percent of requirements, the minimum for any app. L2 is about 50 percent and is what most applications should reach. L3 adds about 30 percent of defense-in-depth controls for the highest assurance. Pick a level per project, record it in ARCHITECTURE.md, and cite the chapter in the security review.

Turn those into one decision:

| Situation | Action |
|-----------|--------|
| CVSS-B >= 9.0 and reachable | Patch now, no discussion |
| EPSS >= 0.1 at any CVSS, or listed in CISA KEV | Treat as actively exploited |
| CVSS-B >= 7.0, EPSS below 0.01, not reachable | Normal SLA, no pager |
| A score looks low but the public exploit is one curl away | Read the advisory text. The vector is a summary, not the failure |

Threat modeling is a design step, not a document. Walk each trust boundary and ask the STRIDE questions: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. One page per risky feature, in the repo next to the ADR, with the mitigations each row maps to in this file.

## Vulnerability response

Prevention is above. This is what happens when an advisory lands for a dependency you already ship.

- Publish `/.well-known/security.txt` (RFC 9116). Required fields are `Contact` and `Expires`. An inbound report needs a route before one exists.
- Turn on Dependabot alerts and "Dependabot security updates" per repository (Settings, Security and quality, Advanced Security). Add `dependabot.yml` with `groups` and `applies-to: security-updates`, and `open-pull-requests-limit: 0` if you want security PRs only. The GitHub Advisory Database is the source. OSV mirrors it and adds others.
- Scan in CI and fail the build on a fixable high or critical. `osv-scanner` 2.7 (Google, lockfiles for every ecosystem), `npm audit --audit-level=high`, `grype` or `trivy` for container images, `audit-ci` 7.1 if you want a plain threshold gate.
- Triage order: reachable in production, then dev only, then not installed at all. A CVE in a transitive package you never call is still yours to patch or pin, but it is not the same risk as a reachable gadget chain.
- Patch SLA. Critical and reachable: same day. High: within 7 days. Moderate: next release. Low: with routine updates. "Critical" and "High" here mean the table above, not a vendor's label.
- When no fix exists: pin the last good version, remove the dependency, or write a dated exception with an owner and an expiry. Never a silent ignore in the lockfile.
- Never patch by editing `node_modules` or vendoring a fork with no plan to upstream it.
- Keep the SBOM current, so a new advisory can be matched against what you actually ship.

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
