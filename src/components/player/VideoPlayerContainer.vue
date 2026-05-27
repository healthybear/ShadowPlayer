<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElButton, ElIcon } from 'element-plus'
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

interface Props {
  videoId: string
}

const props = defineProps<Props>()

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)
const videoElement = computed(() => videoPlayerRef.value?.videoRef)
const videoUrl = ref<string>('')
const loading = ref(true)
const error = ref<string>('')

// Subtitle list ref for programmatic scrolling
const subtitleListScrollerRef = ref<any>(null)

const { getVideo, getVideoBlob, updateLastPlayed } = useVideoStorage()
const playerControls = useVideoPlayer(videoElement)
const { currentSubtitle, subtitles, subtitleVisible, toggleSubtitleVisibility, hasSubtitle } = useSubtitle(videoElement, props.videoId)
const { loadProgress, startTracking } = usePlaybackProgress(props.videoId, videoElement)

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
 * 为什么需要转换？
 * - SubtitleList 组件期望的格式：{ id, time, text, translation }
 * - useSubtitle 返回的格式：SubtitleEntry[] - { id, startTime, endTime, text }
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
    id: subtitle.id,
    time: formatTime(subtitle.startTime),
    text: subtitle.text,
    translation: '', // 当前版本没有翻译，留空
  }))
})

/**
 * 处理字幕列表项点击
 *
 * 交互逻辑：
 * 1. 查找被点击的字幕
 * 2. 启用循环播放（起点 = 字幕开始时间，终点 = 字幕结束时间）
 * 3. 跳转到字幕开始时间
 * 4. 如果视频暂停，开始播放
 *
 * 为什么点击字幕就启用循环？
 * - 这是"影子跟读"应用的核心交互
 * - 用户期望：点击字幕 → 循环播放这一句 → 跟读练习
 * - 如果只是跳转不循环，用户需要手动点击循环按钮，体验差
 *
 * 企业项目经验：
 * - 好的交互设计是"一步到位"，减少用户操作步骤
 * - 默认行为应该符合大多数用户的预期
 * - 如果用户不想循环，可以按 L 键或点击循环按钮关闭
 */
function handleSubtitleSelect(subtitleId: string) {
  const subtitle = subtitles.value.find(s => s.id === subtitleId)
  if (!subtitle) return

  // 启用循环播放（默认无限循环）
  loopControls.enableLoop(subtitle.startTime, subtitle.endTime, 0)

  // 如果视频暂停，开始播放
  if (!playerControls.isPlaying.value) {
    playerControls.play()
  }
}

async function loadVideo() {
  loading.value = true
  error.value = ''
  try {
    const video = await getVideo(props.videoId)
    if (!video) {
      throw new Error('Video not found in database')
    }

    const blob = await getVideoBlob(video)
    if (!blob) {
      throw new Error('Unable to load video file')
    }

    videoUrl.value = URL.createObjectURL(blob)
    await updateLastPlayed(props.videoId)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load video'
    error.value = errorMessage
    ElMessage.error({
      message: errorMessage,
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}

function handleLoadedMetadata(duration: number) {
  playerControls.duration.value = duration

  loadProgress().then((savedTime) => {
    if (savedTime > 0 && videoElement.value) {
      videoElement.value.currentTime = savedTime
      ElMessage.info({
        message: `Resuming from ${formatTime(savedTime)}`,
        duration: 2000
      })
    }
  })

  startTracking()
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
    playerControls.setPlaybackRate(PLAYBACK_RATES[currentIndex - 1])
  }
}

function handleIncreaseSpeed() {
  const currentIndex = PLAYBACK_RATES.indexOf(playerControls.playbackRate.value)
  if (currentIndex < PLAYBACK_RATES.length - 1) {
    playerControls.setPlaybackRate(PLAYBACK_RATES[currentIndex + 1])
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
  // 清理 Object URL，释放内存
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
        />

        <SubtitleOverlay
          v-if="currentSubtitle && subtitleVisible"
          :text="currentSubtitle.text"
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

    <!-- Subtitle List -->
    <div v-if="!loading && !error" class="subtitle-list-container">
      <SubtitleList
        v-if="hasSubtitle"
        ref="subtitleListScrollerRef"
        :subtitles="formattedSubtitles"
        :active-id="currentSubtitle?.id || ''"
        @select="handleSubtitleSelect"
        @scroll="onUserScroll"
      />
      <div v-else class="subtitle-list-empty">
        <p>No subtitles available</p>
        <el-button type="primary" size="small" @click="$router.push(`/player/${props.videoId}?upload=subtitle`)">
          Upload Subtitle
        </el-button>
      </div>
    </div>
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
 */
.subtitle-list-container {
  width: 400px;
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
