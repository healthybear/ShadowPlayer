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
import UploadCard from '@/components/home/UploadCard.vue'
import RecentItem from '@/components/home/RecentItem.vue'

defineOptions({ name: 'HomePageView' })

// 模拟数据，实际应该从 API 获取
const recent = [
  {
    id: '1',
    title: 'Blade Runner 2049 - Language Study',
    duration: '2h 43m',
    date: '2 hours ago',
    thumb: '',
    progress: 75,
  },
  {
    id: '2',
    title: 'Italian Cinema: La Dolce Vita',
    duration: '2h 54m',
    date: 'Yesterday',
    thumb: '',
    progress: 30,
  },
  {
    id: '3',
    title: 'French News - Daily Briefing',
    duration: '25m',
    date: '3 days ago',
    thumb: '',
    progress: 95,
  },
] as const

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

        <!-- Grid 布局，响应式列数 -->
        <div class="home-page__recent-list">
          <RecentItem
            v-for="item in recent"
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
