# Tasks: 词汇表功能实现任务清单

## Sprint 1: 基础设施（2-3 小时）

### 1.1 数据库迁移

- [x] 修改 `src/db/schema.ts`
  - [x] 更新 VocabularyItem 接口，添加新字段
    - [x] normalizedWord: string
    - [x] context?: string
    - [x] timestamp?: number
    - [x] videoId?: string
    - [x] definitions?: Array<{...}>
    - [x] pronunciation?: string
    - [x] audioUrl?: string
    - [x] videoTitle?: string
    - [x] subtitleIndex?: number
    - [x] source: 'captured' | 'legacy'
  - [x] 升级数据库到 version 3
  - [x] 添加 normalizedWord 索引
  - [x] 添加复合索引 `[normalizedWord+videoId+subtitleIndex]`
  - [x] 编写 upgrade 函数处理旧数据
  - [x] 为旧数据生成 normalizedWord
  - [x] 标记旧数据为 source='legacy'

### 1.2 创建工具函数

- [x] 创建 `src/utils/word-tokenizer.ts`
  - [x] 定义 Token 类型
    - [x] displayText: string
    - [x] lookupText?: string
    - [x] type: 'word' | 'space' | 'punctuation'
  - [x] 实现 tokenizeSubtitle() 函数
    - [x] 使用正则表达式分词
    - [x] 区分 word、space、punctuation
    - [x] 为每个 word 生成 lookupText
    - [x] 为每个 word 生成 normalizedWord
  - [x] 实现 normalizeWord() 函数
    - [x] 去除首尾非字母字符
    - [x] 转小写
    - [x] 保留中间的撇号
  - [ ] 添加单元测试用例

- [x] 创建 `src/utils/dictionary-parser.ts`
  - [x] 定义 DictionaryResult 类型
  - [x] 定义 DictionaryDefinition 类型
  - [x] 实现 parseDictionaryResponse() 函数
    - [x] 解析 API 响应
    - [x] 提取音标
    - [x] 提取音频 URL
    - [x] 提取释义列表
    - [x] 处理缺失字段
  - [x] 实现类型守卫函数
  - [ ] 添加单元测试用例

### 1.3 创建 Composables

- [x] 创建 `src/composables/useDictionaryLookup.ts`
  - [x] 定义状态
    - [x] loading: Ref<boolean>
    - [x] error: Ref<string | null>
    - [x] result: Ref<DictionaryResult | null>
  - [x] 实现 fetchWord() 函数
    - [x] 检查缓存
    - [x] 调用 Free Dictionary API
    - [x] 处理超时（5 秒）
    - [x] 处理错误（404、5xx、网络错误）
    - [x] 解析响应
    - [x] 存入缓存
  - [x] 实现请求取消逻辑（AbortController）
  - [x] 实现 clearCache() 函数
  - [x] 添加注释（企业项目经验）

- [x] 创建 `src/composables/useVocabulary.ts`
  - [x] 实现 addWord() 函数
    - [x] 数据验证
    - [x] 重复检测
    - [x] 写入数据库
    - [x] 错误处理
  - [x] 实现 checkDuplicate() 函数
    - [x] 按 normalizedWord + videoId + subtitleIndex 查询
  - [x] 实现 deleteWord() 函数
  - [x] 实现 getVocabularyList() 函数
  - [x] 添加注释（企业项目经验）

- [x] 创建 `src/composables/usePronunciationAudio.ts`（Phase 1.5 可选）
  - [x] 实现音频缓存
  - [x] 实现 playAudio() 函数
  - [x] 实现 preloadAudio() 函数
  - [x] 错误处理

## Sprint 2: UI 集成（3-4 小时）

### 2.1 修改 SubtitleOverlay 组件

