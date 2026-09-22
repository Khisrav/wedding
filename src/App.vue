<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue'
import BootScreen from './components/BootScreen.vue'
import HeroSection from './components/HeroSection.vue'
import InfoSection from './components/InfoSection.vue'
import LangSwitch from './components/LangSwitch.vue'
import SoundToggle from './components/SoundToggle.vue'
import { bindDocumentLang } from './i18n'
import { useAssetsReady } from './composables/useAssetsReady'
import { tryAutoplay } from './composables/useAudio'

bindDocumentLang()

// Desktop-only HUD cursor, loaded lazily and only when a fine pointer exists.
const CustomCursor = defineAsyncComponent(() => import('./components/CustomCursor.vue'))
const finePointer = typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches

const { ready, steps } = useAssetsReady()
const booted = ref(false)

watch(booted, (on) => { if (on) void tryAutoplay() })
</script>

<template>
  <div class="bg-wash min-h-dvh text-ink">
    <BootScreen v-if="!booted" :ready="ready" :steps="steps" @done="booted = true" />

    <header class="fixed top-0 inset-x-0 z-40 flex items-start justify-end px-4 pt-4 sm:px-6 sm:pt-5 pointer-events-none">
      <div class="flex items-center gap-3 pointer-events-auto">
        <SoundToggle />
        <LangSwitch />
      </div>
    </header>

    <main>
      <HeroSection :started="booted" />
      <InfoSection />
    </main>

    <CustomCursor v-if="finePointer" />
  </div>
</template>
