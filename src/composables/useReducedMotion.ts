import { onMounted, onUnmounted, ref } from 'vue'

/** Tracks the user's `prefers-reduced-motion` OS setting reactively. */
export function useReducedMotion() {
  const prefersReducedMotion = ref(false)
  let mql: MediaQueryList | null = null

  const handler = (e: MediaQueryListEvent) => {
    prefersReducedMotion.value = e.matches
  }

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mql.matches
    mql.addEventListener('change', handler)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', handler)
  })

  return { prefersReducedMotion }
}
