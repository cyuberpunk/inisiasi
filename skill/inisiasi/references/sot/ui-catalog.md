# UI catalog: icons, motion, loading, charts, diagrams, sound

> Last verified: 2026-11-17

Scope: UI layers outside [frontend.md](frontend.md) and [mobile.md](mobile.md). Generated from a catalog of 115 libraries (UI kits, icons, motion, loading, charts, diagrams, sound). One default per layer, the rest are conditional. Versions checked on the npm registry 2026-11-17. Scores per library: [ui-catalog-scores.md](ui-catalog-scores.md).

## Defaults

| Layer | Use | Alternative |
|-------|-----|------------|
| React kit | shadcn/ui + `@base-ui/react` 1.9 + Tailwind v4 (unchanged) | COSS UI, Kumo: ready-made sets on top of Base UI |
| Cross-framework headless | `@ark-ui/react` 5.40 | Park UI if using Panda CSS |
| Svelte | `bits-ui` 2.21 | none |
| Chat and AI | `assistant-ui` for threads, AI Elements for widgets | CopilotKit only if you need a full in-app agent |
| Icons | `lucide-react` 1.74 | `@tabler/icons-react` for dense dashboards, `@hugeicons/react` for rounded, `iconoir-react` for thin strokes |
| Brand logos | `simple-icons` 16.38 | do not use UI icons for logos |
| Animated icons | Heroicons Animated | Animate Icons; not for toolbars or dense lists |
| Motion | CSS and View Transitions (unchanged) | `motion` 14.14 for springs, layout, drag; `gsap` 3.15 only for complex timelines or scroll |
| Micro-motion | `@formkit/auto-animate` 0.10 for lists entering and leaving | `number-flow` 0.6 for changing numbers, `torph` 0.1 for text morphing |
| Loading | skeletons from the real layout (Boneyard) for content over 300 ms | `ldrs` 44 loaders if you need a minimal indicator |
| Light charts | `@observablehq/plot` 0.6 | `@visx/shape` 4.0 for custom designs, Nivo if you need many ready-made types |
| Large-volume charts | `echarts` 6.1 | `unovis` if one API must cover web and mobile |
| Node diagrams | `@xyflow/react` 13.0 | Svelte Flow for Svelte, AntV X6 only for full diagram editors |
| Document diagrams | Mermaid 12.3 | already the default in [engineering-practices.md](engineering-practices.md) |
| Sound | no sound | Cuelume (2 KB, synthesized) for interaction tones, `use-sound` 5.0 on top of Howler 2.2 for playback |

## Use when

- Marketing landing pages: blocks from Magic UI, Aceternity, Tailark, Prestige, Coded Visuals. Copy-paste, then review: usually no tokens, weak a11y, heavy animation. At most one hero block per page.
- The team uses Figma as the source: Untitled UI React, Fragments UI, Create UI. Check the license per component before it enters the repo.
- Internal templates or demos: 8bitcn, Skiper UI, Inspira UI, Velora UI, Kokonut, Syntax, Eldora, Easy UI, Arc UI, XiodUI. Not for branded products.
- Vue: Inspira UI, or Ark UI.
- Sound required for feedback: Cuelume or `use-sound`. Mandatory conditions: a mute toggle that persists, no audio on load, sound is never the only feedback (WCAG 1.1.1, 1.4.2).
- Accessible charts: provide a table or a text summary of the same data, whatever the library.

## Avoid

- Melt UI. Not on npm, use Bits UI.
- Chart.js for new React apps. Canvas-based, no tokens, a11y done by hand.
- Heavy chart libraries (ECharts, Nivo, Reaviz, Unovis) in the initial bundle. Load them lazily per route.
- Spinner packs (SpinKit, React Spinners, Soonish) as the default loading state. Skeletons are more honest.
- Autoplaying audio, mass sound on hover, sound as the only confirmation.
- Two component systems in one app (for example shadcn plus HeroUI).
- Marketplaces (21st.dev, iconmcp) as a source of production code without review.
- Catalog entries with no stable package or clear repo: stack-diagram, iconmcp, Prism System, StyleKit, Scrolltide, Rune Icons, Flux Icons, Reicon, Akaza UI (alpha).
