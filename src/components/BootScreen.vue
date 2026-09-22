<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { BootStep } from '../composables/useAssetsReady'
import { useI18n } from '../i18n'
import { useReducedMotion } from '../composables/useReducedMotion'

const props = defineProps<{ ready: boolean; steps: BootStep[] }>()
const emit = defineEmits<{ done: [] }>()

const { t } = useI18n()
const reduced = useReducedMotion()

/* Terminal-style typewriter for the header line: plain setInterval, no GSAP
   dependency (GSAP may still be downloading while this is on screen). */
const header = 'SYSTEM://WEDDING_NOTIFICATION'
const typed = ref(reduced.value ? header : '')
let timer: number | undefined

const leaving = ref(false)
const progress = computed(() => props.steps.filter((s) => s.done).length / props.steps.length)

onMounted(() => {
  // Take over from the static #boot painted by index.html (same look, no flash)
  document.getElementById('boot')?.remove()

  if (!reduced.value) {
    let i = 0
    timer = window.setInterval(() => {
      i++
      typed.value = header.slice(0, i)
      if (i >= header.length) window.clearInterval(timer)
    }, 28)
  }
})

watch(
  () => props.ready,
  (ok) => {
    if (!ok) return
    window.clearInterval(timer)
    typed.value = header
    // Show READY for a beat, then wipe out
    window.setTimeout(() => {
      leaving.value = true
      window.setTimeout(() => emit('done'), reduced.value ? 0 : 520)
    }, 350)
  },
  { immediate: true },
)

onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <div
    class="boot fixed inset-0 z-[100] bg-paper text-ink flex flex-col items-center justify-center px-6 font-mono select-none"
    :class="{ 'is-leaving': leaving }"
    role="status"
    aria-live="polite"
  >
    <div class="w-full max-w-sm">
      <div class="sys text-ink">
        <span class="text-ink-3">{{ typed.slice(0, 9) }}</span>{{ typed.slice(9) }}<span v-if="!ready" class="cursor-blink inline-block w-[.6em] h-[1.1em] bg-ink align-[-0.15em] ml-1" />
      </div>

      <ol class="mt-6 space-y-1.5 sys">
        <li v-for="s in steps" :key="s.id" class="flex items-baseline gap-3">
          <span class="text-ink-3">&gt;</span>
          <span class="flex-1 tracking-wide2">{{ s.label }}</span>
          <span class="tabular-nums" :class="s.done ? 'text-accent' : 'text-ink-3'">
            {{ s.done ? '[ OK ]' : '[ .. ]' }}
          </span>
        </li>
        <li class="flex items-baseline gap-3 pt-2 text-ink-2">
          <span class="text-ink-3">&gt;</span>
          <span class="flex-1">{{ ready ? t.bootReady : t.bootLine1 }}</span>
        </li>
      </ol>

      <!-- Segmented progress gauge: discrete ticks, not a smooth fill -->
      <div class="mt-6 grid grid-cols-12 gap-[3px]" aria-hidden="true">
        <span
          v-for="i in 12"
          :key="i"
          class="h-[3px] transition-colors duration-150"
          :class="i / 12 <= progress + 0.001 ? 'bg-accent' : 'bg-line'"
        />
      </div>

      <div class="mt-3 flex justify-between sys text-ink-3">
        <span>{{ Math.round(progress * 100).toString().padStart(3, '0') }}%</span>
        <span>v1.0.0</span>
      </div>
    </div>

    <!-- Corner brackets -->
    <span class="corner tl" /><span class="corner tr" /><span class="corner bl" /><span class="corner br" />
  </div>
</template>

<style scoped>
.boot {
  transition: clip-path 520ms cubic-bezier(0.7, 0, 0.3, 1), opacity 400ms linear 120ms;
  clip-path: inset(0 0 0 0);
}
.boot.is-leaving {
  clip-path: inset(0 0 100% 0);
  opacity: 0;
}
.corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1px solid var(--color-ink-2);
}
.corner.tl { top: 14px; left: 14px; border-right: 0; border-bottom: 0; }
.corner.tr { top: 14px; right: 14px; border-left: 0; border-bottom: 0; }
.corner.bl { bottom: 14px; left: 14px; border-right: 0; border-top: 0; }
.corner.br { bottom: 14px; right: 14px; border-left: 0; border-top: 0; }
@media (prefers-reduced-motion: reduce) {
  .boot { transition: none; }
}
</style>
