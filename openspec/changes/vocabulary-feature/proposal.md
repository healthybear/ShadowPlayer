# Proposal: 词汇表功能完整实现

## 概述

实现完整的词汇表功能闭环，让用户能够在观看视频时点击字幕中的单词，自动查询释义并保存到词汇表，之后可以在专门的词汇表页面复习和管理这些单词。

## 动机

### 当前状态
- ✅ 词汇表页面已存在，有基础的列表展示和搜索功能
- ✅ WordPopup 组件已存在，但只能展示单词信息
- ✅ 数据库中有 `vocabulary` 表，但字段不完整
- ❌ **缺少关键环节**：用户无法从字幕中添加单词到词汇表

### 用户痛点
1. **学习场景断裂**：看到生词时，需要离开应用去查词典，然后手动记录
2. **上下文丢失**：即使记录了单词，也不记得是在哪个视频、哪个场景中遇到的
3. **复习困难**：没有系统化的词汇管理，无法有效复习

### 教学价值
这个功能展示了多个企业级开发的核心概念：
- **外部 API 集成**：调用第三方词典 API，处理异步、错误、超时
- **渐进增强**：API 失败时降级到手动输入，确保功能可用
- **数据库迁移**：安全地升级数据模型，保持向后兼容
- **状态机设计**：管理复杂 UI 的多个状态转换
- **性能优化**：API 缓存、请求取消、音频预加载
- **用户体验**：加载状态、错误提示、成功反馈

## 目标

### 核心目标
1. ✅ 用户可以点击字幕中的任意单词
2. ✅ 自动查询单词释义（使用 Free Dictionary API）
3. ✅ 一键添加到词汇表，保存完整上下文
4. ✅ 在词汇表页面查看、搜索、管理单词
5. ✅ 点击单词可以跳转回视频的精确时间点

### 非目标（留待后续）
- ❌ 多语言支持（Phase 1 只支持英语）
- ❌ 词汇复习模式（如闪卡、测验）
- ❌ 词汇统计和可视化
- ❌ 导出到 Anki 等第三方工具

## 用户体验流程

```
┌─────────────────────────────────────────────────────────────┐
│                   Complete User Journey                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: 用户在播放器页面观看视频                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Subtitle: "I practice English every day"             │ │
│  │             ^^^^^^^^ (点击单词)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  Step 2: 显示 WordPopup，自动查询 API                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  practice                                              │ │
│  │  🔄 Loading definition...                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  Step 3: 显示完整信息（API 成功）                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  practice                                              │ │
│  │  /ˈpræktɪs/                    [🔊 Play Audio]         │ │
│  │  ─────────────────────────────────────────────────     │ │
│  │  noun: Repetition of an activity to improve a skill   │ │
│  │  verb: To repeat an activity as a way of improving... │ │
│  │  ─────────────────────────────────────────────────     │ │
│  │  Context: "I practice English every day"              │ │
│  │  ─────────────────────────────────────────────────     │ │
│  │  [⭐ Add to Vocabulary]  [✏️ Edit]  [✕ Close]         │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  Step 4: 点击"Add to Vocabulary"                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ✅ "practice" added to vocabulary!                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  Step 5: 在 Vocabulary 页面查看                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📝 practice                                           │ │
│  │     /ˈpræktɪs/                                         │ │
│  │     noun: Repetition of an activity...                │ │
│  │     Context: "I practice English every day"           │ │
│  │     From: "English Lesson 1" (00:05:23)               │ │
│  │     Added: 2026-05-28                                 │ │
│  │     [🎬 Go to Video]  [🗑️ Delete]                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 技术方案

### 1. 单词分词策略

**方案**：保留原始显示 + 查询时规范化

Phase 1 不做完整 NLP，也不引入重量级分词库，但不能简单到把标点和查询词混在一起。

核心原则：

1. **显示层保留原文**：字幕里看到什么，就渲染什么
2. **查询层使用规范化结果**：点击 `practice,` 时，查询 `practice`
3. **存储层同时保留两份信息**：既保存原始上下文，也保存规范化后的查询词

```typescript
type Token = {
  type: 'word' | 'space' | 'punctuation'
  displayText: string      // 原始显示文本，例如 "practice,"
  lookupText?: string      // 规范化查询词，例如 "practice"
}

