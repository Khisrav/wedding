<script setup lang="ts">
import { ref } from 'vue'
import ShareIcon from './icons/ShareIcon.vue'

const props = defineProps<{
  title: string
  text: string
  label: string
  copiedLabel: string
}>()

const copied = ref(false)

async function share() {
  const url = window.location.href

  if (navigator.share) {
    try {
      await navigator.share({ title: props.title, text: props.text, url })
      return
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => (copied.value = false), 2200)
  } catch {
    // clipboard unavailable — silently ignore, nothing else we can do
  }
}
</script>

<template>
  <button
    type="button"
    data-reveal
    class="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm text-ink/70 transition-colors hover:border-gold/50 hover:text-ink"
    @click="share"
  >
    <ShareIcon class="h-4 w-4" />
    <span>{{ copied ? copiedLabel : label }}</span>
  </button>
</template>
