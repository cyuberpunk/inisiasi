# Auth

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: Better Auth, Auth.js, FastAPI Users, Keycloak, Ory, Authlib, Clerk status and advisories, RFC 10017, RFC 9700, RFC 9207.

Scope: choosing auth and session practices. Password hashing and OWASP: [security.md](security.md).

## Defaults

| Situation | Use |
|---------|-----|
| TypeScript app | Better Auth (self-hosted MIT library, owned by Vercel since Jul 2026; passkey and organization plugins) |
| Managed, with ready-made UI | Clerk |
| B2B SaaS, SSO/SAML/SCIM | WorkOS AuthKit |
| Stack already on Supabase | Supabase Auth |
| Self-hosted enterprise SSO | Keycloak, or Ory (Kratos, Hydra, Keto) |
| Go, Python, Rust backends | An IdP on top + session/JWT validation. Python: Authlib |
| Laravel, Spring, Rails, ASP.NET Core | The framework's own auth (Sanctum, Spring Security, Rails authentication generator or Devise, ASP.NET Core Identity). Details: [backend.md](backend.md) |

## Practices

- Web: `HttpOnly`, `Secure`, `SameSite` session cookies. Do not store tokens in localStorage.
- JWT + refresh only if you need stateless access across services. Short-lived access tokens, rotated refresh tokens, logout ends the session.
- Passkeys as the default option, MFA required for admin accounts.
- Rate limit login and other sensitive endpoints. Responses must not reveal whether an account exists.
- Auth in centralized middleware/guards. Authorization is deny by default (RBAC, or ABAC if needed).
- CSRF tokens for cookie-based flows. Audit logs for sensitive actions.
- Watch your auth library's GitHub security advisories and patch within days. Better Auth, Authlib, Keycloak and Clerk all shipped critical or high fixes in 2026.

## OAuth 2.0 and OpenID Connect

Draft, pending owner review.

| Client | Flow |
|--------|------|
| Web app with a server | Authorization code + PKCE, tokens stay on the server, the browser gets a session cookie |
| SPA without a backend | Add a backend-for-frontend (BFF) that holds the tokens (RFC 10017). Tokens in the browser only when no BFF is possible |
| Native and mobile apps | Authorization code + PKCE through the system browser (ASWebAuthenticationSession, Custom Tabs), never an embedded web view |
| Service to service | Client credentials, short-lived tokens, one client per service |
| CLI on a machine with a browser | Authorization code + PKCE with a loopback redirect (`http://127.0.0.1:<port>`) |
| TVs, or CLIs without a local browser (SSH) | Device authorization flow |

- Login is OIDC: validate the ID token (`iss`, `aud`, `exp`, `nonce`, signature from the provider's JWKS). Authorization is OAuth access tokens, checked by the resource server.
- Always send and check `state`. Exact redirect URI match, no wildcards (only the loopback port may vary). More than one provider: check `iss` in the response (RFC 9207).
- Refresh tokens for public clients are rotated or sender-constrained (DPoP).
- Scopes are coarse (what the client may ask for). Fine-grained permissions live in your app.
- Do not use the implicit flow or the password grant (RFC 9700).

## Avoid

- Auth.js / NextAuth for new projects (it is now part of Better Auth). Existing apps: plan a migration.
- FastAPI Users for new projects.
- Rolling your own cryptography. SMS OTP as the only factor.
