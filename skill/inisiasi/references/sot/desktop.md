# Desktop

> Last verified: 2026-11-19
> Status: draft, pending owner review. No versions pinned: check the official docs before you pin one. Checked on the web 2026-11-19: Windows signing service name, tauri-driver platform support.

Scope: desktop apps for Windows, Linux, and macOS: framework choice, packaging, signing, updates, tests. Native Apple: [apple-macos-swift.md](apple-macos-swift.md). Mobile: [mobile.md](mobile.md).

## Defaults

| Situation | Use | When it differs |
|---------|-----|------------|
| Web team, one codebase for Windows, Linux, macOS | Tauri (Rust core, system webview) | Electrobun if the team wants a TS/Bun core and accepts a younger project |
| Best macOS experience only | SwiftUI ([apple-macos-swift.md](apple-macos-swift.md)) | None |
| Flutter already used for mobile | Flutter desktop | None |
| C#/.NET team, Windows, Linux, macOS | Avalonia UI | .NET MAUI when the same app also targets mobile |
| Native Windows only | WinUI 3 (Windows App SDK) | Only when Windows-specific APIs or UI are the product |
| Native Linux only | GTK 4 + libadwaita (GNOME), or Qt (KDE, cross-desktop) | Only when the app is Linux-first |

The frontend for Tauri or Electrobun is a static export: [stack-compat-ts.md](stack-compat-ts.md).

## Webview differences

Tauri uses the system webview: WebView2 (Chromium) on Windows, WKWebView (WebKit) on macOS, WebKitGTK on Linux. CSS and web APIs differ between them. Test the UI on all three, and check WebKit support for every web API you use.

## Packaging and distribution

| OS | Format | Channel |
|----|--------|---------|
| Windows | MSI or NSIS installer, MSIX for the Store | Direct download, winget, Microsoft Store |
| macOS | `.app` in a DMG | Direct download with notarization, or the Mac App Store |
| Linux | Flatpak (default for desktop apps), AppImage (single file), deb/rpm (distro repos) | Flathub, GitHub Releases |

## Signing

- Windows: sign every binary and installer (Authenticode) with a code signing certificate or a cloud signing service (for example Azure Artifact Signing, formerly Trusted Signing). Unsigned builds trigger SmartScreen warnings.
- macOS: Developer ID + Hardened Runtime + notarization ([apple-macos-swift.md](apple-macos-swift.md)).
- Linux: sign repositories and release checksums (GPG). Flathub builds and signs Flatpaks.
- Signing keys live in CI secrets or a cloud signing service, never in the repo.

## Updates

- Tauri: the updater plugin with signed update manifests. The update key is separate from the code signing key and is backed up.
- macOS outside the App Store: Sparkle 2. Stores and Flathub update the app themselves; do not ship a second updater there.
- Updates are staged: a beta channel first, then everyone, with a way to pause.

## Security

- Tauri: allow only the commands and plugins the app uses (capabilities), set a strict CSP, and never load remote content into a window with IPC access.
- Validate every IPC input in the core like an API request.
- Secrets in the OS store: Keychain (macOS), Credential Manager (Windows), Secret Service / libsecret (Linux).

## Tests and CI

- Unit tests in the core language. UI logic tested as a web app (Vitest, Playwright against the dev server).
- End to end: WebDriver through `tauri-driver` on Windows and Linux. Apple ships no WKWebView driver, so on macOS use a WebDriver server embedded in the app (WebdriverIO's Tauri service with its plugin) or CrabNebula's driver.
- CI builds on a matrix of Windows, macOS, and Linux runners (GitHub Actions, `tauri-action`), signs, then publishes to a draft release.

## Avoid

- Electron for new apps without a strong reason (bundle size, memory). It stays valid when the app needs Chromium on every OS.
- Shipping unsigned Windows or macOS builds to users.
- A custom updater when a store or Flathub already updates the app.
