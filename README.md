# 拼音王国

面向一年级的拼音学习网站，依据《2026一上拼音读本（修改）》制作。React + TypeScript + Vite，部署到 Cloudflare Workers Static Assets。

## 已实现

- 对应原书第 3–16 页的 14 节课程：单韵母、声母、复韵母、前鼻韵母、后鼻韵母。
- 428 个教材拼读练习、213 个词语，以及教材中的生字和句子。
- 原书认读练习、易混音比较，支持顺读、倒读和打乱读。
- 中文词句合成朗读、朗读速度设置、词语收藏与搜索。
- 每课五题挑战及综合挑战、即时反馈、星星奖励。
- 家长记录朗读遍数与掌握程度、每周打卡、连续学习和成长徽章。
- 23 个声母、24 个韵母、16 个整体认读音节的图谱。
- 手机、平板、桌面布局；自托管 Andika 拼音字体；原读本对照。
- 绘本风格的彩虹城堡与四位原创动物伙伴、可点击的鼓励话语、彩色字母卡及答题庆祝动画；支持系统“减少动态效果”设置。

## 本地运行

需要 Node.js 22.12+ 或较新的 LTS 版本。

```sh
npm ci
npm run dev
```

```sh
npm run test       # 教材数据、学习记录、出题与计分输入验证
npm run build      # TypeScript 检查及生产构建
npm run preview    # 预览生产构建
npm run check      # 测试 + 构建
npm run test:browser # 在已授权的 Ego 工作区执行交互与响应式检查
```

## 发布

```sh
npx wrangler login
npm run deploy
```

`wrangler.jsonc` 定义了 `pinyin-kingdom` Worker、静态资源目录 `dist` 和自定义域名 `pinyin.autoclaude.cn`。部署需要对 `autoclaude.cn` 所在 Cloudflare 账户具有权限；Wrangler 会配置自定义域名和证书。应用使用 hash 路由，无需服务器、数据库或付费 AI 服务。

GitHub Actions 会在推送与拉取请求时检查测试和构建。部署使用本机 `npm run deploy`；没有把 OAuth 凭证或 API token 写入仓库。

## 内容与教学边界

- `src/curriculum.json`：结构化教材内容，保留原书顺序和页码；`public/materials/pinyin-reader-2026.pdf`：用户提供的原始读本。
- 原书展示的 `ɑ`、`ɡ` 在结构化文本中统一为 Unicode `a`、`g`，使用 Andika 字体呈现适合初学者的字形。
- 原书把前后鼻韵母统称为复韵母，网站按教学分类单列“鼻韵母”。`er` 在课堂提示中明确为特殊韵母。
- 为逐字注音，拆开了原书紧连的拼音；轻声统一为无声调拼音。原书“耳朵”的 `ěr duǒ` 调整为普通话常见读法 `ěr duo`，原 PDF 保留原样。
- 单个拼音由家长或老师带读；浏览器不直接朗读拉丁拼音，以免误读为英文字母。
- 词句朗读依赖设备的中文 SpeechSynthesis 语音；轻声、变调及多音字可能因语音引擎不同而有差异。标注与教师示范为准，不宣称真人标准示范或自动发音评分。
- 不请求麦克风、摄像头或位置权限。学习记录和收藏存储在本机浏览器 `localStorage`，不跨设备同步。清除浏览器数据将丢失记录。
- 自评“熟练会读”的每课计 3 颗星，按最新自评计算；挑战每答对一题奖励 1 颗星，完成整轮后记入记录，可重复练习。

## 维护

- `src/App.tsx`：学习页面与交互。
- `src/learning.ts`：课程查询、题目生成和学习记录处理。
- `src/learning.test.ts`：内容完整性与核心逻辑测试。
- `src/styles.css`：基础响应式布局；`src/cartoon.css`：卡通主题与互动反馈。
- `src/components/KingdomArt.tsx`：原创 SVG 彩虹城堡插画。
- `src/components/LearningBuddy.tsx`：动物伙伴、鼓励互动和庆祝装饰。

原教材的内容权利归原作者所有；Andika 字体由 `@fontsource/andika` 提供，遵循 SIL Open Font License。此仓库未对原教材重新授予许可证。
