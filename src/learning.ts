import data from './curriculum.json'
export interface Word { hanzi: string; pinyin: string }
export interface Lesson {
  id: number; page: number; group: string; title: string; letters: string; tip: string;
  recognition: string; syllables: string[]; comparisons: string[]; words: Word[];
  characters: string; sentences: Word[];
}
export const lessons: Lesson[] = data
export const allWords = lessons.flatMap(l => l.words.map(w => ({ ...w, lessonId: l.id })))
export const STORAGE_KEY = 'pinyin-kingdom-v1'
export interface Practice { lessonId: number; date: string; level: 'again' | 'good' | 'great' }
export interface Progress { practices: Practice[]; favorites: string[]; quizStars: number; lastLesson: number }
export const emptyProgress = (): Progress => ({ practices: [], favorites: [], quizStars: 0, lastLesson: 1 })
// Only accept known data: local storage can be unavailable, outdated or manually edited.
export function parseProgress(raw: string | null): Progress {
  try {
    const value = JSON.parse(raw || 'null')
    if (!value || typeof value !== 'object') return emptyProgress()
    return {
      practices: Array.isArray(value.practices) ? value.practices.filter((p: Practice) => p && Number.isInteger(p.lessonId) && p.lessonId >= 1 && p.lessonId <= 14 && typeof p.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && ['again','good','great'].includes(p.level)) : [],
      favorites: Array.isArray(value.favorites) ? [...new Set<string>(value.favorites.filter((f: unknown) => typeof f === 'string' && allWords.some(w => w.hanzi === f)))] : [],
      quizStars: Number.isSafeInteger(value.quizStars) && value.quizStars >= 0 ? value.quizStars : 0,
      lastLesson: Number.isInteger(value.lastLesson) && value.lastLesson >= 1 && value.lastLesson <= 14 ? value.lastLesson : 1,
    }
  } catch { return emptyProgress() }
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
export function masteredLessons(p: Progress) {
  return new Set(lessons.filter(l => p.practices.findLast(practice => practice.lessonId === l.id)?.level === 'great').map(l => l.id))
}
export function streak(p: Progress, now = new Date()) {
  const days = new Set(p.practices.map(item => item.date))
  const cursor = new Date(now); let count = 0
  if (!days.has(localDate(cursor))) cursor.setDate(cursor.getDate()-1)
  while (days.has(localDate(cursor))) { count++; cursor.setDate(cursor.getDate()-1) }
  return count
}
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items]
  for (let i=result.length-1; i>0; i--) { const j=Math.floor(random()*(i+1)); [result[i],result[j]]=[result[j],result[i]] }
  return result
}
export interface Question { prompt: string; answer: string; choices: string[]; explanation: string; word?: string }
export function makeQuestions(lesson?: Lesson): Question[] {
  const words = lesson ? lesson.words : allWords
  if (words.length) {
    return shuffle(words).slice(0,5).map(w => ({
      prompt: `“${w.hanzi}”的拼音是哪一个？`, answer: w.pinyin, word: w.hanzi,
      choices: shuffle([w.pinyin, ...shuffle([...new Set(words.filter(other=>other.pinyin!==w.pinyin).map(other=>other.pinyin))]).slice(0,3)]),
      explanation: `${w.hanzi}，读作 ${w.pinyin}。再一起读一遍吧！`
    }))
  }
  const vowels = lesson?.id === 2 ? ['ī í ǐ ì','ū ú ǔ ù','ǖ ǘ ǚ ǜ'] : ['ā á ǎ à','ō ó ǒ ò','ē é ě è']
  return shuffle(vowels.flatMap(row=>row.split(' ').map((v,i)=>({prompt:`找一找：哪个是${['一','二','三','四'][i]}声？`,answer:v,choices:shuffle(row.split(' ')),explanation:['一声高高平又平。','二声爬坡向上扬。','三声拐弯下又上。','四声下坡快又响。'][i]})))).slice(0,5)
}
export const charts = {
  '声母': 'b p m f d t n l g k h j q x zh ch sh r z c s y w'.split(' '),
  '韵母': 'a o e i u ü ai ei ui ao ou iu ie üe er an en in un ün ang eng ing ong'.split(' '),
  '整体认读音节': 'zhi chi shi ri zi ci si yi wu yu ye yue yuan yin yun ying'.split(' '),
}
export function lessonsForSymbol(symbol: string) {
  const special: Record<string, number> = { zhi:8,chi:8,shi:8,ri:8,zi:7,ci:7,si:7,yi:9,wu:9,yu:9,ye:12,yue:12,yuan:13,yin:13,yun:13,ying:14 }
  return special[symbol] || lessons.find(l=>l.letters.split(' ').includes(symbol))?.id || 1
}
