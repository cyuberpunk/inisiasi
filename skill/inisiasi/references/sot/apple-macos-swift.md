# Apple, macOS, Swift

> Terakhir diverifikasi: 2026-11-16

Scope: app native Apple (macOS, iOS). Cross-platform: [mobile.md](mobile.md).

## Default

| Area | Pakai | Catatan |
|------|-------|---------|
| Bahasa | Swift 6 language mode | Strict concurrency dari awal |
| UI | SwiftUI | AppKit/UIKit hanya untuk yang belum ada di SwiftUI |
| Menu bar app | `MenuBarExtra` | Scene SwiftUI |
| Integrasi Finder | Finder Sync extension | Target extension terpisah |
| State | `@Observable` (Observation) | Combine hanya kode lama |
| Concurrency | async/await, actor | |
| Persistensi | SwiftData, atau SQLite (GRDB) | |
| Build | Xcode + Swift Package Manager | |
| Test | Swift Testing (unit), XCTest (UI test) | |
| Secret | Keychain Services | Bukan UserDefaults |
| Auth lokal | LocalAuthentication | `.deviceOwnerAuthentication` = biometrik + fallback password |
| Update app (di luar App Store) | Sparkle 2 | |
| Distribusi di luar App Store | Developer ID + Hardened Runtime + notarization | |

## Notarization

`xcrun notarytool submit --wait`, lalu `xcrun stapler staple`. `altool` sudah tidak diterima untuk notarization.

## Aturan

- App Sandbox wajib untuk Mac App Store. Entitlement minimal.
- Keychain: pilih `kSecAttrAccessible...` yang sesuai dan `SecAccessControl` (misal `.userPresence`) untuk item yang butuh Touch ID atau password.
- Minta izin (Full Disk Access, extension) dengan penjelasan sebelum prompt sistem.
- Jangan API private.

## Hindari

`altool`, kernel extension (pakai System Extensions), Carbon, Combine untuk kode baru, Electron untuk app Mac baru tanpa alasan kuat.
