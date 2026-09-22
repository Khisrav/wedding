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
  '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2',
  '@fontsource/cormorant-garamond/files/cormorant-garamond-cyrillic-500-normal.woff2',
  '@fontsource/cormorant-garamond/files/cormorant-garamond-cyrillic-ext-500-normal.woff2',
  '@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff2',
  '@fontsource/eb-garamond/files/eb-garamond-cyrillic-400-normal.woff2',
  '@fontsource/eb-garamond/files/eb-garamond-cyrillic-ext-400-normal.woff2',
]
const fontFiles = []
for (const f of FONTS) {
  const out = path.join(cache, path.basename(f).replace(/\.woff2$/, '.ttf'))
  const ttf = await wawoff2.decompress(await readFile(require.resolve(f)))
  await writeFile(out, ttf)
  fontFiles.push(out)
}

let seed = 20261115
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32)
const COLORS = ['#b8863b', '#d4af6a', '#d98b8b', '#c97878', '#8a9a7e']

const W = 1200, H = 630
const petals = Array.from({ length: 64 }, () => {
  const edge = rnd() < 0.45
  let x = edge ? (rnd() < 0.5 ? rnd() * 220 : W - rnd() * 220) : rnd() * W
  let y = edge ? H * 0.55 + rnd() * H * 0.45 : rnd() * H
  if (x > 150 && x < W - 150 && y > 175 && y < 455) {
    x = x < W / 2 ? rnd() * 150 : W - rnd() * 150
  }
  const s = 7 + rnd() * 10
  const a = rnd() * 360
  const c = COLORS[Math.floor(rnd() * COLORS.length)]
  const o = 0.45 + rnd() * 0.4
  return `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})" d="M0 ${-s} C${s * 0.9} ${-s * 0.6} ${s * 0.7} ${s * 0.7} 0 ${s} C${-s * 0.7} ${s * 0.7} ${-s * 0.9} ${-s * 0.6} 0 ${-s}Z" fill="${c}" fill-opacity="${o.toFixed(2)}"/>`
}).join('')

const curl = (x, y, rot) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})" fill="none" stroke="#b8863b" stroke-width="1.4" stroke-linecap="round">
    <path d="M0 22c0-10 5-15 15-15"/><path d="M10 7c3-4 6-5 10-5"/>
  </g>`

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="wash" cx="50%" cy="0%" r="75%">
      <stop offset="0%" stop-color="#efe2c9" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#f7f1e6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#f7f1e6"/>
  <rect width="${W}" height="${H}" fill="url(#wash)"/>
  ${petals}
  ${curl(48, 42, 0)}${curl(W - 48, 42, 90)}${curl(48, H - 42, -90)}${curl(W - 48, H - 42, 180)}
  <g font-family="EB Garamond" font-size="18" letter-spacing="6" fill="#b8863b">
    <text x="600" y="145" text-anchor="middle">ДАЪВАТНОМА  ·  ПРИГЛАШЕНИЕ</text>
  </g>
  <g font-family="Cormorant Garamond" font-weight="500" fill="#2e2620" text-anchor="middle">
    <text x="600" y="268" font-size="58">Худоёров Хисрав</text>
    <text x="600" y="328" font-size="36" fill="#b8863b">&amp;</text>
    <text x="600" y="400" font-size="58">Раҷабова Фариштабону</text>
  </g>
  <line x1="470" y1="312" x2="560" y2="312" stroke="#d8c6a1"/>
  <line x1="640" y1="312" x2="730" y2="312" stroke="#d8c6a1"/>
  <g font-family="EB Garamond" font-size="20" fill="#7a6a55" text-anchor="middle">
    <text x="600" y="470">Шумо даъват шудаед  ·  Вы приглашены</text>
  </g>
</svg>`

const icon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#f7f1e6"/>
  <path d="M16 6c2.5 4 2.5 8 0 12-2.5-4-2.5-8 0-12Z" fill="#d98b8b" fill-opacity=".85"/>
  <path d="M10 16c4-2.5 8-2.5 12 0-4 2.5-8 2.5-12 0Z" fill="#d4af6a" fill-opacity=".9"/>
  <circle cx="16" cy="16" r="2" fill="#b8863b"/>
  <rect x="3.5" y="3.5" width="25" height="25" rx="1" fill="none" stroke="#b8863b" stroke-width="1"/>
</svg>`

const render = (svg, width) =>
  new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Cormorant Garamond' },
  }).render().asPng()

await writeFile(path.join(root, 'public/og.png'), render(og, W))
await writeFile(path.join(root, 'public/icon-192.png'), render(icon(192), 192))
await writeFile(path.join(root, 'public/icon-512.png'), render(icon(512), 512))
console.log('generated: public/og.png, public/icon-192.png, public/icon-512.png')
