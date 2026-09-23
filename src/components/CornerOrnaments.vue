<script setup lang="ts">
// Quiet botanical flourishes tucked into the four screen corners — a
// slow curling branch with a few leaves and a small blossom, echoing the
// same line-art language as BotanicalDivider / GrowingFlower. Fixed to
// the viewport (not the page), so they frame every screen as you scroll,
// like the printed corners of a wedding invitation.
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const { prefersReducedMotion } = useReducedMotion()
const root = ref<HTMLDivElement | null>(null)

const CORNERS = [
  { id: 'tl', wrapper: 'top-2 left-2 sm:top-4 sm:left-4' },
  { id: 'tr', wrapper: 'top-2 right-2 sm:top-4 sm:right-4 -scale-x-100' },
  { id: 'bl', wrapper: 'bottom-2 left-2 sm:bottom-4 sm:left-4 -scale-y-100' },
  { id: 'br', wrapper: 'bottom-2 right-2 sm:bottom-4 sm:right-4 -scale-x-100 -scale-y-100' },
] as const

let tweens: gsap.core.Tween[] = []

onMounted(() => {
  if (!root.value || prefersReducedMotion.value) return
  // Animate the inner SVG, not the outer slot — the outer element also
  // carries Tailwind's mirroring scale() classes, and letting GSAP write
  // its own transform there would clobber/fight that scale and distort
  // the box (pushing some corners off-screen).
  const branches = root.value.querySelectorAll<HTMLElement>('.corner-ornament-svg')
  branches.forEach((el, i) => {
    tweens.push(
      gsap.to(el, {
        rotate: i % 2 === 0 ? 2.5 : -2.5,
        duration: 6.5 + i * 0.6,
        delay: i * 0.3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '0% 0%',
      }),
    )
  })
})

onUnmounted(() => {
  tweens.forEach((tw) => tw.kill())
  tweens = []
})
</script>

<template>
  <div ref="root" class="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
    <div
      v-for="c in CORNERS"
      :key="c.id"
      class="corner-slot absolute h-16 w-16 opacity-70 sm:h-20 sm:w-20 md:h-28 md:w-28"
      :class="c.wrapper"
    >
      <svg viewBox="0 0 120 120" fill="none" class="corner-ornament-svg h-full w-full">
        <path
          d="M4 4 C 34 8, 20 46, 56 52 C 88 57, 78 92, 112 98"
          stroke="var(--color-gold)"
          stroke-width="1.3"
          stroke-linecap="round"
          opacity="0.8"
        />

        <g transform="translate(18 14) rotate(-28)">
          <path d="M0 0 C 8 -6 18 -6 26 0 C 18 6 8 6 0 0 Z" fill="var(--color-gold-soft)" opacity="0.75" />
        </g>
        <g transform="translate(34 40) rotate(18)">
          <path d="M0 0 C 7 -5 15 -5 22 0 C 15 5 7 5 0 0 Z" fill="var(--color-burgundy)" opacity="0.35" />
        </g>
        <g transform="translate(66 60) rotate(-20)">
          <path d="M0 0 C 8 -6 18 -6 26 0 C 18 6 8 6 0 0 Z" fill="var(--color-gold-soft)" opacity="0.7" />
        </g>

        <g transform="translate(96 90)">
          <g v-for="p in 5" :key="p" :transform="`rotate(${p * 72})`">
            <path d="M0 0 C -4 -6 -3 -13 0 -16 C 3 -13 4 -6 0 0 Z" fill="var(--color-gold-soft)" opacity="0.85" />
          </g>
          <circle r="2.6" fill="var(--color-burgundy)" />
        </g>
      </svg>
    </div>
  </div>
</template>
