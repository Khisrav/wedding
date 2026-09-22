<script setup lang="ts">
/**
 * Falling petals on a single <canvas>. One draw call per petal, no DOM nodes,
 * no filters. Physics runs in a plain loop; GSAP (when available) drives the
 * global "wind" and the initial fade-in so the scene feels choreographed.
 *
 * A share of petals "settles" near the left/right edges of the screen and
 * stays there; the rest respawn at the top.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { loadGsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const props = defineProps<{ active: boolean }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const reduced = useReducedMotion()

type Petal = {
  x: number; y: number
  size: number
  angle: number; spin: number
  vy: number; vx: number
  phase: number; sway: number
  color: string
  alpha: number
  settled: boolean
  settleTarget: number // y where it should rest, or -1 (never settles)
}

// Ochre / dusty crimson / bone — no pastel pink
const COLORS = ['#a8823e', '#b5533f', '#8f6b3a', '#c9a45c', '#9c3f36', '#efe8d6']

let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0, dpr = 1
let petals: Petal[] = []
let raf = 0
let running = false
let inView = true
let lastT = 0
const scene = { wind: 0, alpha: 0 } // tweened by GSAP if present

const rand = (a: number, b: number) => a + Math.random() * (b - a)

function spawn(fromTop = true): Petal {
  const edge = Math.random() < 0.32 // ~1/3 will settle near the edges
  const side = Math.random() < 0.5 ? -1 : 1
  const x = edge
    ? (side < 0 ? rand(0, W * 0.16) : rand(W * 0.84, W))
    : rand(-20, W + 20)
  return {
    x,
    y: fromTop ? rand(-H * 0.4, -20) : rand(-20, H),
    size: rand(5, 11),
    angle: rand(0, Math.PI * 2),
    spin: rand(-1.2, 1.2),
    vy: rand(28, 62),
    vx: rand(-8, 8),
    phase: rand(0, Math.PI * 2),
    sway: rand(10, 28),
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    alpha: rand(0.55, 0.9),
    settled: false,
    settleTarget: edge ? rand(H * 0.72, H - 8) : -1,
  }
}

function drawPetal(p: Petal, alphaMul: number) {
  const c = ctx!
  c.save()
  c.translate(p.x, p.y)
  c.rotate(p.angle)
  c.globalAlpha = p.alpha * alphaMul
  c.fillStyle = p.color
  const s = p.size
  c.beginPath()
  c.moveTo(0, -s)
  c.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.7, 0, s)
  c.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.9, -s * 0.6, 0, -s)
  c.closePath()
  c.fill()
  // hairline midrib, very subtle
  c.globalAlpha = p.alpha * alphaMul * 0.35
  c.strokeStyle = '#2b2620'
  c.lineWidth = 0.5
  c.beginPath()
  c.moveTo(0, -s * 0.7)
  c.lineTo(0, s * 0.7)
  c.stroke()
  c.restore()
}

function step(dt: number) {
  const c = ctx!
  c.clearRect(0, 0, W, H)
  const t = performance.now() / 1000
  let settledCount = 0
  for (let i = 0; i < petals.length; i++) {
    const p = petals[i]!
    if (p.settled) {
      settledCount++
      // resting petals breathe almost imperceptibly with the wind
      drawPetal({ ...p, angle: p.angle + Math.sin(t * 0.6 + p.phase) * 0.02 }, scene.alpha)
      continue
    }
    p.y += p.vy * dt
    p.x += (p.vx + scene.wind * 18 + Math.cos(t * 0.9 + p.phase) * p.sway * 0.35) * dt
    p.angle += p.spin * dt
    if (p.settleTarget > 0 && p.y >= p.settleTarget) {
      p.y = p.settleTarget
      p.settled = true
      p.alpha *= 0.85
    } else if (p.y > H + 20 || p.x < -40 || p.x > W + 40) {
      petals[i] = spawn(true)
    }
    drawPetal(p, scene.alpha)
  }
  // Keep the resting pile bounded; recycle the oldest resting petals
  const maxSettled = Math.round(petals.length * 0.4)
  if (settledCount > maxSettled) {
    let removed = 0
    for (let i = 0; i < petals.length && removed < settledCount - maxSettled; i++) {
      if (petals[i]!.settled) { petals[i] = spawn(true); removed++ }
    }
  }
}

function loop(now: number) {
  if (!running) return
  const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016)
  lastT = now
  step(dt)
  raf = requestAnimationFrame(loop)
}

function start() {
  if (running || !ctx || !inView || document.hidden) return
  running = true
  lastT = performance.now()
  raf = requestAnimationFrame(loop)
}
function stop() {
  running = false
  cancelAnimationFrame(raf)
}

function resize() {
  const el = canvas.value
  if (!el || !el.parentElement) return
  const r = el.parentElement.getBoundingClientRect()
  W = Math.max(1, Math.round(r.width))
  H = Math.max(1, Math.round(r.height))
  dpr = Math.min(window.devicePixelRatio || 1, 1.75) // cap: fill-rate on cheap phones
  el.width = Math.round(W * dpr)
  el.height = Math.round(H * dpr)
  el.style.width = W + 'px'
  el.style.height = H + 'px'
  ctx = el.getContext('2d', { alpha: true })
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)

  const area = W * H
  const count = reduced.value ? 14 : Math.round(Math.min(90, Math.max(34, area / 14000)))
  petals = Array.from({ length: count }, () => spawn(!reduced.value))
  if (reduced.value) {
    // Static still frame: everything already resting, no loop
    petals.forEach((p) => {
      p.settled = true
      p.y = rand(H * 0.7, H - 8)
      p.x = Math.random() < 0.5 ? rand(0, W * 0.2) : rand(W * 0.8, W)
    })
    scene.alpha = 1
    ctx && step(0)
  }
}

let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null
let killGsap: (() => void) | null = null

onMounted(async () => {
  resize()
  ro = new ResizeObserver(() => { resize(); if (reduced.value) step(0) })
  ro.observe(canvas.value!.parentElement!)

  io = new IntersectionObserver(([e]) => {
    inView = !!e?.isIntersecting
    if (inView && props.active) start(); else stop()
  }, { threshold: 0.02 })
  io.observe(canvas.value!)

  document.addEventListener('visibilitychange', onVis)

  if (reduced.value) return

  const g = await loadGsap()
  if (g) {
    const tl = g.gsap.timeline()
    // Wind: slow, endlessly wandering; the whole scene leans with it
    tl.to(scene, { wind: () => rand(-1, 1), duration: 6, ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true }, 0)
    killGsap = () => tl.kill()
  }
})

function onVis() { document.hidden ? stop() : props.active && start() }

watch(
  () => props.active,
  async (on) => {
    if (!on) return stop()
    start()
    const g = await loadGsap()
    if (g && !reduced.value) g.gsap.to(scene, { alpha: 1, duration: 2.2, ease: 'power2.out' })
    else scene.alpha = 1
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stop()
  ro?.disconnect()
  io?.disconnect()
  killGsap?.()
  document.removeEventListener('visibilitychange', onVis)
})
</script>

<template>
  <canvas ref="canvas" class="absolute inset-0 block pointer-events-none" aria-hidden="true" />
</template>
