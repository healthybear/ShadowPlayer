## Context

当前播放器已实现基础功能（播放控制、字幕解析、进度保存），但字幕列表组件（`SubtitleList.vue`）和循环播放逻辑尚未集成到播放器页面。现有的 `VideoPlayerContainer.vue` 只包含视频播放器和控制条，缺少字幕列表的显示区域。

**现有架构：**
- `VideoPlayerContainer.vue` - 播放器容器，管理视频加载和播放状态
- `useVideoPlayer` - 播放控制逻辑
- `useSubtitle` - 字幕加载和同步逻辑
- `SubtitleList.vue` - 虚拟滚动字幕列表（已实现但未使用）

**约束：**
- 必须保持虚拟滚动性能（长字幕文件）
- 响应式布局（桌面/移动端）
- 符合 Material Design 3 设计系统
- 作为教学项目，需要高密度注释

## Goals / Non-Goals

**Goals:**
- 在播放器页面显示字幕列表，支持点击跳转
- 当前播放字幕自动高亮并滚动到可见区域
- 实现单句循环播放（点击字幕 → 循环播放该句）
- 提供循环控制 UI（开关、次数设置）
- 响应式布局适配桌面和移动端

**Non-Goals:**
- 高级 AB 循环（手动标记 A/B 点）- 留给 Phase 2.3
- 逐句播放模式 - 留给 Phase 2.3
- 单词点击查询 - 留给 Phase 2.4
- 字幕编辑功能 - 留给 Phase 3

## Decisions

### 1. 布局方案：Flexbox 分栏 vs Grid

**选择：Flexbox 分栏**

**理由：**
- 桌面端：左侧视频（flex: 1），右侧字幕列表（固定宽度 400px）
- 移动端：上下布局（flex-direction: column）
- Flexbox 更适合单轴布局，代码更简单
- Grid 适合二维布局，这里用不到

**替代方案：**
- CSS Grid - 过度设计，增加复杂度

### 2. 字幕高亮同步：Watch vs Event Listener

**选择：Watch `currentSubtitle` from `useSubtitle`**

**理由：**
- `useSubtitle` 已经通过 `timeupdate` 事件计算 `currentSubtitle`
- 字幕列表只需 watch 这个 ref，响应式更新 `activeId`
- 避免重复监听 `timeupdate`（性能）
- 符合 Vue 3 Composition API 的响应式设计

**替代方案：**
- 直接监听 video 的 `timeupdate` - 重复逻辑，性能差

### 3. 字幕列表自动滚动：scrollIntoView vs DynamicScroller API

**选择：DynamicScroller 的 `scrollToItem` API**

**理由：**
- `vue-virtual-scroller` 提供 `scrollToItem(index)` 方法
- 虚拟滚动需要特殊处理，`scrollIntoView` 不适用（DOM 节点可能未渲染）
- 需要维护 `currentSubtitleIndex`（从 `subtitles` 数组中查找）

**实现细节：**
```typescript
// 在 useSubtitleListSync 中
watch(currentSubtitle, (subtitle) => {
  if (!subtitle) return
  const index = subtitles.value.findIndex(s => s.id === subtitle.id)
  if (index !== -1) {
    scrollerRef.value?.scrollToItem(index)
  }
})
```

### 4. 循环播放实现：setInterval vs timeupdate 监听

**选择：监听 `timeupdate` 事件**

**理由：**
- 视频播放本身就触发 `timeupdate`，无需额外定时器
- 精度足够（通常 250ms 触发一次）
- 避免 `setInterval` 和视频播放不同步的问题

**实现逻辑：**
```typescript
// 在 useLoopPlayback 中
watch(videoElement, (video) => {
  if (!video) return
  
  const handleTimeUpdate = () => {
    if (!loopState.enabled) return
    if (video.currentTime >= loopState.endTime) {
      video.currentTime = loopState.startTime
      loopState.currentLoop++
      
      // 如果设置了循环次数且已完成
      if (loopState.count > 0 && loopState.currentLoop >= loopState.count) {
        loopState.enabled = false
      }
    }
  }
  
  video.addEventListener('timeupdate', handleTimeUpdate)
  return () => video.removeEventListener('timeupdate', handleTimeUpdate)
})
```

### 5. 循环状态管理：Store vs Composable

**选择：Composable（`useLoopPlayback`）**

**理由：**
- 循环状态只在播放器页面使用，不需要全局共享
- Composable 更轻量，符合 Vue 3 最佳实践
- 如果未来需要全局状态，可以轻松迁移到 Store

**API 设计：**
```typescript
interface LoopPlaybackControls {
  loopEnabled: Ref<boolean>
  loopStart: Ref<number>
  loopEnd: Ref<number>
  loopCount: Ref<number>
  currentLoop: Ref<number>
  
  enableLoop: (start: number, end: number, count?: number) => void
  disableLoop: () => void
  toggleLoop: () => void
}
```

### 6. 点击字幕循环：直接循环 vs 先跳转再循环

**选择：直接启用循环并跳转到起点**

**理由：**
- 用户期望：点击字幕 → 立即开始循环播放
- 一步到位，减少交互步骤
- 如果视频正在播放，保持播放状态；如果暂停，则开始播放

**交互流程：**
1. 用户点击字幕列表项
2. 触发 `@select` 事件，传递字幕 ID
3. 查找字幕的 `startTime` 和 `endTime`
4. 调用 `enableLoop(startTime, endTime, 0)` - 0 表示无限循环
5. 跳转到 `startTime` 并播放

## Risks / Trade-offs

### 1. 虚拟滚动的 scrollToItem 性能

**风险：** 频繁调用 `scrollToItem` 可能导致卡顿（每次 `timeupdate` 都触发）

**缓解：**
- 只在 `currentSubtitle` 变化时滚动（不是每次 `timeupdate`）
- 添加防抖（debounce 100ms）
- 添加 `smooth: false` 选项，避免动画开销

### 2. 移动端布局空间不足

**风险：** 移动端屏幕小，上下布局可能导致视频或字幕列表空间不足

**缓解：**
- 视频区域最小高度 40vh，字幕列表最小高度 30vh
- 提供"全屏字幕列表"模式（未来优化）
- 用户可以通过滚动查看完整字幕

### 3. 循环播放的边界情况

**风险：** 
- 用户在循环区间外 seek，循环逻辑可能混乱
- 循环结束时间 < 当前时间，立即跳回起点（可能让用户困惑）

**缓解：**
- 用户手动 seek 时，检查是否在循环区间外 → 自动禁用循环
- 启用循环时，如果当前时间不在区间内，先跳转到起点
- UI 上明确显示循环状态（起止时间、当前循环次数）

### 4. 字幕列表数据格式不匹配

**风险：** `SubtitleList.vue` 期望的数据格式可能与 `useSubtitle` 返回的格式不一致

**当前状态：**
- `SubtitleList.vue` 期望：`{ id, time, text, translation }`
- `useSubtitle` 返回：`SubtitleEntry[]` - `{ id, startTime, endTime, text }`

**缓解：**
- 创建 `computed` 转换数据格式
- 添加 `formatTime` 工具函数（秒 → "00:01:23"）
- 如果字幕没有翻译，`translation` 字段留空

## Open Questions

1. **循环次数默认值？** 
   - 建议：默认无限循环（0），用户可以在设置中修改
   
2. **字幕列表宽度？**
   - 桌面端：400px（固定）还是 30%（响应式）？
   - 建议：400px，更稳定

3. **是否需要"隐藏字幕列表"按钮？**
   - 有些用户可能想要全屏视频
   - 建议：Phase 2.1 先不做，Phase 2.3 再加
