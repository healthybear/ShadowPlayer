<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElButton, ElIcon, ElDialog } from 'element-plus'
import { Loading, Warning } from '@element-plus/icons-vue'
import { useVideoPlayer } from '@/composables/useVideoPlayer'
import { useSubtitle } from '@/composables/useSubtitle'
import { usePlaybackProgress } from '@/composables/usePlaybackProgress'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useVideoStorage } from '@/composables/useVideoStorage'
import { useSubtitleListSync } from '@/composables/useSubtitleListSync'
import { useLoopPlayback } from '@/composables/useLoopPlayback'
import VideoPlayer from './VideoPlayer.vue'
import VideoControls from './VideoControls.vue'
import SubtitleOverlay from './SubtitleOverlay.vue'
import SubtitleList from './SubtitleList.vue'
import WordPopup from './WordPopup.vue'
import SubtitleUploader from './SubtitleUploader.vue'

interface Props {
  videoId: string
}

const props = defineProps<Props>()
const route = useRoute()

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)
const videoElement = computed(() => videoPlayerRef.value?.videoRef ?? null)
const videoUrl = ref<string>('')
const loading = ref(true)
const error = ref<string>('')

// Subtitle list ref for programmatic scrolling
const subtitleListScrollerRef = ref<any>(null)

// WordPopup 状态
const wordPopupVisible = ref(false)
const selectedWord = ref<{
  displayText: string
  lookupText: string
  normalizedWord: string
  context: string
  timestamp: number
  subtitleIndex: number
} | null>(null)

// SubtitleUploader 对话框状态
const subtitleUploadDialogVisible = ref(false)

// 检查路由参数，如果有 upload=subtitle，打开上传对话框
if (route.query.upload === 'subtitle') {
  subtitleUploadDialogVisible.value = true
}

/**
 * 路由参数：从词汇表跳转回来的目标时间点
 *
 * 为什么需要这个？
 * - 用户从词汇表点击单词，期望跳转到单词出现的视频位置
 * - 路由参数 time 和 subtitleIndex 用于精确定位
 *
 * 跳转优先级规则：
 * 1. 如果路由中存在 time，优先跳到 time
 * 2. 如果同时存在 subtitleIndex，用于辅助高亮和列表定位
 * 3. 如果没有 time，才执行"恢复上次播放进度"
 *
 * 为什么要这样做？
 * - 从词汇表回跳时，用户意图非常明确：回到单词出现的学习场景
 * - 这时"学习上下文优先级"高于"继续观看进度优先级"
 * - 如果在 onMounted 就直接 seek，后续 loadedmetadata 或进度恢复逻辑可能会把它覆盖
 *
 * 企业项目经验：
 * - 路由参数要在初始化阶段解析并保存
 * - 不要在多个地方读取路由参数，容易出现不一致
 * - 优先级规则要提前定义清楚，写在注释里
 */
const routeTime = ref<number | null>(null)
const routeSubtitleIndex = ref<number | null>(null)

// 解析路由参数
if (route.query.time) {
  const time = Number(route.query.time)
  if (!isNaN(time)) {
    routeTime.value = time
  }
}
if (route.query.subtitleIndex) {
  const index = Number(route.query.subtitleIndex)
  if (!isNaN(index)) {
    routeSubtitleIndex.value = index
  }
}

const { getVideo, getVideoBlob, updateLastPlayed } = useVideoStorage()
const playerControls = useVideoPlayer(videoElement)
const { currentSubtitle, subtitles, subtitleVisible, toggleSubtitleVisibility, hasSubtitle } = useSubtitle(videoElement, props.videoId)
const { loadProgress } = usePlaybackProgress(props.videoId, videoElement)

// Loop playback controls
const loopControls = useLoopPlayback(videoElement)

// Subtitle list synchronization
const { onUserScroll } = useSubtitleListSync({
  currentSubtitle,
  subtitles,
  scrollerRef: subtitleListScrollerRef,
})

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

