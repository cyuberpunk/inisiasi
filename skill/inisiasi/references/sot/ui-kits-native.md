# UI kits: mobile and native

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: npm versions and weekly downloads (`api.npmjs.org/downloads/point/last-week`, 2026-11-12..2026-11-18), pub.dev versions, likes, and 30-day downloads for the Flutter packages. Not checked: the iOS and Android codebases behind each RN kit.

Scope: component libraries for React Native, Expo, and Flutter. App framework choice: [mobile.md](mobile.md). Web kits: [ui-kits.md](ui-kits.md). Styling engines: [styling.md](styling.md).

## Defaults

| Platform | Use | Alternative |
|----------|-----|-------------|
| Expo / React Native | React Native Paper 5.15, or the platform's own components first | Tamagui 3.3 for one codebase across web and native |
| Styling in RN | StyleSheet or Uniwind 1.14 (Tailwind for RN) | NativeWind 4.2 only in existing code |
| Flutter | Material 3 built in (`flutter/material.dart`) | shadcn_ui 0.61 for a shadcn look, forui 0.28 for a widget-first set |

## React Native

| Library | Version | npm/wk | Built on | Use when |
|---------|---------|--------|----------|----------|
| Platform components | built in | with `react-native` 0.88 | Native views | First. `Pressable`, `FlatList`, `Modal` cover most screens |
| React Native Paper | 5.15.5 | 645k | Material Design 3, own theming | A full kit with tokens and a theme |
| Tamagui | 3.3.3 | 319k | Own compiler, outputs web and native | One component codebase for web and native, a design system you own |
| Gluestack UI | 1.1.73 (`@gluestack-ui/themed`) | 50.8k | Tailwind-for-RN engine | Copy-paste components, Tailwind-like props |
| Uniwind | 1.14.0 | 1.49M | Tailwind v4 for RN | Tailwind syntax in React Native. Replaces NativeWind |
| NativeWind | 4.2.7 | 2.78M | Tailwind for RN (older engine) | Existing code only. Uniwind for new work |

Reanimated 4.8.0 (14.8M/wk) is the animation layer under most kits, not a kit. Gesture Handler 3.5.0 (14.7M/wk) owns gestures.

## Flutter

| Library | Version | pub.dev likes / 30d downloads | Built on | Use when |
|---------|---------|-------------------------------|----------|----------|
| Material 3 (built in) | with Flutter | n/a | Flutter's own widgets | Default. Theme with `ColorScheme` and `ThemeData` |
| shadcn_ui | 0.61.1 | 979 / 107k | Flutter widgets plus Tailwind-like tokens | You want a shadcn look with theming and variants |
| Forui | 0.28.0 | 448 / 39k | Own widget set | Widget-first API, fewer abstractions than Material |
| flex_color_scheme | 9.0.0 | 3,243 / 134k | Theme generator for Material 3 | Generate a Material theme from one seed color |
| Cupertino widgets | built in | n/a | iOS-native look (`flutter/cupertino.dart`) | iOS-only product, or platform-adaptive UI |

Stage note: shadcn_ui (0.61) and Forui (0.28) are pre-1.0 and under active development. Both are usable and both will make breaking changes. Check the changelog before pinning.

## Assets, not kits

- Icons: `cupertino_icons` in Flutter, `@expo/vector-icons` in Expo, or a generated SVG set. See [ui-catalog.md](ui-catalog.md).
- Fonts: `google_fonts` 9.0 (3.51M/30d) fetches at runtime. Bundle the font file for offline and first-paint.
- SVG: `flutter_svg` 2.4.0 (6.57M/30d) and `react-native-svg` for vector assets.
- Lists: `@shopify/flash-list` 2.3.3 (3.42M/wk) when `FlatList` drops frames on long lists.

## Use when

- Material vs Cupertino: use Material for Android-first, Cupertino for iOS-first. `Theme.of` / `Platform.isIOS` branching is cheaper than two UIs.
- Web and native in one repo: Tamagui or a Next.js plus Expo monorepo with shared tokens, not shared components in most cases.
- Design tokens shared across web and mobile: a tokens package, then each platform's own kit. See [design-systems.md](design-systems.md).

## Avoid

- NativeWind for new projects. Use Uniwind.
- Flutter Neumorphic 3.2.0. Unmaintained, 1.9k 30-day downloads, and low contrast by design.
- A web-only kit (shadcn, MUI, Ant Design) forced into React Native with a shim.
- Two kits in one app, or a kit plus hand-built primitives that duplicate it.
