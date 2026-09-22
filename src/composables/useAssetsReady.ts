import { ref } from 'vue'
import { loadGsap } from '../lib/gsap'

export type BootStep = { id: string; label: string; done: boolean }

/**
 * Real readiness, not a timer.
 *
 * The boot screen stays up until every critical resource is either loaded or
 * has definitively failed (a failed font/GSAP is *not* a reason to hold the
 * page hostage — the CSS fallbacks take over). A hard ceiling guarantees the
 * visitor is never stuck on a boot screen if a request hangs.
 */
export function useAssetsReady(opts: { minMs?: number; maxMs?: number } = {}) {
  const { minMs = 1800, maxMs = 9000 } = opts
  const ready = ref(false)
  const steps = ref<BootStep[]>([
    { id: 'fonts', label: 'FONTS', done: false },
    { id: 'motion', label: 'MOTION_ENGINE', done: false },
    { id: 'dom', label: 'INTERFACE', done: false },
  ])
  const mark = (id: string) => {
    const s = steps.value.find((x) => x.id === id)
    if (s) s.done = true
  }

  const fonts = (async () => {
    if (!('fonts' in document)) return
    // Explicitly request the faces the first screen needs; document.fonts.ready
    // only covers faces already used by rendered text.
    const faces = [
      '400 1em "IBM Plex Mono"',
      '500 1em "IBM Plex Mono"',
      '300 1em Manrope',
      '500 1em Manrope',
      '400 1em "Bad Script"',
    ]
    await Promise.allSettled(faces.map((f) => document.fonts.load(f, 'Тӯй Свадьба ABC Хисрав')))
    await document.fonts.ready
  })().finally(() => mark('fonts'))

  const motion = loadGsap().finally(() => mark('motion'))

  const dom = new Promise<void>((res) => {
    if (document.readyState === 'complete') res()
    else window.addEventListener('load', () => res(), { once: true })
  }).finally(() => mark('dom'))

  const minimum = new Promise<void>((res) => setTimeout(res, minMs))
  const ceiling = new Promise<void>((res) => setTimeout(res, maxMs))

  Promise.race([Promise.all([fonts, motion, dom, minimum]), ceiling]).then(() => {
    steps.value.forEach((s) => (s.done = true))
    ready.value = true
  })

  return { ready, steps }
}
