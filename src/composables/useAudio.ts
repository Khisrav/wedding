import { ref } from 'vue'

/**
 * Soft wedding ambient: gentle sine arpeggio (music-box feel) instead of a
 * dark drone. Autoplay is attempted after boot; if the browser blocks it,
 * the first user gesture unlocks playback.
 */
const enabled = ref(false)
let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambient: { stop: () => void } | null = null
let unlockBound = false

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.0001
    master.connect(ctx.destination)
  }
  return ctx
}

/** Soft chime click for UI — sine, not square (square reads as alarm/glitch) */
export function tick(freq = 880) {
  if (!enabled.value) return
  const c = ensureCtx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(freq, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(freq * 0.7, c.currentTime + 0.12)
  g.gain.setValueAtTime(0.04, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18)
  o.connect(g).connect(c.destination)
  o.start()
  o.stop(c.currentTime + 0.2)
}

function startAmbient() {
  const c = ensureCtx()
  if (!c || !master || ambient) return

  const nodes: AudioNode[] = []
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2200
  filter.Q.value = 0.6
  filter.connect(master)
  nodes.push(filter)

  // Warm quiet pad (C major triad, high enough to feel airy — not a horror drone)
  ;[
    { f: 261.63, g: 0.045 }, // C4
    { f: 329.63, g: 0.035 }, // E4
    { f: 392.0, g: 0.03 }, // G4
    { f: 523.25, g: 0.02 }, // C5
  ].forEach(({ f, g: gain }) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    const g = c.createGain()
    g.gain.value = gain
    o.connect(g).connect(filter)
    o.start()
    nodes.push(o, g)
  })

  // Slow breathing on the pad
  const lfo = c.createOscillator()
  lfo.frequency.value = 0.08
  const lfoGain = c.createGain()
  lfoGain.gain.value = 80
  lfo.connect(lfoGain).connect(filter.frequency)
  lfo.start()
  nodes.push(lfo, lfoGain)

  // Soft music-box arpeggio: C–E–G–A–G–E, looping
  const notes = [523.25, 659.25, 783.99, 880.0, 783.99, 659.25]
  let noteIdx = 0
  let timer: number | undefined
  const playNote = () => {
    if (!enabled.value || !c) return
    const f = notes[noteIdx % notes.length]!
    noteIdx++
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.value = f
    const t0 = c.currentTime
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(0.055, t0 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4)
    o.connect(g).connect(filter)
    o.start(t0)
    o.stop(t0 + 1.5)
  }
  playNote()
  timer = window.setInterval(playNote, 1600)

  master.gain.cancelScheduledValues(c.currentTime)
  master.gain.setValueAtTime(0.0001, c.currentTime)
  master.gain.exponentialRampToValueAtTime(0.55, c.currentTime + 2.4)

  ambient = {
    stop() {
      if (timer) window.clearInterval(timer)
      if (!c || !master) return
      master.gain.cancelScheduledValues(c.currentTime)
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), c.currentTime)
      master.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.8)
      setTimeout(() => {
        nodes.forEach((n) => {
          try { (n as OscillatorNode).stop?.() } catch { /* */ }
          try { n.disconnect() } catch { /* */ }
        })
      }, 900)
    },
  }
}

async function enable() {
  const c = ensureCtx()
  if (!c) return false
  if (c.state === 'suspended') {
    try { await c.resume() } catch { return false }
  }
  if (c.state !== 'running') return false
  if (!enabled.value) {
    enabled.value = true
    startAmbient()
  }
  return true
}

function disable() {
  if (!enabled.value) return
  enabled.value = false
  ambient?.stop()
  ambient = null
}

function bindUnlock() {
  if (unlockBound) return
  unlockBound = true
  const unlock = () => {
    void enable().then((ok) => {
      if (ok) {
        window.removeEventListener('pointerdown', unlock)
        window.removeEventListener('keydown', unlock)
        window.removeEventListener('touchstart', unlock)
      }
    })
  }
  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock)
  window.addEventListener('touchstart', unlock, { passive: true })
}

/**
 * Call after boot. Browsers often block autoplay — we try immediately,
 * then unlock on the first tap/key if needed. Mute stays available.
 */
export async function tryAutoplay() {
  const ok = await enable()
  if (!ok) bindUnlock()
}

export function useAudio() {
  const toggle = async () => {
    if (!enabled.value) {
      const ok = await enable()
      if (ok) tick(988)
    } else {
      tick(659)
      disable()
    }
  }
  return { enabled, toggle }
}
