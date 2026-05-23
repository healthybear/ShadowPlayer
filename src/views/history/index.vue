<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/db/schema'
import type { Video } from '@/db/schema'

defineOptions({ name: 'HistoryPageView' })

interface VideoWithProgress extends Video {
  progress?: number
  lastPlayedAt?: number
}

const router = useRouter()
const videos = ref<VideoWithProgress[]>([])
const loading = ref(true)

async function loadHistory() {
  loading.value = true
  try {
    // 获取所有有播放记录的视频
    const allVideos = await db.videos.toArray()

    const videosWithProgress = await Promise.all(
      allVideos.map(async (video) => {
        const progressRecord = await db.progress.get(video.id)
        return {
          ...video,
          progress: progressRecord?.percentage || 0,
          lastPlayedAt: video.lastPlayedAt || 0
        }
      })
    )

    // 只显示播放过的视频，按最近播放时间排序
    videos.value = videosWithProgress
      .filter(v => v.lastPlayedAt && v.lastPlayedAt > 0)
      .sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0))
  } catch (error) {
    console.error('Failed to load history:', error)
  } finally {
    loading.value = false
  }
}

function handleVideoClick(id: string) {
  router.push(`/player/${id}`)
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return date.toLocaleDateString()
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <div class="history-page">
    <div class="history-container">
      <div class="history-header">
        <h1>Playback History</h1>
        <p class="subtitle">Your recently watched videos</p>
      </div>

      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="32"><i-ep-loading /></el-icon>
        <p>Loading history...</p>
      </div>

      <div v-else-if="videos.length === 0" class="empty-state">
        <el-empty description="No playback history yet. Start watching videos to see them here!" />
      </div>

      <div v-else class="history-list">
        <div
          v-for="video in videos"
          :key="video.id"
          class="history-item"
          @click="handleVideoClick(video.id)"
        >
          <div class="item-thumbnail">
            <div class="thumbnail-placeholder">🎬</div>
            <div v-if="video.progress && video.progress > 0" class="progress-overlay">
              <div class="progress-bar" :style="{ width: `${video.progress}%` }"></div>
            </div>
          </div>

          <div class="item-info">
            <h3 class="item-title">{{ video.filename }}</h3>
            <div class="item-meta">
              <span>{{ formatDuration(video.duration) }}</span>
              <span>•</span>
              <span>{{ formatDate(video.lastPlayedAt || 0) }}</span>
            </div>
            <div v-if="video.progress && video.progress > 0" class="item-progress">
              <span>{{ Math.round(video.progress) }}% watched</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  min-height: calc(100vh - 64px);
  background: var(--el-bg-color);
}

.history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

.history-header {
  margin-bottom: 32px;
}

.history-header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  color: var(--el-text-color-secondary);
}

.loading-state .el-icon {
  margin-bottom: 16px;
}

.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.history-item {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--el-bg-color);
}

.history-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.item-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: var(--el-fill-color-light);
  overflow: hidden;
}

.thumbnail-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: var(--el-text-color-placeholder);
}

.progress-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.progress-bar {
  height: 100%;
  background: var(--el-color-primary);
  transition: width 0.3s;
}

.item-info {
  padding: 16px;
}

.item-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.item-meta span {
  margin: 0 4px;
}

.item-progress {
  font-size: 12px;
  color: var(--el-color-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .history-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