- [x] 修改 `src/components/player/SubtitleOverlay.vue`
  - [x] 更新 Props 接口
    - [x] text: string
    - [x] subtitleIndex: number
    - [x] startTime: number
  - [x] 导入 tokenizeSubtitle
  - [x] 使用 computed 分词字幕文本
  - [x] 修改模板，渲染分词后的 tokens
    - [x] word 类型：渲染为可点击的 span
    - [x] space 类型：渲染为普通文本
    - [x] punctuation 类型：渲染为普通文本
  - [x] 添加 word 的 hover 效果（CSS）
  - [x] 实现 handleWordClick() 方法
    - [x] 获取当前字幕的完整文本（context）
    - [x] 使用 startTime 作为 timestamp
    - [x] 使用 props.subtitleIndex 作为 subtitleIndex
    - [x] 传递 normalizedWord
    - [x] emit word-click 事件
  - [x] 添加注释（为什么用 computed、为什么分离 displayText 和 lookupText）

### 2.2 重构 WordPopup 组件

- [x] 重构 `src/components/player/WordPopup.vue`
  - [x] 更新 Props 接口
    - [x] 添加 displayText、lookupText、normalizedWord
    - [x] 添加 context、timestamp、videoId、subtitleIndex
  - [x] 定义状态机
    - [x] state: 'closed' | 'loading' | 'display' | 'manual'
  - [x] 集成 useDictionaryLookup
  - [x] 集成 useVocabulary
  - [x] 实现状态转换逻辑
    - [x] closed -> loading（打开弹窗时）
    - [x] loading -> display（API 成功）
    - [x] loading -> manual（API 失败）
  - [x] 实现 UI 渲染
    - [x] loading 状态：显示加载动画
    - [x] display 状态：显示词典信息
      - [x] 原始显示词形（displayText）
      - [x] 音标
      - [x] 释义列表（按词性分组）
      - [x] 上下文
      - [x] 播放音频按钮（可选）
      - [x] Add to Vocabulary 按钮
      - [x] Close 按钮
    - [x] manual 状态：显示手动输入表单
      - [x] 音标输入框
      - [x] 释义输入框
      - [x] Add 按钮
      - [x] Close 按钮
  - [x] 实现 handleAddToVocabulary() 方法
    - [x] 调用 useVocabulary.addWord()
    - [x] 显示 Toast 提示
    - [x] emit added 成功事件（不传整个 VocabularyItem）
    - [x] 关闭弹窗
  - [x] 添加注释（状态机设计、错误处理）

### 2.3 修改 VideoPlayerContainer 组件

- [x] 修改 `src/components/player/VideoPlayerContainer.vue`
  - [x] 添加状态
    - [x] wordPopupVisible: Ref<boolean>
    - [x] selectedWord: Ref<WordClickPayload | null>
  - [x] 实现 handleWordClick() 方法
    - [x] 保存 selectedWord
    - [x] 打开 WordPopup
  - [x] 实现 handlePopupClose() 方法
  - [x] 实现 handleWordAdded() 方法
    - [x] 显示成功 Toast
    - [x] 关闭弹窗
  - [x] 在模板中添加 WordPopup 组件
    - [x] 绑定 props
    - [x] 绑定 emits
  - [x] 修改 SubtitleOverlay 组件
    - [x] 添加 @word-click 监听
  - [x] 处理路由参数（从词汇表跳转回来）
    - [x] 在初始化阶段解析 route.query.time 和 route.query.subtitleIndex
    - [x] 在 loadedmetadata 后统一决定 seek 目标
    - [x] 如果有 time，优先跳转到指定时间
    - [x] 如果有 subtitleIndex，高亮对应字幕
    - [x] 如果没有 time，回退到恢复上次进度
  - [x] 添加注释（路由优先级逻辑）

## Sprint 3: 词汇表页面（1-2 小时）

### 3.1 修改 Vocabulary 页面

- [x] 修改 `src/views/vocabulary/index.vue`
  - [x] 更新 VocabularyItem 类型引用
  - [x] 修改词汇项渲染
    - [x] 显示音标（如果有）
    - [x] 显示首条释义或摘要（可折叠）
    - [x] 显示上下文（如果有）
    - [x] 显示时间戳（格式化为 MM:SS）
    - [x] 显示视频标题（如果有）
    - [x] 对 legacy 数据显示"缺少上下文"提示
  - [x] 修改 handleWordClick() 方法
    - [x] 构造路由参数：time、subtitleIndex、from=vocabulary
    - [x] 跳转到播放器页面
  - [x] 实现删除功能
    - [x] 添加删除按钮
    - [x] 显示确认对话框
    - [x] 调用 useVocabulary.deleteWord()
    - [x] 刷新列表
  - [x] 添加注释（为什么区分 legacy 数据）

