<script setup lang="ts">
/** HUD reticle cursor. Desktop only (mounted behind a pointer:fine check). */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const el = ref<HTMLElement | null>(null)
const target = { x: -100, y: -100 }
const pos = { x: -100, y: -100 }
let raf = 0
let hovering = false
let visible = false

function onMove(e: PointerEvent) {
  target.x = e.clientX
  target.y = e.clientY
  if (!visible) { visible = true; el.value?.classList.add('is-visible') }
  const t = e.target as Element | null
  const hot = !!t?.closest('a, button, [role="button"]')
  if (hot !== hovering) {
    hovering = hot
    el.value?.classList.toggle('is-hot', hot)
  }
}
function onLeave() { visible = false; el.value?.classList.remove('is-visible') }

function loop() {
  pos.x += (target.x - pos.x) * 0.35
  pos.y += (target.y - pos.y) * 0.35
  if (el.value) el.value.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  document.documentElement.classList.add('has-cursor')
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('mouseleave', onLeave)
  raf = requestAnimationFrame(loop)
})
onBeforeUnmount(() => {
  document.documentElement.classList.remove('has-cursor')
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('mouseleave', onLeave)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div ref="el" class="cur fixed left-0 top-0 z-[90] pointer-events-none" aria-hidden="true">
    <svg class="cur-svg" width="36" height="36" viewBox="-18 -18 36 36" fill="none" stroke="#2b2620" stroke-width="1">
      <!-- crosshair with a gap in the middle -->
      <path d="M0 -14V-5M0 5V14M-14 0H-5M5 0H14" />
      <!-- corner brackets, expand on hover -->
      <g class="brackets">
        <path d="M-11 -7V-11H-7M7 -11H11V-7M11 7V11H7M-7 11H-11V7" />
      </g>
      <circle r="1.2" fill="#a8823e" stroke="none" />
    </svg>
  </div>
</template>

<style scoped>
.cur { opacity: 0; transition: opacity 200ms linear; will-change: transform; }
.cur.is-visible { opacity: 1; }
.cur-svg { display: block; margin: -18px 0 0 -18px; transition: transform 120ms linear; }
.brackets { transition: transform 120ms linear; transform-origin: 0 0; }
.cur.is-hot .brackets { transform: scale(1.35); stroke: #a8823e; }
.cur.is-hot .cur-svg { transform: rotate(45deg); }
</style>
