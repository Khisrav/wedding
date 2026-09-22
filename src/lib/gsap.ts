/**
 * Lazy GSAP loader. Everything animation-related imports GSAP through here,
 * so the library lands in its own chunk (see vite.config manualChunks) and
 * the rest of the page never blocks on it.
 *
 * Resolves to `null` if the chunk fails to load (offline / flaky network):
 * callers must treat animations as optional.
 */
import type { gsap as GsapType } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

export type Gsap = typeof GsapType
export type ST = typeof ScrollTriggerType

let pending: Promise<{ gsap: Gsap; ScrollTrigger: ST } | null> | null = null

export function loadGsap() {
  if (!pending) {
    pending = Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(([g, st]) => {
        g.gsap.registerPlugin(st.ScrollTrigger)
        return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger }
      })
      .catch((err) => {
        console.warn('[gsap] failed to load, running without animations', err)
        return null
      })
  }
  return pending
}
