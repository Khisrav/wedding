<script setup lang="ts">
/**
 * Info block: renders fully with CSS alone. GSAP/ScrollTrigger is an
 * enhancement layered on top *if and when* the chunk arrives — the phone
 * numbers are never gated behind the animation bundle.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ContactCard from './ContactCard.vue'
import HexIcon from './icons/HexIcon.vue'
import PinIcon from './icons/PinIcon.vue'
import CalendarIcon from './icons/CalendarIcon.vue'
import MapOpenIcon from './icons/MapOpenIcon.vue'
import { EVENT, coordsLabel, mapHref } from '../config/event'
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

  // Elements are hidden only once GSAP is actually here (before that they render
  // plainly), and revealed exactly once — by ScrollTrigger, or by the
  // IntersectionObserver safety net if the trigger is ever missed (resize
  // mid-boot, in-app browsers with odd scroll containers, etc.).
  let revealed = false
  const reveal = () => {
    if (revealed) return
    revealed = true
    gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.07, overwrite: true })
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
      <!-- Section heading -->
      <div class="flex items-end justify-between mb-5" data-reveal>
        <div>
          <p class="sys text-ink-3">{{ t.infoSub }}</p>
          <h2 id="info-title" class="mt-1 font-mono text-lg sm:text-xl tracking-wide2 text-ink">{{ t.infoTitle }}</h2>
        </div>
        <div class="sys flex items-center gap-2">
          <span class="cursor-blink inline-block w-1.5 h-1.5 bg-accent" aria-hidden="true" />
          <span>ONLINE</span>
        </div>
      </div>

      <!-- Terminal card -->
      <div class="frame bg-paper-2/80 backdrop-blur-[1px]" data-reveal>
        <span class="frame-tr" /><span class="frame-bl" />

        <!-- Title bar -->
        <div class="flex items-center justify-between border-b border-line px-4 sm:px-6 py-2.5 sys">
          <span class="flex items-center gap-2"><HexIcon class="w-3.5 h-3.5 text-accent" /> EVENT_DATA</span>
          <span class="text-ink-3 tabular-nums">{{ EVENT.build }}</span>
        </div>

        <div class="px-4 sm:px-6 py-6 sm:py-8 space-y-8">
          <!-- Date / time -->
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 sm:gap-10" data-reveal>
            <div>
              <p class="sys">{{ t.date }}</p>
              <p class="mt-2 font-mono text-3xl sm:text-4xl tracking-[0.08em] tabular-nums text-ink">{{ date.sys }}</p>
              <p class="mt-2 font-sans text-ink-2 text-base">{{ date.weekday }}, {{ date.human }}</p>
            </div>
            <div class="sm:text-right sm:border-l sm:border-line sm:pl-10">
              <p class="sys">{{ t.time }}</p>
              <p class="mt-2 font-mono text-3xl sm:text-4xl tracking-[0.08em] tabular-nums text-ink">{{ date.time }}</p>
              <p class="mt-2 sys text-ink-3">UTC+05:00</p>
            </div>
          </div>

          <div class="rule" aria-hidden="true" />

          <!-- Venue -->
          <div data-reveal>
            <p class="sys">{{ t.venue }}</p>
            <div class="mt-3 flex items-start gap-4">
              <span class="shrink-0 w-10 h-10 border border-line flex items-center justify-center text-ink-2">
                <PinIcon class="w-5 h-5" />
              </span>
              <div class="min-w-0">
                <p class="font-sans text-lg text-ink">{{ venue.name }}</p>
                <p class="mt-1 font-sans text-ink-2">{{ venue.address }}</p>
                <a
                  :href="mapHref()"
                  target="_blank"
                  rel="noopener"
                  class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 sys text-ink"
                  @click="tick(988)"
                >
                  <span class="text-ink-3">{{ t.coords }}:</span>
                  <span class="whitespace-nowrap tabular-nums">{{ coordsLabel() }}</span>
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 border border-line text-ink hover:border-accent hover:text-accent transition-colors"
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

          <!-- Contacts -->
          <div>
            <p class="sys" data-reveal>{{ t.contacts }}</p>
            <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="(c, i) in EVENT.contacts" :key="c.id" data-reveal>
                <ContactCard :role="t[c.roleKey]" :name="pick(c.name)" :phone="c.phone" :index="i + 1" />
              </div>
            </div>
          </div>

          <!-- Calendar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2" data-reveal>
            <button type="button" class="btn-sys" @click="addToCalendar">
              <CalendarIcon class="w-4 h-4" />
              {{ t.addToCalendar }}
              <span class="opacity-60">.ics</span>
            </button>
            <p class="font-sans text-ink-2 sm:text-right">{{ t.footer }}</p>
          </div>
        </div>

        <!-- Footer bar -->
        <div class="border-t border-line px-4 sm:px-6 py-2.5 sys flex items-center justify-between text-ink-3">
          <span>{{ t.sysHeader }}</span>
          <span class="hidden sm:inline">END_OF_TRANSMISSION</span>
        </div>
      </div>

      <p class="mt-6 text-center sys text-ink-3" data-reveal>
        {{ pick(EVENT.groom) }} <span class="text-accent">&amp;</span> {{ pick(EVENT.bride) }}
      </p>
    </div>
  </section>
</template>
