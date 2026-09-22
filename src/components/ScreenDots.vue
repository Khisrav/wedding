<script setup lang="ts">
defineProps<{ active: number; count: number }>()
const emit = defineEmits<{ (e: 'select', index: number): void }>()
</script>

<template>
  <div
    class="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 md:right-6 md:flex"
    aria-hidden="true"
  >
    <button
      v-for="i in count"
      :key="i"
      type="button"
      class="h-1.5 w-1.5 rounded-full transition-all"
      :class="active === i - 1 ? 'h-2.5 w-2.5 bg-gold' : 'bg-ink/20'"
      :aria-label="`Screen ${i}`"
      @click="emit('select', i - 1)"
    />
  </div>
</template>
