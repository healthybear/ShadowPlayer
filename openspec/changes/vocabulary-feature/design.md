# Design: 词汇表功能技术设计

## 架构概览

本文档详细描述词汇表功能的技术实现细节，包括组件接口、数据流、状态管理等。

## 数据流设计

### 添加单词到词汇表的完整流程

1. 用户点击字幕中的单词
2. SubtitleOverlay 触发 word-click 事件
3. VideoPlayerContainer 接收事件，打开 WordPopup
4. WordPopup 调用 useDictionaryLookup 查询 API
5. 用户点击 "Add to Vocabulary"
6. useVocabulary.addWord() 写入数据库
7. 显示成功提示

### 从词汇表跳转回视频的流程

1. 用户在 Vocabulary 页面点击词汇项
2. 路由跳转到 /player/:id?time=xxx&subtitleIndex=xxx
3. VideoPlayerContainer 在初始化阶段解析路由参数并保存目标跳转信息
4. 视频元数据加载完成后，优先跳转到指定时间点（而不是恢复上次进度）
5. 如果存在 subtitleIndex，则同步高亮对应字幕项

### 跳转优先级规则

这是播放器链路里最关键的行为规则之一，必须提前写死。

1. 如果路由中存在 `time`，优先跳到 `time`
2. 如果同时存在 `subtitleIndex`，用于辅助高亮和列表定位
3. 如果没有 `time`，才执行“恢复上次播放进度”

为什么要这样做？

- 从词汇表回跳时，用户意图非常明确：回到单词出现的学习场景
- 这时“学习上下文优先级”高于“继续观看进度优先级”
- 如果在 `onMounted` 就直接 seek，后续 `loadedmetadata` 或进度恢复逻辑可能会把它覆盖

## 核心模块设计

### word-tokenizer.ts

职责：字幕分词、词形规范化

关键函数：
- tokenizeSubtitle(text: string): Token[]
- normalizeWord(raw: string): string

关键设计决策：

- `displayText`：字幕里原样显示给用户的文本
- `lookupText`：送给词典 API 的查询词
- `normalizedWord`：缓存、索引、重复检测使用的稳定值

企业项目经验：显示文本和业务主键不要混用，否则标点、大小写和缩写会让缓存与去重逻辑变脆弱。

### useDictionaryLookup.ts

职责：API 调用、缓存、超时、取消

关键函数：
- fetchWord(word: string): Promise<DictionaryResult>
- clearCache(): void

### useVocabulary.ts

职责：词汇表 CRUD、重复检测、数据验证

关键函数：
- addWord(item: VocabularyItem): Promise<void>
- checkDuplicate(item: VocabularyItem): Promise<boolean>
- deleteWord(id: string): Promise<void>

重复检测规则：

- 相同 `normalizedWord`
- 相同 `videoId`
- 相同 `subtitleIndex`

视为同一条词汇记录，不重复插入。

数据库索引要求：

- `normalizedWord`
- `[normalizedWord+videoId+subtitleIndex]`

为什么需要复合索引？

- 业务规则本身就是三元组唯一
- 不能只靠单列索引再在内存中过滤，否则数据量增长后性能和一致性都会变差

## 组件接口设计

### SubtitleOverlay.vue

Props:
- text: string
- subtitleIndex: number
- startTime: number

为什么需要这些 props？

- `text` 只够渲染，不够生成完整的 `word-click` payload
- `startTime` 用于构造词汇回跳时的 `timestamp`
- `subtitleIndex` 用于词汇去重和播放器回跳高亮

Emits:
- word-click: { displayText, lookupText, normalizedWord, context, timestamp, subtitleIndex }

### WordPopup.vue

Props:
- visible: boolean
- displayText: string
- lookupText: string
- normalizedWord: string
- context: string
- timestamp: number
- videoId: string
- subtitleIndex: number

为什么要拆成 3 个字段？

- `displayText` 用于 UI 展示，保留用户点击时看到的原始词形
- `lookupText` 用于词典查询，避免把标点直接送进 API
- `normalizedWord` 用于缓存、索引和重复检测，保证数据稳定

企业项目经验：UI 展示字段、第三方 API 输入字段、数据库主业务字段通常不是同一个值，提前拆开能避免后续大量条件分支。

Emits:
- close: []
- added: []

为什么不用 `added: [VocabularyItem]`？

- WordPopup 内部已经负责调用 `useVocabulary.addWord()` 完成写库
- 父组件只关心“添加成功”这个结果，用成功事件即可
- 降低父子组件的数据耦合，让 WordPopup 只暴露最小必要接口

State:
- state: 'closed' | 'loading' | 'display' | 'manual'
- dictionaryResult: DictionaryResult | null
- error: string | null

## 错误处理策略

### API 错误分类

- 网络错误：显示重试按钮
- 超时：显示重试按钮
- 404：切换到手动输入模式
- 5xx：切换到手动输入模式

### 数据库错误

- 写入失败：显示错误详情 + 重试按钮
- 查询失败：显示错误详情 + 重试按钮
- 迁移失败：提示用户清除数据

## 性能考虑

### 关键性能指标

- API 响应时间：< 1s
- 分词性能：< 10ms (100 字字幕)

Phase 1 不强制要求：

- 词汇列表 1000 条专项性能优化
- 音频播放延迟指标

这些属于 Phase 1.5 增强目标，不作为核心闭环验收门槛。

### 优化策略

1. 分词优化：使用正则表达式一次性分词，结果缓存在 computed 中
2. API 优化：请求缓存、请求取消、超时控制
3. 渲染优化：虚拟滚动、避免不必要的重新渲染

## 测试策略

### 单元测试

- word-tokenizer.ts：测试各种标点符号组合、缩写、边缘情况
- dictionary-parser.ts：测试响应解析、缺失字段处理、类型守卫
- useVocabulary.ts：测试重复检测、数据验证、CRUD 操作

### 集成测试

- 添加单词流程：点击字幕 → API 调用 → 数据库写入 → Toast 提示
- 跳转回视频流程：点击词汇 → 路由跳转 → metadata 加载 → 视频跳转 → 字幕高亮

## 教学注释策略

根据 CLAUDE.md 的要求：

1. 解释"为什么"，不解释"是什么"
2. 标注工程化决策（企业项目经验）
3. 指出常见陷阱
4. 标注性能考虑
