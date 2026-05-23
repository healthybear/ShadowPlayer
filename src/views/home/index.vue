<!--
  Home Page (首页)

  页面结构：
  - 上传卡片（主要操作）
  - 最近播放列表（快速访问）

  响应式布局：
  - 移动端：单列
  - 平板：2 列
  - 桌面：3 列
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UploadCard from '@/components/home/UploadCard.vue'
import RecentItem from '@/components/home/RecentItem.vue'
import { useHistoryStore } from '@/stores/history'
import type { VideoItem } from '@/api/types'

defineOptions({ name: 'HomePageView' })

// 使用 history store 获取最近播放数据
// 企业项目经验：首页和历史页面共享同一个数据源，避免重复请求
const historyStore = useHistoryStore()

const recentVideos = ref<VideoItem[]>([])
const loading = ref(false)

// 组件挂载时加载最近播放数据
onMounted(async () => {
  loading.value = true
  try {
    recentVideos.value = await historyStore.fetchRecent(3)
  }
  finally {
    loading.value = false
  }
})

const handleUpload = () => {
  console.log('Upload clicked')
}

const handleVideoClick = (id: string) => {
  console.log('Video clicked:', id)
}
</script>

<template>
  <div class="home-page">
    <AppTopNav nav-preset="home" />

    <main class="home-page__main">
      <UploadCard @upload="handleUpload" />

      <section class="home-page__recent">
        <div class="home-page__recent-header">
          <h2 class="home-page__section-title">Recent Playback</h2>
          <RouterLink to="/history" class="home-page__view-all">
            View all
            <el-icon :size="12">
              <ArrowRight />
            </el-icon>
          </RouterLink>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="home-page__loading">
          <el-icon class="is-loading" :size="24">
            <Loading />
          </el-icon>
        </div>

        <!-- Grid 布局，响应式列数 -->
        <div v-else class="home-page__recent-list">
          <RecentItem
            v-for="item in recentVideos"
            :key="item.id"
            :thumbnail="item.thumb"
            :title="item.title"
            :duration="item.duration"
            :date="item.date"
            @click="handleVideoClick(item.id)"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: var(--md-sys-color-background);
}

/* 响应式容器宽度
 * Material Design 3 断点：600px, 840px, 1200px
 */
.home-page__main {
  max-width: 100%;
  margin: 0 auto;
  padding: 80px 16px 96px;
}

@media (min-width: 600px) {
  .home-page__main {
    max-width: 600px;
    padding: 80px 24px 96px;
  }
}

@media (min-width: 840px) {
  .home-page__main {
    max-width: 800px;
    padding: 80px 32px 96px;
  }
}

.home-page__recent {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-page__recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-page__section-title {
  margin: 0;
  font-size: var(--md-sys-typescale-headline-small-size);
  font-weight: var(--md-sys-typescale-headline-small-weight);
  color: var(--md-sys-color-on-surface);
}

.home-page__view-all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--md-sys-typescale-label-large-size);
  color: var(--md-sys-color-primary);
  text-decoration: none;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.home-page__view-all:hover {
  opacity: 0.8;
}

/* 加载状态 */
.home-page__loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
  color: var(--md-sys-color-on-surface-variant);
}

/* 响应式 Grid 布局
 * 移动端：1 列
 * 平板：2 列
 * 桌面：3 列
 */
.home-page__recent-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 600px) {
  .home-page__recent-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 840px) {
  .home-page__recent-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