/**
 * 格式化时间显示
 *
 * 企业项目经验：时间格式化的最佳实践
 * - 小于 1 小时：MM:SS（如 "05:23"）
 * - 大于等于 1 小时：HH:MM:SS（如 "1:05:23"）
 * - 使用 padStart 确保两位数显示（如 "05" 而不是 "5"）
 *
 * 为什么不用第三方库（如 date-fns）？
 * - 这个功能很简单，不需要引入额外依赖
 * - 减少 bundle size
 * - 性能更好（避免库的额外开销）
 */
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * 转换字幕数据格式
 *
 * 类型思维：使用 index 作为唯一标识
 * - SubtitleEntry 是值对象，index 是其唯一标识
 * - 转换为字符串以匹配 SubtitleList 组件的接口（期望 string 类型的 id）
 *
 * 为什么不用 UUID？
 * - SubtitleEntry 不是实体，不需要全局唯一 ID
 * - index 在单个字幕文件内唯一，足以标识字幕
 * - 避免生成 UUID 的性能开销（1000 条字幕 = 1000 次生成）
 *
 * 为什么需要转换？
 * - SubtitleList 组件期望的格式：{ id, time, text, translation }
 * - useSubtitle 返回的格式：SubtitleEntry[] - { index, startTime, endTime, text }
 * - 需要一个适配层来转换数据格式
 *
 * 为什么用 computed？
 * - subtitles 变化时自动重新计算
 * - computed 有缓存，避免重复计算
 * - 符合 Vue 3 响应式设计
 *
 * 企业项目经验：
 * - 组件之间的数据格式不匹配是常见问题
 * - 使用 computed 做适配层是最佳实践
 * - 不要修改原始数据，保持数据的不可变性
 */
const formattedSubtitles = computed(() => {
  return subtitles.value.map(subtitle => ({
    id: subtitle.index.toString(), // 使用 index 作为 id，转换为字符串
    time: formatTime(subtitle.startTime),
    text: subtitle.text,
    translation: '', // 当前版本没有翻译，留空
  }))
})

/**
 * 处理字幕列表项点击
 *
 * 类型思维：id 是字符串化的 index，需要转回数字
 * - SubtitleList 传递的 id 是字符串（subtitle.index.toString()）
 * - 需要转换回数字才能与 SubtitleEntry.index 比较
 *
 * 交互逻辑：
 * 1. 查找被点击的字幕
 * 2. 跳转到字幕开始时间
 * 3. 如果视频暂停，开始播放
 * 4. 不启用循环播放（让用户自己决定是否循环）
 *
 * 为什么不自动启用循环？
 * - 用户点击字幕可能只是想跳转到那个位置
 * - 不是所有用户都想循环播放
 * - 如果需要循环，用户可以按 L 键或点击循环按钮
 *
 * 企业项目经验：
 * - 不要假设用户的意图，让用户自己控制
 * - 自动启用功能可能会让用户困惑
 * - 提供快捷键让用户快速启用循环
 */
function handleSubtitleSelect(subtitleId: string) {
  const targetIndex = parseInt(subtitleId, 10)
  const subtitle = subtitles.value.find(s => s.index === targetIndex)
  if (!subtitle) return

  // 跳转到字幕开始时间
  playerControls.seek(subtitle.startTime)

  // 如果视频暂停，开始播放
  // 状态思维：处理 play() 可能失败的情况
  // - play() 返回 Promise，可能因浏览器策略被拒绝
  // - 必须捕获错误，避免未处理的 Promise rejection
  if (!playerControls.isPlaying.value) {
    playerControls.play().catch((error) => {
      // 播放失败（通常是自动播放策略）
      console.warn('Failed to start playback after subtitle selection:', error)
      // 可以选择显示提示，但这里静默处理
      // 因为用户可以手动点击播放按钮
    })
  }
}

