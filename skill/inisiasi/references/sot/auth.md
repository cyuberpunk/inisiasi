# Auth

> Last verified: 2026-11-16

Scope: choosing auth and session practices. Password hashing and OWASP: [security.md](security.md).

## Defaults

| Situation | Use |
|---------|-----|
| TypeScript app | Better Auth (self-hosted library, passkey and organization plugins) |
| Managed, with ready-made UI | Clerk |
| B2B SaaS, SSO/SAML/SCIM | WorkOS AuthKit |
| Stack already on Supabase | Supabase Auth |
| Self-hosted enterprise SSO | Keycloak, or Ory (Kratos, Hydra, Keto) |
| Go, Python, Rust backends | An IdP on top + session/JWT validation. Python: Authlib |

## Practices

- Web: `HttpOnly`, `Secure`, `SameSite` session cookies. Do not store tokens in localStorage.
- JWT + refresh only if you need stateless access across services. Short-lived access tokens, rotated refresh tokens, logout ends the session.
- Passkeys as the default option, MFA required for admin accounts.
- Rate limit login and other sensitive endpoints. Responses must not reveal whether an account exists.
- Auth in centralized middleware/guards. Authorization is deny by default (RBAC, or ABAC if needed).
- CSRF tokens for cookie-based flows. Audit logs for sensitive actions.

## Avoid

- Auth.js / NextAuth for new projects (it is now part of Better Auth). Existing apps: plan a migration.
- FastAPI Users for new projects.
- Rolling your own cryptography. SMS OTP as the only factor.
