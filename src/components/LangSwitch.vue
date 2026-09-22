<script setup lang="ts">
import type { Lang } from '../i18n'

defineProps<{ lang: Lang; label: string }>()
const emit = defineEmits<{ (e: 'set', lang: Lang): void }>()
</script>

<template>
  <div
    class="fixed right-4 top-4 z-40 flex items-center gap-0.5 rounded-full border border-ink/10 bg-cream/80 p-1 text-[11px] font-medium uppercase tracking-widest backdrop-blur-sm md:right-6 md:top-6"
    role="group"
    :aria-label="label"
  >
    <button
      type="button"
      class="rounded-full px-2.5 py-1.5 transition-colors"
      :class="lang === 'ru' ? 'bg-gold text-cream' : 'text-ink/50'"
      :aria-pressed="lang === 'ru'"
      @click="emit('set', 'ru')"
    >
      RU
    </button>
    <button
      type="button"
      class="rounded-full px-2.5 py-1.5 transition-colors"
      :class="lang === 'tj' ? 'bg-gold text-cream' : 'text-ink/50'"
      :aria-pressed="lang === 'tj'"
      @click="emit('set', 'tj')"
    >
      TJ
    </button>
  </div>
</template>
