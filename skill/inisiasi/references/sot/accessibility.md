# Accessibility

> Terakhir diverifikasi: 2026-11-16

Scope: target WCAG, aturan wajib, tes. Berlaku web dan mobile.

## Default

- Target: WCAG 2.2 AA. WCAG 3.0 masih draft, jangan dijadikan target.
- Trigger hukum (cek jika relevan): European Accessibility Act (konsumen UE, berlaku Jun 2025), ADA / Section 508 (AS). Indonesia: belum ada standar teknis mengikat, tetap pakai WCAG 2.2.
- Komponen React: Base UI, Radix, atau React Aria.

## Aturan wajib

- Semantic HTML dulu. ARIA hanya menambah, bukan mengganti.
- Semua interaksi bisa keyboard, fokus terlihat (`:focus-visible`), tanpa keyboard trap, modal mengelola fokus.
- Kontras 4.5:1 (teks normal), 3:1 (teks besar). Jangan andalkan warna saja.
- Form: label terhubung, error diumumkan.
- Zoom 200% dan reflow lebar 320px tetap usable. Hormati `prefers-reduced-motion`.
- Media: caption dan transkrip.

| WCAG 2.2 baru | Aturan |
|---------------|--------|
| 2.4.11 Focus Not Obscured (AA) | Sticky header, banner, chat widget tidak menutupi fokus |
| 2.5.7 Dragging (AA) | Drag punya alternatif klik |
| 2.5.8 Target Size (AA) | Minimal 24x24 CSS px. 44x44 itu AAA / Apple HIG (44pt). Android 48dp |
| 3.2.6 Consistent Help (A) | Bantuan di posisi sama |
| 3.3.7 Redundant Entry (A) | Jangan minta data sama dua kali |
| 3.3.8 Accessible Auth (AA) | Izinkan paste dan password manager |

## Tes

- CI: `@axe-core/playwright` di alur kritis, gagal pada pelanggaran serius.
- Manual: keyboard, VoiceOver, NVDA, TalkBack.
- Unit: Testing Library `getByRole`.
