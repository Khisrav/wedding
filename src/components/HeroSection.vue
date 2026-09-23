<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import FallingLeaves from './FallingLeaves.vue'
import BotanicalDivider from './BotanicalDivider.vue'
import GrowingFlower from './GrowingFlower.vue'
import ScrollHint from './ScrollHint.vue'
import { useI18n } from '../i18n'
import { brideName, groomName } from '../config/event'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const props = defineProps<{ start: boolean }>()

const { t } = useI18n()
const { prefersReducedMotion } = useReducedMotion()

const groomLetters = computed(() => [...groomName])
const brideLetters = computed(() => [...brideName])

const heroRoot = ref<HTMLElement | null>(null)
const eyebrowRef = ref<HTMLElement | null>(null)
const dividerRef = ref<HTMLElement | null>(null)
const inviteRef = ref<HTMLElement | null>(null)
const hintRef = ref<HTMLElement | null>(null)

let tl: gsap.core.Timeline | null = null

function playIntro() {
  if (!heroRoot.value) return

  if (prefersReducedMotion.value) return

  const letters = heroRoot.value.querySelectorAll<HTMLElement>('.name-letter')
  gsap.set(letters, { opacity: 0, y: 16 })
  gsap.set([eyebrowRef.value, dividerRef.value, inviteRef.value, hintRef.value], {
    opacity: 0,
    y: 12,
  })

  tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
  tl.to(eyebrowRef.value, { opacity: 1, y: 0, duration: 0.7 })
    .to(letters, { opacity: 1, y: 0, duration: 0.55, stagger: 0.032 }, '-=0.35')
    .to(dividerRef.value, { opacity: 1, y: 0, duration: 0.6 }, '-=0.15')
    .to(inviteRef.value, { opacity: 1, y: 0, duration: 0.7 }, '-=0.25')
    .to(hintRef.value, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
}

watch(
  () => props.start,
  (started) => {
    if (started) playIntro()
  },
  { immediate: true },
)

onUnmounted(() => tl?.kill())
</script>

<template>
  <section
    ref="heroRoot"
    class="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-24 md:h-screen md:snap-start"
  >
    <div class="hero-copy relative z-10 flex max-w-sm flex-col items-center text-center">
      <p
        ref="eyebrowRef"
        class="mb-6 text-[11px] font-medium uppercase tracking-[0.35em] text-burgundy/70"
      >
        {{ t.hero.eyebrow }}
      </p>

      <h1 class="font-serif text-ink">
        <span class="sr-only">{{ groomName }} &amp; {{ brideName }}</span>
        <span aria-hidden="true" class="name-line relative inline-block leading-tight">
          <!-- <GrowingFlower
            class="pointer-events-none absolute bottom-1 -left-14 md:bottom-2 md:-left-20"
            :size="62"
            tone="gold"
            :delay="1.0"
            :trigger="start"
          /> -->
          <span v-for="(ch, i) in groomLetters" :key="`g-${i}`" class="name-letter inline-block">{{
            ch
          }}</span>
        </span>

        <span ref="dividerRef" class="my-3 flex justify-center md:my-4">
          <BotanicalDivider />
        </span>

        <span aria-hidden="true" class="name-line relative inline-block leading-tight">
          <GrowingFlower
            class="pointer-events-none absolute bottom-1 -left-14 md:bottom-2 md:-left-20"
            :size="62"
            tone="gold"
            :delay="1.0"
            :trigger="start"
          />
          <span v-for="(ch, i) in brideLetters" :key="`b-${i}`" class="name-letter inline-block">{{
            ch
          }}</span>
        </span>
      </h1>

      <p ref="inviteRef" class="mt-8 max-w-[22rem] text-[15px] leading-relaxed text-ink/75 md:text-base">
        {{ t.hero.invite }}
      </p>
    </div>

    <FallingLeaves :active="start" />

    <div ref="hintRef" class="absolute bottom-10 left-1/2 z-30 -translate-x-1/2 md:bottom-12">
      <ScrollHint :label="t.hero.scrollHint" />
    </div>
  </section>
</template>

<style scoped>
/* Names never wrap mid-word — font-size scales with the viewport (with a
   floor/ceiling) so both the short and the long name always fit on one
   line inside the narrow, centered column at any screen size. */
.name-line {
  white-space: nowrap;
  font-size: clamp(1.85rem, 9vw, 2.75rem);
}
</style>
