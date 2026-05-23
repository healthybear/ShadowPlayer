# Proposal: Phase 1 - 视频播放器 MVP

## 概述

**目标**：建立 ShadowPlayer 的核心播放能力，实现视频上传、播放、字幕显示和进度记录功能。

**为什么现在做**：这是整个语言学习应用的基础层，后续的学习功能（生词本、跟读等）都依赖于稳定的播放器和字幕系统。

**预期时间**：2-3 周

## 功能范围

### ✅ 包含的功能

1. **视频上传与管理**
   - 本地文件选择（支持 MP4, WebM, MKV 等常见格式）
   - 文件验证（格式、大小限制）
   - 视频元数据提取（时长、分辨率）
   - 存储到 IndexedDB 或使用 File System Access API

2. **视频播放器**
   - 基于 HTML5 `<video>` 元素封装
   - 播放/暂停控制
   - 进度条拖拽
   - 音量控制
   - 倍速播放（0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x）
   - 全屏支持
   - 键盘快捷键（空格暂停、左右箭头跳转等）

3. **播放进度记录**
   - 自动保存当前播放位置（每 5 秒或暂停时）
   - 下次打开视频自动恢复到上次位置
   - 历史记录列表（最近播放的视频）
   - 播放完成度百分比

4. **外挂字幕支持**
   - 上传字幕文件（SRT, VTT 格式）
   - 字幕解析和验证
   - 字幕与视频时间轴同步显示
   - 字幕显示/隐藏切换
   - 字幕样式配置（字体大小、颜色、背景）

### ❌ 不包含的功能（留给后续 Phase）

- 视频内嵌字幕提取（Phase 3）
- 自动生成字幕（Phase 3）
- 点击字幕单词查词（Phase 2）
- 生词本功能（Phase 2）
- 跟读功能（Phase 3）
- 学习数据统计（Phase 3）

## 技术方案

### 1. 视频存储策略

**问题**：IndexedDB 有大小限制（通常 50MB-1GB），大视频文件无法直接存储。

**方案对比**：

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 直接存 Blob 到 IndexedDB | 简单，离线可用 | 大小限制，性能差 | 小文件（< 50MB） |
| File System Access API | 无大小限制，性能好 | 需要用户授权，浏览器兼容性 | 大文件（推荐） |
| 只存文件路径 | 简单 | 文件移动后失效 | 不推荐 |

**最终选择**：混合方案
- 小文件（< 50MB）：直接存 IndexedDB
- 大文件（≥ 50MB）：使用 File System Access API，存储 `FileSystemFileHandle`

```typescript
interface VideoStorage {
  id: string
  filename: string
  size: number
  duration: number
  
  // 存储方式
  storageType: 'blob' | 'file-handle'
  blob?: Blob                           // 小文件
  fileHandle?: FileSystemFileHandle     // 大文件
  
  // 元数据
  uploadedAt: number
  lastPlayedAt?: number
  thumbnailUrl?: string  // 可选：视频缩略图
}
```

### 2. 字幕解析

**支持格式**：
- **SRT**（SubRip）：最常见的字幕格式
- **VTT**（WebVTT）：Web 标准格式

**解析器实现**：

```typescript
interface SubtitleEntry {
  index: number
  startTime: number  // 秒
  endTime: number    // 秒
  text: string
}

// SRT 格式示例：
// 1
// 00:00:01,000 --> 00:00:03,000
// Hello world

function parseSRT(content: string): SubtitleEntry[] {
  const blocks = content.trim().split(/\n\s*\n/)
  return blocks.map(block => {
    const lines = block.split('\n')
    const index = parseInt(lines[0])
    const [start, end] = lines[1].split(' --> ')
    const text = lines.slice(2).join('\n')
    
    return {
      index,
      startTime: parseTimestamp(start),
      endTime: parseTimestamp(end),
      text
    }
  })
}

function parseTimestamp(timestamp: string): number {
  // "00:00:01,000" -> 1.0
  const [time, ms] = timestamp.split(',')
  const [h, m, s] = time.split(':').map(Number)
  return h * 3600 + m * 60 + s + Number(ms) / 1000
}
```

### 3. 字幕同步机制

**挑战**：如何确保字幕与视频精确同步？

**方案**：
- 监听 `<video>` 的 `timeupdate` 事件（每 250ms 触发一次）
- 使用二分查找快速定位当前时间对应的字幕
- 使用 `requestAnimationFrame` 优化渲染性能

```typescript
// composables/useSubtitle.ts
export function useSubtitle(videoElement: Ref<HTMLVideoElement | null>) {
  const currentSubtitle = ref<SubtitleEntry | null>(null)
  const subtitles = ref<SubtitleEntry[]>([])
  
  // 二分查找当前字幕
  function findCurrentSubtitle(currentTime: number): SubtitleEntry | null {
    let left = 0
    let right = subtitles.value.length - 1
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const entry = subtitles.value[mid]
      
      if (currentTime >= entry.startTime && currentTime <= entry.endTime) {
        return entry
      } else if (currentTime < entry.startTime) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }
    
    return null
  }
  
  // 监听视频时间更新
  watchEffect(() => {
    const video = videoElement.value
    if (!video) return
    
    const handleTimeUpdate = () => {
      currentSubtitle.value = findCurrentSubtitle(video.currentTime)
    }
    
    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  })
  
  return {
    currentSubtitle,
    subtitles,
    loadSubtitles: (entries: SubtitleEntry[]) => {
      subtitles.value = entries
    }
  }
}
```

