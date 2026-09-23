import { computed, ref } from 'vue'

export type Lang = 'ru' | 'tj'

interface Dictionary {
  meta: {
    htmlLang: string
  }
  hero: {
    eyebrow: string
    invite: string
    scrollHint: string
  }
  info: {
    dateLabel: string
    dateValue: string
    timeValue: string
    placeLabel: string
    venueName: string
    venueCity: string
    mapCta: string
    calendarCta: string
    contactsLabel: string
    callCta: string
    countdownLabel: string
    countdownDone: string
    countdownUnits: { days: string; hours: string; minutes: string; seconds: string }
    shareCta: string
    shareCopied: string
  }
  contacts: {
    fatherGroom: string
    fatherBride: string
  }
  langSwitch: {
    label: string
  }
}

const ru: Dictionary = {
  meta: { htmlLang: 'ru' },
  hero: {
    eyebrow: 'Приглашение',
    invite: 'Приглашаем вас разделить с нами этот особенный день',
    scrollHint: 'Прокрутите вниз',
  },
  info: {
    dateLabel: 'Дата',
    dateValue: '4 октября 2026',
    timeValue: '18:00',
    placeLabel: 'Место',
    venueName: 'Ресторан «Дидор»',
    venueCity: 'г. Душанбе',
    mapCta: 'Открыть на карте',
    calendarCta: 'Добавить в календарь',
    contactsLabel: 'Контакты',
    callCta: 'Позвонить',
    countdownLabel: 'До свадьбы осталось',
    countdownDone: 'Мы уже поженились!',
    countdownUnits: { days: 'дн', hours: 'ч', minutes: 'мин', seconds: 'с' },
    shareCta: 'Поделиться',
    shareCopied: 'Ссылка скопирована',
  },
  contacts: {
    fatherGroom: 'Отец жениха',
    fatherBride: 'Отец невесты',
  },
  langSwitch: {
    label: 'Язык',
  },
}

const tj: Dictionary = {
  meta: { htmlLang: 'tg' },
  hero: {
    eyebrow: 'Даъватнома',
    invite: 'Шуморо даъват мекунем, ки ин рӯзи хосро бо мо тақсим кунед',
    scrollHint: 'Ба поён',
  },
  info: {
    dateLabel: 'Сана',
    dateValue: '4 октябри 2026',
    timeValue: 'соати 18:00',
    placeLabel: 'Макон',
    venueName: 'Тарабхонаи «Дидор»',
    venueCity: 'ш. Душанбе',
    mapCta: 'Дар харита кушоед',
    calendarCta: 'Илова ба тақвим',
    contactsLabel: 'Алоқа',
    callCta: 'Занг задан',
    countdownLabel: 'То тӯй боқӣ мондааст',
    countdownDone: 'Мо аллакай оиладор шудем!',
    countdownUnits: { days: 'рӯз', hours: 'соат', minutes: 'дақ', seconds: 'сон' },
    shareCta: 'Мубодила кардан',
    shareCopied: 'Пайванд нусхабардорӣ шуд',
  },
  contacts: {
    fatherGroom: 'Падари домод',
    fatherBride: 'Падари арус',
  },
  langSwitch: {
    label: 'Забон',
  },
}

const dictionaries: Record<Lang, Dictionary> = { ru, tj }

const STORAGE_KEY = 'wedding-lang'
const LANG_PARAM = 'l'

function parseLang(value: string | null): Lang | null {
  const code = value?.toLowerCase()
  if (code === 'ru' || code === 'tj') return code
  return null
}

function langFromUrl(): Lang | null {
  if (typeof window === 'undefined') return null
  return parseLang(new URLSearchParams(window.location.search).get(LANG_PARAM))
}

function applyLangToUrl(next: Lang) {
  const url = new URL(window.location.href)
  if (url.searchParams.get(LANG_PARAM) === next) return
  url.searchParams.set(LANG_PARAM, next)
  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState(window.history.state, '', nextUrl)
}

function getInitialLang(): Lang {
  const fromUrl = langFromUrl()
  if (fromUrl) return fromUrl
  if (typeof window === 'undefined') return 'ru'
  const stored = parseLang(window.localStorage.getItem(STORAGE_KEY))
  return stored ?? 'ru'
}

const lang = ref<Lang>(getInitialLang())

if (typeof window !== 'undefined') {
  window.localStorage.setItem(STORAGE_KEY, lang.value)
  document.documentElement.lang = dictionaries[lang.value].meta.htmlLang
  applyLangToUrl(lang.value)
}

export function useI18n() {
  const t = computed<Dictionary>(() => dictionaries[lang.value])

  function setLang(next: Lang) {
    lang.value = next
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.lang = dictionaries[next].meta.htmlLang
      applyLangToUrl(next)
    }
  }

  function toggleLang() {
    setLang(lang.value === 'ru' ? 'tj' : 'ru')
  }

  return { lang, t, setLang, toggleLang }
}
