<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import PetalCanvas from './PetalCanvas.vue'
import ScrollHint from './ScrollHint.vue'
import HexIcon from './icons/HexIcon.vue'
import { EVENT, coordsLabel } from '../config/event'
import { useI18n } from '../i18n'
import { loadGsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const props = defineProps<{ started: boolean }>()
const { t, pick, lang } = useI18n()
const reduced = useReducedMotion()

const root = ref<HTMLElement | null>(null)
const noticeEl = ref<HTMLElement | null>(null)

/* Typewriter state: how many characters of each name are revealed */
const typed = reactive({ groom: 0, bride: 0 })
const introDone = ref(false)
const groomName = () => pick(EVENT.groom)
const brideName = () => pick(EVENT.bride)

let tl: { kill: () => void } | null = null

function revealAll() {
  typed.groom = groomName().length
  typed.bride = brideName().length
  root.value?.querySelectorAll<HTMLElement>('.pre').forEach((el) => el.classList.remove('pre'))
  introDone.value = true
}

async function playIntro() {
  const g = await loadGsap()
  const els = root.value?.querySelectorAll<HTMLElement>('[data-intro]')
  if (!g || !els || reduced.value) return revealAll()

  const { gsap } = g
  const byKey = (k: string) => Array.from(els).filter((e) => e.dataset.intro === k)

  // Hand control from CSS (.pre) to GSAP without a flash: both happen synchronously before paint
  gsap.set(els, { autoAlpha: 0, y: 8 })
  els.forEach((el) => el.classList.remove('pre'))

  const timeline = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: () => (introDone.value = true) })
  tl = timeline

  timeline
    .to(byKey('sys'), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 })
    .to(byKey('label-groom'), { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.2')
    .to(byKey('groom'), { autoAlpha: 1, y: 0, duration: 0.01 })
    .to(typed, { groom: groomName().length, duration: groomName().length * 0.045, ease: 'none', snap: 'groom' })
    .to(byKey('amp'), { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.1')
    .to(byKey('label-bride'), { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.3')
    .to(byKey('bride'), { autoAlpha: 1, y: 0, duration: 0.01 })
    .to(typed, { bride: brideName().length, duration: brideName().length * 0.045, ease: 'none', snap: 'bride' })
    .add(() => noticeEl.value?.classList.add('glitch-in', 'is-glitching'), '+=0.15')
    .to(byKey('notice'), { autoAlpha: 1, y: 0, duration: 0.01 })
    .to(byKey('invited'), { autoAlpha: 1, y: 0, duration: 0.6 }, '+=0.5')
    .to(byKey('body'), { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.3')
    .to(byKey('hint'), { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.2')
}

watch(
  () => props.started,
  (on) => { if (on) playIntro() },
  { immediate: true },
)

// Language switch after the intro: re-glitch the heading, keep everything visible
watch(lang, () => {
  if (!introDone.value) return
  typed.groom = groomName().length
  typed.bride = brideName().length
  const el = noticeEl.value
  if (!el || reduced.value) return
  el.classList.remove('glitch-in', 'is-glitching')
  void el.offsetWidth // restart CSS animation
  el.classList.add('glitch-in', 'is-glitching')
})

onBeforeUnmount(() => tl?.kill())
</script>

<template>
  <section
    ref="root"
    id="hero"
    class="relative min-h-dvh flex flex-col overflow-hidden"
    aria-labelledby="hero-title"
  >
    <PetalCanvas :active="started" />

    <!-- HUD: top-left coordinates -->
    <div class="pre absolute left-4 top-4 sm:left-6 sm:top-5 sys text-ink-3 select-none" data-intro="sys">
      <div class="flex items-center gap-2"><HexIcon class="w-3 h-3 shrink-0" /> {{ coordsLabel() }}</div>
    </div>

    <!-- Center block -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 pt-20 pb-28 sm:pb-32">
      <h1 id="hero-title" class="leading-[1.15]">
        <span class="pre block sys mb-2 text-ink-3" data-intro="label-groom">{{ t.groom }}</span>
        <span class="pre block font-script text-[clamp(1.75rem,7vw,4.5rem)] text-ink text-balance" data-intro="groom">
          <span aria-hidden="true">{{ groomName().slice(0, typed.groom) }}</span><span
            v-if="typed.groom < groomName().length"
            class="cursor-blink inline-block w-[.45em] h-[.9em] bg-ink align-[-0.08em] ml-1"
            aria-hidden="true"
          /><span class="sr-only">{{ groomName() }}</span>
        </span>

        <span class="pre block my-5 sm:my-7 text-accent font-mono text-2xl sm:text-4xl font-normal" data-intro="amp" aria-hidden="true">
          <span class="inline-block w-10 sm:w-16 h-px bg-line align-middle mr-4" />{{ t.and }}<span class="inline-block w-10 sm:w-16 h-px bg-line align-middle ml-4" />
        </span>

        <span class="pre block sys mb-2 text-ink-3" data-intro="label-bride">{{ t.bride }}</span>
        <span class="pre block font-script text-[clamp(1.75rem,7vw,4.5rem)] text-ink text-balance" data-intro="bride">
          <span aria-hidden="true">{{ brideName().slice(0, typed.bride) }}</span><span
            v-if="typed.bride < brideName().length"
            class="cursor-blink inline-block w-[.45em] h-[.9em] bg-ink align-[-0.08em] ml-1"
            aria-hidden="true"
          /><span class="sr-only">{{ brideName() }}</span>
        </span>
      </h1>

      <div class="mt-10 sm:mt-14 max-w-xl">
        <p
          ref="noticeEl"
          class="pre scanlines font-mono text-[0.75rem] sm:text-sm tracking-wide2 uppercase text-ink border-y border-line py-3 px-4 inline-block"
          data-intro="notice"
        >
          {{ t.notice }}
        </p>
        <p class="pre mt-5 font-mono text-accent text-xs sm:text-sm tracking-wide2 uppercase" data-intro="invited">
          {{ t.invited }}
        </p>
        <p class="pre mt-5 font-sans text-ink-2 text-[0.95rem] sm:text-base leading-relaxed" data-intro="body">
          {{ t.inviteBody }}
        </p>
      </div>
    </div>

    <!-- HUD: bottom-right build hash (≥sm only — on phones the scroll hint owns the bottom edge) -->
    <div class="pre absolute bottom-5 right-6 sys text-ink-3 select-none hidden sm:block" data-intro="sys">
      {{ EVENT.build }}
    </div>

    <div class="pre absolute bottom-5 inset-x-0 flex justify-center" data-intro="hint">
      <ScrollHint target="#info" />
    </div>
  </section>
</template>

<style scoped>
/* Hidden until the intro takes over. Without JS/GSAP, revealAll() drops the class;
   if JS never runs at all the <noscript> fallback in index.html is shown instead. */
.pre {
  opacity: 0;
  visibility: hidden;
}
</style>
