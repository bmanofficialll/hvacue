# HVACue — mobile (Expo / React Native)

Native iOS + Android build of the HVACue diagnostic app, built with Expo.
This is a full React Native port of the web prototype in `../app` — same
diagnostic engine, same screens, rebuilt with native components (`View`,
`Text`, `Pressable`, `Modal`, native `Picker`) and the real Archivo /
IBM Plex Mono fonts loaded via `expo-font`.

## Run it on your phone (Expo Go)

1. Install **Expo Go** from the App Store (iOS) or Play Store (Android).
2. On your computer:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. A QR code prints in the terminal. Scan it:
   - **iOS** — with the Camera app.
   - **Android** — from inside Expo Go ("Scan QR code").
4. The app loads live on your phone. Edits reload instantly.

> Your phone and computer must be on the same Wi-Fi. If they aren't (or
> you're behind a restrictive network), run `npx expo start --tunnel`
> instead — it routes through Expo's servers so the QR works anywhere.

## Run on a simulator (optional, macOS/Android Studio)

```bash
npx expo start        # then press "i" for iOS simulator, "a" for Android
```

## What's here

- `src/engine/` — the diagnostic engine, copied unchanged from the web app
  (framework-agnostic TypeScript: PT tables, chiller + split-system trees,
  cause ranking, verification).
- `src/state/` — app state hook + view-model derivation, also shared with web.
- `src/theme.ts` — design tokens + `heading()` / `mono()` text-style helpers
  that map to the loaded font families.
- `src/components/` — the React Native UI: `screens/`, `sheets/` (keypad,
  repair, voice as `Modal`s), `ui/` primitives, `layout/AppShell`.
- `App.tsx` — loads fonts, then renders the current screen + overlays.

## Store builds (later)

Expo Go is for development. To produce installable `.ipa` / `.aab` binaries
for TestFlight / Play Console, use EAS Build:

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

Bundle identifiers are already set to `com.hvacue.app` in `app.json`.
