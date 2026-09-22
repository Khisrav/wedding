/**
 * Single source of truth for the event. Edit this file only.
 * TODO: replace the date, venue and coordinates before publishing.
 */
export const EVENT = {
  groom: { ru: 'Худоёров Хисрав', tj: 'Худоёров Хисрав' },
  bride: { ru: 'Раджабова Фариштабону', tj: 'Раҷабова Фариштабону' },

  /** ISO 8601 with Dushanbe offset (+05:00). TODO: set the real date & time. */
  start: '2026-11-15T17:00:00+05:00',
  /** Duration in hours, used for the .ics file */
  durationHours: 5,

  /** TODO: venue name + address */
  venue: {
    ru: { name: 'Название зала', address: 'г. Душанбе, улица, дом' },
    tj: { name: 'Номи толор', address: 'ш. Душанбе, кӯча, хона' },
  },

  /** TODO: real coordinates (used for the HUD label and the map link) */
  coords: { lat: 38.5598, lng: 68.787 },

  contacts: [
    { id: 'groom-father', name: { ru: 'Фирдавс', tj: 'Фирдавс' }, roleKey: 'groomFather', phone: '+992 55 555 59 77' },
    { id: 'bride-father', name: { ru: 'Алишер', tj: 'Алишер' }, roleKey: 'brideFather', phone: '+992 12 312 31 23' },
  ],

  /** Shown next to the date like a build hash */
  build: 'v1.0.0 // rev.2b26',
} as const

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export const mapHref = () =>
  `https://maps.google.com/?q=${EVENT.coords.lat},${EVENT.coords.lng}`

export const coordsLabel = () => {
  const { lat, lng } = EVENT.coords
  const f = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(4)}°${v >= 0 ? pos : neg}`
  return `${f(lat, 'N', 'S')} ${f(lng, 'E', 'W')}`
}
