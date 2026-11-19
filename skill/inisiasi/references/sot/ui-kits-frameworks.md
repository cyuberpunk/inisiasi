# UI kits: Vue, Svelte, Angular, Lit

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: npm latest version and weekly downloads (`api.npmjs.org/downloads/point/last-week`, 2026-11-12..2026-11-18), GitHub stars and last push, Shoelace archived and Web Awesome as its successor. Not checked: per-component licensing.

Scope: component libraries per framework, ranked by measured usage. React and framework-neutral kits: [ui-kits.md](ui-kits.md). Mobile: [ui-kits-native.md](ui-kits-native.md).

## Defaults

| Framework | Use | Alternative |
|-----------|-----|-------------|
| Vue | Nuxt UI 4.13 or PrimeVue 5.0 | Vuetify 4.3 if the team already knows it |
| Svelte | bits-ui 2.21 headless | shadcn-svelte 1.8 for copied source, Flowbite Svelte 1.33 for a full kit |
| Angular | Angular Material 22.3 | PrimeNG 22.1 |
| Web components / any framework | Lit 3.3 (build your own) | Web Awesome 3.15, shoelace's paid successor |

## Vue

| Library | Version | npm/wk | Stars | Built on | CSS-only | Use when |
|---------|---------|--------|-------|----------|----------|----------|
| Nuxt UI | 4.13.0 | 1.10M | 7.1k (`nuxt/ui`) | Reka UI plus Tailwind v4 | Yes, Tailwind classes | Nuxt or Vue plus Tailwind |
| PrimeVue | 5.0.5 | 1.15M | 12.5k | Own primitives, themes | Partly | Large forms and tables, a theme marketplace |
| Vuetify | 4.3.4 | 1.39M | 41.0k | Material Design 3, own CSS | Yes, compiled CSS | Material look, a large team that knows it |
| Element Plus | 2.14.8 | 815k | 27.9k | Own theming | Partly | Admin panels, Chinese ecosystem |
| Quasar | 2.35.5 | 562k | 27.2k | Own CSS | Partly | One codebase for web, Electron, and mobile |
| shadcn-vue | 2.9.0 | 127k | 10.8k | Reka UI plus Tailwind | Yes | Source in your repo, the Vue port of shadcn |
| Naive UI | 2.45.3 | 211k | 18.6k | Own CSS-in-JS | No | A lighter Ant Design feel |

## Svelte

| Library | Version | npm/wk | Stars | Built on | CSS-only | Use when |
|---------|---------|--------|-------|----------|----------|----------|
| bits-ui | 2.21.0 | 1.82M | 3.7k | Own primitives, Svelte 5 | Yes | Default headless base for Svelte |
| shadcn-svelte | 1.8.1 | 335k | 9.3k | bits-ui plus Tailwind | Yes | Source in your repo |
| Flowbite Svelte | 1.33.1 | 120k | 2.8k | Tailwind plus Flowbite tokens | Yes | A full kit without copying source |
| Skeleton | 5.0.5 | 115k | 6.1k | Tailwind v4 | Yes | A themeable kit, Tailwind-native |
| Melt UI | 0.x rewrite | see Avoid | | Own builders | Yes | Do not use. See [ui-catalog.md](ui-catalog.md) Avoid |

## Angular

| Library | Version | npm/wk | Stars | Built on | CSS-only | Use when |
|---------|---------|--------|-------|----------|----------|----------|
| Angular Material | 22.3.0 | 3.32M | 25.0k (`angular/components`) | Material 3, own CSS | Yes | The Angular default |
| PrimeNG | 22.1.5 | 933k | 12.5k | Own themes | Partly | More components than Material |
| NG-ZORRO | 22.2.0 | 198k | 9.2k | Ant Design for Angular | Partly | An Ant Design look in Angular |

Angular tracks its own major (`22`) with the Angular release. The `@angular/cdk` package is the behaviour layer underneath Material.

## Web components

| Library | Version | npm/wk | Stars | Built on | CSS-only | Use when |
|---------|---------|--------|-------|----------|----------|----------|
| Lit | 3.3.3 | 10.2M | 21.9k | Native custom elements | Yes | Build your own components once, use in any framework |
| Web Awesome | 3.15.0 | 200k | 1.4k | Lit, successor to Shoelace | Yes | A ready-made set of custom elements |
| Shoelace | 2.20.1 | 198k | 13.8k | Lit | Yes | Avoid for new work. Repository archived 2026-05, moved to Web Awesome |

Lit is a base, not a kit. Its value is one component shared across React, Vue, Svelte, and plain HTML. `@lit-labs/react` 2.1.3 (3.71M/wk) wraps a custom element as a React component.

## Use when

- The product uses two frameworks (marketing in Astro, app in React): a web component set or plain CSS, not two kits.
- The team is new to the framework: the framework's own official kit first, a third-party kit second.
- A design system already exists: use its framework bindings. See [design-systems.md](design-systems.md).

## Avoid

- Melt UI. The old package is stale and the Svelte 5 rewrite is 0.x.
- Shoelace for new work. Archived, and the successor is paid.
- A React kit ported to another framework by a third party with low downloads and no release in a year.
- Two kits in one framework app.
