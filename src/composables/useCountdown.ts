import { computed, onMounted, onUnmounted, ref } from 'vue'

export function useCountdown(targetISO: string) {
  const now = ref(Date.now())
  const target = new Date(targetISO).getTime()
  let interval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    interval = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  const remainingMs = computed(() => Math.max(0, target - now.value))
  const isPast = computed(() => target - now.value <= 0)

  const days = computed(() => Math.floor(remainingMs.value / 86_400_000))
  const hours = computed(() => Math.floor((remainingMs.value / 3_600_000) % 24))
  const minutes = computed(() => Math.floor((remainingMs.value / 60_000) % 60))
  const seconds = computed(() => Math.floor((remainingMs.value / 1000) % 60))

  return { days, hours, minutes, seconds, isPast }
}
