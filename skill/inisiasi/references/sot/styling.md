# Styling

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: npm versions and weekly downloads of every package below (`api.npmjs.org/downloads/point/last-week`, 2026-11-12..2026-11-18), GitHub stars and last push, Stitches archived, WindiCSS last push. Not checked: runtime behaviour of each option inside RSC and streaming SSR.

Scope: how CSS is written and shipped, plus the CSS foundations a project starts from. Component libraries: [ui-kits.md](ui-kits.md). Design systems and tokens: [design-systems.md](design-systems.md).

## Defaults

- Utility CSS (Tailwind v4) for application UI. CSS Modules for component-scoped styles that sit next to their markup. Both are zero runtime.
- Runtime CSS-in-JS only where an existing codebase already uses it. Do not start a new app with it.
- Do not mix approaches in one app. Pick one for components and one for content.

## Choosing an approach

| Approach | Use when | Trade-off | Libraries (npm/wk) |
|----------|----------|-----------|--------------------|
| Utility CSS (atomic) | Application UI, many components, a design system you own | Markup fills with class strings; needs a merge helper (`clsx` 179M, `tailwind-merge` 117M, `class-variance-authority` 88.8M); design constrained by the config | Tailwind CSS 4.3.5 (190M), UnoCSS 66.13.0 (1.30M) |
| CSS Modules | Component-scoped styles next to the markup; existing plain CSS | A CSS file per component; no shared tokens unless you add them; cross-package sharing is awkward | Built into Vite, Next.js, webpack (`*.module.css`). No package |
| Zero-runtime CSS-in-JS (typed, compiled) | Type-safe styles, variants and recipes, static CSS output | Build step; less dynamic than runtime; learning cost | Vanilla Extract 1.21.3 (3.61M), Panda CSS 2.6.0 (858k), StyleX 0.19.2 (2.57M), Griffel 1.7.8 (799k) |
| Runtime CSS-in-JS | Existing codebase, heavy dynamic theming | Style injection at runtime, streaming SSR and RSC friction, extra bytes, needs a registry | styled-components 6.6.0 (14.8M, 7.0 is prerelease), Emotion 11.14.0 (29.2M) |
| Plain CSS (native) | Small sites, content, or no-build pages | Manual structure and naming; no theming layer unless you write tokens | Native `@layer`, nesting, `:has()`, `container` queries, `oklch()`, `color-mix()`, `light-dark()` |
| Preprocessor | Existing Sass/SCSS codebase | Extra build step that native CSS now covers for variables, nesting and functions | Sass 1.108.2 (44.1M) |

The pipeline is separate from the approach: PostCSS 441M and Lightning CSS 260M both transform CSS (nesting, vendor prefixes, minification). Vite+ configures this already.

Why utility CSS is the default: one source of styles for every component, no naming invented per file, the design tokens and the components share one scale. Why CSS Modules still earns its place: a component that owns a non-trivial style block reads better as CSS than as 40 class names, and it needs no tooling.

## Foundations

| Foundation | What it is | Use when |
|------------|-------------|----------|
| Tailwind CSS 4.3.5 | Utility engine, `@theme` tokens, preflight reset, `@tailwindcss/vite` | Default engine (`tailwindcss` 190M/wk) |
| Bootstrap 5.3.9 | Full foundation: grid, components, utilities, optional JS plugins | Server-rendered pages, a team that already knows it (175k★, 8.0M/wk) |
| Pico CSS 2.1.1 | Classless styling for semantic HTML | Content or docs where you write no classes (59k/wk) |
| daisyUI 5.8.1 | Tailwind plugin: component classes, CSS only | Non-React UI, or Tailwind with ready-made parts (1.50M/wk) |
| Bulma 1.0.4 | Class-based CSS, no JS | Small sites, a team that wants no build step (541k/wk) |
| Open Props 1.7.23 | CSS variable library, not a framework | Tokens without a compiler (63k/wk) |
| Radix Colors 3.x | 30 a11y-checked color scales, light and dark | Every project that needs a palette (4.94M/wk) |
| modern-normalize | Reset | Baseline reset if not using Tailwind preflight (599k/wk) |
| `@tailwindcss/typography` 0.5.20 | `prose` classes for rendered content | Markdown, CMS output, docs (26.9M/wk) |
| `@fontsource-variable/inter` 5.3.0 | Self-hosted variable fonts | Default typeface setup (12.9M/wk) |

Design system foundations with a government or enterprise mandate are not a style choice: USWDS 2.14.0 and GOV.UK Frontend 6.6.0 are required for those domains. See [design-systems.md](design-systems.md).

## Use when

- Tailwind v4 with no `tailwind.config.js`: configuration lives in CSS (`@theme`), which is the new default.
- Component variants without runtime: `class-variance-authority` plus `tailwind-merge`.
- Dynamic themes switched at runtime (tenant branding): CSS variables on `:root`, not a JS style engine.
- Dark mode: `light-dark()` or a `.dark` class on `<html>` plus `color-scheme`. `next-themes` 0.4.6 (37.1M/wk) only prevents the flash.
- Anything animated: CSS transitions and View Transitions first. See [ui-catalog.md](ui-catalog.md).

## Avoid

- Stitches 1.2.8. Repository archived since 2025-02.
- WindiCSS. No push since 2024-06. Use UnoCSS or Tailwind.
- Semantic UI 2.5.0. No push since 2024-11. Its community fork is Fomantic UI.
- Runtime CSS-in-JS in a new app that uses RSC or streaming SSR.
- `!important` escalation and global element selectors in a component library.
- Two styling systems in one app, or a Sass mixin set layered on top of Tailwind.
- A CSS framework for a single page with no components.
