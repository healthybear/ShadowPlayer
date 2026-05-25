## Why

ShadowPlayer 的播放器目前只有基础的视频播放功能，缺少"影子跟读"应用的核心交互能力。用户无法有效地进行跟读练习，因为字幕列表未集成到播放器界面，也没有循环播放功能来重复练习某个句子。这些是跟读应用的基础功能，必须在 Phase 2 中补充。

## What Changes

- 在播放器页面集成字幕列表（桌面端左右分栏，移动端上下分栏）
- 实现点击字幕跳转到对应时间
- 实现当前播放字幕的自动高亮和滚动跟随
- 实现 AB 循环播放功能（点击字幕循环播放该句）
- 添加循环控制 UI（循环次数设置、循环状态指示器）
- 优化播放器布局以容纳字幕列表

## Capabilities

### New Capabilities
- `subtitle-list-integration`: 字幕列表在播放器页面的显示、交互和同步
- `loop-playback`: AB 循环播放功能，支持单句循环和自定义区间循环

### Modified Capabilities
<!-- 无现有 capability 的需求变更 -->

## Impact

**受影响的组件：**
- `views/player/index.vue` - 需要调整布局以容纳字幕列表
- `components/player/VideoPlayerContainer.vue` - 需要集成字幕列表组件
- `components/player/SubtitleList.vue` - 需要连接到播放器状态
- `components/player/VideoControls.vue` - 需要添加循环控制按钮

**新增的 composables：**
- `useSubtitleListSync.ts` - 处理字幕列表的高亮和自动滚动
- `useLoopPlayback.ts` - 处理循环播放逻辑

**受影响的样式：**
- 播放器布局需要支持响应式分栏（桌面/移动端）
- 字幕列表需要适配新的布局容器

**无 Breaking Changes**
