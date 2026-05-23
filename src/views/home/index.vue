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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import VideoUploader from '@/components/home/VideoUploader.vue'
import VideoList from '@/components/home/VideoList.vue'
import VideoToolbar from '@/components/home/VideoToolbar.vue'

defineOptions({ name: 'HomePageView' })

const router = useRouter()
const uploadKey = ref(0)
const videoListRef = ref<InstanceType<typeof VideoList>>()

const totalCount = computed(() => videoListRef.value?.totalCount || 0)

const handleUploadSuccess = () => {
  uploadKey.value++
  // 刷新视频列表
  videoListRef.value?.loadVideos()
}

const handleVideoClick = (id: string) => {
  router.push(`/player/${id}`)
}

const handleSearch = (keyword: string) => {
  videoListRef.value?.handleSearch(keyword)
}

const handleSort = (type: 'date' | 'name' | 'duration') => {
  videoListRef.value?.handleSort(type)
}
</script>

<template>
  <div class="home-page">
    <main class="home-page__main">
      <section class="home-page__upload">
        <h1 class="home-page__title">ShadowPlayer</h1>
        <p class="home-page__subtitle">Upload a video to start learning</p>
        <VideoUploader :key="uploadKey" @upload-success="handleUploadSuccess" />
      </section>

      <section class="home-page__videos">
        <h2 class="home-page__section-title">Your Videos</h2>
        <VideoToolbar
          :total-count="totalCount"
          @search="handleSearch"
          @sort="handleSort"
        />
        <VideoList ref="videoListRef" @video-click="handleVideoClick" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: var(--md-sys-color-background);
}

.home-page__main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

.home-page__upload {
  text-align: center;
  margin-bottom: 64px;
}

.home-page__title {
  margin: 0 0 8px;
  font-size: var(--md-sys-typescale-display-small-size);
  font-weight: var(--md-sys-typescale-display-small-weight);
  color: var(--md-sys-color-on-surface);
}

.home-page__subtitle {
  margin: 0 0 32px;
  font-size: var(--md-sys-typescale-body-large-size);
  color: var(--md-sys-color-on-surface-variant);
}

.home-page__videos {
  margin-top: 48px;
}

.home-page__section-title {
  margin: 0 0 24px;
  font-size: var(--md-sys-typescale-headline-medium-size);
  font-weight: var(--md-sys-typescale-headline-medium-weight);
  color: var(--md-sys-color-on-surface);
}

@media (max-width: 768px) {
  .home-page__main {
    padding: 24px 16px;
  }

  .home-page__title {
    font-size: var(--md-sys-typescale-headline-large-size);
  }
}
</style>
