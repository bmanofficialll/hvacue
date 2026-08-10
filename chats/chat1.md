# Diagnostic engine mobile app

_Started 2026-08-10 15:07 UTC_

---

## User

Design a mobile app for a diagnostic engine with structured decision trees + verified technical knowledge + AI reasoning + field measurements.

## Assistant



## User

Answered — hero_flow: Chiller high-discharge-pressure decision tree (the spec's example call), Split-system no-cooling / refrigerant circuit diagnosis, Fault-code scan → explanation → guided tests, Nameplate scan → equipm…; screens: Home hub, Active diagnostic session, Fault code scanner, Equipment/job history; mode_default: Auto-detect / switchable; measurement_ui: Live gauge-set panel: all readings on one editable card; trust_display: Dedicated 'sources' sheet, subtle inline dot; chrome: Both side by side; variations: Diagnostic session layout (tree vs card stack vs feed), Home hub density,…

## Assistant

_[tool: ask_user]_

_[tool: copy_starter_component]_

_[tool: grep]_

_[tool: read_file]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

HVACue is up — a working diagnostic instrument, not a chat mock.

- **DIAGNOSE** → session runs a real engine: each reading you key in recomputes condenser ΔT, R‑134a saturation/condensing temp and approach, then re-ranks six causes with live percentages. Zero evidence = it refuses to show confidence.
- **WHAT SHOULD I CHECK NEXT?** always returns one step with Why / How / Expected / If normal / If abnormal, then hands off to a hands-on test, repair log, and verification reading before the report will close.
- Bad-data guard fires on impossible inputs (leaving water colder than entering, high head with low amps, over-relief pressure).
- Also built: fault-code scanner, nameplate ID with low-confidence fields flagged, glycol-corrected GPM calculator, plant tree with recurrence detection, skill map, voice mode.

You dismissed the questions form, so I picked the chiller flow, beginner default with a TECH toggle, and a dark instrument aesthetic. Tell me which flow to build next (split-system no-cooling? VRF comms?) or which screen to push further.

_[tool: list_files]_

_[tool: read_file]_

_[tool: grep]_

_[tool: copy_starter_component]_

_[tool: grep]_

_[tool: dc_write]_

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Fixed the save bug (a handler name collided with the runtime) in both files, and rebuilt on the Modernist system you picked — **HVACue Modernist.dc.html**:

- Light ground, one red accent reserved for *abnormal*, zero radius, 2px rules, Archivo throughout.
- **Gauge set**: every channel on one card, tap any cell to key it in — no wizard.
- **Sources sheet** behind a small red square: manufacturer spec vs guideline vs PT data vs inferred vs measured, kept separate.
- **AUTO depth** switches from beginner to tech once you're three channels in (BEGIN/TECH still manual).
- Two scenarios on the same engine: the water-cooled chiller and a 4‑ton R‑410A split no-cooling call (superheat/subcooling/air split, restriction vs undercharge).
- iPhone runs the full flow; the Android frame mirrors the same live session on platform chrome.
- Tweak prop: confidence display (bars / stacked meter).

The dark v1 is still at HVACue.dc.html if you want to compare. Next candidates: fault-code screen for the split scenario, or the report's PDF export layout.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Both device mounts now hold their true widths (`flex:none`), and the wrapper wraps on narrow viewports instead of squeezing the phones.

## User

Check didn’t complete

## Assistant

_[tool: show_html]_

_[tool: show_html]_

Renders correctly at full width now — frames hold 402/412px, home hero and segmented control are intact. No further changes needed.

## User

Add tweakable controls to HVACue.dc.html (declare with dc_set_props, read via this.props): when i click diagnose, i want to be able to select brand unit,  model unit, refrigerant type, voltage, phase,  etc. to be able to accurately diagnose the proper equipment.

## Assistant

_[tool: read_file]_

_[tool: dc_set_props]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the template: dynamic chips row, header title, and an equipment-profile card on the session screen.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Equipment is now tweakable on HVACue.dc.html — Tweaks panel, three sections:

- **Equipment**: manufacturer, model, serial, equipment type, capacity
- **Refrigerant circuit**: refrigerant, metering device, compressor, circuits
- **Electrical**: voltage, phase

They drive the engine, not just labels: the session header, chip strip and new **Equipment profile** card all read from them; the PT conversion switches table by refrigerant (R‑134a, R‑410A, R‑404A, R‑22 cached). Pick R‑454B, R‑32, R‑448A or R‑290 and it refuses to compute a saturation temperature and tells you to pull the manufacturer PT chart instead of guessing. Choosing "Generic / unknown" manufacturer flags every procedure as generic, and a non-chiller type warns the condenser-water sequence is generic for that equipment.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Routed the save handler through an inline arrow in both files — SAVE READING should now commit to the ledger and unlock derived values, ranking, repair/verify and the report.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Both fixed:

- **Verification is now computed, not assumed.** The final reading is converted and the approach checked: ≤7 °F passes green; above that it reports "NOT VERIFIED · STILL OUT OF RANGE" in red with the actual approach, says the root cause wasn't addressed, and offers *Back to ranked causes*. No PT table or no leaving-water temp gives an amber "RECORDED · NOT VERIFIED" instead of a false pass — and the service report carries the same verdict.
- CTA label is now "LOG THIS READING" (was "LOG F READING").

## User

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Modernist (design system)">
[Design System] This project uses the **Modernist** design system. This is a binding choice for visual style — every visual must follow it. Don't invent colors, type, spacing, or components not grounded here.

Scope: the design system is a visual style reference only. Its guide may describe example products, brands, or people that are unrelated to the user and unrelated to the subject of this conversation. Never treat anything in the design system as a fact about the user, their work, or the topic they asked about.

This project has the **Modernist_modern** design system bound at `_ds/modernist-84f2a322-58f6-4098-a42f-59c5d2a7f538/`. If anything under that path is missing or fails to load, the folder name may differ — `list_files` `_ds/` and use the folder whose name ends with 84f2a322-58f6-4098-a42f-59c5d2a7f538 instead, including in the <link>/<script> paths below.

**Loading the bundle is how you use this design system.** Every Design Component you build must load `_ds/modernist-84f2a322-58f6-4098-a42f-59c5d2a7f538/_ds_bundle.js` in `<helmet>` (include it in child DCs too — de-duped by URL) and compose with its components — do not recreate those components from scratch or restyle raw HTML to look like them. At the top of the template:

```html
<helmet>
  <link rel="stylesheet" href="_ds/modernist-84f2a322-58f6-4098-a42f-59c5d2a7f538/styles.css">
  <script src="_ds/modernist-84f2a322-58f6-4098-a42f-59c5d2a7f538/_ds_bundle.js"></script>
</helmet>
```

Then mount any component directly in the template — no logic class needed:

```html
<x-import component-from-global-scope="Modernist_modern.Button" hint-size="auto,40px">Label</x-import>
```

Props are template attributes (kebab → camelCase); template children pass through as `props.children`. The linked stylesheet(s) carry the design tokens (colors, type, spacing) — style against those via `var(--*)` and the design system's classes rather than guessing values.

**Start from a template if one matches.** Before building from scratch, check whether a template below matches the user's request. Read the template (list its folder, `read_file` the entry) and decide: if it's close to what's asked, `copy_files` the folder as your starting point; if you'd rather re-author in DC, `dc_write` a new page using the template as your structural reference. When this design system is bound, `copy_files` repoints the copied `ds-base.js` automatically — only edit its base line yourself if the copy result says so, or when copying from an unbound project (change `'../..'` to your `_ds/modernist-84f2a322-58f6-4098-a42f-59c5d2a7f538` path). (Older templates have no `ds-base.js` and carry `../../…` bundle/stylesheet refs in their pages instead — repoint those by hand.)

- `Deck` (`/projects/84f2a322-58f6-4098-a42f-59c5d2a7f538/templates/deck/`) — A twenty-one-slide presentation starter: cover, contents, dividers, columns, quadrants, a data table, SVG charts and timeline, bleed imagery, a quote and a close, on the theme's tokens
- `Landing` (`/projects/84f2a322-58f6-4098-a42f-59c5d2a7f538/templates/landing/`) — A one-page product landing in the system's own voice — an invented product (Takt: Swiss-clockwork timetables), a ruled hero, stat row, feature rows, a grayscale photograph and a red poster close

The full design-system source tree lives at `/projects/84f2a322-58f6-4098-a42f-59c5d2a7f538/` — use `list_files` / `read_file` from there for anything not under `_ds/` (layout varies by brand; don't assume folder names). Its guide is reproduced below so you don't need to fetch it:

<design-system-guide>
# Modernist design system

Modernist is flat, architectural and set entirely in Archivo: a near-mono red on white, a visible modular grid, zero corner radius and strong 2px rules. Nothing floats and nothing is decorated — alignment and the strength of the dividers do all the organising, labels sit flush left (even inside buttons), and photography prints in pure black and white.

## How to use this

- Link the one stylesheet from every page — `&lt;link rel="stylesheet" href="styles.css"&gt;` (adjust the relative path) — and take every color, font, spacing, radius and shadow from its variables (`var(--color-*)`, `var(--font-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)`). Never hard-code a hex, a font name or a px value the tokens already carry.
- Build with the classes below rather than inventing parallel ones; the component pages are plain HTML, so view source and copy the markup.
- `templates/` holds starting points a consuming project can copy whole.
- The whole system was derived from `theme.json`. To change the look, edit the tokens at the top of `styles.css` — every page, the thumbnail and this guide read from them — and keep `theme.json` and the written guidance in step so they don't drift from what the CSS actually does.

## Direction

Modular grid layouts — content in equal-width cells, strong horizontal and vertical rhythm, visible structure. Use strong 2px dividers (`var(--color-divider)`) between major sections. Button labels are flush left — a button wider than its label starts the text at the left padding edge (trailing icon and all), never centered. Wrap hero and inline images in the `.grayscale` class — they print in pure black and white.

## Color

A light ground (`--color-bg` #f3f2f2) with `--color-text` #201e1d and a single accent #ec3013 (this is a mono scheme: no second accent was chosen — the `--color-accent-2-*` variables carry a machine-derived stand-in kept only so both sets resolve; treat them as one role). Each role carries a 100–900 tonal ramp (`--color-neutral-100` … `--color-accent-2-900`) generated in OKLCH on a shared perceptual lightness scale, so the same step of any ramp has the same visual weight. Use the light steps (100–300) for tinted fills, hovers and subtle borders, 500 as the role's base, and the dark steps (700–900) for text on tinted fills and for pressed states; prefer ramp steps over ad-hoc `color-mix()`. For elevation use `--shadow-sm/md/lg` (already tuned to the ground) rather than ad-hoc box-shadows.

## Type

Archivo for headings over Archivo for body text, loaded as `--font-heading` / `--font-body`. Density 1.00× and radius 0px are already baked into the `--space-*` / `--radius-*` scales — use the variables, not raw numbers.

## Icons

Use Lucide icons (https://lucide.dev) throughout.

## Interaction states

Interactive states are themed, never browser defaults: give every interactive element a `:hover` tint and a pressed state from the accent ramp (one step past the base — `--color-accent-600` on a light ground, `--color-accent-400` on a dark one, or a `color-mix()` tint for outlined/ghost variants), and style keyboard focus with `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }` — never leave the default blue focus ring.

## Components

| Class | What it is | Shown in |
| --- | --- | --- |
| `.btn` with `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-icon`, `.btn-block` | Actions — the primary is a solid accent fill | components/buttons.html |
| `.tag` with `.tag-accent`, `.tag-accent-2`, `.tag-neutral`, `.tag-outline` | Small labels tinted from the ramps (mono palette: accent-2 reads the same as accent) | components/buttons.html |
| `.field` + `label`, `.input`, `.radio` + `.dot`, `.seg` + `.seg-opt` | Form fields and choices on native elements — no script | components/forms.html |
| `.card` with `.card-kicker`, `.card-title`, `.card-body`, `.card-meta`; `.elev-sm/md/lg` | Surface-filled content cards; elevation utilities | components/cards.html |
| `.nav` + `.nav-brand` | The header bar | components/navigation.html |
| `.table` | Data tables with themed header and row rules | components/table.html |
| `.dialog-backdrop` + `.dialog` (+ `.dialog-title/-body/-actions`) | A modal at the top elevation | components/dialog.html |
| `.hr` | A strong 2px horizontal rule | foundations/layout.html |
| `.grayscale` | The image wrapper — every content photograph goes through it | foundations/image.html |

States are built in: hovers and pressed states come from the accent ramp, keyboard focus is the 2px accent `:focus-visible` ring, `::selection` is an accent tint, and disabled controls drop to 45% opacity. Don't restyle them per page. The accent-to-ground pair is tuned to at least 3:1 — enough for icons, large text and interface chrome, not for body copy — so for paragraph-size text in the accent use a deep ramp step (`--color-accent-700` on this ground) rather than the accent itself.

## Do

- Let the grid show: equal-width cells, strong horizontal rules between sections, visible structure.
- Keep everything flush left — headings, copy, and the labels inside wide buttons.
- Use the accent sparingly, for the primary action and small emphasis; the system is mostly ink on ground. The one place red runs as a field is the poster statement — the deck's section dividers and the landing's closing banner — where type stays display-grade and the accent carries the page.
- Print photographs in black and white with the `.grayscale` wrapper.

## Don't

- Do not round a corner anywhere — `--radius-md` is 0 on purpose.
- Do not center button labels or hero copy.
- Do not soften the rules into hairlines or drop them for whitespace.
- Do not tint or colorize imagery.

## Files

- `styles.css` — the only stylesheet: the token sheet (`:root` variables, ramps, base type) plus the component layer. Link it from every page.
- `readme.md` — this guide.
- `theme.json` — the parameters these files were derived from (a machine-readable record of the theme).
- `thumbnail.html` — the project cover (brand mark + swatches).
- `foundations/type.html` — the type scale and the heading/body pairing at real sizes.
- `foundations/color.html` — color roles and the 100-900 tonal ramps, with usage notes.
- `foundations/layout.html` — the spacing scale, the grid and how edges are drawn.
- `foundations/icons.html` — the icon set at interface sizes, inline and in buttons.
- `foundations/image.html` — how photographs and figures are treated.
- `components/buttons.html` — buttons, icon buttons and tags in every variant and state.
- `components/forms.html` — text fields, radios and the segmented control on native elements.
- `components/cards.html` — content cards and the elevation steps.
- `components/navigation.html` — the header bar pattern.
- `components/table.html` — a data table with the themed header and row rules.
- `components/dialog.html` — a modal over its backdrop at the top elevation.
- `theme.html` — the theme's parameters rendered as a reference sheet.
- `templates/landing/` — a starter page consuming the system the intended way (`index.html`, its `ds-base.js` loader, and the vendored `image-slot.js` its photograph mounts).
- `assets/photo.jpg` — the reference photograph the imagery page treats.

</design-system-guide>
</attached-skill>

## Assistant

Noted — those are now the file's defaults (Goodman split system, R‑454B, TXV, 230 V/1Ø).

Two consequences worth knowing: with R‑454B there's no cached PT table, so the engine deliberately refuses the saturation conversion, and with "Split system" selected it flags the condenser-water sequence as generic. That combination leaves the dark v1's chiller decision tree mostly disclaimered.

Want me to point the tweaks at the real split-system tree instead — the R‑410A/R‑454B channels (superheat, subcooling, air split) that already run in **HVACue Modernist.dc.html** — so the equipment selection drives a matching sequence? That file is also the one on the Modernist system you've bound.

