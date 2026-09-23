<script setup lang="ts">
// Autumn leaves drift down the hero and come to rest on the two names.
// Each leaf is pinned to a spot along a name: GSAP only animates the offset
// from that spot, so a resize or a language change keeps landed leaves seated
// on the letters.
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const props = defineProps<{ active: boolean }>()

const { prefersReducedMotion } = useReducedMotion()

const root = ref<HTMLElement | null>(null)

type ShapeName = 'maple' | 'oak' | 'birch'

interface LeafShape {
  viewBox: string
  /** width / height of the viewBox, so the leaf keeps its silhouette. */
  aspect: number
  body: string
  stem: string
  veins: string[]
}

const SHAPES: Record<ShapeName, LeafShape> = {
  maple: {
    viewBox: '18 2 64 106',
    aspect: 64 / 106,
    body: `M50 8
      C52 20 58 24 72 22
      C64 30 66 40 78 46
      C68 50 64 58 66 68
      C58 62 54 70 50 82
      C46 70 42 62 34 68
      C36 58 32 50 22 46
      C34 40 36 30 28 22
      C42 24 48 20 50 8Z`,
    stem: 'M48.4 78 L50 104 L51.6 78Z',
    veins: ['M50 20 C50 36 50 54 50 76', 'M50 34 C60 30 66 28 72 26', 'M50 34 C40 30 34 28 28 26', 'M50 52 C60 50 68 48 74 46', 'M50 52 C40 50 32 48 26 46'],
  },
  oak: {
    viewBox: '12 2 76 106',
    aspect: 76 / 106,
    body: `M50 6
      C62 10 68 18 60 26
      C74 24 84 34 74 42
      C86 48 80 62 66 60
      C70 72 58 78 52 86
      C46 78 34 72 38 60
      C24 62 16 50 28 42
      C18 34 28 24 42 26
      C34 18 40 10 50 6Z`,
    stem: 'M48.4 82 L50 104 L51.6 82Z',
    veins: ['M50 16 C50 36 50 58 50 80', 'M50 30 C60 26 68 26 74 28', 'M50 30 C40 26 32 26 26 28', 'M50 50 C62 48 70 50 76 54', 'M50 50 C38 48 30 50 24 54'],
  },
  birch: {
    viewBox: '18 0 64 110',
    aspect: 64 / 110,
    body: `M50 4
      C66 16 78 38 70 62
      C64 82 56 98 50 106
      C44 98 36 82 30 62
      C22 38 34 16 50 4Z`,
    stem: '',
    veins: ['M50 16 C50 40 50 68 50 96', 'M50 32 C58 34 64 38 68 42', 'M50 32 C42 34 36 38 32 42', 'M50 52 C60 56 64 60 66 66', 'M50 52 C40 56 36 60 34 66', 'M50 72 C56 76 58 80 60 86', 'M50 72 C44 76 42 80 40 86'],
  },
}

interface Leaf {
  id: number
  nameIndex: 0 | 1
  /** 0 = left edge of the name, 1 = right edge. */
  along: number
  /** How far the leaf sinks into the cap height, 0–1. */
  drop: number
  /** Leaf height as a fraction of the name's line box. */
  scale: number
  rotation: number
  flutter: number
  shape: ShapeName
  color: string
  flip: boolean
  delay: number
  duration: number
  sway: number
  /** Portion of the fall already elapsed when the leaf appears, so a few are in frame immediately. */
  headStart: number
  opacity: number
}

