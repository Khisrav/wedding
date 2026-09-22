<script setup lang="ts">
// A thin, minimal ornamental divider placed between the names — a small
// branch/leaf motif rendered as inline SVG (no image request, tiny weight).
</script>

<template>
  <svg
    class="botanical-divider"
    viewBox="0 0 180 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M2 12H74" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
    <path d="M106 12H178" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
    <g stroke="currentColor" stroke-width="1" stroke-linecap="round">
      <path d="M90 12c0-5.5 3.4-9 8-10-1.6 4.3-1.6 7.2 0 10-1.6 2.8-1.6 5.7 0 10-4.6-1-8-4.5-8-10Z" />
      <path d="M90 12c0-5.5-3.4-9-8-10 1.6 4.3 1.6 7.2 0 10 1.6 2.8 1.6 5.7 0 10 4.6-1 8-4.5 8-10Z" />
      <circle cx="90" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </g>
  </svg>
</template>

<style scoped>
.botanical-divider {
  width: 7.5rem;
  height: 1rem;
  color: var(--color-gold);
}
</style>
