# Accessibility

> Last verified: 2026-11-16

Scope: WCAG target, mandatory rules, tests. Applies to web and mobile.

## Defaults

- Target: WCAG 2.2 AA. WCAG 3.0 is still a draft, do not use it as a target.
- Legal triggers (check when relevant): European Accessibility Act (EU consumers, in force June 2025), ADA / Section 508 (US). Indonesia: no binding technical standard yet, still use WCAG 2.2.
- React components: Base UI, Radix, or React Aria.

## Mandatory rules

- Semantic HTML first. ARIA only adds, it never replaces.
- Everything works with the keyboard, focus is visible (`:focus-visible`), no keyboard traps, modals manage focus.
- Contrast 4.5:1 (normal text), 3:1 (large text). Never rely on color alone.
- Forms: labels are connected, errors are announced.
- 200% zoom and 320px reflow stay usable. Respect `prefers-reduced-motion`.
- Media: captions and transcripts.

| New in WCAG 2.2 | Rule |
|---------------|--------|
| 2.4.11 Focus Not Obscured (AA) | Sticky headers, banners, and chat widgets must not cover the focused element |
| 2.5.7 Dragging (AA) | Dragging has a click alternative |
| 2.5.8 Target Size (AA) | At least 24x24 CSS px. 44x44 is AAA / Apple HIG (44pt). Android 48dp |
| 3.2.6 Consistent Help (A) | Help stays in the same place |
| 3.3.7 Redundant Entry (A) | Do not ask for the same data twice |
| 3.3.8 Accessible Authentication (AA) | Allow paste and password managers |

## Tests

- CI: `@axe-core/playwright` on critical journeys, fails on serious violations.
- Manual: keyboard, VoiceOver, NVDA, TalkBack.
- Unit: Testing Library `getByRole`.
