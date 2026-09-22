<script setup lang="ts">
// A small flower that "grows": a long, gently S-curved stem draws itself
// upward (never a straight line), sprouting a couple of leaves as it
// rises, then a blossom blooms at the tip — even, uniform petals, like a
// real little flower.
import { onUnmounted, ref, watch } from 'vue'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const props = withDefaults(
  defineProps<{
    trigger: boolean
    size?: number
    petalCount?: number
    tone?: 'gold' | 'burgundy'
    mirror?: boolean
    delay?: number
  }>(),
  {
    size: 70,
    petalCount: 5,
    tone: 'gold',
    mirror: false,
    delay: 0,
  },
)

const { prefersReducedMotion } = useReducedMotion()
const svgRoot = ref<SVGSVGElement | null>(null)
let idleTween: gsap.core.Tween | null = null

// --- Stem: a long, wavy S-curve (never a straight line) rising from the
// base (near the text) up to where the blossom sits — deliberately as
// long as a name so it reads as a real stem, not a tiny flourish. ---
const STEM_LENGTH = 82
const stemPath = `M0 0 C -20 -18, 18 -30, 4 -${STEM_LENGTH * 0.5} C -10 -${STEM_LENGTH * 0.66}, 16 -${STEM_LENGTH * 0.86}, 7 -${STEM_LENGTH}`

const tip: [number, number] = [7, -STEM_LENGTH]

const leafAnchors = [
  { x: -13, y: -22, angle: -35 },
  { x: 12, y: -54, angle: 40 },
]

// --- Blossom: even, uniform petals (same size, evenly spaced) — a
// simple, classic little flower. ---
function rotatePoint([x, y]: [number, number], angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [x * Math.cos(rad) - y * Math.sin(rad), x * Math.sin(rad) + y * Math.cos(rad)]
}

const PETAL_SCALE = 0.82

const basePetalPoints: Array<[number, number]> = [
  [0, 0],
  [-12, -8],
  [-18, -28],
  [0, -44],
  [18, -28],
  [12, -8],
  [0, 0],
]

function petalPath(angleDeg: number): string {
  const pts = basePetalPoints.map(([x, y]) => rotatePoint([x * PETAL_SCALE, y * PETAL_SCALE], angleDeg))
  const f = (n: number) => n.toFixed(2)
  const [p0, c1, c2, t, c3, c4, p2] = pts
  return `M${f(p0[0])} ${f(p0[1])} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(t[0])} ${f(t[1])} C${f(c3[0])} ${f(c3[1])} ${f(c4[0])} ${f(c4[1])} ${f(p2[0])} ${f(p2[1])} Z`
}

const petals = Array.from({ length: props.petalCount }, (_, i) => ({
  id: i,
  d: petalPath((360 / props.petalCount) * i),
}))

const stamens = Array.from({ length: props.petalCount }, (_, i) => {
  const angle = (360 / props.petalCount) * i
  const [x, y] = rotatePoint([0, -9], angle)
  return { id: i, x, y }
})

const palette =
  props.tone === 'burgundy'
    ? { petal: 'rgba(124, 63, 53, 0.6)', center: 'var(--color-gold)', stem: 'rgba(124, 63, 53, 0.55)' }
    : { petal: 'var(--color-gold-soft)', center: 'var(--color-burgundy)', stem: 'var(--color-gold)' }

function playGrow() {
  if (!svgRoot.value) return
  const stemEl = svgRoot.value.querySelector<SVGPathElement>('.stem-path')
  const leaves = svgRoot.value.querySelectorAll<SVGElement>('.stem-leaf')
  const petalEls = svgRoot.value.querySelectorAll<SVGPathElement>('.flower-petal')
  const centerEl = svgRoot.value.querySelector<SVGCircleElement>('.flower-center')
  const stamenEls = svgRoot.value.querySelectorAll<SVGCircleElement>('.flower-stamen')
  if (!stemEl) return

  if (prefersReducedMotion.value) return

  const len = stemEl.getTotalLength()
  gsap.set(stemEl, { strokeDasharray: len, strokeDashoffset: len })
  gsap.set(leaves, { scale: 0, opacity: 0, transformOrigin: '0px 0px' })
  gsap.set(petalEls, { scale: 0, opacity: 0, transformOrigin: '0px 0px' })
  gsap.set([centerEl, ...Array.from(stamenEls)], { scale: 0, opacity: 0, transformOrigin: '0px 0px' })

  const tl = gsap.timeline({ delay: props.delay })
  tl.to(stemEl, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out' })
  leaves.forEach((leaf, i) => {
    tl.to(leaf, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }, 0.45 + i * 0.4)
  })
  tl.to(centerEl, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' }, 1.25)
  tl.to(petalEls, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.7)', stagger: 0.08 }, 1.35)
  tl.to(stamenEls, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out', stagger: 0.03 }, 1.55)
  tl.add(() => {
    if (!svgRoot.value || prefersReducedMotion.value) return
    idleTween = gsap.to(svgRoot.value, {
      rotate: props.mirror ? -3 : 3,
      duration: 5.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '50% 100%',
    })
  })
}

watch(
  () => props.trigger,
  (started) => {
    if (started) playGrow()
  },
  { immediate: true },
)

onUnmounted(() => idleTween?.kill())
</script>

<template>
  <svg
    ref="svgRoot"
    :width="size"
    :height="size * 1.55"
    viewBox="-40 -122 80 130"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    class="growing-flower"
    :style="{ transform: mirror ? 'scaleX(-1)' : undefined }"
  >
    <path
      class="stem-path"
      :d="stemPath"
      fill="none"
      :stroke="palette.stem"
      stroke-width="1.8"
      stroke-linecap="round"
    />

    <g
      v-for="(leaf, i) in leafAnchors"
      :key="`leaf-${i}`"
      class="stem-leaf"
      :transform="`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`"
    >
      <path d="M0 0 C5 -4 11 -4 16 0 C11 4 5 4 0 0 Z" :fill="palette.stem" opacity="0.8" />
    </g>

    <g :transform="`translate(${tip[0]} ${tip[1]})`">
      <path v-for="p in petals" :key="p.id" class="flower-petal" :d="p.d" :fill="palette.petal" />
      <circle
        v-for="s in stamens"
        :key="`stamen-${s.id}`"
        class="flower-stamen"
        :cx="s.x"
        :cy="s.y"
        r="1.8"
        :fill="palette.center"
      />
      <circle class="flower-center" cx="0" cy="0" r="6.5" :fill="palette.center" />
    </g>
  </svg>
</template>

<style scoped>
.growing-flower {
  display: block;
  overflow: visible;
}
</style>
