# Mobile

> Last verified: 2026-11-16

Scope: mobile frameworks, state, UI, OTA updates, forced updates. Native Apple: [apple-macos-swift.md](apple-macos-swift.md).

## Defaults

| Situation | Use |
|---------|-----|
| React/TS team | Expo + Expo Router + Uniwind (Tailwind v4) + TanStack Query + Zustand |
| Maximum polish per platform | SwiftUI (iOS), Jetpack Compose (Android) |
| One codebase, custom UI | Flutter (Riverpod, GoRouter, Drift) |
| Shared logic, native UI | Kotlin Multiplatform |
| Desktop from a web app | Tauri, or Electrobun (lighter) |

Expo SDK 55+: the New Architecture is always on. Unistyles if you do not want Tailwind. NativeWind only for existing apps.

| Need | Choice |
|-----|--------|
| Local DB | SQLite (expo-sqlite, Drift, Room, SwiftData) |
| Push | Expo Notifications, or APNs/FCM directly |
| OTA | EAS Update (`expo-updates`). Self-hosting only through the `expo-updates` protocol |
| Deep links | Universal links / app links |

## App updates

- API changes are additive. Clients become tolerant readers (ignore unknown fields and enum values).
- Version endpoint on the backend: `minimum_version`, `latest_version`, `force_update`, `update_url`. Compare against `versionCode` / `CFBundleVersion`, not semver.
- Soft update first. Hard update only for breaking API changes, security holes, data corruption, or legal obligations.
- `update_url` matches the install source. Sideloading is common in Indonesia, so Play In-App Updates alone are not enough.
- If the version check fails, use the last minimum version you cached.
- OTA is only for JS and assets. `runtimeVersion` must match the binary, or the update is not delivered. Native changes, permission changes, or SDK changes require a store release.
- Staged rollout: Play staged rollout, App Store phased release. Be ready to halt.
- Local data migrations: forward-only, tested from several old versions.

## Avoid

- CodePush / App Center (shut down in 2025).
- Electron for new apps without a strong reason.
- Capacitor unless you are wrapping an existing web app.
