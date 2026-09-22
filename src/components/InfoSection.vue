<script setup lang="ts">
/**
 * Info block: renders fully with CSS alone. GSAP/ScrollTrigger is an
 * enhancement layered on top *if and when* the chunk arrives — the phone
 * numbers are never gated behind the animation bundle.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ContactCard from './ContactCard.vue'
import BotanicalDivider from './BotanicalDivider.vue'
import FlourishIcon from './icons/FlourishIcon.vue'
import PinIcon from './icons/PinIcon.vue'
import CalendarIcon from './icons/CalendarIcon.vue'
import MapOpenIcon from './icons/MapOpenIcon.vue'
import { EVENT, mapHref } from '../config/event'
import { formatDate, useI18n } from '../i18n'
import { downloadIcs } from '../lib/ics'
import { loadGsap } from '../lib/gsap'
import { useReducedMotion } from '../composables/useReducedMotion'
import { tick } from '../composables/useAudio'

const { t, pick } = useI18n()
const reduced = useReducedMotion()
const root = ref<HTMLElement | null>(null)

const date = computed(() => formatDate(EVENT.start, t.value))
const venue = computed(() => pick(EVENT.venue))

function addToCalendar() {
  tick(880)
  downloadIcs({
    title: t.value.icsTitle,
    description: t.value.icsDesc,
    location: `${venue.value.name}, ${venue.value.address}`,
  })
}

let cleanup: (() => void) | null = null

onMounted(async () => {
  if (reduced.value) return
  const g = await loadGsap()
  const el = root.value
  if (!g || !el) return
  const { gsap, ScrollTrigger } = g
  const items = el.querySelectorAll<HTMLElement>('[data-reveal]')

  let revealed = false
  const reveal = () => {
    if (revealed) return
    revealed = true
    gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.09, overwrite: true })
    st.kill()
    io.disconnect()
  }

  gsap.set(items, { autoAlpha: 0, y: 14 })
  const st = ScrollTrigger.create({ trigger: el, start: 'top 75%', once: true, onEnter: reveal })
  const io = new IntersectionObserver(([e]) => e?.isIntersecting && reveal(), { threshold: 0.15 })
  io.observe(el)

  cleanup = () => { st.kill(); io.disconnect(); gsap.set(items, { clearProps: 'all' }) }
})
onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <section id="info" ref="root" class="relative px-4 py-20 sm:py-28 min-h-dvh flex items-center" aria-labelledby="info-title">
    <div class="mx-auto w-full max-w-2xl">
      <div class="text-center mb-8" data-reveal>
        <p class="sys">{{ t.infoSub }}</p>
        <h2 id="info-title" class="mt-2 font-display text-3xl sm:text-4xl text-ink tracking-title">{{ t.infoTitle }}</h2>
        <BotanicalDivider class="mt-5" />
      </div>

      <div class="frame bg-paper-2/90" data-reveal>
        <span class="frame-tr" /><span class="frame-bl" />

        <div class="flex items-center justify-center gap-3 border-b border-line px-4 sm:px-6 py-3">
          <FlourishIcon class="w-4 h-4 text-accent" />
          <span class="sys text-accent">{{ t.sysHeader }}</span>
          <FlourishIcon class="w-4 h-4 text-accent scale-x-[-1]" />
        </div>

        <div class="px-4 sm:px-6 py-7 sm:py-9 space-y-8">
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-7 sm:gap-10" data-reveal>
            <div>
              <p class="sys">{{ t.date }}</p>
              <p class="mt-2 font-display text-3xl sm:text-[2.65rem] leading-tight text-ink">{{ date.sys }}</p>
              <p class="mt-2 font-body text-ink-2 text-base sm:text-lg">{{ date.weekday }}, {{ date.human }}</p>
            </div>
            <div class="sm:text-right sm:border-l sm:border-line sm:pl-10">
              <p class="sys">{{ t.time }}</p>
              <p class="mt-2 font-display text-3xl sm:text-[2.65rem] leading-tight text-ink tabular-nums">{{ date.time }}</p>
              <p class="mt-2 sys text-ink-3 tracking-sys">UTC+05:00</p>
            </div>
          </div>

          <div class="rule" aria-hidden="true" />

          <div data-reveal>
            <p class="sys">{{ t.venue }}</p>
            <div class="mt-3 flex items-start gap-4">
              <span class="shrink-0 w-10 h-10 rounded-sm border border-line flex items-center justify-center text-accent">
                <PinIcon class="w-5 h-5" />
              </span>
              <div class="min-w-0">
                <p class="font-display text-xl sm:text-2xl text-ink">{{ venue.name }}</p>
                <p class="mt-1 font-body text-ink-2 text-base">{{ venue.address }}</p>
                <a
                  :href="mapHref()"
                  target="_blank"
                  rel="noopener"
                  class="mt-3 inline-flex items-center gap-2 sys text-ink hover:text-accent transition-colors"
                  @click="tick(988)"
                >
                  <span>{{ t.openMap }}</span>
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-line text-ink hover:border-accent hover:text-accent transition-colors"
                    :aria-label="t.openMap"
                    :title="t.openMap"
                  >
                    <MapOpenIcon class="w-4 h-4" />
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div class="rule" aria-hidden="true" />

          <div>
            <p class="sys" data-reveal>{{ t.contacts }}</p>
            <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="(c, i) in EVENT.contacts" :key="c.id" data-reveal>
                <ContactCard :role="t[c.roleKey]" :name="pick(c.name)" :phone="c.phone" :index="i + 1" />
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1" data-reveal>
            <button type="button" class="btn-sys" @click="addToCalendar">
              <CalendarIcon class="w-4 h-4" />
              {{ t.addToCalendar }}
            </button>
            <p class="font-body text-ink-2 sm:text-right italic">{{ t.footer }}</p>
          </div>
        </div>
      </div>

      <p class="mt-8 text-center font-display text-lg text-ink-2" data-reveal>
        {{ pick(EVENT.groom) }} <span class="text-accent">&amp;</span> {{ pick(EVENT.bride) }}
      </p>
    </div>
  </section>
</template>