### 4. 播放进度持久化

**策略**：
- 每 5 秒自动保存一次
- 暂停时立即保存
- 播放完成（进度 > 95%）时标记为已完成

```typescript
// composables/usePlaybackProgress.ts
export function usePlaybackProgress(videoId: string) {
  const progress = ref(0)
  const lastSavedTime = ref(0)
  
  // 从 IndexedDB 加载进度
  async function loadProgress() {
    const record = await db.progress.get(videoId)
    if (record) {
      progress.value = record.currentTime
    }
  }
  
  // 保存进度（防抖）
  const saveProgress = useDebounceFn(async (currentTime: number) => {
    await db.progress.put({
      videoId,
      currentTime,
      lastPlayedAt: Date.now()
    })
    lastSavedTime.value = currentTime
  }, 5000)
  
  return {
    progress,
    loadProgress,
    saveProgress
  }
}
```

## 数据模型

### IndexedDB Schema

```typescript
// db/schema.ts
import Dexie, { Table } from 'dexie'

export interface Video {
  id: string                    // UUID
  filename: string
  size: number                  // 字节
  duration: number              // 秒
  storageType: 'blob' | 'file-handle'
  blob?: Blob
  fileHandle?: FileSystemFileHandle
  uploadedAt: number
  lastPlayedAt?: number
}

export interface Subtitle {
  id: string                    // UUID
  videoId: string               // 关联的视频 ID
  filename: string
  language: string              // 'en', 'zh', etc.
  entries: SubtitleEntry[]
  uploadedAt: number
}

export interface PlaybackProgress {
  videoId: string               // 主键
  currentTime: number           // 当前播放位置（秒）
  duration: number              // 视频总时长
  percentage: number            // 完成百分比 (0-100)
  lastPlayedAt: number          // 最后播放时间
  completed: boolean            // 是否已完成（> 95%）
}

export class ShadowPlayerDB extends Dexie {
  videos!: Table<Video, string>
  subtitles!: Table<Subtitle, string>
  progress!: Table<PlaybackProgress, string>
  
  constructor() {
    super('ShadowPlayerDB')
    this.version(1).stores({
      videos: 'id, uploadedAt, lastPlayedAt',
      subtitles: 'id, videoId, uploadedAt',
      progress: 'videoId, lastPlayedAt'
    })
  }
}

export const db = new ShadowPlayerDB()
```

## 组件结构

```
src/
├── components/
│   ├── player/
│   │   ├── VideoPlayer.vue           # 主播放器容器
│   │   ├── VideoControls.vue         # 播放控制条
│   │   ├── VideoProgress.vue         # 进度条组件
│   │   ├── VolumeControl.vue         # 音量控制
│   │   ├── PlaybackSpeed.vue         # 倍速选择
│   │   ├── SubtitleDisplay.vue       # 字幕显示
│   │   └── SubtitleUploader.vue      # 字幕上传
│   │
│   └── home/
│       ├── VideoUploader.vue         # 视频上传
│       ├── VideoList.vue             # 视频列表
│       └── VideoCard.vue             # 视频卡片
│
├── composables/
│   ├── useVideoPlayer.ts             # 播放器核心逻辑
│   ├── useSubtitle.ts                # 字幕管理
│   ├── useVideoStorage.ts            # 视频存储
│   ├── usePlaybackProgress.ts        # 进度追踪
│   └── useKeyboardShortcuts.ts       # 键盘快捷键
│
├── db/
│   └── schema.ts                     # IndexedDB 数据库定义
│
├── utils/
│   ├── subtitle-parser.ts            # 字幕解析器
│   └── video-validator.ts            # 视频文件验证
│
└── views/
    ├── HomeView.vue                  # 首页（视频列表）
    └── PlayerView.vue                # 播放器页面
```

## UI/UX 设计要点

### 1. 视频上传流程

```
┌─────────────────────────────────────┐
│  拖拽区域 或 点击选择文件              │
│                                     │
│     📁 支持 MP4, WebM, MKV          │
│     最大 2GB                        │
│                                     │
└─────────────────────────────────────┘
         ↓ 选择文件后
┌─────────────────────────────────────┐
│  ⏳ 正在处理...                      │
│  ▓▓▓▓▓▓▓▓░░░░░░░░ 60%              │
│  提取元数据、生成缩略图               │
└─────────────────────────────────────┘
         ↓ 完成
┌─────────────────────────────────────┐
│  ✅ 上传成功！                       │
│  [立即播放] [返回列表]               │
└─────────────────────────────────────┘
```

