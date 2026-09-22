import gsap from 'gsap'

// We intentionally register no extra plugins (no ScrollTrigger) — the
// 2-screen layout only needs simple timelines, which keeps the JS payload
// small for guests on slow mobile connections.
export { gsap }
