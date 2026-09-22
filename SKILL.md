---
name: nier-automata-ui-ux
description: Design guidance for building interfaces in the spirit of NieR:Automata's UI — warm monochrome/beige palette, thin geometric linework, terminal/OS-like chrome, and restrained glitch motion. Use when a user asks for a "NieR-style," "android OS," "sci-fi terminal," or "minimal beige HUD" look for a web app, dashboard, or game UI mockup.
---

# NieR:Automata-Inspired UI/UX

This is a design language reference, not a reproduction of any copyrighted assets. Nothing here should include NieR:Automata logos, character art, in-game text, or fonts under license — the goal is to capture the *design principles* PlatinumGames' UI artist Hisayoshi Kijima described (sci-fi restraint growing out of a fantasy/scrapbook lineage, functional clarity, a "luxurious but worn" feel) and translate them into an original interface.

## Core design principles

1. **Warm neutral over cold neutral.** The signature move is a beige/cream base instead of the usual black or pure white "sci-fi HUD" cliché. It reads as machine-made but not sterile — like aged paper or bone rather than glass.
2. **Function first, ornament second.** Every line, bracket, and divider should look like it's doing structural work (framing a data field, marking a boundary) rather than being decorative chrome.
3. **Thin, precise linework.** Hairline strokes (1px), sharp corners, occasional single chamfered/cut corner — never soft shadows or heavy borders.
4. **Restraint in motion.** Panels slide/wipe in with short, linear (not bouncy) easing. Occasional deliberate "glitch" — a brief scanline flicker or text jitter — used sparingly as a moment of emphasis, not constant background noise.
5. **Modular, slotted layout.** Think of a chip/inventory grid or a musical staff: content sits in discrete cells with visible grid lines, echoing the game's chip-installation system and its notation-inspired menu bars.

## Color tokens

```css
:root {
  --bg-primary:    #ece6d8;  /* warm beige base */
  --bg-panel:      #f5f1e6;  /* slightly lighter panel fill */
  --bg-recessed:   #ddd5c2;  /* inset / disabled fields */
  --ink-primary:   #2b2620;  /* near-black warm ink for text */
  --ink-secondary: #6f665a;  /* muted labels, captions */
  --line-hairline: #b9ae98;  /* dividers, grid lines */
  --accent-active: #c96f3e;  /* burnt amber — selection, active state */
  --accent-alert:  #b23b3b;  /* warning/damage/error */
  --accent-system: #4c6b63;  /* muted teal-green — system/ok state */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary:    #1c1a16;
    --bg-panel:      #262319;
    --bg-recessed:   #14120e;
    --ink-primary:   #eee7d6;
    --ink-secondary: #b3a993;
    --line-hairline: #45402f;
  }
}
```

## Typography

- A monospaced or semi-condensed geometric sans for data/labels (tracked out, uppercase, small size — e.g. system-ui or a mono stack) paired with a plain humanist serif or sans for longer readable text — mirrors the game's mix of technical readouts and warm, book-like body text.
- Letter-spacing on labels: `0.08em`–`0.15em`.
- Avoid rounded/soft display faces entirely — no geometric-sans-with-rounded-terminals fonts.

```css
.label   { font: 500 11px/1.4 "IBM Plex Mono", ui-monospace, monospace; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-secondary); }
.body    { font: 400 15px/1.6 "IBM Plex Serif", Georgia, serif; color: var(--ink-primary); }
.numeral { font: 600 20px/1 "IBM Plex Mono", monospace; }
```

## Layout & chrome patterns

- **Cut-corner panels**: one or two corners of a panel are chamfered at 45°, done with `clip-path: polygon(...)` — a quiet signature shape, not applied to every element.
- **Hairline grid dividers** instead of card shadows: `border: 1px solid var(--line-hairline)`, no `box-shadow` unless it's a 1px inset for a pressed state.
- **Sidebar/tab rail**: a slim vertical strip of icon-only tabs with a thin active-indicator bar (2px) in `--accent-active`, not a filled background.
- **Data readouts**: label above value, label muted+tracked, value large and monospaced, e.g. `HEALTH` / `0980 / 1000`.
- **Status chips**: small rectangular (not pill-shaped) tags with a hairline border and a 6px square "LED" indicator dot in the relevant accent color.
- **Progress/gauge bars**: rectangular, segmented into discrete ticks rather than one smooth fill — echoes the chip-slot/segmented aesthetic.

## Motion

- Panel enter: 120–180ms linear or ease-out slide (8–16px) + opacity fade. No spring/bounce.
- Selection change: instant snap of the active-indicator bar, not an eased glide, to feel mechanical.
- Glitch accent (use rarely, e.g. on error/transition states): 80–150ms of a horizontal scanline offset or 1–2 characters of text substituting a glyph, then settle. Implement as a short CSS `@keyframes` clip-path jitter — never anything flashing fast enough to be a photosensitivity risk.

```css
@keyframes glitch-in {
  0%   { clip-path: inset(0 0 100% 0); opacity: 0; }
  60%  { clip-path: inset(0 0 0 0);   opacity: 1; }
  100% { clip-path: inset(0 0 0 0);   opacity: 1; }
}
.panel-enter { animation: glitch-in 160ms linear; }
```

## Iconography

- Line icons only, 1.5px stroke, no fills, sharp joins (not rounded caps) — geometric and technical rather than friendly.
- Prefer bracket/reticle motifs (`⌐ ¬`-style corner marks) to frame focused elements instead of a glow or highlight box.

## When applying this to a real interface

- Keep it to **one** accent color doing the "active/selected" work; reserve the others strictly for status semantics (ok/warn/error).
- Don't overuse the chamfered corner — one per panel/section, not on every button.
- Keep body copy in the readable serif/sans; confine the mono/tracked treatment to labels, numbers, and system text so long-form content stays legible.
- This pairs well with the `frontend-design` skill's guidance on intentional, non-templated visual choices — load that alongside this one when actually building the UI.