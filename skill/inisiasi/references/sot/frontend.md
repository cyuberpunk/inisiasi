# Frontend

> Terakhir diverifikasi: 2026-11-16

Scope: framework web, UI kit, design system, state, form, styling. Arsitektur dan checklist: [frontend-architecture.md](frontend-architecture.md). Ikon, motion, loading, chart, diagram, sound: [ui-catalog.md](ui-catalog.md). Mobile: [mobile.md](mobile.md).

## Default

| Layer | Pakai | Alternatif |
|-------|-------|------------|
| Framework SPA | TanStack Router | React Router |
| Fullstack React | TanStack Start, atau Next.js App Router jika butuh SEO/RSC | |
| Vue / Svelte / konten | Nuxt / SvelteKit / Astro (API typed: oRPC) | |
| UI React | shadcn/ui (primitives Base UI, `@base-ui/react`) + Tailwind v4 | Radix untuk project shadcn lama. React Aria jika a11y/i18n ketat |
| UI non-React | daisyUI 5 + Tailwind v4 | |
| Server state | TanStack Query | fate jika butuh normalized cache gaya Relay |
| Client state | Zustand | Jotai. Redux Toolkit hanya kode existing |
| Form | React Hook Form + Zod | TanStack Form jika stack sudah TanStack |
| Schema | Zod (share dengan backend) | Valibot jika bundle sensitif |
| Animasi | CSS dan View Transitions | Motion (`motion/react`), GSAP untuk kasus kompleks |
| Ikon | Lucide | Phosphor |
| i18n | Paraglide (library, app baru), next-intl (Next.js) | fbtee (inline, compiler) |

## Design system

- Mulai dari token: warna semantik (`primary`, `destructive`, `muted`), spacing skala 4/8, radius, font. Bukan `blue-500`.
- Urutan komponen: Button, Input, Label, lalu Card, Dialog, Dropdown, lalu Table, Form, Toast, Navigation, Empty state, Skeleton.
- Dark mode dan a11y dari awal. Storybook hanya jika ada lebih dari satu app atau tim.
- Registry komunitas shadcn: review kode sebelum dipakai.

## Pakai kalau

- MUI / Chakra: tool internal yang padat data, bukan produk ber-brand.
- PWA: app perlu installable. Butuh SPA atau Next.js.
- Qwik: hanya jika tim sudah memakainya.

## Hindari

- SolidStart untuk project baru (dihentikan di siklus Solid 2.0).
- NativeWind untuk project baru (pakai Uniwind).
- Paket `@base-ui-components/react` (nama lama, pakai `@base-ui/react`).
- UI kit berat sebagai default. Global store untuk data server.
