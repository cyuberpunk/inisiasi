# Mobile

> Terakhir diverifikasi: 2026-11-16

Scope: framework mobile, state, UI, OTA, update paksa. Native Apple: [apple-macos-swift.md](apple-macos-swift.md).

## Default

| Situasi | Pakai |
|---------|-------|
| Tim React/TS | Expo + Expo Router + Uniwind (Tailwind v4) + TanStack Query + Zustand |
| Polish maksimal per platform | SwiftUI (iOS), Jetpack Compose (Android) |
| Satu codebase, UI custom | Flutter (Riverpod, GoRouter, Drift) |
| Share logic, UI native | Kotlin Multiplatform |
| Desktop dari web app | Tauri, atau Electrobun (lebih ringan) |

Expo SDK 55+: New Architecture selalu aktif. Unistyles jika tidak mau Tailwind. NativeWind hanya app existing.

| Kebutuhan | Pilihan |
|-----------|---------|
| Local DB | SQLite (expo-sqlite, Drift, Room, SwiftData) |
| Push | Expo Notifications, atau APNs/FCM langsung |
| OTA | EAS Update (`expo-updates`). Self-host hanya lewat protokol `expo-updates` |
| Deep link | Universal links / app links |

## Update app

- Perubahan API additive. Klien jadi tolerant reader (abaikan field dan enum asing).
- Endpoint versi di backend: `minimum_version`, `latest_version`, `force_update`, `update_url`. Bandingkan dengan `versionCode` / `CFBundleVersion`, bukan semver.
- Soft update dulu. Hard update hanya untuk breaking API, celah keamanan, korupsi data, atau kewajiban hukum.
- `update_url` sesuai sumber instal. Sideload umum di Indonesia, jadi Play In-App Updates tidak cukup.
- Cek versi gagal: pakai minimum terakhir yang di-cache.
- OTA hanya untuk JS dan aset. `runtimeVersion` harus cocok dengan binary, kalau tidak update tidak masuk. `runtimeVersion` harus cocok dengan binary. Perubahan native, permission, atau SDK wajib rilis store.
- Rollout bertahap: Play staged rollout, App Store phased release. Siap halt.
- Migrasi data lokal: forward-only, dites dari beberapa versi lama.

## Hindari

- CodePush / App Center (mati sejak 2025).
- Electron untuk app baru tanpa alasan kuat.
- Capacitor kecuali memang membungkus web app yang sudah ada.
