// Generates the favicon + share assets (og.png, apple/touch icons) from
// inline SVG templates using sharp. Run with `npm run generate-assets`.
// No external network calls, no binary assets checked in by hand.

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const CREAM = '#F7EFE1'
const INK = '#2B241F'
const GOLD = '#C9A15E'
const BURGUNDY = '#7C3F35'

const faviconSvg = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="${CREAM}"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="${GOLD}" stroke-width="2"/>
  <circle cx="32" cy="10" r="1.6" fill="${GOLD}"/>
  <text x="32" y="40" font-family="Georgia, serif" font-size="21" fill="${INK}" text-anchor="middle">X&amp;F</text>
</svg>
`.trim()

function ogSvg() {
  const width = 1200
  const height = 630
  const cx = width / 2

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${CREAM}"/>
  <rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.55"/>

  <circle cx="60" cy="60" r="2" fill="${GOLD}"/>
  <circle cx="${width - 60}" cy="60" r="2" fill="${GOLD}"/>
  <circle cx="60" cy="${height - 60}" r="2" fill="${GOLD}"/>
  <circle cx="${width - 60}" cy="${height - 60}" r="2" fill="${GOLD}"/>

  <text x="${cx}" y="${height / 2 - 60}" font-family="Georgia, serif" font-size="30" letter-spacing="6" fill="${BURGUNDY}" text-anchor="middle" opacity="0.85">ПРИГЛАШЕНИЕ</text>

  <text x="${cx}" y="${height / 2 + 20}" font-family="Georgia, serif" font-size="76" fill="${INK}" text-anchor="middle">Хисрав &amp; Фариштабону</text>

  <line x1="${cx - 90}" y1="${height / 2 + 70}" x2="${cx + 90}" y2="${height / 2 + 70}" stroke="${GOLD}" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${height / 2 + 70}" r="4" fill="${GOLD}"/>

  <text x="${cx}" y="${height / 2 + 125}" font-family="Georgia, serif" font-size="28" letter-spacing="2" fill="${INK}" text-anchor="middle" opacity="0.75">4 октября 2026 · 18:00 · Душанбе</text>
</svg>
`.trim()
}

async function main() {
  await mkdir(publicDir, { recursive: true })

  await writeFile(join(publicDir, 'favicon.svg'), faviconSvg, 'utf8')

  const faviconBuffer = Buffer.from(faviconSvg)
  await sharp(faviconBuffer, { density: 384 })
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'icon-192.png'))

  await sharp(faviconBuffer, { density: 384 })
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'icon-512.png'))

  const ogBuffer = Buffer.from(ogSvg())
  await sharp(ogBuffer).resize(1200, 630).png().toFile(join(publicDir, 'og.png'))

  console.log('Assets generated in /public: favicon.svg, icon-192.png, icon-512.png, og.png')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
