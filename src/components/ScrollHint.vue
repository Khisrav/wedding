<script setup lang="ts">
import ChevronDownIcon from './icons/ChevronDownIcon.vue'

defineProps<{ label: string }>()
</script>

<template>
  <div class="scroll-hint flex flex-col items-center gap-2 text-ink/60">
    <span class="text-[10px] font-medium uppercase tracking-[0.3em]">{{ label }}</span>
    <ChevronDownIcon class="scroll-hint-icon h-4 w-4" />
  </div>
</template>

<style scoped>
.scroll-hint-icon {
  animation: scroll-hint-drift 2.4s ease-in-out infinite;
}

@keyframes scroll-hint-drift {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  50% {
    transform: translateY(5px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-hint-icon {
    animation: none;
  }
}
</style>
