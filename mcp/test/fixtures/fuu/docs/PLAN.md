# Plan

## Goals
fuu is a personal macOS app to lock and encrypt folders on the owner machine. Menubar plus Finder extension. Used by the owner first, not sold.

## MVP (v1)
- Menubar app (MenuBarExtra) and Finder Sync extension.
- Lock a folder into an hdiutil AES-256 encrypted sparse image, unlock mounts it.
- Unlock with Touch ID or password fallback (LocalAuthentication, deviceOwnerAuthentication).
- No account, no network, no telemetry.

## Constraints
- Minimum macOS 15 Sequoia. Swift and SwiftUI.
- Never delete the original until the encrypted copy is verified readable.
- Use only macOS encrypted disk images and Keychain secrets.

## Non-goals
- Distribution, App Store, notarization, selling.
- Payments or accounts.
- Auto-lock on idle or sleep, app locking, intruder photo.

## Open questions
- Which folders or volumes should v1 be able to lock? Not answered yet.
- How should the volume passphrase be stored in Keychain? Which access control fits Touch ID plus password fallback?
