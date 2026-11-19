# Mobile

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: Expo SDK 58 with React Native 0.88 and the New Architecture always-on statement, Expo Router and expo-updates versions, Uniwind 1.14 versus NativeWind 4.2, Reanimated 4.8, Flutter stable 3.50.0, Riverpod 3.5, GoRouter 18.1, Drift 2.35, Kotlin 2.4 stable, Compose Multiplatform 1.12 stable with a Beta web target, .NET MAUI 11. Carried over from 2026-11-19: Google Play target API rule, WorkManager, DataStore, the Data safety form, App Store guidelines 4.8, 5.1.1, 5.1.2, privacy manifest, Maestro, Detox. Not checked: per-store policy dates beyond those carried over.

Scope: mobile frameworks, state, UI, OTA updates, forced updates. Native Apple: [apple-macos-swift.md](apple-macos-swift.md).

## Defaults

| Situation | Use |
|---------|-----|
| React/TS team | Expo + Expo Router + Uniwind (Tailwind v4) + TanStack Query + Zustand |
| Maximum polish per platform | SwiftUI (iOS), Jetpack Compose (Android) |
| One codebase, custom UI | Flutter (Riverpod, GoRouter, Drift) |
| Shared logic, native UI | Kotlin Multiplatform (Kotlin 2.4 stable line) |
| Shared UI across Android and iOS | Compose Multiplatform 1.12 (stable; web target still Beta). Skip when the team cannot own a Kotlin build |
| C#/.NET team | .NET MAUI 11, on .NET 10 LTS |
| Desktop from a web app | Tauri, or Electrobun (TS/Bun core). Details: [desktop.md](desktop.md) |

Expo SDK 58 (React Native 0.88) is current. From SDK 55 the New Architecture is always on and cannot be disabled, so New Architecture blockers must be solved, not deferred. Unistyles if you do not want Tailwind. NativeWind only for existing apps; Uniwind 1.14 is the current Tailwind engine for React Native.

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

## Android native

Checked on the web 2026-11-19: Google Play target API rule, WorkManager, DataStore.

| Area | Use | Notes |
|------|-----|-------|
| Language and UI | Kotlin + Jetpack Compose | Views only for existing screens |
| Build | Gradle Kotlin DSL + a version catalog (`libs.versions.toml`) | |
| Architecture | ViewModel + Kotlin coroutines and Flow, Navigation Compose | Hilt for DI only when the graph is large |
| Storage | Room (data), DataStore (settings) | Not SharedPreferences for new code |
| Background work | WorkManager | Survives restarts and respects battery rules |
| Secrets and keys | Android Keystore | Never plain files or preferences |
| Release | Android App Bundle (AAB), Play App Signing, R8 shrinking | The Play target API level requirement rises every year: plan the bump |

## Release and store rules

Checked on the web 2026-11-19: Data safety form, App Store guidelines 4.8, 5.1.1 and 5.1.2, privacy manifest.

- Expo: EAS Build + EAS Submit. Native: fastlane (signing, build, upload) or Xcode Cloud for iOS. Flutter: Codemagic or fastlane.
- iOS betas: TestFlight. Android betas: Play internal and closed testing tracks.
- iOS: a privacy manifest (`PrivacyInfo.xcprivacy`) for the app and its SDKs, App Tracking Transparency before cross-app tracking, in-app account deletion when the app creates accounts, and a privacy-focused login option (Sign in with Apple or equivalent) when you offer third-party social login.
- Android: the Data safety form matches what the app and its SDKs collect.
- Signing keys and store credentials live in CI secrets (fastlane match, EAS credentials), never in the repo.
- Selling digital goods or subscriptions: [billing.md](billing.md).

## Tests

Checked on the web 2026-11-19: Maestro, Detox.

- E2E across iOS and Android: Maestro (YAML flows). Detox for React Native gray-box tests.
- Native: XCUITest (iOS), Compose UI tests and Espresso (Android). Flutter: `integration_test`.
- Unit tests in the app language; run them in CI on every PR. Device farms (Firebase Test Lab, BrowserStack) only for release candidates.

## Avoid

- CodePush / App Center (shut down in 2025).
- Electron for new apps without a strong reason.
- Capacitor unless you are wrapping an existing web app.
