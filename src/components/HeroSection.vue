<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import PetalCanvas from './PetalCanvas.vue'
import ScrollHint from './ScrollHint.vue'
import BotanicalDivider from './BotanicalDivider.vue'
import { EVENT } from '../config/event'
import { useI18n } from '../i18n'
import { loadGsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const props = defineProps<{ started: boolean }>()
const { t, pick, lang } = useI18n()
const reduced = useReducedMotion()

const root = ref<HTMLElement | null>(null)
const noticeEl = ref<HTMLElement | null>(null)

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

  gsap.set(els, { autoAlpha: 0, y: 12 })
  els.forEach((el) => el.classList.remove('pre'))

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => (introDone.value = true),
  })
  tl = timeline

  timeline
    .to(byKey('ornament'), { autoAlpha: 1, y: 0, duration: 0.7 })
    .to(byKey('label-groom'), { autoAlpha: 1, y: 0, duration: 0.45 }, '-=0.25')
    .to(byKey('groom'), { autoAlpha: 1, y: 0, duration: 0.01 })
    .to(typed, { groom: groomName().length, duration: groomName().length * 0.05, ease: 'none', snap: 'groom' })
    .to(byKey('amp'), { autoAlpha: 1, y: 0, duration: 0.55 }, '-=0.1')
    .to(byKey('label-bride'), { autoAlpha: 1, y: 0, duration: 0.45 }, '-=0.3')
    .to(byKey('bride'), { autoAlpha: 1, y: 0, duration: 0.01 })
    .to(typed, { bride: brideName().length, duration: brideName().length * 0.05, ease: 'none', snap: 'bride' })
    .add(() => noticeEl.value?.classList.add('fade-in'), '+=0.12')
    .to(byKey('notice'), { autoAlpha: 1, y: 0, duration: 0.01 })
    .to(byKey('body'), { autoAlpha: 1, y: 0, duration: 0.7 }, '+=0.35')
    .to(byKey('hint'), { autoAlpha: 1, y: 0, duration: 0.65 }, '-=0.2')
}

watch(
  () => props.started,
  (on) => { if (on) playIntro() },
  { immediate: true },
)

watch(lang, () => {
  if (!introDone.value) return
  typed.groom = groomName().length
  typed.bride = brideName().length
  const el = noticeEl.value
  if (!el || reduced.value) return
  el.classList.remove('fade-in')
  void el.offsetWidth
  el.classList.add('fade-in')
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

    <div class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 pt-20 pb-28 sm:pb-32">
      <div class="pre" data-intro="ornament">
        <BotanicalDivider />
      </div>

      <h1 id="hero-title" class="mt-8 sm:mt-10 leading-[1.12]">
        <span class="pre block sys mb-2" data-intro="label-groom">{{ t.groom }}</span>
        <span class="pre block font-display text-[clamp(2rem,8vw,4.75rem)] text-ink text-balance" data-intro="groom">
          <span aria-hidden="true">{{ groomName().slice(0, typed.groom) }}</span><span
            v-if="typed.groom < groomName().length"
            class="cursor-blink inline-block w-[.4em] h-[.85em] bg-accent align-[-0.05em] ml-1"
            aria-hidden="true"
          /><span class="sr-only">{{ groomName() }}</span>
        </span>

        <span class="pre block my-5 sm:my-7 text-accent font-display text-2xl sm:text-3xl font-normal" data-intro="amp" aria-hidden="true">
          <span class="inline-block w-8 sm:w-14 h-px bg-line align-middle mr-3 sm:mr-4" />{{ t.and }}<span class="inline-block w-8 sm:w-14 h-px bg-line align-middle ml-3 sm:ml-4" />
        </span>

        <span class="pre block sys mb-2" data-intro="label-bride">{{ t.bride }}</span>
        <span class="pre block font-display text-[clamp(2rem,8vw,4.75rem)] text-ink text-balance" data-intro="bride">
          <span aria-hidden="true">{{ brideName().slice(0, typed.bride) }}</span><span
            v-if="typed.bride < brideName().length"
            class="cursor-blink inline-block w-[.4em] h-[.85em] bg-accent align-[-0.05em] ml-1"
            aria-hidden="true"
          /><span class="sr-only">{{ brideName() }}</span>
        </span>
      </h1>

      <div class="mt-10 sm:mt-14 max-w-lg">
        <p
          ref="noticeEl"
          class="pre font-display text-[clamp(1.05rem,3.2vw,1.35rem)] text-ink tracking-[0.06em] border-y border-accent/50 py-3.5 px-2 inline-block"
          data-intro="notice"
        >
          {{ t.notice }}
        </p>
        <p class="pre mt-6 font-body text-ink-2 text-[1.05rem] sm:text-lg leading-relaxed" data-intro="body">
          {{ t.inviteBody }}
        </p>
      </div>
    </div>

    <div class="pre absolute bottom-5 inset-x-0 flex justify-center" data-intro="hint">
      <ScrollHint target="#info" />
    </div>
  </section>
</template>

<style scoped>
.pre {
  opacity: 0;
  visibility: hidden;
}
</style>