function tokenizeSubtitle(text: string): Token[] {
  // Phase 1 目标：
  // 1. 保留空格和标点的原始显示
  // 2. 只让真正可查询的单词部分可点击
  // 3. 支持常见英语缩写，如 don't、I'm
  return []
}

function normalizeWord(raw: string): string {
  return raw
    .trim()
    .replace(/^[^a-zA-Z]+|[^a-zA-Z']+$/g, '')
    .toLowerCase()
}
```

**示例**：

```text
"I practice English every day."
```

→ 分词结果概念上应接近：

```typescript
[
  { type: 'word', displayText: 'I', lookupText: 'i' },
  { type: 'space', displayText: ' ' },
  { type: 'word', displayText: 'practice', lookupText: 'practice' },
  { type: 'space', displayText: ' ' },
  { type: 'word', displayText: 'English', lookupText: 'english' },
  { type: 'space', displayText: ' ' },
  { type: 'word', displayText: 'every', lookupText: 'every' },
  { type: 'space', displayText: ' ' },
  { type: 'word', displayText: 'day', lookupText: 'day' },
  { type: 'punctuation', displayText: '.' }
]
```

**为什么这样设计？**

- 解决 `practice,`、`"word"`、`day...` 这类高频标点问题
- 缩写如 `don't` 可以整体查询，不会被粗暴拆坏
- 为后续重复检测和词典缓存提供稳定的 `normalizedWord`

**Phase 1 边界**：

- ✅ 处理常见英文标点和缩写
- ✅ 区分 `displayText` 与 `lookupText`
- ❌ 不做词形还原（如 `practiced` -> `practice`）
- ❌ 不做多语言分词

### 2. API 集成方案

**选择**：Free Dictionary API

- **Endpoint**: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- **优点**：完全免费、无需 API key、支持音标和音频
- **限制**：仅支持英语、部分生僻词可能查不到

**API 响应示例**：

```json
[
  {
    "word": "practice",
    "phonetic": "/ˈpræktɪs/",
    "phonetics": [
      {
        "text": "/ˈpræktɪs/",
        "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/practice-us.mp3"
      }
    ],
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "Repetition of an activity to improve a skill.",
            "example": "He will need lots of practice with those lines."
          }
        ]
      },
      {
        "partOfSpeech": "verb",
        "definitions": [
          {
            "definition": "To repeat an activity as a way of improving one's skill.",
            "example": "You should practice playing piano every day."
          }
        ]
      }
    ]
  }
]
```

**错误处理策略**：

| 错误类型 | HTTP 状态 | 处理方式 |
|---------|----------|---------|
| 单词不存在 | 404 | 显示手动输入表单 |
| 网络错误 | - | 显示错误提示 + 重试按钮 |
| 超时 | - | 5 秒超时，显示错误提示 |
| API 错误 | 500/503 | 显示错误提示 + 降级到手动输入 |

### 2.1 查询词与展示词分离

这是这个功能最容易被忽略，但最影响数据质量的决策之一。

- `displayText`：用户在字幕里实际点击到的文本
- `lookupText`：用于词典 API 查询的规范化词
- `normalizedWord`：用于缓存、去重、索引的稳定值

示例：

| 字幕显示 | displayText | lookupText | normalizedWord |
|---------|-------------|------------|----------------|
| `practice,` | `practice,` | `practice` | `practice` |
| `English` | `English` | `English` | `english` |
| `don't` | `don't` | `don't` | `don't` |

企业项目经验：

- 显示数据和业务主键不要混用
- 用户看到的文本不一定适合作为 API 输入
- 稳定的规范化字段能显著降低缓存和重复检测的复杂度

### 3. 数据模型升级

**数据库迁移**：从 version 2 升级到 version 3

```typescript
// 新的 VocabularyItem 接口
export interface VocabularyItem {
  id: string
  word: string               // 用户看到/点击的原始词形（displayText）
  normalizedWord: string     // 去重、缓存、搜索使用的规范化词
  
  // 捕获上下文（新数据要求完整）
  context?: string           // 字幕原文；历史数据可能缺失
  timestamp?: number         // 视频时间点（秒）；历史数据可能缺失
  videoId?: string           // 关联的视频 ID；历史数据可能缺失
  createdAt: number          // 创建时间
  
  // 词典数据（可选，来自 API）
  pronunciation?: string     // 音标
  audioUrl?: string          // 发音音频 URL
  definitions?: Array<{      // 多个释义
    partOfSpeech: string     // 词性（noun, verb, adjective...）
    definition: string       // 释义
    example?: string         // 例句
  }>
  
  // 用户自定义（可选）
  translation?: string       // 用户添加的翻译
  notes?: string             // 用户笔记
  
  // 元数据（可选）
  videoTitle?: string        // 视频标题（冗余，性能优化）
  subtitleIndex?: number     // 字幕索引
  source: 'captured' | 'legacy'
}

// 数据库迁移代码
this.version(3).stores({
  videos: 'id, uploadedAt, lastPlayedAt',
  subtitles: 'id, videoId, uploadedAt',
  progress: 'videoId, lastPlayedAt',
  vocabulary: 'id, normalizedWord, videoId, createdAt, [normalizedWord+videoId+subtitleIndex]'  // 支持重复检测的复合索引
}).upgrade(tx => {
  // 旧数据不伪装成“完整数据”
  // 企业项目经验：缺失值要显式标记，而不是填空字符串/0 掩盖问题
  return tx.table('vocabulary').toCollection().modify(item => {
    if (!item.normalizedWord && item.word) item.normalizedWord = item.word.toLowerCase()
    if (!item.source) item.source = 'legacy'
  })
})
```

**迁移策略**：
- ✅ 向后兼容：历史词汇允许缺少 `context/timestamp/videoId`
- ✅ 显式区分：`source='legacy'` 表示旧数据没有完整上下文
- ✅ 新写入要求完整：播放器中新增的词汇必须写入完整上下文
- ✅ 索引调整：为 `normalizedWord` 建索引，并增加 `[normalizedWord+videoId+subtitleIndex]` 复合索引服务重复检测

**为什么不再给旧数据填 `''` 和 `0`？**

- `timestamp = 0` 会被误解为“视频开头真的出现过这个词”
- `videoId = ''` 会让跳转逻辑无法区分“没有数据”还是“数据异常”
- 教学项目应展示“显式建模缺失数据”的工程实践

### 3.1 重复检测规则

必须在 proposal 阶段先定义“什么叫重复”，否则 agent 很容易实现出不同版本。

**Phase 1 规则**：

- 相同 `normalizedWord`
- 相同 `videoId`
- 相同 `subtitleIndex`

视为同一条词汇记录，不重复插入。

```typescript
function isDuplicate(item: VocabularyItem) {
  return db.vocabulary
    .where('[normalizedWord+videoId+subtitleIndex]')
    .equals([item.normalizedWord, item.videoId ?? '', item.subtitleIndex ?? -1])
    .first()
}
```

**为什么不用“同一个词全局只保留一条”？**

- 同一个词在不同视频、不同语境下都可能有学习价值
- 词汇学习比字典更看重上下文
- 这也更符合“从具体场景回跳复习”的产品目标

### 3.2 从词汇表回跳到播放器的规则

提案必须明确播放器恢复逻辑，否则“点击词汇跳回视频”会和“自动恢复上次进度”冲突。

**路由设计**：

```text
/player/:id?time=323&subtitleIndex=18&from=vocabulary
```

**优先级规则**：

1. 如果路由带 `time`，优先跳到 `time`
2. 如果同时有 `subtitleIndex`，用于辅助高亮和列表定位
3. 如果没有 `time`，才回退到“上次播放进度恢复”

**原因**：

- 用户从词汇表回跳时，意图非常明确：回到这个词出现的位置
- 这时“学习上下文优先级”高于“继续观看进度优先级”

这部分需要显式纳入实现范围，而不是只在词汇页里拼一个 query 参数。

### 4. WordPopup 状态机

Phase 1 的弹窗只承担“查询 -> 展示 -> 手动补录 -> 添加”的核心闭环。

```typescript
type PopupState = 
  | 'closed'       // 关闭
  | 'loading'      // 正在查询 API
  | 'display'      // 显示查询结果
  | 'manual'       // 手动输入（API 失败）

// 状态转换
/*
  closed ──(点击单词)──> loading
    ▲                      │
    │                      ├──(API 成功)──> display
    │                      └──(API 失败)──> manual
    │                                          │
    └──────────────────(点击 Close/Add)────────┴─────────────────────────────────────┘
*/
```

编辑模式保留到 Phase 1.5，再扩展状态机。

### 5. 性能优化

### 5.1 模块边界

为了避免“查词 composable”变成“大而全工具箱”，Phase 1 采用以下职责划分：

- `utils/word-tokenizer.ts`
  负责字幕分词、词形规范化、点击命中
- `utils/dictionary-parser.ts`
  负责清洗第三方 API 响应，输出稳定内部类型
- `composables/useDictionaryLookup.ts`
  负责查询状态、超时、取消、缓存
- `composables/usePronunciationAudio.ts`
  负责发音音频缓存和播放
- `composables/useVocabulary.ts`
  负责词汇 CRUD、重复检测、写入验证

企业项目经验：

- “查询词典” 和 “播放音频” 是两个不同的外部依赖
- 提前拆边界，后续测试和替换 API 都更容易

#### API 缓存
```typescript
// 避免重复查询同一个单词
const cache = new Map<string, DictionaryResult>()

async function fetchWord(word: string) {
  if (cache.has(word)) {
    return cache.get(word)
  }
  const result = await fetch(...)
  cache.set(word, result)
  return result
}
```

#### 请求取消
```typescript
// 用户快速点击多个单词时，取消上一个未完成的请求
let currentController: AbortController | null = null

async function fetchWord(word: string) {
  if (currentController) {
    currentController.abort()
  }
  currentController = new AbortController()
  const response = await fetch(url, { signal: currentController.signal })
  // ...
}
```

#### 音频预加载
```typescript
// 避免每次播放都重新下载
const audioCache = new Map<string, HTMLAudioElement>()

function playPronunciation(audioUrl: string) {
  if (!audioCache.has(audioUrl)) {
    const audio = new Audio(audioUrl)
    audio.preload = 'auto'
    audioCache.set(audioUrl, audio)
  }
  audioCache.get(audioUrl)!.play()
}
```

## 实现范围

### Phase 1：核心闭环（必须完成）

本阶段只关注“从字幕点击单词，到进入词汇表，再从词汇表回跳”的闭环。

**必须交付**：

- [ ] 字幕分词与单词点击
- [ ] 词典 API 查询与降级处理
- [ ] 词汇写入与重复检测
- [ ] 词汇页面展示核心信息
- [ ] 从词汇表跳回视频指定时间点

**明确不纳入 Phase 1 的内容**：

- [ ] 发音音频预加载
- [ ] 编辑模式
- [ ] CSV 导出
- [ ] 1000+ 词汇的专项性能优化

### Sprint 1：基础设施（2-3 小时）

**目标**：搭建数据层和 API 层

- [ ] 数据库迁移到 version 3
- [ ] 创建 `composables/useDictionaryLookup.ts`
  - API 调用逻辑
  - 错误处理
  - 超时控制
  - 缓存机制
- [ ] 创建 `composables/useVocabulary.ts`
  - 词汇表 CRUD 操作
  - 重复检测
  - 数据验证
- [ ] 创建 `utils/word-tokenizer.ts`
  - 字幕分词工具
  - `displayText/lookupText/normalizedWord` 规则
- [ ] 创建 `utils/dictionary-parser.ts`
  - API 响应解析
  - 类型守卫

### Sprint 2：UI 集成（3-4 小时）

**目标**：实现核心交互流程

- [ ] 修改 `SubtitleOverlay.vue`
  - 字幕分词渲染
  - 单词点击事件
  - Hover 效果
  - 标点不可点击，单词可点击
- [ ] 重构 `WordPopup.vue`
  - 状态机实现
  - 集成 API 调用
  - 加载状态
  - 错误处理
  - 手动输入表单
- [ ] 修改 `VideoPlayerContainer.vue`
  - 集成 WordPopup
  - 处理单词点击事件
  - 管理弹窗状态
  - 处理从 query 参数进入时的精准跳转优先级

### Sprint 3：词汇表页面（1-2 小时）

**目标**：让核心闭环可复习

- [ ] 修改 `views/vocabulary/index.vue`
  - 显示音标
  - 显示释义（首条或摘要）
  - 显示上下文
  - 显示时间戳
  - 点击跳转到视频
  - 对 `legacy` 数据显示“缺少上下文”而不是伪造数据
- [ ] 删除功能
  - 删除按钮
  - 确认对话框
  - 删除后刷新列表

### Phase 1.5：增强体验（可选）

这些内容有价值，但不阻塞核心闭环验收。

- [ ] 音频播放功能
  - 播放按钮
  - 音频缓存
  - 错误处理
- [ ] 编辑模式
  - 切换到编辑状态
  - 表单验证
  - 保存/取消
- [ ] 重复检测
  - 检查单词是否已存在
  - 显示"已收藏"标记
  - 提示用户
- [ ] Toast 提示
  - 添加成功
  - 添加失败
  - 重复添加
- [ ] 导出 CSV 功能
  - 导出按钮
  - 生成 CSV 文件
  - 下载

## 成功标准

### 功能完整性
- ✅ 用户可以点击字幕中的任意单词
- ✅ 自动查询并显示单词释义
- ✅ 可以添加单词到词汇表
- ✅ 词汇表页面显示完整信息
- ✅ 可以从词汇表跳转回视频
- ✅ 播放器在 `time` 路由参数存在时优先跳到指定时间点

### 用户体验
- ✅ 加载状态清晰（不超过 5 秒）
- ✅ 错误提示友好（网络错误、API 失败）
- ✅ 操作反馈及时（Toast 提示）
- ✅ 重复添加有提示
- ✅ API 失败时可以手动输入

### 性能
- ✅ API 响应缓存，避免重复查询
- ✅ 快速点击时取消上一个请求

### Phase 1.5 成功标准（可选）
- ✅ 可以播放单词发音
- ✅ 音频预加载，播放流畅
- ✅ 编辑模式可用
- ✅ 导出 CSV 可用

### 代码质量
- ✅ TypeScript 类型完整，业务代码避免 `any`
- ✅ 错误处理完善，无未捕获异常
- ✅ 注释清晰，符合教学项目标准
- ✅ 组件职责单一，可复用

## 风险与挑战

### 技术风险

1. **CORS 问题**
   - **风险**：Free Dictionary API 可能有 CORS 限制
   - **缓解**：开发环境使用 Vite 代理，生产环境测试确认

2. **API 响应格式复杂**
   - **风险**：API 返回的数据结构嵌套很深，边缘情况多
   - **缓解**：创建专门的 parser 函数，添加类型守卫

3. **数据库迁移**
   - **风险**：迁移失败可能导致数据丢失
   - **缓解**：upgrade 函数仔细测试，提供回滚方案

### 用户体验风险

1. **API 查询慢**
   - **风险**：网络慢时，用户等待时间长
   - **缓解**：5 秒超时，显示加载状态，提供取消按钮

2. **生僻词查不到**
   - **风险**：Free Dictionary API 覆盖不全
   - **缓解**：降级到手动输入，用户体验不中断

3. **中文单词无法查询**
   - **风险**：API 只支持英语
   - **缓解**：Phase 1 只支持英语，后续扩展多语言

## 后续扩展方向

完成 Phase 1 后，可以考虑：

### Phase 2：评估是否需要 Pinia
- 如果出现跨页面实时同步复杂度上升，再引入全局 store
- 如果局部 composable 已足够，就不要为教学目的强行上 Pinia
- 词汇统计（总数、今日新增）

### Phase 3：高级功能
- 词汇复习模式（闪卡、测验）
- 词汇统计和可视化
- 按视频、按日期筛选
- 导出到 Anki

### Phase 4：多语言支持
- 集成多语言 API（有道、百度翻译）
- 自动检测语言
- 中英文混合字幕

## 教学价值总结

这个功能是一个完整的"从 0 到 1"的案例，展示了：

1. **外部 API 集成** - 异步、错误处理、超时、缓存
2. **渐进增强** - API 失败时的降级策略
3. **数据库迁移** - 安全升级数据模型
4. **状态机设计** - 管理复杂 UI 状态
5. **性能优化** - 缓存、请求取消、资源预加载
6. **用户体验** - 加载状态、错误提示、成功反馈
7. **类型安全** - TypeScript 的实际应用
8. **组件设计** - 职责单一、可复用

完成后，学生将理解：
- 如何设计和实现一个完整的功能
- 如何处理外部依赖的不确定性
- 如何在用户体验和技术实现之间权衡
- 如何判断什么时候需要全局状态管理，而不是过早引入 Pinia
