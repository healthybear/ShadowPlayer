<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useVideoPlayer } from '@/composables/useVideoPlayer'
import { useSubtitle } from '@/composables/useSubtitle'
import { usePlaybackProgress } from '@/composables/usePlaybackProgress'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useVideoStorage } from '@/composables/useVideoStorage'
import VideoPlayer from './VideoPlayer.vue'
import VideoControls from './VideoControls.vue'
import SubtitleOverlay from './SubtitleOverlay.vue'
import { ElMessage } from 'element-plus'

interface Props {
  videoId: string
}

const props = defineProps<Props>()

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)
const videoElement = computed(() => videoPlayerRef.value?.videoRef)
const videoUrl = ref<string>('')
const loading = ref(true)
const error = ref<string>('')

const { getVideo, getVideoBlob, updateLastPlayed } = useVideoStorage()
const playerControls = useVideoPlayer(videoElement)
const { currentSubtitle, subtitleVisible, toggleSubtitleVisibility } = useSubtitle(videoElement, props.videoId)
const { loadProgress, startTracking } = usePlaybackProgress(props.videoId, videoElement)

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

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

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
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
  onIncreaseSpeed: handleIncreaseSpeed
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
      <el-icon class="is-loading"><i-ep-loading /></el-icon>
      <p>Loading video...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <el-icon class="error-icon"><i-ep-warning /></el-icon>
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
        @toggle-play="playerControls.togglePlay"
        @seek="playerControls.seek"
        @set-volume="playerControls.setVolume"
        @toggle-mute="playerControls.toggleMute"
        @set-playback-rate="playerControls.setPlaybackRate"
        @toggle-fullscreen="playerControls.toggleFullscreen"
        @toggle-subtitle="toggleSubtitleVisibility"
      />
    </div>
  </div>
</template>

<style scoped>
.video-player-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
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
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  width: 100%;
}
</style>