async function loadVideo() {
  loading.value = true
  error.value = ''
  try {
    console.log('[VideoPlayerContainer] Loading video:', props.videoId)

    const video = await getVideo(props.videoId)
    if (!video) {
      throw new Error('Video not found in database')
    }

    console.log('[VideoPlayerContainer] Video record found:', {
      id: video.id,
      filename: video.filename,
      storageType: video.storageType,
      hasFileHandle: !!video.fileHandle
    })

    const blob = await getVideoBlob(video)
    if (!blob) {
      throw new Error('Unable to load video file')
    }

    console.log('[VideoPlayerContainer] Blob created:', {
      size: blob.size,
      type: blob.type
    })

    videoUrl.value = URL.createObjectURL(blob)
    console.log('[VideoPlayerContainer] Video URL created:', videoUrl.value.substring(0, 50) + '...')

    await updateLastPlayed(props.videoId)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load video'
    error.value = errorMessage
    console.error('[VideoPlayerContainer] Load video failed:', err)
    ElMessage.error({
      message: errorMessage,
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}

function handleLoadedMetadata(duration: number) {
  console.log('[VideoPlayerContainer] Video metadata loaded, duration:', duration)
  playerControls.duration.value = duration

  /**
   * 跳转优先级逻辑
   *
   * 1. 如果有路由参数 time（从词汇表跳转回来），优先跳到指定时间
   * 2. 如果同时有 subtitleIndex，触发字幕列表滚动和高亮
   * 3. 如果没有 time，才恢复上次播放进度
   *
   * 为什么要这样做？
   * - 从词汇表回跳时，用户意图非常明确：回到单词出现的学习场景
   * - 这时"学习上下文优先级"高于"继续观看进度优先级"
   * - 必须在 loadedmetadata 后统一决定 seek 目标，避免多次 seek 冲突
   * - subtitleIndex 用于辅助高亮和列表定位，提升回跳体验
   *
   * 企业项目经验：
   * - 优先级规则要在一个地方统一处理
   * - 不要在多个地方 seek，容易出现竞态条件
   * - 路由参数优先级高于本地状态
   */
  if (routeTime.value !== null && videoElement.value) {
    // 从词汇表跳转回来，跳到指定时间
    videoElement.value.currentTime = routeTime.value

    // 如果有 subtitleIndex，触发字幕选择（会自动滚动和高亮）
    if (routeSubtitleIndex.value !== null) {
      handleSubtitleSelect(routeSubtitleIndex.value.toString())
    }

    ElMessage.info({
      message: `Jumping to ${formatTime(routeTime.value)}`,
      duration: 2000
    })
  } else {
    // 恢复上次播放进度
    loadProgress().then((savedTime) => {
      if (savedTime > 0 && videoElement.value) {
        videoElement.value.currentTime = savedTime
        ElMessage.info({
          message: `Resuming from ${formatTime(savedTime)}`,
          duration: 2000
        })
      }
    })
  }

  // 进度追踪现在自动启动，无需手动调用
  // usePlaybackProgress 内部使用 watch 自动管理事件监听器
}

/**
 * 处理视频加载错误
 */
function handleVideoError(errorMessage: string) {
  console.error('[VideoPlayerContainer] Video error:', errorMessage)
  error.value = errorMessage
  ElMessage.error({
    message: errorMessage,
    duration: 5000
  })
}

function handleTimeUpdate(time: number) {
  playerControls.currentTime.value = time
}

function handleSeekBackward() {
  if (videoElement.value) {
    playerControls.seek(Math.max(0, videoElement.value.currentTime - 5))
  }
}

function handleSeekForward() {
  if (videoElement.value) {
    playerControls.seek(Math.min(videoElement.value.duration, videoElement.value.currentTime + 5))
  }
}

function handleVolumeUp() {
  playerControls.setVolume(Math.min(1, playerControls.volume.value + 0.1))
}

function handleVolumeDown() {
  playerControls.setVolume(Math.max(0, playerControls.volume.value - 0.1))
}

function handleDecreaseSpeed() {
  const currentIndex = PLAYBACK_RATES.indexOf(playerControls.playbackRate.value)
  if (currentIndex > 0) {
    const newRate = PLAYBACK_RATES[currentIndex - 1]
    if (newRate !== undefined) {
      playerControls.setPlaybackRate(newRate)
    }
  }
}

function handleIncreaseSpeed() {
  const currentIndex = PLAYBACK_RATES.indexOf(playerControls.playbackRate.value)
  if (currentIndex < PLAYBACK_RATES.length - 1) {
    const newRate = PLAYBACK_RATES[currentIndex + 1]
    if (newRate !== undefined) {
      playerControls.setPlaybackRate(newRate)
    }
  }
}

/**
 * 处理循环播放切换（键盘快捷键）
 *
 * 逻辑：
 * 1. 如果循环已启用 → 禁用循环
 * 2. 如果循环未启用：
 *    - 如果有当前字幕 → 循环当前字幕
 *    - 如果没有字幕 → 循环当前 5 秒片段
 *
 * 为什么需要 fallback 逻辑？
 * - 用户可能在没有字幕的时间点按 L 键
 * - 或者视频根本没有字幕
 * - 提供 5 秒循环作为默认行为，总比什么都不做好
 *
 * 企业项目经验：
 * - 快捷键应该在任何情况下都有合理的行为
 * - 不要让用户按了快捷键却没有反应
 * - fallback 逻辑提升用户体验
 */
function handleToggleLoop() {
  if (loopControls.loopEnabled.value) {
    // 已启用，禁用循环
    loopControls.disableLoop()
  } else {
    // 未启用，启用循环
    if (currentSubtitle.value) {
      // 有当前字幕，循环当前字幕
      loopControls.enableLoop(currentSubtitle.value.startTime, currentSubtitle.value.endTime, 0)
    } else {
      // 没有字幕，循环当前 5 秒片段
      const video = videoElement.value
      if (video) {
        const start = Math.max(0, video.currentTime - 2.5)
        const end = Math.min(video.duration, video.currentTime + 2.5)
        loopControls.enableLoop(start, end, 0)
      }
    }
  }
}

/**
 * 处理单词点击
 *
 * 流程：
 * 1. 保存 selectedWord
 * 2. 打开 WordPopup
 *
 * 为什么要保存 selectedWord？
 * - WordPopup 需要这些信息来查询词典和保存到数据库
 * - 父组件作为数据中转站，连接 SubtitleOverlay 和 WordPopup
 *
 * 企业项目经验：
 * - 父组件负责协调子组件之间的通信
 * - 不要让子组件直接通信，容易出现耦合
 * - 数据流要清晰：SubtitleOverlay -> VideoPlayerContainer -> WordPopup
 */
function handleWordClick(payload: {
  displayText: string
  lookupText: string
  normalizedWord: string
  context: string
  timestamp: number
  subtitleIndex: number
}) {
  selectedWord.value = payload
  wordPopupVisible.value = true
}

/**
 * 处理弹窗关闭
 */
function handlePopupClose() {
  wordPopupVisible.value = false
}

/**
 * 处理单词添加成功
 *
 * 流程：
 * 1. 关闭弹窗
 *
 * 为什么不显示 Toast？
 * - WordPopup 内部已经显示了成功提示
 * - 不要重复显示，避免信息过载
 *
 * 企业项目经验：
 * - 成功提示只显示一次
 * - 不要在多个层级重复显示
 * - 用户体验要简洁
 */
function handleWordAdded() {
  wordPopupVisible.value = false
}

/**
 * 处理字幕上传成功
 *
 * 流程：
 * 1. 关闭上传对话框
 * 2. 重新加载字幕（不刷新整个页面）
 *
 * 为什么不刷新页面？
 * - 刷新页面会中断视频播放
 * - 用户体验差
 * - 应该只重新加载字幕数据
 *
 * 企业项目经验：
 * - 避免不必要的页面刷新
 * - 使用响应式更新而不是强制刷新
 */
async function handleSubtitleUploaded() {
  subtitleUploadDialogVisible.value = false

  // 重新加载字幕
  // useSubtitle 会自动监听 videoId 变化并重新加载
  // 但这里 videoId 没变，所以需要手动触发重新加载
  // 简单的方案：重新加载整个组件
  ElMessage.success({
    message: 'Subtitle uploaded successfully! Reloading...',
    duration: 2000
  })

  // 使用 router.replace 重新加载当前路由
  // 这会重新创建组件实例，触发字幕加载
  await router.replace({
    path: `/player/${props.videoId}`,
    query: { t: Date.now() } // 添加时间戳强制重新加载
  })
}

useKeyboardShortcuts({
  onTogglePlay: playerControls.togglePlay,
  onSeekBackward: handleSeekBackward,
  onSeekForward: handleSeekForward,
  onVolumeUp: handleVolumeUp,
  onVolumeDown: handleVolumeDown,
  onToggleFullscreen: playerControls.toggleFullscreen,
  onToggleMute: playerControls.toggleMute,
  onToggleSubtitle: toggleSubtitleVisibility,
  onDecreaseSpeed: handleDecreaseSpeed,
  onIncreaseSpeed: handleIncreaseSpeed,
  onToggleLoop: handleToggleLoop,
})

onMounted(() => {
  loadVideo()
})

onUnmounted(() => {
  // 只清理 Object URL
  // 事件监听器由 useVideoPlayer 和 usePlaybackProgress 的 watch 自动清理
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
})
</script>

<template>
  <div class="video-player-container">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>Loading video...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <el-icon class="error-icon"><Warning /></el-icon>
      <h3>Failed to Load Video</h3>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="loadVideo">Retry</el-button>
        <el-button @click="$router.push('/')">Back to Home</el-button>
      </div>
    </div>

    <div v-else class="player-wrapper">
      <div class="video-wrapper">
        <VideoPlayer
          ref="videoPlayerRef"
          :src="videoUrl"
          @timeupdate="handleTimeUpdate"
          @loadedmetadata="handleLoadedMetadata"
          @error="handleVideoError"
        />

        <SubtitleOverlay
          v-if="currentSubtitle && subtitleVisible"
          :text="currentSubtitle.text"
          :subtitle-index="currentSubtitle.index"
          :start-time="currentSubtitle.startTime"
          @word-click="handleWordClick"
        />
      </div>

      <VideoControls
        :is-playing="playerControls.isPlaying.value"
        :current-time="playerControls.currentTime.value"
        :duration="playerControls.duration.value"
        :volume="playerControls.volume.value"
        :is-muted="playerControls.isMuted.value"
        :playback-rate="playerControls.playbackRate.value"
        :subtitle-visible="subtitleVisible"
        :has-subtitle="currentSubtitle !== null"
        :loop-enabled="loopControls.loopEnabled.value"
        :loop-start="loopControls.loopStart.value"
        :loop-end="loopControls.loopEnd.value"
        :loop-count="loopControls.loopCount.value"
        :current-loop="loopControls.currentLoop.value"
        @toggle-play="playerControls.togglePlay"
        @seek="playerControls.seek"
        @set-volume="playerControls.setVolume"
        @toggle-mute="playerControls.toggleMute"
        @set-playback-rate="playerControls.setPlaybackRate"
        @toggle-fullscreen="playerControls.toggleFullscreen"
        @toggle-subtitle="toggleSubtitleVisibility"
        @toggle-loop="handleToggleLoop"
        @set-loop-count="(count) => loopControls.loopCount.value = count"
      />
    </div>

    <!-- WordPopup -->
    <WordPopup
      v-if="selectedWord"
      :visible="wordPopupVisible"
      :display-text="selectedWord.displayText"
      :lookup-text="selectedWord.lookupText"
      :normalized-word="selectedWord.normalizedWord"
      :context="selectedWord.context"
      :timestamp="selectedWord.timestamp"
      :video-id="props.videoId"
      :subtitle-index="selectedWord.subtitleIndex"
      @close="handlePopupClose"
      @added="handleWordAdded"
    />

    <!-- Subtitle List -->
    <div v-if="!loading && !error" class="subtitle-list-container">
      <SubtitleList
        v-if="hasSubtitle"
        ref="subtitleListScrollerRef"
        :subtitles="formattedSubtitles"
        :active-id="currentSubtitle?.index.toString() || ''"
        @select="handleSubtitleSelect"
        @scroll="onUserScroll"
      />
      <div v-else class="subtitle-list-empty">
        <p>No subtitles available</p>
        <el-button type="primary" size="small" @click="subtitleUploadDialogVisible = true">
          Upload Subtitle
        </el-button>
      </div>
    </div>

    <!-- Subtitle Upload Dialog -->
    <el-dialog
      v-model="subtitleUploadDialogVisible"
      title="Upload Subtitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <SubtitleUploader
        :video-id="props.videoId"
        @uploaded="handleSubtitleUploaded"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
.video-player-container {
  width: 100%;
  max-width: 1400px;
  max-height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  color: var(--el-text-color-secondary);
}

.loading-state .el-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.error-state {
  text-align: center;
}

.error-icon {
  font-size: 48px;
  color: var(--el-color-warning);
  margin-bottom: 16px;
}

.error-state h3 {
  margin: 0 0 16px;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.error-message {
  margin: 0 0 24px;
  max-width: 500px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.player-wrapper {
  flex: 1;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  min-width: 0;
}

.video-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  max-height: calc(100vh - 64px - 80px - 48px);
}

/* 字幕列表容器
 * 企业项目经验：虚拟滚动的关键 - 固定高度
 * - 虚拟滚动必须有明确的高度才能计算可见区域
 * - 使用 flex-shrink: 0 防止被压缩
 * - 桌面端固定宽度 400px，移动端自适应
 * - 使用 calc() 计算高度：视口高度 - 顶部导航栏 - 底部边距
 */
.subtitle-list-container {
  width: 400px;
  height: calc(100vh - 64px - 48px); /* 视口高度 - 导航栏 - 边距 */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.subtitle-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background-color: var(--md-sys-color-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
}

.subtitle-list-empty p {
  margin: 0 0 16px;
  font-size: var(--md-sys-typescale-body-large-size);
}

/* 响应式布局：移动端
 * 企业项目经验：Flexbox 响应式布局的最佳实践
 * - 桌面端：flex-direction: row（左右布局）
 * - 移动端：flex-direction: column（上下布局）
 * - 使用 min-height 确保两个区域都有足够空间
 * - 768px 是常见的移动/桌面分界点
 */
@media (max-width: 768px) {
  .video-player-container {
    flex-direction: column;
    gap: 12px;
  }

  .player-wrapper {
    min-height: 40vh;
  }

  .subtitle-list-container {
    width: 100%;
    min-height: 30vh;
    flex: 1;
  }

  .video-wrapper {
    max-height: 40vh;
  }
}
</style>
