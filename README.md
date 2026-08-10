# HVACue

**Diagnose. Verify. Fix.** — a field diagnostic instrument for HVAC/R technicians.

HVACue walks a technician through a service call one measurement at a time,
ranks the probable causes from the *actual numbers* they key in (not a guess),
refuses to show confidence until it has evidence, flags impossible readings,
and only lets a job close once the repair is verified. Optional AI adds a
second-opinion diagnosis, reads equipment nameplates and fault codes from a
photo, and answers free-form questions — using whatever AI provider the
technician connects.

There are two apps in this repo, built from one shared engine:

| Folder | What it is | Run it with |
| --- | --- | --- |
| [`mobile/`](mobile/) | **iOS + Android app** (Expo / React Native) | `npx expo start` → scan the QR in Expo Go |
| [`app/`](app/) | **Web app** (Vite + React + TypeScript) | `npm run dev` → open in a browser |

The diagnostic engine, the app state, and all the domain data live in shared
TypeScript modules that both apps use unchanged — only the UI layer differs
(DOM/CSS for web, native components for mobile).

---

## Quick start

### Phone app (recommended)

You need [Node.js](https://nodejs.org) on your computer and the **Expo Go**
app on your phone (App Store / Play Store).

```bash
cd mobile
npm install
npx expo start
```

A QR code prints in the terminal — scan it (iOS Camera app, or the "Scan QR
code" button inside Expo Go) and the app loads live on your phone. If your
phone and computer aren't on the same Wi-Fi, run `npx expo start --tunnel`.

### Web app

```bash
cd app
npm install
npm run dev
```

Then open the printed `http://localhost:5173` URL.

---

## What it does

- **Guided diagnosis** — start a session, log field readings one at a time, and
  the engine recomputes derived values (superheat, subcooling, condenser ΔT,
  approach…) and re-ranks six probable causes live. Zero evidence → it refuses
  to show a confidence number.
- **Two decision trees, chosen by equipment** — a water-cooled chiller
  condenser-water sequence and an R-410A/R-454B split-system superheat/subcooling
  sequence. The equipment type you pick drives which one runs.
- **Honest by design** — impossible inputs get flagged (leaving water colder
  than entering, superheat below zero, over-relief pressures). Refrigerants with
  no verified pressure–temperature table on device (zeotropic blends, unusual
  gases) are told plainly instead of being guessed.
- **Verify to close** — after a repair, HVACue asks for the one reading that must
  move, recomputes it, and marks the job **verified / not verified** accordingly.
- **Type-in the call** — enter the real customer complaint or controller alarm;
  it flows into the session, the AI context, and the service report.
- **Camera** — photograph the nameplate, a controller fault code, or the gauges.
- **Calculators** — 10 working field tools (hydronic GPM, superheat, subcooling,
  air split, target superheat, sensible heat, 3-phase power, duct size, external
  static, temp convert).
- **Training** — real HVAC lessons (refrigeration fundamentals, chiller
  diagnostics, electrical, controls, airside, VRF) with takeaways.
- **Fault-code scanner, nameplate ID, plant tree with recurrence detection,
  skill map, voice mode.**

## Connecting AI (optional)

The AI features (nameplate reading, fault-code reading, whole-case second-opinion
diagnosis, and free-form Q&A) are **off by default** and work only once you
connect a provider. Tap the **AI** button in the app header.

> There is no "sign in with a free ChatGPT/Claude account" that lets an app use
> the model — those are website logins. Every provider gates model access behind
> a personal **API key**. Paste one and you're connected.

Supported providers:

- **Google Gemini** — *genuinely free* API key ([get one](https://aistudio.google.com/apikey)), the recommended default
- **OpenRouter** — one key, several free-tier models
- **OpenAI (ChatGPT)** and **Anthropic (Claude)** — pay-as-you-go keys
- **Custom** — any OpenAI-compatible endpoint (Groq, LM Studio, self-hosted)

Your key is stored **only on the device** — browser `localStorage` on web, the
OS keychain (`expo-secure-store`) on the phone. The AI is always framed as a
second opinion to cross-check against the rule engine and manufacturer data.

---

## Project layout

```
mobile/        Expo / React Native app (iOS + Android)
app/           Vite + React web app
  src/engine/    shared: diagnostic trees, PT tables, calculators, training,
                 equipment data, and the AI provider layer
  src/state/     shared: app state hook + view-model derivation
  src/components/ platform-specific UI (screens, sheets, primitives)
project/       original Claude Design HTML prototypes (design reference)
chats/         the design conversation that shaped the app
```

## Tech

- **Mobile:** Expo SDK 57, React Native, TypeScript, expo-font (Archivo + IBM
  Plex Mono), expo-image-picker, expo-secure-store.
- **Web:** Vite, React 19, TypeScript.
- **AI:** provider-agnostic layer supporting OpenAI-compatible, Anthropic, and
  Google Gemini request shapes, for both chat and vision.

## Building installable app-store binaries (later)

Expo Go is for development. To produce a real `.ipa` / `.aab` for TestFlight /
Play Console, use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
cd mobile
eas build --platform ios
eas build --platform android
```

Bundle identifier is set to `com.hvacue.app` in `mobile/app.json`.

---

*HVACue was designed in [Claude Design](https://claude.ai/design) and implemented
with [Claude Code](https://claude.com/claude-code).*
