# Frontend

> Last verified: 2026-11-20

Scope: web frameworks, state, forms, styling entry, SEO, CMS, admin dashboards. Architecture and checklist: [frontend-architecture.md](frontend-architecture.md). Which UI kit, ranked by measured downloads: [ui-kits.md](ui-kits.md) (React), [ui-kits-frameworks.md](ui-kits-frameworks.md) (Vue, Svelte, Angular, Lit). Design systems and tokens: [design-systems.md](design-systems.md). Styling approaches and CSS foundations: [styling.md](styling.md). Icons, motion, loading, charts, diagrams, sound: [ui-catalog.md](ui-catalog.md). Mobile: [mobile.md](mobile.md), [ui-kits-native.md](ui-kits-native.md).

## Defaults

| Layer | Use | Alternative |
|-------|-----|------------|
| SPA framework | TanStack Router | React Router |
| Fullstack React | TanStack Start, or Next.js App Router if you need SEO/RSC | |
| Vue / Svelte / content | Nuxt / SvelteKit / Astro (typed API: oRPC) | |
| React UI | shadcn/ui (Base UI primitives, `@base-ui/react`) + Tailwind v4 | Radix for older shadcn projects. React Aria if a11y/i18n requirements are strict |
| Non-React UI | daisyUI 5 + Tailwind v4 | the framework's own kit: [ui-kits-frameworks.md](ui-kits-frameworks.md) |
| Styling | Tailwind v4 utility CSS | CSS Modules per component. CSS-in-JS only in existing code: [styling.md](styling.md) |
| Server state | TanStack Query | fate if you need a Relay-style normalized cache |
| Client state | Zustand | Jotai. Redux Toolkit only for existing code |
| Forms | React Hook Form + Zod | TanStack Form if the stack is already TanStack |
| Schema | Zod (shared with the backend) | Valibot if the bundle size is critical |
| Animation | CSS and View Transitions | Motion (`motion/react`), GSAP for complex cases |
| Icons | Lucide | Phosphor |
| i18n | Paraglide (library, new apps), next-intl (Next.js) | fbtee (inline, compiler) |

## Design system

- Start from tokens: semantic colors (`primary`, `destructive`, `muted`), a 4/8 spacing scale, radius, fonts. Not `blue-500`.
- Component order: Button, Input, Label, then Card, Dialog, Dropdown, then Table, Form, Toast, Navigation, Empty state, Skeleton.
- Dark mode and a11y from the start. Storybook only if there is more than one app or team.
- shadcn community registries: review the code before using it.

## SEO

Checked on the web 2026-11-19: JSON-LD guidance, FAQ rich results, Core Web Vitals as a ranking input.

- Pages that must rank render on the server or at build time (SSR/SSG). Client-only SPAs for app screens behind login.
- Every indexable page: a unique `<title>` and meta description, a canonical URL, Open Graph and Twitter tags with an image.
- `sitemap.xml` and `robots.txt` generated from routes. Structured data as JSON-LD (schema.org) for products, articles, organizations. Google no longer shows FAQ rich results.
- Multilingual: [i18n.md](i18n.md). Speed is a ranking signal: [performance.md](performance.md).

## Content sites and CMS

Checked on the web 2026-11-19: Astro content collections, Payload (now part of Figma, still open source), Sanity, Directus.

| Who edits | Use |
|---------|-----|
| Developers only | Content in git: Astro content collections or MDX |
| Non-developers, TS/Next stack, self-hosted | Payload |
| Non-developers, managed | Sanity |
| An existing SQL database needs an admin UI | Directus |

Preview drafts before publishing, and rebuild or revalidate pages from a CMS webhook.

## Admin and dashboards

Checked on the web 2026-11-19: TanStack Table, Refine.

- Tables: TanStack Table with server-side pagination, sorting, and filters kept in the URL.
- Many CRUD resources: Refine on top of your API, instead of hand-building every list and form.
- Charts: [ui-catalog.md](ui-catalog.md). Permission-based UI, checked again on the server.
- Exports (CSV) run as background jobs for large data ([data-services.md](data-services.md)).

## Use when

- MUI / Chakra: an internal data-dense tool, not a branded product.
- PWA: the app must be installable. Needs an SPA or Next.js.
- Qwik: only if the team already uses it.

## Avoid

- SolidStart for new projects (discontinued in the Solid 2.0 cycle).
- NativeWind for new projects (use Uniwind).
- The package `@base-ui-components/react` (old name, use `@base-ui/react`).
- Heavy UI kits as the default. A global store for server data.
