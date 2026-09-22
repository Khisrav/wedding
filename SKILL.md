---
name: nothing-os-5-ui-ux
description: Design guidance for building interfaces in the spirit of Nothing OS 5.0 — transparent monochrome base, Geist system type, dot-matrix used only as accent, adaptive/minimal widgets — with the signature red accent swapped for GOLD. Use for clean, modern, minimal invitation or product UI.
---

# Nothing OS 5.0-Inspired UI/UX (Gold Accent)

This is a design-language reference, not a reproduction of any copyrighted assets — no Nothing logos, wordmarks, or the licensed NDot/Ntype fonts themselves. The goal is to translate Nothing's OS 5.0 design language (a pure monochrome canvas, transparent/see-through materials, the Geist system typeface carrying most of the UI with dot-matrix now used sparingly as accent rather than everywhere, and an adaptive single accent color) into an original build — with that accent recolored from Nothing's signature red to **gold**.

## Core design principles

1. **Monochrome canvas, one accent color.** Nothing OS 5.0's whole system is black/white/gray with a single accent doing all the "this matters" work. Here that accent is gold — used for exactly one job (primary actions, active states, key highlights), never as a general decoration.
2. **Type carries the hierarchy, not color.** OS 5.0 moved its everyday UI onto Geist (a clean, slightly technical grotesk) and pulled the dot-matrix font back to a few accent spots — dates, counters, small labels — instead of using it everywhere like earlier versions did. Follow the same restraint: one clean sans for almost all text, dot-matrix only where it earns its keep.
3. **Transparent, layered materials.** Panels read as slightly see-through glass over the canvas rather than solid opaque cards — subtle blur/backdrop-filter, thin 1px borders, no heavy drop shadows.
4. **Grid discipline.** Widgets and content blocks sit on a visible, consistent grid with generous, even spacing — nothing crowded, nothing centered "by eye."
5. **Quiet, mechanical motion.** Short, linear or slight-ease transitions (toggle switches, panel reveals) that feel precise rather than bouncy or playful.

## Color tokens

```css
:root {
  --bg-canvas:     #fafafa;  /* near-white base */
  --bg-panel:      rgba(255, 255, 255, 0.6); /* translucent panel over canvas */
  --bg-panel-solid:#ffffff;  /* fallback where backdrop-filter isn't supported */
  --ink-primary:   #141414;  /* near-black text */
  --ink-secondary: #6b6b6b;  /* muted labels, secondary text */
  --line-hairline: #e2e2e2;  /* thin dividers/borders */
  --accent-gold:   #c9a24b;  /* primary accent — replaces Nothing Red */
  --accent-gold-soft: #e6d3a3; /* lighter gold for subtle fills/hover */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-canvas:     #141414;
    --bg-panel:      rgba(20, 20, 20, 0.6);
    --bg-panel-solid:#1c1c1c;
    --ink-primary:   #f5f5f5;
    --ink-secondary: #9a9a9a;
    --line-hairline: #2c2c2c;
  }
}
```

## Typography

- Primary UI font: a clean, slightly technical grotesk in the spirit of Geist — e.g. Geist, Inter, or Space Grotesk for nearly all text (headings, body, buttons, nav).
- Dot-matrix font: reserved for a handful of accent spots only — a countdown/date display, a small numeric badge, a section eyebrow — never for paragraph text or navigation.

```css
.heading  { font: 600 clamp(24px, 4vw, 40px)/1.2 "Geist", "Inter", sans-serif; color: var(--ink-primary); letter-spacing: -0.01em; }
.body     { font: 400 16px/1.6 "Geist", "Inter", sans-serif; color: var(--ink-primary); }
.label    { font: 500 12px/1.4 "Geist", "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-secondary); }
.dotmatrix-accent { font-family: "Dot Matrix", monospace; letter-spacing: .1em; color: var(--accent-gold); }
```

## Layout & component patterns

- **Widget cards**: rounded corners (16–20px radius), translucent fill (`var(--bg-panel)` + `backdrop-filter: blur(20px)`), 1px `var(--line-hairline)` border, no colored fill except the rare gold-accented widget.
- **Toggle/switch controls**: pill-shaped, gray track, gold knob/fill only in the "on" state — exactly the one-accent-color rule applied to a control.
- **Status/eyebrow labels**: small dot-matrix or tracked-uppercase text in gold, sitting above a heading — this is the "accent used sparingly" pattern from OS 5.0's redesign.
- **Dividers**: hairline 1px lines, full-bleed or inset — never gradient or decorative.
- **Buttons**: primary = solid gold fill with `--ink-primary`-on-gold text or dark text; secondary = transparent with hairline border, no fill.

```css
.card {
  background: var(--bg-panel);
  backdrop-filter: blur(20px);
  border: 1px solid var(--line-hairline);
  border-radius: 18px;
}
.btn-primary {
  background: var(--accent-gold);
  color: #141414;
  border-radius: 999px;
  padding: 12px 24px;
  font: 500 14px/1 "Geist", sans-serif;
}
```

## Motion

- Panel/section reveals: 200–260ms ease-out fade + 8px upward translate — clean, not playful.
- Toggle/switch state change: 150ms linear slide of the knob, instant color fill.
- Avoid bounce, elastic, or overshoot easing entirely — OS 5.0's motion reads as precise/mechanical, not springy.

```css
.reveal {
  animation: reveal 220ms ease-out both;
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

## Iconography

- Thin-stroke (1.5px), geometric, monoline icons — no fills, no gradients — matching the system's clean grotesk character.
- Keep icons monochrome (`--ink-primary` or `--ink-secondary`); reserve gold for the rare "active/selected" icon state only.

## Applying this to the wedding site

- Use the translucent card pattern for the date/venue/contact block, with gold reserved for the one primary action (e.g. "Save the date" / RSVP button) and maybe a dot-matrix countdown to the wedding date as the one accent-typography moment.
- Keep body copy (venue address, phone numbers) in the plain grotesk at full contrast — legibility over style, especially given guests will load this over slow connections.
- This replaces the previously-planned Clair Obscur / NieR Automata directions for the same project — keep only one visual language active when building, since mixing this clean monochrome-grid system with either of the ornate ones will read as inconsistent.
- Pairs well with the `frontend-design` skill for general layout/spacing discipline; load that alongside this one when actually building the pages.