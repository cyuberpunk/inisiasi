# Browser extensions

> Last verified: 2026-11-25
> No versions pinned: check the official docs before you pin one. Checked on the web 2026-11-25: WXT releases (0.x line, a minor bump breaks), WXT upgrade guide and Vitest plugin, Plasmo release activity, CRXJS Vite plugin 3.0, Chrome MV3 service worker lifecycle, MV2 removal timeline, remotely hosted code policy, storage areas and quotas, offscreen documents, alarms minimum interval, Firefox MV3 event pages and signing, Safari web extension packager, Playwright extension testing, Chrome Web Store single purpose, privacy and Limited Use policies, `@webext-core/messaging`. Not checked: Edge Add-ons review rules, side panel and `userScripts` API details, store review times.

Scope: extensions for Chrome and other Chromium browsers, Firefox, and Safari, on Manifest V3. The UI inside the extension (popup, options page, side panel, new tab page) follows [frontend.md](frontend.md) and [toolchain-ts.md](toolchain-ts.md). Local data and sync: [offline-sync.md](offline-sync.md).

## Defaults

| Situation | Use | When it differs |
|---------|-----|------------|
| New extension in TypeScript | WXT: Vite based, file-based entrypoints, one build per browser | CRXJS Vite plugin when an existing Vite app only targets Chrome |
| Messaging between background, content scripts, and pages | `@webext-core/messaging` (typed protocol map, Chrome, Firefox, Safari) | `webext-bridge` or `trpc-chrome`, both listed by the WXT docs |
| Settings and small state | `storage.local` through WXT's storage wrapper | `storage.sync` for preferences that follow the browser profile (about 100 KB total, 8 KB per item) |
| Large or queried local data | IndexedDB through Dexie, written from one context (the service worker) | `storage.local` with `unlimitedStorage` when the data is a few JSON blobs |
| Unit tests | Vitest with `WxtVitest()`: an in-memory fake `browser` | Mock by hand only the APIs the fake does not implement |
| End to end tests | Playwright, bundled Chromium, persistent context | None |
| Safari | `xcrun safari-web-extension-packager`, or the packager in App Store Connect without a Mac | None |

WXT is pre 1.0: a change in the second digit (`0.20` to `0.21`) carries breaking changes, so read the upgrade guide before bumping. WXT 0.21 requires Node 22 or newer and Vite 6.3.4 or newer.

## Manifest V3 on Chrome

- Manifest V2 is over on Chrome. Chrome 138 disabled it for every user (July 2025), and all remaining MV2 extensions left the Chrome Web Store on 31 August 2026. New work is MV3 only.
- The background is a service worker. Chrome stops it after 30 seconds without events or extension API calls, when one event or API call runs longer than 5 minutes, or when a `fetch()` response takes longer than 30 seconds. Design for termination at any time.
- Global variables die with the worker. Keep state in `storage.session` (in memory, about 10 MB, survives worker restarts, cleared on reload, update, and browser restart), `storage.local`, or IndexedDB. Web Storage (`localStorage`) does not exist in the worker.
- Register every event listener at the top level, synchronously, so the event that wakes the worker reaches it.
- `setTimeout` only for delays under 30 seconds. Anything later uses `chrome.alarms`. Since Chrome 120 the minimum alarm interval is 30 seconds, and a packed extension never fires faster, even though an unpacked one does during development.
- The worker has no DOM. Parsing HTML, clipboard, or audio from the background goes through an offscreen document: the `offscreen` permission, a bundled static HTML file, one open at a time, `runtime` as the only extension API inside it, and you close it when the work is done.
- No remotely hosted code. All JavaScript and Wasm ship in the package. No remote `<script>`, no `eval()` or `new Function()` on fetched strings, no interpreter for commands fetched as data. Remote data and remote configuration (JSON) are allowed. This includes bundled libraries that fetch code at runtime. The exceptions are the `userScripts` and `debugger` APIs, and sandboxed iframes.

## Other browsers

- Firefox MV3 runs the background as an event page (`background.scripts`), not a service worker, and keeps blocking `webRequest`. Declare both `service_worker` and `scripts`: Chrome 121+ loads the worker, Firefox 121+ loads the scripts. WXT generates the right manifest per browser.
- Firefox installs only extensions signed by Mozilla in release and beta builds. Self-distributed builds are signed through AMO as unlisted (`web-ext sign` or the AMO API).
- Safari runs a web extension inside a containing macOS or iOS app. The packager (formerly `safari-web-extension-converter`) creates the Xcode project, or App Store Connect packages it from any browser. It needs the Apple Developer Program, and the extension ships through TestFlight and the App Store.

## Permissions, privacy, and the store

- Request the fewest permissions the purpose needs. The Chrome Web Store asks for a justification per permission in the Privacy practices tab, and broader permissions than necessary can get the item rejected.
- Host access: name the hosts. Prefer `optional_host_permissions` requested at runtime over a broad match such as `<all_urls>`.
- Single purpose: one narrow focus area or one narrow browser function.
- If the extension handles user data, publish a privacy policy and link it in the dashboard. Limited Use: collect only what the single purpose needs, and collect browsing activity only for a user-facing feature described prominently in the listing and the UI.
- `storage.local` and `storage.sync` are not encrypted. Keep secrets out of them, or seal them first (for example AES-GCM with WebCrypto).
- A content script runs inside a page you do not control. Treat the page DOM as untrusted input: write page or user text with `textContent`, never `innerHTML`, and validate every message in the background like an API request (check `sender.id` and the sender URL).

## Tests and CI

- Unit: Vitest with `WxtVitest()` from `wxt/testing/vitest-plugin`. Storage works in memory like the real thing, so do not mock it. Reset state per test. Events such as `alarms.onAlarm` must be triggered by hand.
- End to end: `chromium.launchPersistentContext` with `channel: 'chromium'` (runs headless) and `--disable-extensions-except` plus `--load-extension`. Google Chrome and Microsoft Edge removed the side-loading flags, so use Playwright's bundled Chromium. Open the popup, options, or side panel by their extension URL.
- Termination: an open DevTools window keeps the worker alive. Close DevTools when you test that state survives a worker restart.
- Parser fixtures: a content script that scrapes a site breaks when the site changes its DOM. Keep saved HTML fixtures and a test per selector.
- CI builds and zips one artifact per target browser, then uploads each to its store.

## Avoid

- Plasmo for a new extension: no npm release since 0.90.5 (May 2025), and its maintainers have moved on. Existing projects can stay until something breaks.
- Manifest V2 for Chrome.
- Remotely hosted code, or `eval()` on fetched strings.
- Global variables as state in the service worker, and `setTimeout` or `setInterval` beyond 30 seconds.
- `<all_urls>` or wide host permissions when a few named hosts or optional permissions do the job.
- Adding `webextension-polyfill` to a WXT project: WXT 0.20 removed it on purpose.
- Testing extensions in branded Chrome or Edge builds.