const leaves: Leaf[] = [
  { id: 0, nameIndex: 0, along: 0.0, drop: 0.42, scale: 0.7, rotation: -28, flutter: 4, shape: 'maple', color: '#C47A3A', flip: false, delay: 0.45, duration: 5.6, sway: 34, headStart: 0.12, opacity: 0.92 },
  { id: 1, nameIndex: 0, along: 0.36, drop: 0.62, scale: 0.56, rotation: 16, flutter: -3.5, shape: 'birch', color: '#7C3F35', flip: true, delay: 1.15, duration: 5.1, sway: -26, headStart: 0, opacity: 0.88 },
  { id: 2, nameIndex: 0, along: 0.68, drop: 0.36, scale: 0.64, rotation: -10, flutter: 3, shape: 'oak', color: '#6E7340', flip: false, delay: 1.9, duration: 6.2, sway: 40, headStart: 0.08, opacity: 0.9 },
  { id: 3, nameIndex: 0, along: 0.98, drop: 0.52, scale: 0.5, rotation: 24, flutter: -4, shape: 'maple', color: '#A24B30', flip: true, delay: 2.4, duration: 5.4, sway: -22, headStart: 0, opacity: 0.94 },
  { id: 4, nameIndex: 1, along: -0.02, drop: 0.4, scale: 0.62, rotation: 20, flutter: 3.5, shape: 'oak', color: '#C9A15E', flip: false, delay: 0.7, duration: 5.8, sway: -32, headStart: 0.16, opacity: 0.9 },
  { id: 5, nameIndex: 1, along: 0.18, drop: 0.58, scale: 0.52, rotation: -18, flutter: -3, shape: 'birch', color: '#8A6232', flip: false, delay: 1.45, duration: 5.2, sway: 24, headStart: 0, opacity: 0.88 },
  { id: 6, nameIndex: 1, along: 0.38, drop: 0.34, scale: 0.72, rotation: 8, flutter: 4.5, shape: 'maple', color: '#D4A04C', flip: true, delay: 0.3, duration: 6.4, sway: -38, headStart: 0.2, opacity: 0.93 },
  { id: 7, nameIndex: 1, along: 0.56, drop: 0.55, scale: 0.48, rotation: -26, flutter: -3.5, shape: 'oak', color: '#8E3E32', flip: false, delay: 2.15, duration: 5.5, sway: 28, headStart: 0, opacity: 0.9 },
  { id: 8, nameIndex: 1, along: 0.76, drop: 0.4, scale: 0.6, rotation: 14, flutter: 3, shape: 'birch', color: '#A24B30', flip: true, delay: 1.0, duration: 5.0, sway: -20, headStart: 0.05, opacity: 0.86 },
  { id: 9, nameIndex: 1, along: 1.02, drop: 0.6, scale: 0.56, rotation: -14, flutter: -4, shape: 'maple', color: '#6E7340', flip: false, delay: 2.55, duration: 6.0, sway: 36, headStart: 0, opacity: 0.92 },
]

interface Spot {
  left: number
  top: number
  width: number
  height: number
}

const spots = ref<Record<number, Spot>>({})
const leafEls = new Map<number, HTMLElement>()
const timelines: gsap.core.Timeline[] = []
let resizeObserver: ResizeObserver | null = null
let measureRaf = 0
let started = false

function setLeafEl(id: number, el: unknown) {
  if (el instanceof HTMLElement) leafEls.set(id, el)
  else leafEls.delete(id)
}

function spotStyle(leaf: Leaf) {
  const spot = spots.value[leaf.id]
  return {
    left: spot ? `${spot.left}px` : '-9999px',
    top: spot ? `${spot.top}px` : '0px',
    width: spot ? `${spot.width}px` : '20px',
    height: spot ? `${spot.height}px` : '20px',
    color: leaf.color,
    zIndex: leaf.id + 1,
  }
}

// Playfair Display at leading-tight (1.25): share of the line box above the
// cap ink, and the cap height as a share of that same box. Measured from the
// rendered names so leaves sit on the letters, not in the line-gap above them.
const CAP_TOP = 0.247
const CAP_HEIGHT = 0.582

function measure() {
  const hero = root.value?.closest('section')
  if (!hero) return
  const heroRect = hero.getBoundingClientRect()
  const names = hero.querySelectorAll<HTMLElement>('.name-line')
  const next: Record<number, Spot> = {}

  for (const leaf of leaves) {
    const name = names[leaf.nameIndex]
    if (!name) continue
    const rect = name.getBoundingClientRect()
    const shape = SHAPES[leaf.shape]
    const height = Math.min(36, Math.max(17, rect.height * leaf.scale))
    const width = height * shape.aspect
    const inkTop = rect.top + rect.height * CAP_TOP
    const sink = Math.max(8, rect.height * CAP_HEIGHT * leaf.drop)
    const left = rect.left - heroRect.left + leaf.along * rect.width - width / 2
    const top = inkTop - heroRect.top - height + sink
    next[leaf.id] = { left, top, width, height }
  }

  spots.value = next
}

