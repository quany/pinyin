import { describe, expect, it } from 'vitest'
import { allWords, charts, emptyProgress, lessons, lessonsForSymbol, localDate, makeQuestions, masteredLessons, parseProgress, shuffle, streak } from './learning'

describe('教材完整性',()=>{
  it('按原书第 3–16 页排列 14 课，覆盖所有拼音',()=>{
    expect(lessons).toHaveLength(14)
    expect(lessons.map(l=>l.page)).toEqual(Array.from({length:14},(_,i)=>i+3))
    expect(lessons.flatMap(l=>l.syllables)).toHaveLength(428)
    expect(allWords).toHaveLength(213)
    expect(charts['声母']).toHaveLength(23)
    expect(charts['韵母']).toHaveLength(24)
    expect(charts['整体认读音节']).toHaveLength(16)
    Object.values(charts).flat().forEach(s=>expect(lessonsForSymbol(s)).toBeGreaterThan(0))
  })
  it('每个词句的汉字与拼音逐字对齐，无重复词语',()=>{
    for(const lesson of lessons){
      for(const word of [...lesson.words,...lesson.sentences]){
        expect(word.pinyin.split(' ').length,word.hanzi).toBe((word.hanzi.match(/[\u3400-\u9fff]/g)||[]).length)
      }
    }
    expect(new Set(allWords.map(w=>w.hanzi)).size).toBe(allWords.length)
  })
  it('保留易错词和轻声，不把 jqx 后的 u 错写成 ü',()=>{
    expect(allWords.find(w=>w.hanzi==='数数')?.pinyin).toBe('shǔ shù')
    expect(allWords.find(w=>w.hanzi==='乐器')?.pinyin).toBe('yuè qì')
    expect(allWords.find(w=>w.hanzi==='娃娃')?.pinyin).toBe('wá wa')
    expect(lessons[5].syllables).toContain('jū')
    expect(lessons[5].syllables).not.toContain('jǖ')
  })
})
describe('学习记录',()=>{
  it('安全恢复缺失、损坏和旧格式记录',()=>{
    expect(parseProgress(null)).toEqual(emptyProgress())
    expect(parseProgress('{bad json')).toEqual(emptyProgress())
    expect(parseProgress('null')).toEqual(emptyProgress())
    expect(parseProgress('12')).toEqual(emptyProgress())
    expect(parseProgress(JSON.stringify({practices:[null,{lessonId:99,date:'x',level:'great'}],favorites:[null,'不存在','妈妈','妈妈'],quizStars:-1,lastLesson:999}))).toEqual({...emptyProgress(),favorites:['妈妈']})
  })
  it('保存记录后可以恢复，并按最新评估计算掌握程度',()=>{
    const p=emptyProgress();p.practices=[{lessonId:1,date:'2026-09-28',level:'great'},{lessonId:1,date:'2026-09-28',level:'again'},{lessonId:2,date:'2026-09-28',level:'great'}]
    expect(parseProgress(JSON.stringify(p))).toEqual(p)
    expect([...masteredLessons(p)]).toEqual([2])
  })
  it('连续天数按本地日历计算，忽略同一天重复练习',()=>{
    const p=emptyProgress();p.practices=['2026-09-26','2026-09-27','2026-09-27','2026-09-28'].map(date=>({lessonId:1,date,level:'good'}))
    expect(streak(p,new Date(2026,8,28,23))).toBe(3)
    expect(streak(p,new Date(2026,8,29,1))).toBe(3)
    expect(streak(p,new Date(2026,8,30))).toBe(0)
    expect(localDate(new Date(2026,8,28,0,1))).toBe('2026-09-28')
  })
  it('跨月份和跨年份也正确累计',()=>{
    const p=emptyProgress();p.practices=['2025-12-30','2025-12-31','2026-01-01'].map(date=>({lessonId:1,date,level:'good'}))
    expect(streak(p,new Date(2026,0,1,15))).toBe(3)
  })
})
describe('挑战出题',()=>{
  it('每课和综合挑战都有五道题，每题恰好一个正确选项',()=>{
    for(const lesson of [undefined,...lessons]){
      const questions=makeQuestions(lesson)
      expect(questions).toHaveLength(5)
      for(const q of questions){expect(q.choices).toHaveLength(4);expect(new Set(q.choices).size).toBe(4);expect(q.choices.filter(c=>c===q.answer)).toHaveLength(1)}
    }
  })
  it('词语挑战仅使用当前课程中的词语和拼音',()=>{
    for(const lesson of lessons.filter(l=>l.words.length)){
      for(const q of makeQuestions(lesson)){
        expect(lesson.words.some(w=>w.hanzi===q.word&&w.pinyin===q.answer)).toBe(true)
        expect(q.choices.every(c=>lesson.words.some(w=>w.pinyin===c))).toBe(true)
      }
    }
  })
  it('打乱朗读不丢失重复音节，也不修改原教材',()=>{
    const input=['ā','á','ā','à'];const output=shuffle(input,()=>0)
    expect([...output].sort()).toEqual([...input].sort());expect(input).toEqual(['ā','á','ā','à']);expect(output).not.toEqual(input)
  })
})