### 2. 播放器布局

```
┌───────────────────────────────────────────────────┐
│                                                   │
│                  视频画面                          │
│                                                   │
│                                                   │
│               ┌─────────────────┐                 │
│               │  Hello world    │  ← 字幕         │
│               └─────────────────┘                 │
├───────────────────────────────────────────────────┤
│ ▶️ ━━━━━━━━━━●━━━━━━━━━━━━━━━━━━ 🔊 ⚙️ ⛶        │
│    01:23 / 05:45              1.0x               │
└───────────────────────────────────────────────────┘
```

### 3. 键盘快捷键

| 按键 | 功能 |
|------|------|
| Space | 播放/暂停 |
| ← | 后退 5 秒 |
| → | 前进 5 秒 |
| ↑ | 音量 +10% |
| ↓ | 音量 -10% |
| F | 全屏切换 |
| M | 静音切换 |
| C | 字幕显示/隐藏 |
| < | 减速（0.25x） |
| > | 加速（0.25x） |

## 验收标准

### 功能验收

- [ ] **视频上传**
  - [ ] 能选择本地视频文件
  - [ ] 能显示上传进度
  - [ ] 能验证文件格式和大小
  - [ ] 能提取视频元数据（时长、分辨率）
  - [ ] 小文件（< 50MB）存储到 IndexedDB
  - [ ] 大文件（≥ 50MB）使用 File System Access API

- [ ] **视频播放**
  - [ ] 能正常播放视频
  - [ ] 播放/暂停按钮工作正常
  - [ ] 进度条能拖拽跳转
  - [ ] 音量控制工作正常
  - [ ] 倍速播放工作正常（0.5x - 2x）
  - [ ] 全屏功能工作正常
  - [ ] 键盘快捷键工作正常

- [ ] **播放进度**
  - [ ] 播放时自动保存进度（每 5 秒）
  - [ ] 暂停时立即保存进度
  - [ ] 下次打开自动恢复到上次位置
  - [ ] 历史记录列表显示最近播放的视频
  - [ ] 显示播放完成度百分比

- [ ] **字幕功能**
  - [ ] 能上传 SRT 格式字幕
  - [ ] 能上传 VTT 格式字幕
  - [ ] 字幕与视频时间轴精确同步（误差 < 100ms）
  - [ ] 能切换字幕显示/隐藏
  - [ ] 字幕样式清晰易读

### 性能验收

- [ ] 视频上传响应时间 < 3 秒（100MB 文件）
- [ ] 播放器启动时间 < 1 秒
- [ ] 字幕切换延迟 < 50ms
- [ ] 进度条拖拽响应时间 < 100ms
- [ ] 内存占用合理（< 500MB for 1080p 视频）

### 代码质量验收

- [ ] 所有组件使用 TypeScript 严格模式
- [ ] 关键逻辑有详细注释（遵循 CLAUDE.md 注释策略）
- [ ] 使用 Composition API (`<script setup>`)
- [ ] Props 使用 `interface` + `withDefaults`
- [ ] 样式优先使用 UnoCSS 原子类
- [ ] 无 ESLint 错误

## 技术风险与缓解

### 风险 1：File System Access API 浏览器兼容性

**影响**：部分浏览器不支持，大文件无法存储

**缓解方案**：
- 检测浏览器支持情况
- 不支持时降级到 IndexedDB（提示用户文件大小限制）
- 或提示用户使用 Chrome/Edge 浏览器

```typescript
function isFileSystemAccessSupported(): boolean {
  return 'showOpenFilePicker' in window
}
```

### 风险 2：字幕同步精度

**影响**：字幕显示不准确，影响学习体验

**缓解方案**：
- 使用二分查找优化查询性能
- 使用 `requestAnimationFrame` 优化渲染
- 提供手动调整字幕偏移的功能（Phase 2）

### 风险 3：大视频文件性能

**影响**：播放卡顿、内存占用高

**缓解方案**：
- 使用原生 `<video>` 元素（浏览器优化）
- 不在内存中缓存整个视频
- 使用 `preload="metadata"` 减少初始加载

## 依赖项

### 新增依赖

```json
{
  "dependencies": {
    "dexie": "^4.0.0",           // IndexedDB 封装
    "uuid": "^10.0.0"            // 生成唯一 ID
  },
  "devDependencies": {
    "@types/uuid": "^10.0.0"
  }
}
```

### 浏览器 API 依赖

- File API（文件选择）
- File System Access API（大文件存储，可选）
- IndexedDB（数据持久化）
- HTML5 Video API（视频播放）

## 后续工作（Phase 2）

完成 Phase 1 后，下一步将实现：
- 交互式字幕（点击单词查词）
- 生词本管理
- 单词注释
- 单词来源定位

---

**提案状态**：待审批  
**创建时间**：2026-05-23  
**预计开始时间**：审批通过后立即开始  
**预计完成时间**：2-3 周后
