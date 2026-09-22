<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import BootScreen from './components/BootScreen.vue'
import HeroSection from './components/HeroSection.vue'
import InfoSection from './components/InfoSection.vue'
import LangSwitch from './components/LangSwitch.vue'
import ScreenDots from './components/ScreenDots.vue'
import { useI18n } from './i18n'
import { useAssetsReady } from './composables/useAssetsReady'
import { useReducedMotion } from './composables/useReducedMotion'

const { lang, setLang, t } = useI18n()
const { ready, waitForAssets } = useAssetsReady()
const { prefersReducedMotion } = useReducedMotion()

const containerRef = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
let observer: IntersectionObserver | null = null

onMounted(async () => {
  document.documentElement.lang = t.value.meta.htmlLang
  await waitForAssets()
  await nextTick()

  const sections = containerRef.value?.querySelectorAll<HTMLElement>('section') ?? []
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const idx = Array.from(sections).indexOf(entry.target as HTMLElement)
          if (idx !== -1) activeIndex.value = idx
        }
      }
    },
    { threshold: 0.5 },
  )
  sections.forEach((s) => observer?.observe(s))
})

onUnmounted(() => observer?.disconnect())

function goToSection(index: number) {
  const sections = containerRef.value?.querySelectorAll<HTMLElement>('section')
  const target = sections?.[index]
  target?.scrollIntoView({ behavior: prefersReducedMotion.value ? 'auto' : 'smooth', block: 'start' })
}
</script>

<template>
  <Transition name="boot-fade">
    <BootScreen v-if="!ready" />
  </Transition>

  <LangSwitch :lang="lang" :label="t.langSwitch.label" @set="setLang" />
  <ScreenDots :active="activeIndex" :count="2" @select="goToSection" />

  <main ref="containerRef" class="w-full md:h-screen md:snap-y md:snap-mandatory md:overflow-y-scroll">
    <HeroSection :start="ready" />
    <InfoSection />
  </main>
</template>

<style>
.boot-fade-enter-active,
.boot-fade-leave-active {
  transition: opacity 0.5s ease;
}
.boot-fade-enter-from,
.boot-fade-leave-to {
  opacity: 0;
}
</style>
