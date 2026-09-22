import { computed, ref, watchEffect } from 'vue'

export type Lang = 'tj' | 'ru'

const STORAGE_KEY = 'wedding:lang'

/** One dictionary, two languages. Every visible string lives here. */
const dict = {
  tj: {
    htmlLang: 'tg',
    title: 'Хисрав & Фариштабону — Тӯй',
    sysHeader: 'SYSTEM://WEDDING_NOTIFICATION',
    bootLine1: 'СИСТЕМА БОР МЕШАВАД',
    bootLine2: 'ҲУРУФ, СКРИПТҲО, РАСМҲО',
    bootReady: 'ТАЙЁР',
    groom: 'ДОМОД',
    bride: 'АРӮС',
    and: '&',
    notice: 'ҲОДИСА: АҚДИ НИКОҲ',
    invited: 'ШУМО ДАЪВАТ ШУДАЕД',
    inviteBody: 'Шуморо самимона даъват менамоем, ки ин рӯзи хушро бо мо ҷашн гиред.',
    scroll: 'ПОЁНТАР',
    infoTitle: 'МАЪЛУМОТ',
    infoSub: 'STATUS // EVENT_DATA',
    date: 'САНА',
    time: 'ВАҚТ',
    venue: 'ҶОЙИ БАРГУЗОРӢ',
    coords: 'КООРДИНАТҲО',
    openMap: 'ХАРИТА',
    contacts: 'ТАМОС',
    groomFather: 'Падари домод',
    brideFather: 'Падари арӯс',
    call: 'ЗАНГ ЗАНЕД',
    addToCalendar: 'БА ТАҚВИМ ИЛОВА КУНЕД',
    footer: 'Шуморо интизорем',
    sound: 'САДО',
    soundOn: 'Садоро фаъол кунед',
    soundOff: 'Садоро хомӯш кунед',
    langSwitch: 'Забон',
    weekdays: ['Якшанбе', 'Душанбе', 'Сешанбе', 'Чоршанбе', 'Панҷшанбе', 'Ҷумъа', 'Шанбе'],
    months: ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'],
    icsTitle: 'Тӯйи Хисрав ва Фариштабону',
    icsDesc: 'Даъватнома ба тӯй',
  },
  ru: {
    htmlLang: 'ru',
    title: 'Хисрав & Фариштабону — Свадьба',
    sysHeader: 'SYSTEM://WEDDING_NOTIFICATION',
    bootLine1: 'ЗАГРУЗКА СИСТЕМЫ',
    bootLine2: 'ШРИФТЫ, СКРИПТЫ, РЕСУРСЫ',
    bootReady: 'ГОТОВО',
    groom: 'ЖЕНИХ',
    bride: 'НЕВЕСТА',
    and: '&',
    notice: 'СОСТОЯЛОСЬ СОБЫТИЕ: БРАКОСОЧЕТАНИЕ',
    invited: 'ВЫ ПРИГЛАШЕНЫ',
    inviteBody: 'Приглашаем вас разделить с нами этот день.',
    scroll: 'ПРОКРУТИТЕ',
    infoTitle: 'ИНФОРМАЦИЯ',
    infoSub: 'STATUS // EVENT_DATA',
    date: 'ДАТА',
    time: 'ВРЕМЯ',
    venue: 'МЕСТО ПРОВЕДЕНИЯ',
    coords: 'КООРДИНАТЫ',
    openMap: 'КАРТА',
    contacts: 'КОНТАКТЫ',
    groomFather: 'Отец жениха',
    brideFather: 'Отец невесты',
    call: 'ПОЗВОНИТЬ',
    addToCalendar: 'ДОБАВИТЬ В КАЛЕНДАРЬ',
    footer: 'Ждём вас',
    sound: 'ЗВУК',
    soundOn: 'Включить звук',
    soundOff: 'Выключить звук',
    langSwitch: 'Язык',
    weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    icsTitle: 'Свадьба Хисрава и Фариштабону',
    icsDesc: 'Приглашение на свадьбу',
  },
} as const

export type Dict = (typeof dict)['tj']

/** Shareable links: `/?l=ru` or `/?l=tj` (also accepts `tg`). */
function langFromUrl(): Lang | null {
  try {
    const raw = new URLSearchParams(location.search).get('l')?.toLowerCase()
    if (raw === 'ru') return 'ru'
    if (raw === 'tj' || raw === 'tg') return 'tj'
  } catch { /* ignore */ }
  return null
}

function syncLangToUrl(l: Lang) {
  try {
    const url = new URL(location.href)
    url.searchParams.set('l', l)
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  } catch { /* ignore */ }
}

function initialLang(): Lang {
  // URL wins so shared invitation links open in the intended language.
  const fromUrl = langFromUrl()
  if (fromUrl) return fromUrl
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'tj') return saved
  } catch { /* private mode etc. */ }
  return 'tj' // default is Tajik, per spec
}

const lang = ref<Lang>(initialLang())

// Keep the address bar in sync when the page was opened without ?l=
if (typeof location !== 'undefined' && !langFromUrl()) {
  syncLangToUrl(lang.value)
}

/** Module-level singleton: one reactive language for the whole app. */
export function useI18n() {
  const t = computed<Dict>(() => dict[lang.value] as Dict)

  const setLang = (l: Lang) => {
    lang.value = l
    syncLangToUrl(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
  }
  const toggle = () => setLang(lang.value === 'tj' ? 'ru' : 'tj')

  /** Pick a value from a { ru, tj } object */
  const pick = <A, B>(v: { ru: A; tj: B }): A | B => v[lang.value]

  return { lang, t, setLang, toggle, pick }
}

/** Keep <html lang> and <title> in sync. Call once from App. */
export function bindDocumentLang() {
  watchEffect(() => {
    const d = dict[lang.value]
    document.documentElement.lang = d.htmlLang
    document.title = d.title
  })
}

/** Locale-aware date parts without relying on Intl 'tg' support (patchy in browsers). */
export function formatDate(iso: string, d: Dict) {
  const date = new Date(iso)
  const day = date.getDate()
  const month = d.months[date.getMonth()]
  const year = date.getFullYear()
  const weekday = d.weekdays[date.getDay()]
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    human: `${day} ${month} ${year}`,
    weekday,
    time: `${hh}:${mm}`,
    /** 2026.11.15 — the "system" rendering */
    sys: `${year}.${pad(date.getMonth() + 1)}.${pad(day)}`,
  }
}