function scheduleMeasure() {
  cancelAnimationFrame(measureRaf)
  measureRaf = requestAnimationFrame(() => measure())
}

function restState(leaf: Leaf) {
  return { x: 0, y: 0, rotation: leaf.rotation, scaleX: leaf.flip ? -1 : 1, opacity: leaf.opacity }
}

function play() {
  if (started) return
  measure()
  if (Object.keys(spots.value).length === 0) return
  started = true

  for (const leaf of leaves) {
    const el = leafEls.get(leaf.id)
    const spot = spots.value[leaf.id]
    if (!el || !spot) continue

    if (prefersReducedMotion.value) {
      gsap.set(el, restState(leaf))
      continue
    }

    const full = spot.top + spot.height + 16
    const head = leaf.headStart
    const distance = full * (1 - head)
    const dur = leaf.duration * (1 - head)

    gsap.set(el, {
      x: leaf.sway,
      y: -distance,
      rotation: leaf.rotation + Math.sign(leaf.sway || 1) * 22,
      scaleX: leaf.flip ? -1 : 1,
      opacity: head > 0.04 ? leaf.opacity : 0,
    })

    const tl = gsap.timeline({ delay: leaf.delay })
    if (head <= 0.04) {
      tl.to(el, { opacity: leaf.opacity, duration: 0.7, ease: 'power2.out' }, 0)
    }
    tl.to(el, { y: -10, duration: dur * 0.8, ease: 'none' }, 0)
    tl.to(el, { y: 0, duration: dur * 0.2, ease: 'power2.out' })
    tl.to(el, { x: -leaf.sway * 0.35, duration: dur * 0.55, ease: 'sine.inOut' }, 0)
    tl.to(el, { x: 0, duration: dur * 0.45, ease: 'sine.out' }, dur * 0.55)
    tl.to(el, { rotation: leaf.rotation, duration: dur, ease: 'sine.inOut' }, 0)
    tl.to(el, { y: 2.5, duration: 0.16, ease: 'power1.out' })
    tl.to(el, { y: 0, duration: 0.4, ease: 'power2.out' })
    tl.to(el, {
      rotation: leaf.rotation + leaf.flutter,
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    timelines.push(tl)
  }
}

onMounted(async () => {
  const hero = root.value?.closest('section')
  const column = hero?.querySelector<HTMLElement>('.hero-copy')
  if (hero && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => scheduleMeasure())
    resizeObserver.observe(hero)
    if (column) resizeObserver.observe(column)
  }
  if (props.active) {
    await nextTick()
    play()
  }
})

watch(
  () => props.active,
  async (active) => {
    if (!active || !root.value) return
    await nextTick()
    play()
  },
)

onUnmounted(() => {
  cancelAnimationFrame(measureRaf)
  resizeObserver?.disconnect()
  timelines.forEach((tl) => tl.kill())
})
</script>

<template>
  <div ref="root" class="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
    <div
      v-for="leaf in leaves"
      :key="leaf.id"
      :ref="(el) => setLeafEl(leaf.id, el)"
      class="leaf absolute opacity-0"
      :style="spotStyle(leaf)"
    >
      <svg :viewBox="SHAPES[leaf.shape].viewBox" class="block h-full w-full overflow-visible" fill="none">
        <path :d="SHAPES[leaf.shape].body" fill="currentColor" />
        <path v-if="SHAPES[leaf.shape].stem" :d="SHAPES[leaf.shape].stem" fill="currentColor" />
        <path
          v-for="(vein, i) in SHAPES[leaf.shape].veins"
          :key="i"
          :d="vein"
          stroke="rgba(43, 36, 31, 0.28)"
          stroke-width="1.15"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.leaf {
  transform-origin: 50% 42%;
  filter: drop-shadow(0 1px 1.2px rgba(43, 36, 31, 0.22));
}
</style>
