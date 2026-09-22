<script setup lang="ts">
import { useCountdown } from '../composables/useCountdown'

const props = defineProps<{
  targetISO: string
  label: string
  doneLabel: string
  units: { days: string; hours: string; minutes: string; seconds: string }
}>()

const { days, hours, minutes, seconds, isPast } = useCountdown(props.targetISO)

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}
</script>

<template>
  <div data-reveal class="text-center">
    <p v-if="isPast" class="font-serif text-base text-ink/80">{{ doneLabel }}</p>
    <template v-else>
      <p class="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-ink/50">{{ label }}</p>
      <div class="flex items-center justify-center gap-3 font-sans tabular-nums text-ink">
        <div class="flex flex-col items-center">
          <span class="text-xl font-semibold md:text-2xl">{{ pad(days) }}</span>
          <span class="text-[10px] uppercase tracking-widest text-ink/45">{{ units.days }}</span>
        </div>
        <span class="pb-4 text-ink/30">:</span>
        <div class="flex flex-col items-center">
          <span class="text-xl font-semibold md:text-2xl">{{ pad(hours) }}</span>
          <span class="text-[10px] uppercase tracking-widest text-ink/45">{{ units.hours }}</span>
        </div>
        <span class="pb-4 text-ink/30">:</span>
        <div class="flex flex-col items-center">
          <span class="text-xl font-semibold md:text-2xl">{{ pad(minutes) }}</span>
          <span class="text-[10px] uppercase tracking-widest text-ink/45">{{ units.minutes }}</span>
        </div>
        <span class="pb-4 text-ink/30">:</span>
        <div class="flex flex-col items-center">
          <span class="text-xl font-semibold md:text-2xl">{{ pad(seconds) }}</span>
          <span class="text-[10px] uppercase tracking-widest text-ink/45">{{ units.seconds }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
