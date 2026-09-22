<script setup lang="ts">
import { useI18n, type Lang } from '../i18n'
import { tick } from '../composables/useAudio'

const { lang, setLang, t } = useI18n()
const options: { id: Lang; label: string }[] = [
  { id: 'tj', label: 'TJ' },
  { id: 'ru', label: 'RU' },
]
function pick(l: Lang) {
  if (l === lang.value) return
  tick(1046)
  setLang(l)
}
</script>

<template>
  <div
    class="flex rounded-sm border border-line bg-paper-2/75 backdrop-blur-[2px] overflow-hidden"
    role="group"
    :aria-label="t.langSwitch"
  >
    <button
      v-for="o in options"
      :key="o.id"
      type="button"
      class="relative px-3 py-2 font-body text-[11px] font-medium tracking-sys uppercase transition-colors"
      :class="o.id === lang ? 'text-ink' : 'text-ink-3 hover:text-ink-2'"
      :aria-pressed="o.id === lang"
      :lang="o.id === 'tj' ? 'tg' : 'ru'"
      @click="pick(o.id)"
    >
      {{ o.label }}
      <span
        v-if="o.id === lang"
        class="absolute left-2 right-2 -bottom-px h-px bg-accent transition-[left,right] duration-300"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
