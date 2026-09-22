<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const { prefersReducedMotion } = useReducedMotion()
const petalsRoot = ref<HTMLDivElement | null>(null)
const timelines: gsap.core.Timeline[] = []

const PETAL_COUNT = 11

const petals = Array.from({ length: PETAL_COUNT }, (_, i) => ({
  id: i,
  left: 3 + ((i * 8.7) % 94),
  scale: 0.6 + ((i * 0.37) % 0.65),
  delay: (i * 0.85) % 6,
  duration: 15 + ((i * 3.3) % 11),
  sway: 14 + ((i * 5) % 18),
  rotateDir: i % 2 === 0 ? 1 : -1,
  tone: i % 3 === 0 ? 'text-burgundy/35' : 'text-gold/55',
}))

function animate() {
  if (!petalsRoot.value) return
  const els = petalsRoot.value.querySelectorAll<HTMLElement>('.petal')

  els.forEach((el, i) => {
    const p = petals[i]
    if (!p) return

    gsap.set(el, { yPercent: -15, opacity: 0, x: 0, rotate: 0 })

    const tl = gsap.timeline({ repeat: -1, delay: p.delay })
    tl.to(el, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
    tl.to(el, { yPercent: 125, duration: p.duration, ease: 'none' }, 0)
    tl.to(
      el,
      { x: p.sway, duration: p.duration / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 },
      0,
    )
    tl.to(
      el,
      { rotate: 22 * p.rotateDir, duration: p.duration / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 },
      0,
    )
    tl.to(el, { opacity: 0, duration: 1.6, ease: 'power2.in' }, Math.max(p.duration - 1.6, 0))

    timelines.push(tl)
  })
}

onMounted(() => {
  if (!prefersReducedMotion.value) animate()
})

onUnmounted(() => {
  timelines.forEach((tl) => tl.kill())
})
</script>

<template>
  <div ref="petalsRoot" class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div
      v-for="p in petals"
      :key="p.id"
      class="petal absolute top-0"
      :class="p.tone"
      :style="{ left: p.left + '%', width: 15 * p.scale + 'px', height: 19 * p.scale + 'px' }"
    >
      <svg viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.5 0C11.2 3.2 14 7 14 10.8 14 14.9 11.1 17.9 7.5 19 3.9 17.9 1 14.9 1 10.8 1 7 3.8 3.2 7.5 0Z"
          fill="currentColor"
        />
      </svg>
    </div>
  </div>
</template>
