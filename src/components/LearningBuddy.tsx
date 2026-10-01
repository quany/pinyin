import { useState } from 'react'
import type { CSSProperties } from 'react'

export type Animal = 'fox' | 'bunny' | 'bear' | 'frog'
export const animalForGroup: Record<string, Animal> = {
  '单韵母': 'bunny', '声母': 'fox', '复韵母': 'bear', '鼻韵母': 'frog',
}

/** Original vector characters stay crisp at every screen size. */
export function AnimalFace({ animal = 'fox' }: { animal?: Animal }) {
  return <g stroke="#513b52" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
    {animal === 'fox' && <>
      <path d="M25 58 18 13Q38 14 48 36M80 36Q93 13 110 13L103 58" fill="#ffad54"/>
      <path d="m27 40-3-18 17 16m47 0 16-16-3 18" fill="#ffc5ba" stroke="none"/>
      <path d="M23 44Q64 23 105 44L115 68Q98 104 64 109 30 104 13 68Z" fill="#ffad54"/>
      <path d="M15 65q25-4 49 28 24-32 49-28-13 35-49 44-36-9-49-44Z" fill="#fff8e7" stroke="none"/>
    </>}
    {animal === 'bunny' && <>
      <path d="M33 51Q12 0 33 3 53 6 49 45M77 45Q80 0 99 4 119 10 94 53" fill="#fffaf3"/>
      <path d="M33 13q-8 4 5 28m56-28q7 4-6 28" fill="none" stroke="#ffb5c6" strokeWidth="9"/>
      <path d="M23 48q41-25 82 0 24 57-41 62-64-5-41-62Z" fill="#fffaf3"/>
      <path d="m64 90 0 9m0-5-5 0 0 8 10 0 0-8" fill="white"/>
    </>}
    {animal === 'bear' && <>
      <circle cx="28" cy="36" r="19" fill="#c99bf2"/><circle cx="100" cy="36" r="19" fill="#c99bf2"/>
      <circle cx="28" cy="36" r="10" fill="#edcbff" stroke="none"/><circle cx="100" cy="36" r="10" fill="#edcbff" stroke="none"/>
      <path d="M21 51q7-28 43-28t43 28q17 57-43 59-60-2-43-59Z" fill="#c99bf2"/>
      <ellipse cx="64" cy="89" rx="21" ry="15" fill="#fff4e9" stroke="none"/>
    </>}
    {animal === 'frog' && <>
      <path d="M21 59q-12-42 13-42 23-1 26 31h8q2-31 26-31 26 0 13 42 34 45-43 50-77-5-43-50Z" fill="#9bdb85"/>
      <ellipse cx="36" cy="38" rx="11" ry="14" fill="#fffbed" stroke="none"/><ellipse cx="92" cy="38" rx="11" ry="14" fill="#fffbed" stroke="none"/>
      <circle cx="38" cy="38" r="4" fill="#513b52" stroke="none"/><circle cx="90" cy="38" r="4" fill="#513b52" stroke="none"/>
    </>}
    {animal !== 'frog' && <g className="buddy-eyes">
      <path d="M40 65q6-8 12 0m24 0q6-8 12 0" fill="none" strokeWidth="3.5"/>
    </g>}
    <ellipse cx="32" cy="80" rx="9" ry="5" fill="#ff9fbd" stroke="none"/>
    <ellipse cx="96" cy="80" rx="9" ry="5" fill="#ff9fbd" stroke="none"/>
    {animal === 'frog' ? <path d="M45 79q19 18 38 0" fill="none" strokeWidth="3"/> : <>
      <path d="M59 80q5-4 10 0l-5 6Z" fill="#513b52"/>
      <path d="M64 85v5m-7 0q7 9 14 0" fill="none"/>
    </>}
    {animal === 'bunny' && <g transform="translate(100 51)"><path d="m-10-2 11 0 5-8 3 8 10 2-9 6-1 10-7-7-10 2 4-8Z" fill="#ffcc62" strokeWidth="2"/></g>}
  </g>
}

export function AnimalPortrait({ animal = 'fox', className = '' }: { animal?: Animal; className?: string }) {
  return <svg className={`animal-portrait ${className}`} viewBox="0 0 128 128" fill="none" aria-hidden="true"><AnimalFace animal={animal}/></svg>
}

const encouragements = ['大声读一读，我在听哦！', '答错也没关系，再试一次吧！', '你的小进步，我都看见啦！', '学习一会儿，记得看看远处哦。']
export default function LearningBuddy({ animal = 'fox', message }: { animal?: Animal; message: string }) {
  const [index, setIndex] = useState(-1)
  return <div className={`buddy-banner buddy-${animal}`}>
    <button className="buddy-button" aria-label="和拼音小伙伴打个招呼" onClick={() => setIndex(i => (i + 1) % encouragements.length)}>
      <AnimalPortrait animal={animal}/><span className="buddy-tap">点点我</span>
    </button>
    <div className="buddy-speech"><span className="buddy-label">你的拼音小伙伴</span><p aria-live="polite">{index < 0 ? message : encouragements[index]}</p></div>
    <span className="buddy-sparkle" aria-hidden="true">✦</span>
  </div>
}

export function Celebration() {
  return <div className="celebration" aria-hidden="true">{Array.from({length:12},(_,i)=><span key={i} style={{'--piece':i} as CSSProperties}>{i%3===0?'★':i%3===1?'●':'✦'}</span>)}</div>
}
