# Auth

> Terakhir diverifikasi: 2026-11-16

Scope: pemilihan auth dan praktik session. Hash password dan OWASP: [security.md](security.md).

## Default

| Situasi | Pakai |
|---------|-------|
| App TypeScript | Better Auth (self-hosted library, plugin passkey dan organization) |
| Butuh managed + UI jadi | Clerk |
| SaaS B2B, SSO/SAML/SCIM | WorkOS AuthKit |
| Stack sudah Supabase | Supabase Auth |
| SSO self-hosted enterprise | Keycloak, atau Ory (Kratos, Hydra, Keto) |
| Backend Go, Python, Rust | IdP di atas + validasi session/JWT. Python: Authlib |

## Praktik

- Web: session cookie `HttpOnly`, `Secure`, `SameSite`. Jangan simpan token di localStorage.
- JWT + refresh hanya jika butuh akses stateless lintas service. Access token pendek, refresh dirotasi, logout mematikan session.
- Passkeys sebagai opsi default, MFA wajib untuk akun admin.
- Rate limit login dan endpoint sensitif. Respons tidak membocorkan keberadaan akun.
- Auth di middleware/guard terpusat. Authorization default deny (RBAC, atau ABAC jika perlu).
- CSRF token untuk alur berbasis cookie. Audit log untuk aksi sensitif.

## Hindari

- Auth.js / NextAuth untuk project baru (sekarang bagian dari Better Auth). App existing: rencanakan migrasi.
- FastAPI Users untuk project baru.
- Implementasi crypto sendiri. SMS OTP sebagai satu-satunya faktor.
