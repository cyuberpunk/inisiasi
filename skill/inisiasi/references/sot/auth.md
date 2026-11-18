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

## OAuth 2.0 and OpenID Connect

Draft, pending owner review.

| Client | Flow |
|--------|------|
| Web app with a server | Authorization code + PKCE, tokens stay on the server, the browser gets a session cookie |
| SPA without a backend | Add a backend-for-frontend (BFF) that holds the tokens. Tokens in the browser only when no BFF is possible |
| Native and mobile apps | Authorization code + PKCE through the system browser (ASWebAuthenticationSession, Custom Tabs), never an embedded web view |
| Service to service | Client credentials, short-lived tokens, one client per service |
| Devices without a keyboard (TV, CLI) | Device authorization flow |

- Login is OIDC: validate the ID token (`iss`, `aud`, `exp`, `nonce`, signature from the provider's JWKS). Authorization is OAuth access tokens, checked by the resource server.
- Always send and check `state`. Exact redirect URI match, no wildcards.
- Scopes are coarse (what the client may ask for). Fine-grained permissions live in your app.
- Do not use the implicit flow or the password grant.

## Avoid

- Auth.js / NextAuth for new projects (it is now part of Better Auth). Existing apps: plan a migration.
- FastAPI Users for new projects.
- Rolling your own cryptography. SMS OTP as the only factor.
