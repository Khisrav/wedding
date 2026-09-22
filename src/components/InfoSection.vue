<script setup lang="ts">
import PinIcon from './icons/PinIcon.vue'
import CalendarIcon from './icons/CalendarIcon.vue'
import ContactCard from './ContactCard.vue'
import Countdown from './Countdown.vue'
import ShareButton from './ShareButton.vue'
import { useI18n } from '../i18n'
import {
  brideName,
  contacts,
  eventDateISO,
  eventDurationHours,
  groomName,
  mapsUrl,
  venue,
} from '../config/event'
import { downloadIcsEvent } from '../lib/ics'
import { useRevealOnView } from '../composables/useRevealOnView'

const { t } = useI18n()
const { root } = useRevealOnView()

function addToCalendar() {
  downloadIcsEvent({
    title: `${groomName} & ${brideName} — свадьба`,
    description: t.value.hero.invite,
    location: `${venue.name}, ${venue.city}`,
    startISO: eventDateISO,
    durationHours: eventDurationHours,
  })
}
</script>

<template>
  <section
    ref="root"
    class="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-20 md:h-screen md:snap-start"
  >
    <div class="flex w-full max-w-sm flex-col items-center gap-10 text-center">
      <div data-reveal>
        <p class="mb-2 text-[11px] font-medium uppercase tracking-[0.3em] text-burgundy/60">
          {{ t.info.dateLabel }}
        </p>
        <p class="font-serif text-3xl text-ink md:text-4xl">{{ t.info.dateValue }}</p>
        <p class="mt-1 text-sm tracking-wide text-ink/60">{{ t.info.timeValue }}</p>
      </div>

      <div class="h-px w-16 bg-ink/10" data-reveal />

      <div data-reveal class="flex flex-col items-center gap-3">
        <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-burgundy/60">
          {{ t.info.placeLabel }}
        </p>
        <p class="font-serif text-xl text-ink">{{ t.info.venueName }}</p>
        <p class="text-sm text-ink/60">{{ t.info.venueCity }}</p>
        <a
          :href="mapsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-1 inline-flex items-center gap-1.5 text-sm text-gold underline-offset-4 hover:underline"
        >
          <PinIcon class="h-4 w-4" />
          {{ t.info.mapCta }}
        </a>
      </div>

      <button
        type="button"
        data-reveal
        class="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-opacity hover:opacity-90"
        @click="addToCalendar"
      >
        <CalendarIcon class="h-4 w-4" />
        {{ t.info.calendarCta }}
      </button>

      <Countdown
        :target-i-s-o="eventDateISO"
        :label="t.info.countdownLabel"
        :done-label="t.info.countdownDone"
        :units="t.info.countdownUnits"
      />

      <div class="h-px w-16 bg-ink/10" data-reveal />

      <div data-reveal class="w-full">
        <p class="mb-1 text-[11px] font-medium uppercase tracking-[0.3em] text-burgundy/60">
          {{ t.info.contactsLabel }}
        </p>
        <div class="mt-3">
          <ContactCard
            v-for="c in contacts"
            :key="c.id"
            :role="c.roleKey === 'fatherGroom' ? t.contacts.fatherGroom : t.contacts.fatherBride"
            :name="c.name"
            :phone="c.phone"
            :tel="c.tel"
            :wa="c.wa"
            :call-label="t.info.callCta"
          />
        </div>
      </div>

      <ShareButton
        :title="`${groomName} & ${brideName}`"
        :text="t.hero.invite"
        :label="t.info.shareCta"
        :copied-label="t.info.shareCopied"
      />
    </div>
  </section>
</template>
