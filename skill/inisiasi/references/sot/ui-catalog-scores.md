# UI catalog scores

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: COSS UI (ex-Origin) rename, Base UI as shadcn default, Melt UI npm status, npm versions of default packages. Not checked: existence and repo status of most of the 115 kits, the scores themselves.

> Generated 2026-11-17 from 115 catalog entries. Translated to English by hand on 2026-11-18. The generator (`mcp/curation/score-ui-catalog.mjs`) is no longer in the repo, so edit this file directly.

Score = bundle weight (0-3) + framework neutrality (0-2) + usage evidence from the catalog (0-3) + adoption cost (0-2).
Bands: 8+ core, 7-7.9 choose if, 5.5-6.9 conditional, below 5.5 avoid.
The score rates fitness as a default for a new project, not the quality of the library.
The Avoid list in [ui-catalog.md](ui-catalog.md) overrides any band here: those rows are marked `avoid`.

## chart

| Score | Band | Library | Framework | Evidence | Note |
|---|---|---|---|---|---|
| 8 | core | Apache ECharts | Agnostic | 67.7k★ |  |
| 7.5 | choose if | Liveline | React | Realtime line |  |
| 7 | choose if | Observable Plot | Agnostic | D3 team |  |
| 6.5 | conditional | Gifted Charts | React | Mobile charts |  |
| 6.5 | conditional | Mono Charts | React | 30 charts |  |
| 6.5 | conditional | visx | React | Low-level primitives |  |
| 6 | conditional | LayerChart | Svelte | Composable charts |  |
| 6 | conditional | Unovis | Multi | Multi-framework |  |
| 5.5 | conditional | Chart.js | Agnostic | 67.8k★ | canvas, no tokens, a11y manual |
| 5.5 | conditional | Nivo | React | Ready-made charts |  |
| 5.5 | conditional | Reaviz | React | D3 + Motion |  |

## diagram

| Score | Band | Library | Framework | Evidence | Note |
|---|---|---|---|---|---|
| 9 | core | Mermaid | Agnostic | ~91k★ |  |
| 8.5 | core | React Flow | React | 38.9k★ |  |
| 7.5 | choose if | AntV G6 | Agnostic | 12.4k★ |  |
| 7 | avoid | stack-diagram | Other | New 1 Nov 2026 | no stable package (ui-catalog Avoid) |
| 6 | conditional | AntV X6 | Agnostic | Diagram editor |  |
| 6 | conditional | Svelte Flow | Svelte | Same team as React Flow |  |

## icons

| Score | Band | Library | Framework | Evidence | Note |
|---|---|---|---|---|---|
| 8 | core | Heroicons | Multi | 1,288 icons |  |
| 8 | core | Hugeicons | Multi | 6,000+ free |  |
| 8 | avoid | Icon MCP | Agnostic | Agent-editable set | no stable package (ui-catalog Avoid) |
| 8 | core | Iconoir | Multi | 1,600+ icons |  |
| 8 | core | Lucide | Multi | 1,500+ icons |  |
| 8 | core | Phosphor | Multi | 9,000+ · 6 weights |  |
| 8 | avoid | Reicon | Multi | 2,700+ icons | no stable package (ui-catalog Avoid) |
| 8 | core | Remix Icon | Multi | 3,000+ pairs |  |
| 8 | avoid | Rune Icons | Agnostic | 900+ · 5 styles | no stable package (ui-catalog Avoid) |
| 8 | core | Simple Icons | Agnostic | 3,200+ brands |  |
| 8 | core | Tabler Icons | Multi | 5,800+ icons |  |
| 7.5 | avoid | Flux Icons | React | 3,700+ React | no stable package (ui-catalog Avoid) |
| 7.5 | choose if | Heroicons Animated | React | 316 animated |  |
| 7 | choose if | Nano Icons | Other | RN font icons |  |
| 6.5 | conditional | Animate Icons | React | 1,170 animated |  |

## loading

| Score | Band | Library | Framework | Evidence | Note |
|---|---|---|---|---|---|
| 8.5 | core | Boneyard | Multi | 7.5k★ |  |
| 8 | core | ldrs | Multi | 44 loaders |  |
| 8 | core | Loader Buttons | Agnostic | 25 buttons |  |
| 7.5 | choose if | Soonish | React | 91 pixel loaders |  |
| 7 | choose if | SpinKit | Agnostic | CSS spinners | a spinner is not the default loading state |
| 6.5 | conditional | React Spinners | React | Spinner pack | a spinner is not the default loading state |

## motion

