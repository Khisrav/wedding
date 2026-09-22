import { onBeforeUnmount, ref } from 'vue'

export function useReducedMotion() {
  const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null
  const reduced = ref(mq?.matches ?? false)
  const onChange = (e: MediaQueryListEvent) => (reduced.value = e.matches)
  mq?.addEventListener?.('change', onChange)
  onBeforeUnmount(() => mq?.removeEventListener?.('change', onChange))
  return reduced
}
