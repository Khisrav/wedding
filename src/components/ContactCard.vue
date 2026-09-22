<script setup lang="ts">
import PhoneIcon from './icons/PhoneIcon.vue'
import WhatsAppIcon from './icons/WhatsAppIcon.vue'

defineProps<{
  role: string
  name: string
  phone: string
  tel: string
  wa: string
  callLabel: string
}>()
</script>

<template>
  <div
    data-reveal
    class="flex items-center justify-between gap-4 border-b border-ink/10 py-4 last:border-b-0"
  >
    <div class="min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-burgundy/60">{{ role }}</p>
      <p class="mt-1 font-serif text-lg text-ink">{{ name }}</p>
      <p class="mt-0.5 text-sm tabular-nums text-ink/60">{{ phone }}</p>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <a
        :href="`tel:${tel}`"
        :aria-label="`${callLabel}: ${name}`"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10"
      >
        <PhoneIcon class="h-4 w-4" />
      </a>
      <a
        :href="`https://wa.me/${wa}`"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`WhatsApp: ${name}`"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10"
      >
        <WhatsAppIcon class="h-4 w-4" />
      </a>
    </div>
  </div>
</template>
