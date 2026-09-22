import { ref } from 'vue'

/**
 * Resolves once fonts are ready (or a hard timeout elapses) — never blocking
 * the reveal forever on a flaky connection — while guaranteeing the boot
 * screen is visible for at least `minDurationMs` so it never flashes/pops.
 */
export function useAssetsReady() {
  const ready = ref(false)

  async function waitForAssets(minDurationMs = 700) {
    const start = performance.now()

    const fontsReady =
      typeof document !== 'undefined' && 'fonts' in document
        ? (document as Document & { fonts: FontFaceSet }).fonts.ready
        : Promise.resolve()

    const hardTimeout = new Promise((resolve) => setTimeout(resolve, 2500))

    await Promise.race([fontsReady, hardTimeout])

    const elapsed = performance.now() - start
    if (elapsed < minDurationMs) {
      await new Promise((resolve) => setTimeout(resolve, minDurationMs - elapsed))
    }

    ready.value = true
  }

  return { ready, waitForAssets }
}
