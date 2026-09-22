<script setup lang="ts">
// A quiet field of big, outlined hearts scattered across the whole page —
// fixed behind all content, very low opacity, so it reads as texture/mood
// rather than decoration competing with the text.
import { onMounted, ref } from 'vue'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const { prefersReducedMotion } = useReducedMotion()
const root = ref<HTMLDivElement | null>(null)

const TONES = ['gold', 'burgundy', 'ink'] as const
const TONE_COLORS: Record<(typeof TONES)[number], string> = {
  gold: 'var(--color-gold)',
  burgundy: 'var(--color-burgundy)',
  ink: 'var(--color-ink)',
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

interface HeartSpec {
  id: number
  top: number
  left: number
  size: number
  rotate: number
  opacity: number
  tone: (typeof TONES)[number]
  duration: number
  delay: number
}

const HEART_COUNT = 8

const hearts: HeartSpec[] = Array.from({ length: HEART_COUNT }, (_, i) => ({
  id: i,
  top: rand(2, 90),
  left: rand(2, 88),
  size: rand(100, 230),
  rotate: rand(-18, 18),
  opacity: rand(0.05, 0.12),
  tone: TONES[i % TONES.length],
  duration: rand(7, 13),
  delay: rand(0, 4),
}))

onMounted(() => {
  if (!root.value || prefersReducedMotion.value) return
  const els = root.value.querySelectorAll<HTMLElement>('.heart-outline')
  els.forEach((el, i) => {
    const h = hearts[i]
    if (!h) return
    gsap.to(el, {
      scale: 1.06,
      duration: h.duration,
      delay: h.delay,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '50% 50%',
    })
  })
})
</script>

<template>
  <div ref="root" class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <svg
      v-for="h in hearts"
      :key="h.id"
      class="heart-outline absolute"
      :style="{
        top: h.top + '%',
        left: h.left + '%',
        width: h.size + 'px',
        height: h.size + 'px',
        transform: `rotate(${h.rotate}deg)`,
        opacity: h.opacity,
      }"
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d="M50 90 C20 66 -6 40 18 18 C33 4 50 13 50 30 C50 13 67 4 82 18 C106 40 80 66 50 90 Z"
        :stroke="TONE_COLORS[h.tone]"
        stroke-width="1.4"
      />
    </svg>
  </div>
</template>