| Score | Band | Library | Framework | Evidence | Note |
|---|---|---|---|---|---|
| 9.5 | core | React Bits | React | 47k★ · 165+ |  |
| 8 | core | anime.js | Agnostic | Small engine |  |
| 8 | core | AutoAnimate | Multi | ~2KB |  |
| 8 | core | Cult UI | React | 6.1k★ · 75–157 UI + 100+ agent patterns |  |
| 8 | core | Torph | Agnostic | Text morph |  |
| 7.5 | choose if | Amicro | React | Micro-interactions |  |
| 7.5 | choose if | Animata | React | Small CSS |  |
| 7.5 | choose if | Animate UI | React | Mid + MCP |  |
| 7.5 | choose if | Fancy Components | React | Experimental set |  |
| 7.5 | choose if | Magic UI | React | 20.8–22k★ · 150–247 items |  |
| 7.5 | choose if | Morph UI | React | View Transitions |  |
| 7.5 | choose if | Motion Primitives | React | Small set |  |
| 7.5 | choose if | Number Flow | React | Tiny specialist |  |
| 7.5 | choose if | Sileo | React | Gooey toast |  |
| 7.5 | choose if | Tween UI | React | Animated components |  |
| 7 | choose if | Canvas UI | Multi | ~4.5k★ |  |
| 7 | choose if | GSAP | Agnostic | Timeline engine |  |
| 7 | choose if | Kinetics | Agnostic | 153 spring effects |  |
| 7 | choose if | Motion | Multi | Animation runtime |  |
| 6.5 | conditional | Bencho | React | Interaction gallery |  |
| 6.5 | conditional | BEUI | React | Animated set |  |
| 6.5 | conditional | Easy UI | React | Copy-paste set |  |
| 6.5 | conditional | Kobra | React | 80+ motion components |  |
| 6.5 | conditional | React Spring | React | Spring hooks |  |
| 6.5 | conditional | UI Layouts | React | Mid |  |
| 6 | conditional | Aceternity UI | React | ~19k★ · 200+ blocks |  |
| 6 | conditional | Transitions.dev | Other | Transition gallery |  |
| 5.5 | conditional | Prestige UI | React | 132 blocks · 43 components |  |
| 4.5 | avoid | Skiper UI | React | 163 elements |  |

## sound

| Score | Band | Library | Framework | Evidence | Note |
|---|---|---|---|---|---|
| 8.5 | core | use-sound | React | 3.2k★ · <1KB |  |
| 8 | core | Howler.js | Agnostic | ~7KB gzip |  |
| 7 | choose if | Cuelume | Agnostic | ~2 KB · 10 sounds |  |
| 6.5 | conditional | Sound Lab | React | 200 sounds |  |
| 6.5 | conditional | soundcn | React | 700+ sounds |  |

## ui

| Score | Band | Library | Framework | Evidence | Note |
|---|---|---|---|---|---|
| 10 | core | Ark UI | Multi | ~200k npm/wk @ark-ui/react |  |
| 10 | core | daisyUI | Agnostic | ~39–42k★ · 60+ · ~510k npm/wk |  |
| 9 | core | Bits UI | Svelte | 3.5k★ · 1–4.2M npm/mo |  |
| 8.5 | core | 8bitcn | React | 2.0k★ |  |
| 8.5 | core | AI Elements | React | 2.4k★ · 20+ |  |
| 8 | core | assistant-ui | React | 12.1k★ |  |
| 8 | core | Astryx | React | 12.9k★ · 150+ components |  |
| 8 | core | Park UI | Multi | 2.4k★ · 30+ |  |
| 8 | core | productdevbook/ui | Multi | 39 components · early |  |
| 7.5 | avoid | Akaza UI | Vue | 109★ · alpha | no stable package (ui-catalog Avoid) |
| 7.5 | choose if | Base UI | React | Growing · shadcn 2026 default |  |
| 7.5 | choose if | Beautiful UI | React | AI primitives |  |
| 7.5 | choose if | CopilotKit | React | 37.3k★ |  |
| 7.5 | choose if | COSS UI (ex-Origin) | React | ~10.6k site · 50+ primitives / 600 Origin |  |
| 7.5 | choose if | HeroUI | React | ~31k★ · full set |  |
| 7.5 | choose if | Kibo UI | React | 41 core · 1,000+ variants |  |
| 7.5 | choose if | Kumo | React | 4.2k★ · Base UI |  |
| 7.5 | choose if | Lobe UI | React | 2.2k★ |  |
| 7.5 | choose if | Merid | React | 60+ components |  |
| 7.5 | choose if | Syntax UI | React | Small |  |
| 7 | choose if | 21st.dev | React | 5.4k★ repo · 12k+ catalog |  |
| 7 | choose if | ARC UI | Multi | 166 web components |  |
| 7 | choose if | FlyonUI | Agnostic | daisy-scale |  |
| 7 | avoid | Prism System | Other | White-label monorepo | no stable package (ui-catalog Avoid) |
| 7 | choose if | Storefront UI | Multi | eCom components + blocks |  |
| 7 | avoid | StyleKit | Other | 148 styles | no stable package (ui-catalog Avoid) |
| 6.5 | conditional | Agent Elements | React | 25–26 components |  |
| 6.5 | conditional | Eldora UI | React | Smaller |  |
| 6.5 | conditional | Fragments UI | React | 68 components + MCP |  |
| 6.5 | conditional | Planes | React | 100+ components · paid |  |
| 6.5 | conditional | Velora UI | React | 64 components + site |  |
| 6.5 | conditional | XiodUI | React | 89 components · 20 palettes |  |
| 6 | avoid | Scrolltide | Other | Spatial vault | no stable package (ui-catalog Avoid) |
| 6 | conditional | SV5UI | Svelte | New 2026 full set |  |
| 5.5 | conditional | Arc UI | React | 140 components · 83 blocks |  |
| 5.5 | conditional | Kokonut UI | React | Mid catalog |  |
| 5.5 | conditional | Tailark | React | 300+ blocks |  |
| 5.5 | conditional | Tremor | React | Dashboard set |  |
| 5.5 | conditional | Untitled UI React | Figma | 1.9k★ · ~8.9k npm/wk |  |
| 5 | avoid | Inspira UI | Vue | Vue catalog |  |
| 4.5 | avoid | Coded Visuals | React | 1,140+ variations |  |
| 4.5 | avoid | Create UI | Figma | Figma + MCP |  |
| 3 | avoid | Melt UI | Svelte | ~30+ builders | old npm package stale since 2025-03, rewrite is 0.x |
