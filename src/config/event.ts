// Raw, language-agnostic event data.
// Localized display strings live in src/i18n/index.ts — this file only
// holds the "facts" used for computations (countdown, .ics, map/tel links).

export const groomName = 'Хисрав'
export const brideName = 'Фариштабону'

// Dushanbe is UTC+5 year-round (no DST).
export const eventDateISO = '2026-10-04T18:00:00+05:00'
export const eventDurationHours = 4

export const venue = {
  name: 'Дидор',
  city: 'Душанбе',
  mapsQuery: 'Ресторан Дидор Душанбе',
}

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  venue.mapsQuery,
)}`

export interface Contact {
  id: string
  nameKey: 'firdavs' | 'alisher'
  roleKey: 'fatherGroom' | 'fatherBride'
  name: string
  phone: string // display format
  tel: string // tel: link, digits + leading plus
  wa: string // wa.me link, digits only, no plus
}

export const contacts: Contact[] = [
  {
    id: 'firdavs',
    nameKey: 'firdavs',
    roleKey: 'fatherGroom',
    name: 'Фирдавс',
    phone: '+992 55 555 59 77',
    tel: '+992555559977',
    wa: '992555559977',
  },
  {
    id: 'alisher',
    nameKey: 'alisher',
    roleKey: 'fatherBride',
    name: 'Алишер',
    phone: '+992 91 867 33 83',
    tel: '+992918673383',
    wa: '992918673383',
  },
]

export const siteUrl = 'https://khisrav-farishtabonu.wedding'
