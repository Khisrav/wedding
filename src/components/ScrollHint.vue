<script setup lang="ts">
import { useI18n } from '../i18n'
import { tick } from '../composables/useAudio'

const props = defineProps<{ target: string }>()
const { t } = useI18n()

function go() {
  tick(784)
  document.querySelector(props.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <button type="button" class="group flex flex-col items-center gap-2 sys text-ink-2 hover:text-ink transition-colors" @click="go">
    <span>{{ t.scroll }}</span>
    <span class="relative block w-px h-8 bg-line overflow-hidden" aria-hidden="true">
      <span class="scroll-dot absolute left-0 top-0 w-px h-3 bg-ink" />
    </span>
    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
      <path d="M1 1l6 6 6-6" />
    </svg>
  </button>
</template>

<style scoped>
.scroll-dot { animation: drop 1.6s cubic-bezier(0.2, 0, 0, 1) infinite; }
@keyframes drop {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(300%); }
}
@media (prefers-reduced-motion: reduce) { .scroll-dot { animation: none; } }
</style>
