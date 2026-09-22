import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

// Service worker: registered after first paint, never on the critical path.
// Second visit (e.g. to re-check a phone number) is served from cache instantly.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    import('virtual:pwa-register')
      .then(({ registerSW }) => registerSW({ immediate: true }))
      .catch(() => { /* PWA is a bonus, never a blocker */ })
  })
}
