import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * Fades/slides in any descendant marked with `data-reveal` the first time
 * the root element scrolls into view. No-ops entirely for users who prefer
 * reduced motion (content is simply visible from the start).
 */
export function useRevealOnView() {
  const root = ref<HTMLElement | null>(null)
  const { prefersReducedMotion } = useReducedMotion()
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!root.value || prefersReducedMotion.value) return
    const items = root.value.querySelectorAll<HTMLElement>('[data-reveal]')
    if (items.length === 0) return

    gsap.set(items, { opacity: 0, y: 22 })

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            gsap.to(items, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              stagger: 0.08,
            })
            observer?.disconnect()
          }
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(root.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { root }
}
