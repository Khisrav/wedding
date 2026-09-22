<script setup lang="ts"></script>

<template>
  <div class="boot-screen fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream">
    <div class="font-serif text-2xl tracking-wide text-ink/90 md:text-3xl">Х &amp; Ф</div>
    <div class="mt-5 flex items-center gap-2" role="status" aria-label="Загрузка">
      <span class="boot-dot" style="animation-delay: 0ms" />
      <span class="boot-dot" style="animation-delay: 160ms" />
      <span class="boot-dot" style="animation-delay: 320ms" />
    </div>
  </div>
</template>

<style scoped>
.boot-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background-color: var(--color-gold);
  display: inline-block;
  animation: boot-pulse 1.1s ease-in-out infinite;
}

@keyframes boot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.25;
    transform: scale(0.85);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .boot-dot {
    animation: none;
    opacity: 0.7;
  }
}
</style>
