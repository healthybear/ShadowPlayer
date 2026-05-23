<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElEmpty } from 'element-plus'
import VideoCard from './VideoCard.vue'
import { useVideoStorage } from '@/composables/useVideoStorage'
import { db } from '@/db/schema'
import type { Video } from '@/db/schema'

interface VideoWithProgress extends Video {
  progress?: number
}

const { getAllVideos } = useVideoStorage()
const allVideos = ref<VideoWithProgress[]>([])
const loading = ref(true)
const searchKeyword = ref('')
const sortType = ref<'date' | 'name' | 'duration'>('date')

// 过滤和排序后的视频列表
const videos = computed(() => {
  let result = [...allVideos.value]

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(video =>
      video.filename.toLowerCase().includes(keyword)
    )
  }

  // 排序
  result.sort((a, b) => {
    switch (sortType.value) {
      case 'name':
        return a.filename.localeCompare(b.filename)
      case 'duration':
        return b.duration - a.duration
      case 'date':
      default:
        return b.uploadedAt - a.uploadedAt
    }
  })

  return result
})

async function loadVideos() {
  loading.value = true
  try {
    const fetchedVideos = await getAllVideos()

    const videosWithProgress = await Promise.all(
      fetchedVideos.map(async (video) => {
        const progressRecord = await db.progress.get(video.id)
        return {
          ...video,
          progress: progressRecord?.percentage || 0
        }
      })
    )

    allVideos.value = videosWithProgress
  } catch (error) {
    console.error('Failed to load videos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadVideos()
})

// 刷新列表（删除后调用）
function handleVideoDeleted() {
  loadVideos()
}

// 搜索
function handleSearch(keyword: string) {
  searchKeyword.value = keyword
}

// 排序
function handleSort(type: 'date' | 'name' | 'duration') {
  sortType.value = type
}

// 暴露方法和数据给父组件
defineExpose({
  loadVideos,
  handleSearch,
  handleSort,
  totalCount: computed(() => allVideos.value.length)
})
</script>

<template>
  <div class="video-list">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><i-ep-loading /></el-icon>
      <p>Loading videos...</p>
    </div>

    <div v-else-if="videos.length === 0" class="empty-state">
      <el-empty description="No videos yet. Upload your first video to get started!" />
    </div>

    <div v-else class="video-grid">
      <VideoCard
        v-for="video in videos"
        :key="video.id"
        :video="video"
        :progress="video.progress"
        @deleted="handleVideoDeleted"
      />
    </div>
  </div>
</template>

<style scoped>
.video-list {
  width: 100%;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  color: var(--el-text-color-secondary);
}

.loading .el-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.empty-state {
  padding: 64px 24px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px 0;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
