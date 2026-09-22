<script setup lang="ts">
/** Soft ornamental cursor — desktop only (mounted behind a pointer:fine check). */
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
  pos.x += (target.x - pos.x) * 0.32
  pos.y += (target.y - pos.y) * 0.32
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
    <svg class="cur-svg" width="34" height="34" viewBox="-17 -17 34 34" fill="none" stroke="#2e2620" stroke-width="1" stroke-linecap="round">
      <!-- delicate fleur / petal cross -->
      <path d="M0 -13C2 -8 2 -4 0 -1C-2 -4 -2 -8 0 -13Z" fill="#d98b8b" fill-opacity="0.35" />
      <path d="M0 13C2 8 2 4 0 1C-2 4 -2 8 0 13Z" fill="#d98b8b" fill-opacity="0.35" />
      <path d="M-13 0C-8 2 -4 2 -1 0C-4 -2 -8 -2 -13 0Z" fill="#d4af6a" fill-opacity="0.4" />
      <path d="M13 0C8 2 4 2 1 0C4 -2 8 -2 13 0Z" fill="#d4af6a" fill-opacity="0.4" />
      <circle r="1.4" fill="#b8863b" stroke="none" />
      <circle class="ring" r="7" stroke="#b8863b" stroke-opacity="0.45" />
    </svg>
  </div>
</template>

<style scoped>
.cur { opacity: 0; transition: opacity 220ms linear; will-change: transform; }
.cur.is-visible { opacity: 1; }
.cur-svg { display: block; margin: -17px 0 0 -17px; transition: transform 200ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.ring { transition: r 200ms cubic-bezier(0.22, 0.61, 0.36, 1), stroke-opacity 200ms linear; }
.cur.is-hot .cur-svg { transform: scale(1.18); }
.cur.is-hot .ring { stroke-opacity: 0.85; }
</style>
