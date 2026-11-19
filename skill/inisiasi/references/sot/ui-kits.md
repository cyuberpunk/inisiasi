# UI kits: React and framework-agnostic web

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: npm latest version and weekly downloads for every package below (`api.npmjs.org/downloads/point/last-week`, 2026-11-12..2026-11-18), GitHub stars and last push, Headless UI and Tremor activity. Not checked: per-component licensing of the paid kits.

Scope: React and framework-neutral component libraries for the web, ranked by measured usage. Vue, Svelte, Angular, and copy-paste block sets: [ui-kits-frameworks.md](ui-kits-frameworks.md). Mobile: [ui-kits-native.md](ui-kits-native.md). Enterprise design systems: [design-systems.md](design-systems.md). Styling engines: [styling.md](styling.md). An agent generating the UI (AG-UI, A2UI, MCP Apps): [agentic-engineering.md](agentic-engineering.md).

Reading the table. Popularity is npm weekly downloads, then GitHub stars. Stage is the version's maturity, not its quality. A pre-1.0 library in wide use is still a valid default when its owner accepts churn.

## Defaults

- React: shadcn/ui (copy the source into the repo) on Base UI primitives and Tailwind v4.
- Non-React web without a framework kit: daisyUI 5 or Bootstrap 5.
- Headless and brand-neutral: React Aria Components (a11y and i18n), Ark UI (multi-framework), Base UI (unstyled, React).

## Tiers

| Tier | What it means |
|------|---------------|
| Foundation | Unstyled behaviour: state, a11y, keyboard, positioning. You own the visuals. |
| Kit | Styled components. Either installed or copied into the repo. |
| Registry | Copy-paste blocks and sections on top of a kit. Reviewed before use, per block. |

## React foundations

| Library | Version | npm/wk | Stars | Built on | CSS-only | Use when |
|---------|---------|--------|-------|----------|----------|----------|
| React Aria Components | 1.22.1 | 10.1M | 13k (`adobe/react-spectrum`) | Own hooks, no styling | Yes | a11y, keyboard, i18n requirements are strict |
| Radix Primitives | 1.3.1 (`@radix-ui/react-dialog`) | 101M | 19.5k | Own primitives, no styling | Yes | The default headless base for older shadcn projects |
| Base UI | 1.9.0 | 32.3M | 11.5k | Own primitives, no styling | Yes | shadcn 2026 default. New code |
| Headless UI | 2.2.10 | 10.3M | 28.8k | Own primitives, Tailwind-friendly | Yes | Tailwind shops that want minimal parts. No push since 2026-04 |
| Ark UI | 5.40.0 | 1.51M | 5.5k | Zag.js state machines | Yes | One API for React, Vue, Solid, Svelte |
| Ariakit | 0.4.43 | 2.22M | 8.6k | Own primitives | Yes | Accessible combobox, menu, dialog with less API |

## React kits, installed

| Library | Version | npm/wk | Stars | Built on | CSS-only | Use when |
|---------|---------|--------|-------|----------|----------|----------|
| MUI | 9.5.0 | 14.8M | 99.4k | Emotion or Pigment CSS | No, needs a style engine | Data-dense internal tools, hiring pool of MUI devs |
| Ant Design | 6.7.1 | 5.45M | 100k | cssinjs (`@ant-design/cssinjs`) | No | Admin panels, Chinese ecosystem, huge table and form coverage |
| Mantine | 9.8.1 | 3.81M | 32.0k | Own CSS modules plus variables | Partly. Ships compiled CSS, no runtime engine | Full kit with hooks, forms, dates, charts in one place |
| Chakra UI | 3.38.0 | 2.36M | 40.7k | Panda CSS preset | Yes, zero runtime in v3 | A styled kit with tokens and no Tailwind |
| Radix Themes | 3.3.0 | 1.61M | 8.9k | Radix Primitives plus CSS variables | Yes | Styled Radix without writing a system |
| HeroUI | 3.2.7 | 1.18M | 31.3k | Tailwind v4 | Yes, Tailwind classes | Tailwind kit with a full component set and themes |
| shadcn CLI | 4.23.0 | 19.2M | 128.6k | Radix or Base UI plus Tailwind | Yes | Source in your repo, you own it. Default |
| PrimeReact | 11.2.3 | 425k | 8.3k | Own theming (themes on npm) | Partly | Data tables and forms, jQuery-era team |
| Blueprint | 6.23.1 | 382k | 22.2k | Sass plus own CSS | Yes | Dense desktop-like web apps, Palantir style |
| Adobe Spectrum | 3.47.7 | 2.28M | 16.1k | Own CSS, React Aria underneath | Partly | Adobe-adjacent products, strict a11y |
| MUI Joy | 5.0.0-beta.52 | 191k | with MUI | Emotion | No | Skip. Beta since 2023, MUI now points to Material 3 |

## Registries and blocks

| Registry | Version (package) | npm/wk | Stars | Built on | Use when |
|----------|---------|--------|-------|----------|----------|
| Magic UI | repo only | n/a | 23.4k | Tailwind plus Motion | Marketing pages, at most one hero block |
| Kumo | 2.19.0 | 811k | 4.2k | Base UI, Cloudflare | A Base UI kit that is already assembled |
| Lobe UI | 6.16.2 | 616k | 2.2k | Ant Design | Chat and AI panels (LobeChat) |
| Tremor | 3.18.7 | 581k | 3.7k | Tailwind plus Recharts | Dashboards. No push since 2025-10 |
| assistant-ui | 0.15.37 | 3.46M | 13.3k | React, own primitives | Chat threads and AI panels |
| AI Elements | repo only | n/a | 2.5k | shadcn | AI widgets: prompt, message, tool call |
| CopilotKit | `@copilotkit/react-core` 811k/wk | n/a | 38.8k | React | Full in-app agent, not just widgets |

## Use when

- Dark theming by tenant: CSS variables plus a `.dark` class. See [styling.md](styling.md).
- Forms: React Hook Form plus Zod, or the kit's own form layer if the kit is Mantine or Ant Design.
- Data tables: TanStack Table or the kit's table. Server-side pagination and filters.
- The team already has a kit: stay in it. Two kits in one app costs more than the parts you gain.
- An agent picks components: keep the catalog closed and app-owned. See [agentic-engineering.md](agentic-engineering.md).

## Avoid

- `@nextui-org/react` 2.6.11. Superseded by HeroUI.
- `@mui/joy` for new work. Still beta, and MUI's direction is Material 3.
- `@base-ui-components/react`. Old package name, use `@base-ui/react`.
- Headless UI for a new project that needs more than menu and dialog. Activity stopped 2026-04.
- A paid kit (Planes, Velora, XiodUI) before reading the license per component.
- Two component systems in one app, or a kit plus a hand-written parallel design system.
