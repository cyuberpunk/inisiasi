# Design systems

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: npm versions and weekly downloads for every token and component package (`api.npmjs.org/downloads/point/last-week`, 2026-11-12..2026-11-18), GitHub stars and last push, Polaris archived, Shoelace archived, Web Awesome's free and Pro split, MUI Joy's 2023-08 beta start. Not checked: the release cadence of each vendor's roadmap.

Scope: tokens, published design systems, and the ones a project is required to use. Component libraries that are not a full system: [ui-kits.md](ui-kits.md). Styling engines: [styling.md](styling.md). Product tokens and component order: [frontend.md](frontend.md).

## Defaults

- Own your tokens. A product needs its own semantic layer whether or not it adopts a published system. Start from `frontend.md` tokens, not from a vendor's palette names.
- Adopt a published system when it is mandated (government, a parent company), or when it saves more than it costs to override.
- Tokens as data (JSON or CSS variables), then a build step to each platform. Do not hand-copy values into a second file.
- Never ship a published system's raw palette as the product's brand.

## Tokens

| Tool | Version | npm/wk | Use when |
|------|---------|--------|----------|
| CSS variables | native | n/a | Default. One source, read by every framework |
| Style Dictionary | 5.8.0 | 3.13M | One JSON source, output to CSS, iOS, Android, Compose |
| Tokens Studio transforms | 2.0.3 | 285k | The team designs tokens in Figma and syncs them |
| Radix Colors | 3.0.0 | 4.94M | A default palette with contrast checked for every step |
| Open Props | 1.7.23 | 63k | Ready-made CSS variables without a build step |

Radix Colors does not ship components. It is the palette layer under Radix Themes and many shadcn projects.

## Published systems

| System | Package | Version | npm/wk | Domain | Built on |
|--------|---------|---------|--------|--------|----------|
| Material 3 | `@mui/material` | 9.5.0 | 14.8M | Android and Google ecosystem | Emotion or Pigment CSS |
| Ant Design | `antd` | 6.7.1 | 5.45M | Admin and enterprise | cssinjs |
| Fluent UI | `@fluentui/react-components` | 9.75.2 | 618k | Microsoft 365 look and Office add-ins | Griffel |
| Carbon | `@carbon/react` | 1.121.0 | 171k | IBM products, strict accessibility and data viz | Sass plus own CSS |
| Primer | `@primer/react` | 38.46.0 | 89k | GitHub-like developer tools | CSS modules |
| Spectrum | `@adobe/react-spectrum` | 3.47.7 | 2.28M | Adobe products, React Aria base | Own CSS |
| PatternFly | `@patternfly/react-core` | 6.7.0 | 159k | Red Hat and enterprise consoles | Own CSS |
| Cloudscape | `@cloudscape-design/components` | 3.0.1419 | 195k | AWS consoles | Own CSS tokens |
| GOV.UK Frontend | `govuk-frontend` | 6.6.0 | 247k | UK public sector, mandated | Plain CSS plus JS |
| USWDS | `uswds` | 2.14.0 | 14.8k | US federal sites, mandated (ADA Title II) | Sass |
| Atlassian Design System | `@atlaskit/tokens` | 20.14.0 | 2.45M | Jira and Confluence-like products | CSS variables |
| Salesforce Lightning | `@salesforce-ux/design-system` | 2.264.3 | 65k | Salesforce platform | Sass plus own CSS |
| Nord Design System | `@nordhealth/components` | 5.6.0 | 9.6k | Healthcare | Lit web components |
| EDS | `@equinor/eds-core-react` | 2.6.4 | 22.8k | Energy, Statoil/Equinor | React plus own CSS |
| Grommet | `grommet` | 2.58.0 | 57k | Enterprise dashboards | styled-components |
| Polaris | `@shopify/polaris` | 13.9.5 | 470k | Shopify apps | Own CSS. Repository archived 2026-09 |

## When a system is mandated

| Situation | System |
|-----------|--------|
| US federal site | USWDS. ADA Title II deadlines apply. See [accessibility.md](accessibility.md) |
| UK public sector | GOV.UK Frontend |
| An Office add-in or Teams app | Fluent UI |
| The parent company's system | that system, and its tokens package |
| A vendor's app marketplace (Shopify, Salesforce, Atlassian) | that vendor's system, or the listing is rejected |

In these cases the choice is not a preference. Read the mandate before arguing about a kit.

## Forks and avoid

| Library | Why |
|---------|-----|
| Polaris 13.9.5 | Archived 2026-09. Existing Shopify apps only |
| Shoelace 2.20.1 | Archived 2026-05. Successor is Web Awesome |
| `@mui/joy` 5.0.0-beta.52 | Beta since 2023. MUI's direction is Material 3 |
| Ant Design v4 | Unmaintained |
| A vendor's design system without its token package | You get components and no system. Half the value is the tokens |

## Building one

1. Tokens first: semantic colors, a 4/8 spacing scale, radius, type scale, elevation. As CSS variables, exported to each platform.
2. Primitives on a headless base. See [ui-kits.md](ui-kits.md).
3. Components in the order in [frontend.md](frontend.md).
4. Documented states for each component: default, hover, focus, active, disabled, loading, error, empty.
5. Version the tokens. A token rename is a breaking change for every app that adopts the system.

## Use when

- One product, one team: a local token file plus a kit. A published system is overhead until a second product exists.
- Several products or teams: extract the local tokens into a package, then a component library.
- An acquired codebase already uses a system: keep it. Migration costs more than the gain unless it is mandated.
- Brand wants a custom look: keep the system's behaviour and a11y, replace its visual tokens. Never fork the internals.

## Avoid

- A published system's palette used as the brand without contrast review.
- Two token sources (a Figma file and a CSS file) that drift.
- Copying a system's components into the repo without its license and update path.
- A design system nobody owns. It becomes the slowest layer within a quarter.
