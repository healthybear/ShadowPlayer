<!--
  Player Page (播放器页面)

  页面结构：
  - 视频区域（左侧/上方）
    - 视频播放器
    - 字幕覆盖层
    - 单词弹窗
    - 播放控制条
  - 字幕列表（右侧/下方）

  响应式布局：
  - 移动端：上下布局（视频在上，字幕在下）
  - 桌面：左右布局（视频在左，字幕在右）
-->

<script setup lang="ts">
import { useRoute } from 'vue-router'
import VideoPlayerContainer from '@/components/player/VideoPlayerContainer.vue'

defineOptions({ name: 'PlayerPageView' })

const route = useRoute()
const videoId = route.params.id as string
</script>

<template>
  <div class="player-page">
    <main class="player-page__main">
      <VideoPlayerContainer :video-id="videoId" />
    </main>
  </div>
</template>

<style scoped>
.player-page {
  min-height: calc(100vh - 64px); /* 减去导航栏高度 */
  background-color: var(--md-sys-color-background);
  display: flex;
  flex-direction: column;
}

.player-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  /* 限制最大高度，确保视频不会超出视口 */
  max-height: calc(100vh - 64px);
  overflow: hidden;
}

@media (max-width: 768px) {
  .player-page__main {
    padding: 16px;
    max-height: calc(100vh - 64px);
  }
}
</style>