### 3.2 测试完整流程

- [ ] 手动测试：添加单词流程
  - [ ] 上传视频和字幕
  - [ ] 播放视频
  - [ ] 点击字幕中的单词
  - [ ] 验证 WordPopup 显示
  - [ ] 验证 API 调用（检查 Network 面板）
  - [ ] 点击 Add to Vocabulary
  - [ ] 验证 Toast 提示
  - [ ] 切换到 Vocabulary 页面
  - [ ] 验证单词显示

- [ ] 手动测试：跳转回视频流程
  - [ ] 在 Vocabulary 页面点击单词
  - [ ] 验证路由跳转
  - [ ] 验证视频时间跳转
  - [ ] 验证字幕高亮（如果实现）

- [ ] 手动测试：错误处理
  - [ ] 断网测试（API 失败）
  - [ ] 生僻词测试（404）
  - [ ] 重复添加测试

## Phase 1.5: 增强体验（可选，2-3 小时）

### 4.1 音频播放功能

- [ ] 在 WordPopup 中添加播放按钮
- [ ] 集成 usePronunciationAudio
- [ ] 实现播放逻辑
- [ ] 错误处理（音频加载失败）

### 4.2 编辑模式

- [ ] 扩展 WordPopup 状态机
  - [ ] state: 'edit'
- [ ] 在 display 状态中添加 Edit 按钮
- [ ] 实现 edit 状态的 UI
- [ ] 实现表单验证
- [ ] 实现保存逻辑
- [ ] 实现取消逻辑

### 4.3 重复检测提示

- [ ] 复用 Phase 1 已实现的重复检测结果
- [ ] 如果已存在，显示"已收藏"标记
- [ ] Toast 提示"Already in vocabulary"

### 4.4 Toast 提示优化

- [ ] 添加成功：绿色 Toast
- [ ] 添加失败：红色 Toast
- [ ] 重复添加：黄色 Toast

### 4.5 导出 CSV 功能

- [ ] 在 Vocabulary 页面添加导出按钮
- [ ] 实现 exportToCSV() 函数
  - [ ] 构造 CSV 内容
  - [ ] 创建 Blob
  - [ ] 触发下载
- [ ] 处理特殊字符（逗号、换行）

## 验收标准

### 功能完整性

- [ ] 用户可以点击字幕中的任意单词
- [ ] 自动查询并显示单词释义
- [ ] 可以添加单词到词汇表
- [ ] 词汇表页面显示完整信息
- [ ] 可以从词汇表跳转回视频
- [ ] 播放器在 time 路由参数存在时优先跳到指定时间点

### 用户体验

- [ ] 加载状态清晰（不超过 5 秒）
- [ ] 错误提示友好（网络错误、API 失败）
- [ ] 操作反馈及时（Toast 提示）
- [ ] API 失败时可以手动输入

### 性能

- [ ] API 响应缓存，避免重复查询
- [ ] 快速点击时取消上一个请求
- [ ] 分词性能 < 10ms（100 字字幕）

### Phase 1.5 验收（可选）

- [ ] 可以播放单词发音
- [ ] 编辑模式可用
- [ ] 导出 CSV 可用

### 代码质量

- [ ] TypeScript 类型完整，业务代码避免 any
- [ ] 错误处理完善，无未捕获异常
- [ ] 注释清晰，符合教学项目标准
- [ ] 组件职责单一，可复用

## 注意事项

1. **数据库迁移**：先备份数据，测试迁移逻辑
2. **API 调用**：注意 CORS 问题，可能需要配置 Vite 代理
3. **错误处理**：每个 async 函数都要有 try-catch
4. **类型安全**：避免使用 any，使用类型守卫
5. **注释密度**：这是教学项目，注释要详细
6. **性能测试**：用长字幕测试分词性能
7. **边缘情况**：测试空字符串、纯标点、特殊字符
8. **回跳生命周期**：不要在 metadata 之前直接依赖 seek 成功
