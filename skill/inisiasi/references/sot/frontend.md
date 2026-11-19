# Frontend

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: npm latest versions for every package in the Defaults table (React 19.3, TanStack Router 1.170, TanStack Start 1.169, Next 16.4, Nuxt 4.6, SvelteKit 3.4, Astro 7.4, Zustand 5.1, Jotai 3.0, Zod 4.6, Valibot 1.5, TanStack Query 5.108, React Hook Form 7.92, Motion 14.14, GSAP 3.15, lucide-react 1.76, Paraglide 3.2, next-intl 4.15, fbtee 6.0, Tailwind 4.3), the CMS and blog stack with versions and downloads per row, WordPress 7.1.5, Ghost 6.78. Carried over from 2026-11-19: JSON-LD and FAQ guidance, Payload's Figma ownership. Not checked: admin dashboard entries in this file, hosted CMS pricing.

Scope: web frameworks, state, forms, styling entry, SEO, CMS, admin dashboards. Architecture and checklist: [frontend-architecture.md](frontend-architecture.md). Which UI kit, ranked by measured downloads: [ui-kits.md](ui-kits.md) (React), [ui-kits-frameworks.md](ui-kits-frameworks.md) (Vue, Svelte, Angular, Lit). Design systems and tokens: [design-systems.md](design-systems.md). Styling approaches and CSS foundations: [styling.md](styling.md). Icons, motion, loading, charts, diagrams, sound: [ui-catalog.md](ui-catalog.md). Mobile: [mobile.md](mobile.md), [ui-kits-native.md](ui-kits-native.md).

## Defaults

| Layer | Use | Alternative |
|-------|-----|------------|
| SPA framework | TanStack Router v1 (React 19) | React Router v7 |
| Fullstack React | TanStack Start v1, or Next.js 16 App Router if you need SEO/RSC | |
| Vue / Svelte / content | Nuxt 4 / SvelteKit 3 / Astro 7 (typed API: oRPC) | |
| React UI | shadcn/ui (Base UI 1.x primitives, `@base-ui/react`) + Tailwind v4 | Radix for older shadcn projects. React Aria if a11y/i18n requirements are strict |
| Non-React UI | daisyUI 5 + Tailwind v4 | the framework's own kit: [ui-kits-frameworks.md](ui-kits-frameworks.md) |
| Styling | Tailwind v4 utility CSS | CSS Modules per component. CSS-in-JS only in existing code: [styling.md](styling.md) |
| Server state | TanStack Query v5 | fate if you need a Relay-style normalized cache |
| Client state | Zustand 5 | Jotai 3. Redux Toolkit 2 only for existing code |
| Forms | React Hook Form 7 + Zod 4 | TanStack Form if the stack is already TanStack |
| Schema | Zod 4 (shared with the backend) | Valibot 1 if the bundle size is critical |
| Animation | CSS and View Transitions | Motion 14 (`motion/react`), GSAP 3 for complex cases |
| Icons | Lucide (`lucide-react` 1.x) | Phosphor 2 |
| i18n | Paraglide 3 (library, new apps), next-intl 4 (Next.js) | fbtee 6 (inline, compiler) |

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

Checked on the web 2026-11-20: npm versions and weekly downloads for Payload 3.94, Sanity 6.24, `@directus/sdk` 27.2, Strapi 5.63, Astro 7.4, Keystatic 0.6, Tina 3.15, Decap 3.18, Contentful 11.12, `@storyblok/react` 7.5, `@prismicio/client` 7.23, Pagefind 1.6, MDX 3.1, and GitHub activity for each; WordPress 7.1.5 and Ghost 6.78 from their own release channels. Carried over from 2026-11-19: Payload is part of Figma and still open source. Not checked: pricing tiers for Sanity, Contentful, Storyblok, and Prismic.

| Who edits | Use | Evidence |
|---------|-----|----------|
| Developers, publishing from git | Astro 7 content collections, or MDX | Astro 12.5M/wk, 64.1k stars |
| A marketing team, site hosted for them | Ghost 6.78 (self-host, or Ghost Pro) | 55.9k stars |
| Non-developers editing inside a Next.js app | Payload 3.94 | 1.59M/wk, 45.9k stars |
| Non-developers, managed editing, separate API | Sanity 6.24 | `@sanity/client` 5.2M/wk, 6.4k stars on the studio repo |
| An existing SQL database needs an admin UI | Directus | 38.6k stars |
| A team already on Strapi, or a big plugin market | Strapi 5.63 | 73.5k stars, heavier admin |
| The client wants the admin they already know | WordPress 7.1.5, headless or classic | 21.5k stars |
| Edit from GitHub, no server to run | Keystatic 0.6 (pre-1.0), or Decap 3.18 (formerly Netlify CMS) | 2.5k stars, 19.5k stars |
| A SaaS you do not run | Contentful 11.12, Storyblok 7.5, Prismic 7.23 | Ask the price |

A blog is the same decision with fewer requirements.

- Ten posts, one author, all engineers: files in git. A CMS is a dependency, a database, and a backup to maintain for nothing.
- Every post as MDX, with frontmatter for title, description, date, and OG image. The route list generates `sitemap.xml` and the RSS feed.
- Preview before publish. Drafts go to a preview build, never to the public URL.
- Search: Pagefind 1.6 (4.1M/wk) indexes the built output, so it costs no server. Past roughly 10k pages, use a real index: [data-services.md](data-services.md).
- Comments: Giscus 3.1 on GitHub Discussions. Do not add a comment database to a blog.
- Newsletter: [email-notifications.md](email-notifications.md).

Rules:

- One source of truth per post. A Notion page synced into git as the "real" copy drifts within a month.
- Never hand-build a CMS. Every option above already has auth, drafts, and media handling.
- Images go through the framework's image pipeline, not raw uploads into `public/`.
- Rebuild or revalidate from the CMS webhook. A stale page after publish is the most common bug in this stack.

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
- A headless CMS for a ten-post blog, or a hand-built CMS for anything.
- Decap or Keystatic when the editors have no GitHub account.
- `storyblok-js-client` (repo archived 2025-06). Use `@storyblok/react` 7.5.
- WordPress with no one to maintain updates. Core, plugins, and PHP on a public host is a security surface, and [security.md](security.md) applies.
