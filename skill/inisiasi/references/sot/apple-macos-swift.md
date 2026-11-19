# Apple, macOS, Swift

> Last verified: 2026-11-16

Scope: native Apple apps (macOS, iOS, iPadOS). Cross-platform: [mobile.md](mobile.md). Windows and Linux: [desktop.md](desktop.md).

## Defaults

| Area | Use | Notes |
|------|-----|-------|
| Language | Swift 6 language mode | Strict concurrency from the start |
| UI | SwiftUI | AppKit/UIKit only for what SwiftUI does not cover yet |
| Menu bar app | `MenuBarExtra` | SwiftUI scene |
| Finder integration | Finder Sync extension | Separate extension target |
| State | `@Observable` (Observation) | Combine only in legacy code |
| Concurrency | async/await, actors | |
| Persistence | SwiftData, or SQLite (GRDB) | |
| Build | Xcode + Swift Package Manager | |
| Tests | Swift Testing (unit), XCTest (UI tests) | |
| Secrets | Keychain Services | Not UserDefaults |
| Local auth | LocalAuthentication | `.deviceOwnerAuthentication` = biometrics + password fallback |
| App updates (outside the App Store) | Sparkle 2 | |
| Distribution outside the App Store | Developer ID + Hardened Runtime + notarization | |

## iPadOS

Draft, pending owner review.
Checked on the web 2026-11-19: iPad multitasking modes, NavigationSplitView, PencilKit.

- One SwiftUI target for iPhone and iPad. Layout follows size classes, not device checks.
- Navigation: `NavigationSplitView` for sidebar and detail on iPad, collapsing to a stack on iPhone.
- Support multitasking (windowed apps, Split View, Slide Over, Stage Manager): every size from compact to full screen works, and multiple windows (scenes) when documents are the product.
- Keyboard and pointer: `.keyboardShortcut` for main actions, hover states, context menus. Drag and drop between apps where content moves.
- Apple Pencil: PencilKit for drawing and handwriting.
- Test on iPad simulators in portrait, landscape, and split sizes.

Store release, TestFlight, privacy manifest: [mobile.md](mobile.md).

## Notarization

`xcrun notarytool submit --wait`, then `xcrun stapler staple`. `altool` is no longer accepted for notarization.

## Rules

- App Sandbox is required for the Mac App Store. Minimal entitlements.
- Keychain: choose the right `kSecAttrAccessible...` and a `SecAccessControl` (for example `.userPresence`) for items that require Touch ID or a password.
- Request permissions (Full Disk Access, extensions) with an explanation before the system prompt.
- No private APIs.

## Avoid

`altool`, kernel extensions (use System Extensions), Carbon, Combine for new code, Electron for new Mac apps without a strong reason.
