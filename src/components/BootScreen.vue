<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import FlourishIcon from './icons/FlourishIcon.vue'
import BotanicalDivider from './BotanicalDivider.vue'
import type { BootStep } from '../composables/useAssetsReady'
import { useI18n } from '../i18n'
import { useReducedMotion } from '../composables/useReducedMotion'

const props = defineProps<{ ready: boolean; steps: BootStep[] }>()
const emit = defineEmits<{ done: [] }>()

const { t } = useI18n()
const reduced = useReducedMotion()

const header = computed(() => t.value.sysHeader)
const typed = ref(reduced.value ? header.value : '')
let timer: number | undefined

const leaving = ref(false)
const progress = computed(() => props.steps.filter((s) => s.done).length / props.steps.length)

onMounted(() => {
  document.getElementById('boot')?.remove()

  if (!reduced.value) {
    let i = 0
    const run = () => {
      const text = header.value
      i++
      typed.value = text.slice(0, i)
      if (i >= text.length) window.clearInterval(timer)
    }
    timer = window.setInterval(run, 36)
  }
})

watch(header, (text) => {
  if (props.ready || reduced.value) typed.value = text
})

watch(
  () => props.ready,
  (ok) => {
    if (!ok) return
    window.clearInterval(timer)
    typed.value = header.value
    window.setTimeout(() => {
      leaving.value = true
      window.setTimeout(() => emit('done'), reduced.value ? 0 : 700)
    }, 420)
  },
  { immediate: true },
)

onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <div
    class="boot fixed inset-0 z-[100] bg-wash text-ink flex flex-col items-center justify-center px-6 select-none"
    :class="{ 'is-leaving': leaving }"
    role="status"
    aria-live="polite"
  >
    <div class="w-full max-w-sm text-center">
      <FlourishIcon class="mx-auto w-7 h-7 text-accent mb-6" />

      <p class="sys text-accent tracking-wide2 min-h-[1.4em]">
        {{ typed }}<span
          v-if="!ready"
          class="cursor-blink inline-block w-[.45em] h-[.85em] bg-accent align-[-0.08em] ml-1"
          aria-hidden="true"
        />
      </p>

      <BotanicalDivider class="mt-5 mb-6" />

      <ol class="space-y-2 font-body text-sm text-ink-2">
        <li v-for="s in steps" :key="s.id" class="flex items-baseline justify-between gap-4">
          <span class="tracking-wide2 uppercase text-[0.7rem]">{{ s.label }}</span>
          <span class="tabular-nums text-[0.7rem] tracking-sys" :class="s.done ? 'text-accent' : 'text-ink-3'">
            {{ s.done ? '✦' : '·' }}
          </span>
        </li>
      </ol>

      <p class="mt-5 font-body text-ink-2 text-sm">
        {{ ready ? t.bootReady : t.bootLine1 }}
      </p>

      <!-- Soft gold progress line -->
      <div class="mt-6 h-px bg-line/70 overflow-hidden" aria-hidden="true">
        <div
          class="h-full bg-accent origin-left transition-[transform] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
          :style="{ transform: `scaleX(${Math.max(0.06, progress)})` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.boot {
  transition: opacity 700ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.boot.is-leaving {
  opacity: 0;
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .boot { transition: none; }
}
</style>
