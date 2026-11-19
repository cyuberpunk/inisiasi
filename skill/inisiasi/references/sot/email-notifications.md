# Email and notifications

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: Gmail, Yahoo, Microsoft sender rules, List-Unsubscribe, SPF/DKIM/DMARC, provider and tool status (Resend, Postmark, SES, Novu, Knock, Courier, Mailpit, MailHog).

Scope: transactional email, push, in-app, local testing.

## Defaults

| Need | Use |
|-----------|-----|
| Transactional email in TS | Resend + React Email (`react-email` package) |
| Deliverability as the priority | Postmark |
| Cost at large scale | Amazon SES |
| Push | APNs, FCM, Web Push. Expo: `expo-notifications` |
| Email + push + in-app + preferences + batching | Novu (OSS), Knock, or Courier |
| Local | Mailpit (captures email, never sends) |

## Rules

- Always send through a queue, with an idempotency key so nothing is sent twice.
- A dedicated sending domain, SPF, DKIM, DMARC. Handle bounces and complaints.
- Transactional and marketing mail use separate domains or subdomains.
- Marketing/bulk: `List-Unsubscribe` header + `List-Unsubscribe-Post: List-Unsubscribe=One-Click`, processed within 48 hours (Yahoo requires 2 days, Gmail recommends 48 hours).
- Security notifications are still sent when marketing is turned off. Users control channels and types.
- Templates: HTML + plain text, rendering tested.
- Better Auth: connect an email provider for verification and password reset.
- In-app: stored in the DB, delivered over SSE/WebSocket, with read status.

## Avoid

MailHog (unmaintained). Amazon Pinpoint (support ended 2026-10-30; SES for email, AWS End User Messaging for SMS). Production providers in local environments.
