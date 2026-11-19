# Billing and in-app purchases

> Last verified: 2026-11-19
> Status: draft, pending owner review. Store rules change and differ by region: check the current App Store and Google Play policies before launch. Checked on the web 2026-11-19: US external purchase link rule, merchant of record vendors and Lemon Squeezy shutdown, Stripe Managed Payments and Stripe Tax, Midtrans and Xendit methods, StoreKit 2, Google Play Billing and US alternative billing, store notification names, RevenueCat platforms.

Scope: SaaS subscriptions, entitlements, tax, and mobile in-app purchases. Payment safety (idempotency, webhooks, money as integers): [problems-critical.md](problems-critical.md), [scenarios.md](scenarios.md).

## Defaults

| Situation | Use |
|---------|-----|
| SaaS, you want tax handled for you | A merchant of record: Polar, Paddle, or Stripe Managed Payments (not open to Indonesia-based businesses). Lemon Squeezy stops processing payments on 2027-03-31 and takes no new sign-ups |
| SaaS, you handle tax and want full control | Stripe Billing (+ Stripe Tax) |
| Indonesian local methods (QRIS, virtual account, e-wallet) | Midtrans or Xendit |
| Digital goods inside an iOS or Android app | StoreKit 2 (iOS), Google Play Billing (Android) |
| Subscriptions across iOS, Android, and web | RevenueCat on top of the store SDKs |

## Entitlements

- Store what a customer may use in your own database (`entitlements`: user or org, plan, status, period end). Update it from provider webhooks.
- Check access against your table, never by calling the provider on each request.
- Webhooks are verified, deduplicated by event ID, and processed asynchronously. Reconcile with the provider daily.
- Plan limits (seats, usage) are enforced on the server. Usage-based billing reports usage from a ledger you can recount.

## Subscription lifecycle

States: trialing, active, past due, cancelled (active until period end), expired. Dunning on failed payments, a grace period, then downgrade. Upgrades take effect now with proration; downgrades at period end.

## Mobile stores

- Digital content and features sold inside the app usually go through the store's billing. Physical goods and real-world services use a normal payment provider.
- Rules on external payment links and alternative billing differ by region and change often. Since May 2025 the US App Store storefront allows buttons and links to outside purchases; most other storefronts still require in-app purchase. Check the current guidelines for every storefront you ship to before you design the paywall. On Google Play, Google does not require Play Billing for US users and runs alternative billing programs and an external content links program there, with reporting and fees. Other regions follow their own rules.
- Validate receipts or purchase tokens on the server, and handle refunds and revocations from store notifications (App Store Server Notifications, Google Play real-time developer notifications).
- Offer restore purchases. The same entitlement table serves web and mobile.

## Avoid

- Granting access from the client's word that a payment succeeded.
- Storing card data. Use the provider's hosted fields or checkout.
- Hard-coding prices in the app. Load them from the store or the provider.
