<script setup lang="ts">
import PhoneIcon from './icons/PhoneIcon.vue'
import { telHref } from '../config/event'
import { useI18n } from '../i18n'
import { tick } from '../composables/useAudio'

defineProps<{ role: string; name: string; phone: string; index: number }>()
const { t } = useI18n()
</script>

<template>
  <a
    :href="telHref(phone)"
    class="frame cut-corner group block bg-paper-2 p-4 sm:p-5 transition-colors hover:bg-paper-3/60 focus-visible:bg-paper-3/60"
    @click="tick(988)"
  >
    <span class="frame-tr" /><span class="frame-bl" />
    <div class="flex items-start gap-4">
      <span class="shrink-0 w-10 h-10 border border-line flex items-center justify-center text-ink-2 group-hover:text-accent group-hover:border-accent transition-colors">
        <PhoneIcon class="w-5 h-5" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="sys flex items-center justify-between gap-3">
          <span>{{ role }}</span>
          <span class="text-ink-3">{{ String(index).padStart(2, '0') }}</span>
        </div>
        <div class="mt-1 font-script text-xl sm:text-2xl text-ink leading-snug">{{ name }}</div>
        <div class="mt-2 font-mono text-[15px] tracking-[0.06em] tabular-nums text-ink underline decoration-line underline-offset-4 group-hover:decoration-accent">
          {{ phone }}
        </div>
      </div>
    </div>
    <div class="mt-4 flex items-center justify-between sys">
      <span class="text-ink-3">TEL_LINK</span>
      <span class="text-ink group-hover:text-accent transition-colors flex items-center gap-2">
        {{ t.call }}
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M0 4h11M7 1l4 3-4 3" /></svg>
      </span>
    </div>
  </a>
</template>
