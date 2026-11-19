# UI catalog scores

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: the `ui` section was split into [ui-kits.md](ui-kits.md), [ui-kits-frameworks.md](ui-kits-frameworks.md), [ui-kits-native.md](ui-kits-native.md), and [design-systems.md](design-systems.md). Not checked: existence and repo status of the catalog kits still scored below, and the scores themselves.

> Generated 2026-11-17 from 115 catalog entries. Translated to English by hand on 2026-11-18. The generator (`mcp/curation/score-ui-catalog.mjs`) is no longer in the repo, so edit this file directly.

Score = bundle weight (0-3) + framework neutrality (0-2) + usage evidence from the catalog (0-3) + adoption cost (0-2).
Bands: 8+ core, 7-7.9 choose if, 5.5-6.9 conditional, below 5.5 avoid.
The score rates fitness as a default for a new project, not the quality of the library.
The Avoid list in [ui-catalog.md](ui-catalog.md) overrides any band here: those rows are marked `avoid`.
Sections below: chart, diagram, icons, loading, motion, sound. The `ui` section moved to the downloaded-ranked files named at the end.

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

Moved. React and framework-neutral kits, ranked by measured npm weekly downloads: [ui-kits.md](ui-kits.md). Vue, Svelte, Angular, Lit: [ui-kits-frameworks.md](ui-kits-frameworks.md). React Native, Flutter: [ui-kits-native.md](ui-kits-native.md). Published design systems and tokens: [design-systems.md](design-systems.md). Styling engines: [styling.md](styling.md).

The old 0-10 scores for that section are gone. The split files rank by measured downloads and stars instead, which is the same evidence the score formula was approximating.
