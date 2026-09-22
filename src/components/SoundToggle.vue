<script setup lang="ts">
import { useAudio } from '../composables/useAudio'
import { useI18n } from '../i18n'

const { enabled, toggle } = useAudio()
const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-2 rounded-sm border border-line bg-paper-2/75 backdrop-blur-[2px] px-3 py-2 font-body text-[11px] font-medium tracking-sys uppercase transition-colors"
    :class="enabled ? 'text-ink' : 'text-ink-3 hover:text-ink-2'"
    :aria-pressed="enabled"
    :aria-label="enabled ? t.soundOff : t.soundOn"
    :title="enabled ? t.soundOff : t.soundOn"
    @click="toggle"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 9.5h4l5-4v13l-5-4H4z" />
      <template v-if="enabled">
        <path d="M16.5 8.5a5 5 0 0 1 0 7" />
        <path d="M19 6a8.5 8.5 0 0 1 0 12" />
      </template>
      <path v-else d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
    </svg>
    <span class="hidden sm:inline">{{ t.sound }}</span>
    <span class="inline-block w-1.5 h-1.5 rounded-full" :class="enabled ? 'bg-accent' : 'bg-line'" aria-hidden="true" />
  </button>
</template>
