import { computed, ref, watchEffect } from 'vue'

export type Lang = 'tj' | 'ru'

const STORAGE_KEY = 'wedding:lang'

/** One dictionary, two languages. Every visible string lives here. */
const dict = {
  tj: {
    htmlLang: 'tg',
    title: 'Хисрав & Фариштабону — Тӯй',
    sysHeader: 'ДАЪВАТНОМА',
    bootLine1: 'Даъватнома кушода мешавад…',
    bootLine2: 'Ҳуруфҳо, ҳаракатҳо, тасвирҳо',
    bootReady: 'Хуш омадед',
    groom: 'Домод',
    bride: 'Арӯс',
    and: '&',
    notice: 'Шумо ба тӯй даъват шудаед',
    invited: 'Шумо даъват шудаед',
    inviteBody: 'Шуморо самимона даъват менамоем, ки ин рӯзи хушро бо мо ҷашн гиред.',
    scroll: 'Поёнтар',
    infoTitle: 'Маълумот',
    infoSub: 'Рӯз · Ҷой · Тамос',
    date: 'Сана',
    time: 'Вақт',
    venue: 'Ҷои баргузорӣ',
    coords: 'Координатҳо',
    openMap: 'Харита',
    contacts: 'Тамос',
    groomFather: 'Падари домод',
    brideFather: 'Падари арӯс',
    call: 'Занг занед',
    addToCalendar: 'Ба тақвим илова кунед',
    footer: 'Шуморо интизорем',
    sound: 'Садо',
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
    sysHeader: 'ПРИГЛАШЕНИЕ',
    bootLine1: 'Приглашение открывается…',
    bootLine2: 'Шрифты, анимация, ресурсы',
    bootReady: 'Добро пожаловать',
    groom: 'Жених',
    bride: 'Невеста',
    and: '&',
    notice: 'Вы приглашены на свадьбу',
    invited: 'Вы приглашены',
    inviteBody: 'Приглашаем вас разделить с нами этот день.',
    scroll: 'Далее',
    infoTitle: 'Сведения',
    infoSub: 'День · Место · Контакты',
    date: 'Дата',
    time: 'Время',
    venue: 'Место проведения',
    coords: 'Координаты',
    openMap: 'Карта',
    contacts: 'Контакты',
    groomFather: 'Отец жениха',
    brideFather: 'Отец невесты',
    call: 'Позвонить',
    addToCalendar: 'Добавить в календарь',
    footer: 'Ждём вас',
    sound: 'Звук',
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
  const fromUrl = langFromUrl()
  if (fromUrl) return fromUrl
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'tj') return saved
  } catch { /* private mode etc. */ }
  return 'tj'
}

const lang = ref<Lang>(initialLang())

if (typeof location !== 'undefined' && !langFromUrl()) {
  syncLangToUrl(lang.value)
}

export function useI18n() {
  const t = computed<Dict>(() => dict[lang.value] as Dict)

  const setLang = (l: Lang) => {
    lang.value = l
    syncLangToUrl(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
  }
  const toggle = () => setLang(lang.value === 'tj' ? 'ru' : 'tj')

  const pick = <A, B>(v: { ru: A; tj: B }): A | B => v[lang.value]

  return { lang, t, setLang, toggle, pick }
}

export function bindDocumentLang() {
  watchEffect(() => {
    const d = dict[lang.value]
    document.documentElement.lang = d.htmlLang
    document.title = d.title
  })
}

export function formatDate(iso: string, d: Dict) {
  const date = new Date(iso)
  const day = date.getDate()
  const month = d.months[date.getMonth()]
  const year = date.getFullYear()
  const weekday = d.weekdays[date.getDay()]
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  return {
    human: `${day} ${month} ${year}`,
    weekday,
    time: `${hh}:${mm}`,
    /** 15 · XI · 2026 — Belle Époque ceremonial date */
    sys: `${day} · ${roman[date.getMonth()]} · ${year}`,
  }
}
