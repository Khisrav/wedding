<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Lang } from '../i18n'
import ChevronDownIcon from './icons/ChevronDownIcon.vue'

const props = defineProps<{ lang: Lang; label: string }>()
const emit = defineEmits<{ (e: 'set', lang: Lang): void }>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const options: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'tj', label: 'TJ' },
]

const currentLabel = computed(
  () => options.find((o) => o.code === props.lang)?.label ?? 'RU',
)

function toggle() {
  open.value = !open.value
}

function select(code: Lang) {
  emit('set', code)
  open.value = false
}

function onPointerDown(e: PointerEvent) {
  if (!open.value || !rootRef.value) return
  if (!rootRef.value.contains(e.target as Node)) open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootRef" class="fixed right-4 top-4 z-40 md:right-6 md:top-6">
    <button
      type="button"
      class="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.2em] text-ink/45 transition-colors hover:text-ink/70"
      :aria-label="label"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span>{{ currentLabel }}</span>
      <ChevronDownIcon
        class="h-3 w-3 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <Transition name="lang-menu">
      <ul
        v-if="open"
        role="listbox"
        :aria-label="label"
        class="absolute right-0 top-full mt-1.5 min-w-[3.25rem] overflow-hidden rounded-md border border-ink/8 bg-cream/95 py-0.5 text-[11px] font-medium uppercase tracking-[0.2em] shadow-sm backdrop-blur-sm"
      >
        <li v-for="opt in options" :key="opt.code" role="option" :aria-selected="lang === opt.code">
          <button
            type="button"
            class="block w-full px-3 py-1.5 text-left transition-colors"
            :class="lang === opt.code ? 'text-gold' : 'text-ink/50 hover:text-ink/80'"
            @click="select(opt.code)"
          >
            {{ opt.label }}
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.lang-menu-enter-active,
.lang-menu-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.lang-menu-enter-from,
.lang-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
