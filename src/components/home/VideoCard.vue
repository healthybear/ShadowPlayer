<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { useVideoStorage } from '@/composables/useVideoStorage'
import type { Video } from '@/db/schema'

interface Props {
  video: Video
  progress?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  deleted: []
}>()

const router = useRouter()
const { deleteVideo } = useVideoStorage()

const progressPercentage = computed(() => props.progress || 0)
const isCompleted = computed(() => progressPercentage.value > 95)

function handleClick() {
  router.push(`/player/${props.video.id}`)
}

async function handleDelete(event: Event) {
  event.stopPropagation()

  try {
    await ElMessageBox.confirm(
      `确定要删除视频 "${props.video.filename}" 吗？这将删除所有相关的学习数据（进度、字幕、生词）。`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await deleteVideo(props.video.id)

    ElMessage.success('视频已删除')
    emit('deleted')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
</script>

<template>
  <div class="video-card" @click="handleClick">
    <div class="video-thumbnail">
      <div class="thumbnail-placeholder">🎬</div>
      <div v-if="isCompleted" class="completed-badge">✓ Completed</div>
      <el-button
        class="delete-button"
        type="danger"
        :icon="Delete"
        circle
        size="small"
        @click="handleDelete"
      />
    </div>

    <div class="video-info">
      <h3 class="video-title">{{ video.filename }}</h3>
      <div class="video-meta">
        <span>{{ formatDuration(video.duration) }}</span>
        <span>•</span>
        <span>{{ formatFileSize(video.size) }}</span>
      </div>

      <div v-if="progressPercentage > 0" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
        <span class="progress-text">{{ Math.round(progressPercentage) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--el-bg-color);
}

.video-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.video-thumbnail {
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

.completed-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--el-color-success);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.delete-button {
  position: absolute;
  top: 8px;
  left: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-card:hover .delete-button {
  opacity: 1;
}

.video-info {
  padding: 16px;
}

.video-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-meta {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.video-meta span {
  margin: 0 4px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--el-fill-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--el-color-primary);
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 40px;
  text-align: right;
}
</style>
