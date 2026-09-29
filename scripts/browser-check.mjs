// Run with: npm run test:browser (requires an active, agent-controlled Ego task space).
// Reuse the task space created for this goal; never create a second space here.
const config = globalThis.pinyinCheckConfig || {};
const task = await taskSpace(Number(config.spaceId || 1));
const page = task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride', {width:1440,height:1050,deviceScaleFactor:1,mobile:false});
const { readFile } = await import('node:fs/promises');
const projectDir = config.projectDir;
if (!projectDir) throw new Error('Set PINYIN_PROJECT_DIR to the absolute repository path.');
const curriculum = JSON.parse(await readFile(`${projectDir}/src/curriculum.json`,'utf8'));
const origin = config.origin || 'http://127.0.0.1:5173';
const results=[];
function assert(value,label){if(!value)throw new Error(label);results.push(label)}
await page.goto(origin);
await page.waitForSelector('.course-card');
const previous = await page.evaluate(()=>localStorage.getItem('pinyin-kingdom-v1'));
try {
  await page.evaluate(()=>localStorage.removeItem('pinyin-kingdom-v1'));
  await page.reload(); await page.waitForSelector('.course-card');
  assert(await page.evaluate(()=>document.querySelectorAll('.course-card').length===14),'首页展示 14 课');
  await page.click('loc=css:.filter-tabs button:nth-child(2)');
  assert(await page.evaluate(()=>document.querySelectorAll('.course-card').length===2),'单韵母分类筛选');
  await page.click('loc=css:.course-card:first-child');await page.waitForSelector('.syllable-grid');
  assert(await page.evaluate(()=>document.querySelectorAll('.syllable-grid button').length===21),'课程完整显示 21 个练习音节');
  const first=await page.evaluate(()=>document.querySelector('.syllable-grid button').textContent);
  await page.click('loc=css:.reading-controls button:nth-child(2)');
  assert(await page.evaluate((first)=>[...document.querySelectorAll('.syllable-grid button')].at(-1).textContent===first,first),'倒读顺序正确');
  await page.click('loc=css:.rating-buttons button:nth-child(3)');await page.click('loc=css:.record-options > .primary-button');
  assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('pinyin-kingdom-v1')).practices[0].level==='great'),'家长掌握程度保存');
  assert(await page.evaluate(()=>document.querySelector('.record-options > .primary-button').disabled),'同次记录防止重复点击');
  await page.reload();await page.waitForSelector('.practice-record');
  assert(await page.evaluate(()=>document.querySelector('.practice-record p').textContent.includes('1 遍')),'刷新后恢复练习次数');
  await page.goto(origin+'/#lesson/3');await page.waitForSelector('#tab-words');await page.click('#tab-words');
  await page.click('loc=css:button[aria-label="收藏妈妈"]');
  await page.goto(origin+'/#favorites');await page.waitForSelector('.word-card');
  assert(await page.evaluate(()=>document.querySelector('.word-read')?.getAttribute('aria-label')==='朗读妈妈'),'收藏出现在收藏夹');
  await page.fill('loc=css:input[aria-label="搜索收藏词语"]','不存在');
  assert(await page.evaluate(()=>document.querySelectorAll('.word-card').length===0&&document.querySelector('.empty-state h2').textContent==='还没找到这个词语'),'收藏无匹配搜索空态');
  await page.fill('loc=css:input[aria-label="搜索收藏词语"]','妈妈');await page.click('loc=css:button[aria-label="取消收藏妈妈"]');
  assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('pinyin-kingdom-v1')).favorites.length===0),'取消收藏保存');
  await page.goto(origin+'/#lesson/3');await page.waitForSelector('#tab-quiz');await page.click('#tab-quiz');
  const dictionary=new Map(curriculum[2].words.map(w=>[w.hanzi,w.pinyin]));
  for(let i=0;i<5;i++){
    await page.waitForSelector('.quiz-question h2');
    const word=await page.evaluate(()=>document.querySelector('.quiz-question h2').textContent.match(/“(.+?)”/)[1]);
    const answer=dictionary.get(word);
    const choiceIndex=await page.evaluate(({answer,wrong})=>[...document.querySelectorAll('.answer-grid button')].findIndex(b=>wrong?b.children[1].textContent!==answer:b.children[1].textContent===answer),{answer,wrong:i===0});
    await page.click(`loc=css:.answer-grid button:nth-child(${choiceIndex+1})`);
    assert(await page.evaluate(()=>[...document.querySelectorAll('.answer-grid button')].every(b=>b.disabled)),`第 ${i+1} 题选择后锁定`);
    assert(await page.evaluate(answer=>document.querySelector('.answer-grid button.correct').children[1].textContent===answer,answer),`第 ${i+1} 题反馈标注正确答案`);
    await page.click('loc=css:.answer-feedback .primary-button');
  }
  await page.waitForSelector('.quiz-result');
  assert(await page.evaluate(()=>document.querySelector('.quiz-result').textContent.includes('答对 4 / 5')&&JSON.parse(localStorage.getItem('pinyin-kingdom-v1')).quizStars===4),'闯关 4/5 计分及星星持久化');
  await page.goto(origin+'/#chart');await page.waitForSelector('.alphabet-grid');
  assert(await page.evaluate(()=>document.querySelectorAll('.alphabet-grid button').length===23),'图谱展示 23 个声母');
  await page.click('loc=css:.chart-tabs button:nth-child(3)');
  assert(await page.evaluate(()=>document.querySelectorAll('.alphabet-grid button').length===16),'整体认读图谱展示 16 个音节');
  await page.click('loc=css:.alphabet-grid button:last-child');await page.click('loc=css:.symbol-detail .primary-button');
  await page.waitForSelector('.lesson-header');
  assert(await page.evaluate(()=>location.hash==='#lesson/14'),'ying 正确关联到后鼻韵母课程');
  const overflow=[];
  for(const width of [320,390,768,1440]){
    await page.cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<700});
    for(const route of ['learn','lesson/14','chart','challenge','favorites','progress']){
      await page.goto(origin+'/#'+route);await page.waitForSelector('main h1');
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))overflow.push({width,route});
    }
  }
  assert(overflow.length===0,'320 / 390 / 768 / 1440 像素下的六个主要页面无溢出：'+JSON.stringify(overflow));
  await page.goto(origin+'/#lesson/3');await page.waitForSelector('#tab-words');await page.click('#tab-words');
  console.log({speech:await page.evaluate(()=>({supported:'speechSynthesis' in window,chineseVoices:window.speechSynthesis?.getVoices().filter(v=>/^zh/i.test(v.lang)).length})),tests:results});
  console.log(await page.snapshot());
}finally{
  await page.evaluate(previous=>{if(previous===null)localStorage.removeItem('pinyin-kingdom-v1');else localStorage.setItem('pinyin-kingdom-v1',previous)},previous);
  await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await page.goto(origin+'/#learn');await page.reload();await page.waitForSelector('.course-card');
  const restored = await page.evaluate(()=>localStorage.getItem('pinyin-kingdom-v1'));
  if (previous !== null) assert(restored === previous, '验证结束后原学习记录完整恢复');
  await page.screenshot({path:'/tmp/pinyin-source/home-mobile-final.png'});
}
