/**
 * Generates public/og.png (1200x630 messenger preview) and the PWA icons
 * from an SVG drawn here, using the same palette and fonts as the site.
 *
 *   node scripts/generate-assets.mjs
 *
 * Fonts are the bundled @fontsource woff2 files, decompressed to TTF on the
 * fly (resvg cannot read woff2). Nothing is fetched from the network.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import wawoff2 from 'wawoff2'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cache = path.join(root, 'node_modules/.cache/og-fonts')
await mkdir(cache, { recursive: true })

const FONTS = [
  '@fontsource/manrope/files/manrope-latin-300-normal.woff2',
  '@fontsource/manrope/files/manrope-cyrillic-300-normal.woff2',
  '@fontsource/manrope/files/manrope-cyrillic-ext-300-normal.woff2',
  '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
  '@fontsource/ibm-plex-mono/files/ibm-plex-mono-cyrillic-400-normal.woff2',
  '@fontsource/ibm-plex-mono/files/ibm-plex-mono-cyrillic-ext-400-normal.woff2',
]
const fontFiles = []
for (const f of FONTS) {
  const out = path.join(cache, path.basename(f).replace(/\.woff2$/, '.ttf'))
  const ttf = await wawoff2.decompress(await readFile(require.resolve(f)))
  await writeFile(out, ttf)
  fontFiles.push(out)
}

// Deterministic pseudo-random so the image is reproducible
let seed = 20261115
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32)
const COLORS = ['#a8823e', '#b5533f', '#8f6b3a', '#c9a45c', '#9c3f36']

const W = 1200, H = 630
const petals = Array.from({ length: 70 }, () => {
  const edge = rnd() < 0.45
  let x = edge ? (rnd() < 0.5 ? rnd() * 220 : W - rnd() * 220) : rnd() * W
  let y = edge ? H * 0.55 + rnd() * H * 0.45 : rnd() * H
  // keep the name block readable: push petals out of the text area
  if (x > 150 && x < W - 150 && y > 190 && y < 430) {
    x = x < W / 2 ? rnd() * 150 : W - rnd() * 150
  }
  const s = 7 + rnd() * 9
  const a = rnd() * 360
  const c = COLORS[Math.floor(rnd() * COLORS.length)]
  const o = 0.5 + rnd() * 0.4
  return `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})" d="M0 ${-s} C${s * 0.9} ${-s * 0.6} ${s * 0.7} ${s * 0.7} 0 ${s} C${-s * 0.7} ${s * 0.7} ${-s * 0.9} ${-s * 0.6} 0 ${-s}Z" fill="${c}" fill-opacity="${o.toFixed(2)}"/>`
}).join('')

const bracket = (x, y, sx, sy) =>
  `<path d="M${x} ${y + 22 * sy}V${y}H${x + 22 * sx}" fill="none" stroke="#2b2620" stroke-width="1.5"/>`

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 .5H0M.5 0v48" fill="none" stroke="#2b2620" stroke-opacity=".07"/>
      <circle cx=".5" cy=".5" r="1" fill="#2b2620" fill-opacity=".12"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#e8e2d0"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  ${petals}
  ${bracket(40, 40, 1, 1)}${bracket(W - 40, 40, -1, 1)}${bracket(40, H - 40, 1, -1)}${bracket(W - 40, H - 40, -1, -1)}
  <g font-family="IBM Plex Mono" font-size="16" letter-spacing="3" fill="#6f665a">
    <text x="600" y="150" text-anchor="middle">SYSTEM://WEDDING_NOTIFICATION</text>
    <text x="600" y="470" text-anchor="middle" fill="#2b2620">ҲОДИСА: АҚДИ НИКОҲ  ·  СОСТОЯЛОСЬ СОБЫТИЕ: БРАКОСОЧЕТАНИЕ</text>
    <text x="600" y="510" text-anchor="middle" fill="#a8823e">ШУМО ДАЪВАТ ШУДАЕД  ·  ВЫ ПРИГЛАШЕНЫ</text>
  </g>
  <g font-family="Manrope" font-weight="300" fill="#2b2620" text-anchor="middle" letter-spacing="3">
    <text x="600" y="265" font-size="64">Худоёров Хисрав</text>
    <text x="600" y="330" font-size="40" fill="#a8823e" font-family="IBM Plex Mono">&amp;</text>
    <text x="600" y="405" font-size="64">Раҷабова Фариштабону</text>
  </g>
  <line x1="470" y1="318" x2="560" y2="318" stroke="#b9ae98"/>
  <line x1="640" y1="318" x2="730" y2="318" stroke="#b9ae98"/>
</svg>`

const icon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#e8e2d0"/>
  <path d="M16 4 26.4 10v12L16 28 5.6 22V10L16 4Z" fill="none" stroke="#2b2620" stroke-width="1.2"/>
  <path d="M16 11.5 20 13.75v4.5L16 20.5 12 18.25v-4.5L16 11.5Z" fill="#a8823e"/>
</svg>`

const render = (svg, width) =>
  new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Manrope' },
  }).render().asPng()

await writeFile(path.join(root, 'public/og.png'), render(og, W))
await writeFile(path.join(root, 'public/icon-192.png'), render(icon(192), 192))
await writeFile(path.join(root, 'public/icon-512.png'), render(icon(512), 512))
console.log('generated: public/og.png, public/icon-192.png, public/icon-512.png')
