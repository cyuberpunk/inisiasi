# Katalog UI: ikon, motion, loading, chart, diagram, sound

> Terakhir diverifikasi: 2026-11-17

Scope: layer UI di luar [frontend.md](frontend.md) dan [mobile.md](mobile.md). Diasilkan dari katalog 115 library (UI kit, ikon, motion, loading, chart, diagram, sound). Satu default per layer, sisanya kondisi. Versi dicek di npm registry 2026-11-17. Skor per library: [ui-catalog-scores.md](ui-catalog-scores.md).

## Default

| Layer | Pakai | Alternatif |
|-------|-------|------------|
| Kit React | shadcn/ui + `@base-ui/react` 1.9 + Tailwind v4 (tetap) | COSS UI, Kumo: set siap pakai di atas Base UI |
| Headless lintas framework | `@ark-ui/react` 5.40 | Park UI jika Panda CSS |
| Svelte | `bits-ui` 2.21 | tidak ada |
| Chat dan AI | `assistant-ui` untuk thread, AI Elements untuk widget | CopilotKit hanya jika butuh agent in-app penuh |
| Ikon | `lucide-react` 1.74 | `@tabler/icons-react` untuk dashboard padat, `@hugeicons/react` rounded, `iconoir-react` stroke tipis |
| Logo brand | `simple-icons` 16.38 | jangan pakai ikon UI untuk logo |
| Ikon animasi | Heroicons Animated | Animate Icons; bukan untuk toolbar atau list padat |
| Motion | CSS dan View Transitions (tetap) | `motion` 14.14 untuk spring, layout, drag; `gsap` 3.15 hanya timeline atau scroll rumit |
| Motion mikro | `@formkit/auto-animate` 0.10 untuk list masuk keluar | `number-flow` 0.6 untuk angka berubah, `torph` 0.1 untuk morph teks |
| Loading | skeleton dari layout nyata (Boneyard) untuk konten lebih dari 300 ms | `ldrs` 44 loader jika butuh indikator minimal |
| Chart ringan | `@observablehq/plot` 0.6 | `@visx/shape` 4.0 jika desain custom, Nivo jika banyak tipe siap pakai |
| Chart volume besar | `echarts` 6.1 | `unovis` jika satu API untuk web dan mobile |
| Diagram node | `@xyflow/react` 13.0 | Svelte Flow untuk Svelte, AntV X6 hanya untuk editor diagram penuh |
| Diagram dokumen | Mermaid 12.3 | sudah default di [engineering-practices.md](engineering-practices.md) |
| Sound | tanpa sound | Cuelume (2 KB, sintetis) untuk tone interaksi, `use-sound` 5.0 di atas Howler 2.2 untuk playback |

## Pakai kalau

- Landing marketing: blok dari Magic UI, Aceternity, Tailark, Prestige, Coded Visuals. Copy-paste lalu review: umumnya tanpa token, a11y lemah, animasi berat. Maksimal satu blok hero per halaman.
- Tim punya Figma sebagai sumber: Untitled UI React, Fragments UI, Create UI. Cek lisensi per komponen sebelum masuk repo.
- Butuh template internal atau demo: 8bitcn, Skiper UI, Inspira UI, Velora UI, Kokonut, Syntax, Eldora, Easy UI, Arc UI, XiodUI. Bukan untuk produk ber-brand.
- Vue: Inspira UI, atau Ark UI.
- Sound wajib untuk umpan balik: Cuelume atau `use-sound`. Syarat wajib: toggle mute yang tersimpan, tidak ada audio saat load, sound bukan satu satunya feedback (WCAG 1.1.1, 1.4.2).
- Chart yang perlu aksesibel: sediakan tabel atau ringkasan teks dari data yang sama, apa pun library-nya.

## Hindari

- Melt UI. Tidak ada di npm, pakai Bits UI.
- Chart.js untuk app React baru. Canvas, tanpa token, a11y dikerjakan manual.
- Library chart berat (ECharts, Nivo, Reaviz, Unovis) di bundle awal. Muat lazy per route.
- Spinner pack (SpinKit, React Spinners, Soonish) sebagai default state loading. Skeleton lebih jujur.
- Autoplay audio, sound di hover massal, sound sebagai satu satunya konfirmasi.
- Dua sistem komponen di satu app (misal shadcn plus HeroUI).
- Marketplace (21st.dev, iconmcp) sebagai sumber kode produksi tanpa review.
- Entri katalog tanpa paket stabil atau repo jelas: stack-diagram, iconmcp, Prism System, StyleKit, Scrolltide, Rune Icons, Flux Icons, Reicon, Akaza UI (alpha).