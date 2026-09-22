import { EVENT } from '../config/event'

const toIcsUtc = (d: Date) =>
  d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** Build a minimal RFC 5545 event and trigger a download. No network involved. */
export function downloadIcs(opts: { title: string; description: string; location: string }) {
  const start = new Date(EVENT.start)
  const end = new Date(start.getTime() + EVENT.durationHours * 3600_000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//wedding-invitation//RU-TJ//',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${start.getTime()}@invitation`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escape(opts.title)}`,
    `DESCRIPTION:${escape(opts.description)}`,
    `LOCATION:${escape(opts.location)}`,
    `GEO:${EVENT.coords.lat};${EVENT.coords.lng}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(opts.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'wedding.ics'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
