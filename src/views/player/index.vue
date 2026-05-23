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
import { onMounted } from 'vue'
import VideoPlayer from '@/components/player/VideoPlayer.vue'
import SubtitleOverlay from '@/components/player/SubtitleOverlay.vue'
import PlayerControls from '@/components/player/PlayerControls.vue'
import WordPopup from '@/components/player/WordPopup.vue'
import SubtitleList from '@/components/player/SubtitleList.vue'
import { usePlayerStore } from '@/stores/player'

defineOptions({ name: 'PlayerPageView' })

// 使用 Pinia store 管理播放器状态
// 企业项目经验：播放器状态复杂，使用 store 统一管理
const playerStore = usePlayerStore()

// 组件挂载时加载视频数据
// 实际项目中 videoId 应该从路由参数获取
onMounted(() => {
  const videoId = 'demo-video-1'
  playerStore.loadVideo(videoId)
})

const handleTogglePlay = () => {
  playerStore.togglePlay()
}

const handleSeek = (time: number) => {
  playerStore.seek(time)
}

const handleSubtitleSelect = (id: string) => {
  playerStore.selectSubtitle(id)
}
</script>

<template>
  <div class="player-page">
    <AppTopNav nav-preset="player" />

    <!-- 主容器：响应式 flex 布局 -->
    <div class="player-page__container">
      <!-- 视频区域 -->
      <div class="player-page__video-section">
        <div class="player-page__video-wrapper">
          <VideoPlayer :src="playerStore.poster" />

          <SubtitleOverlay
            v-if="playerStore.currentSubtitle"
            :text="playerStore.currentSubtitle.text"
          />

          <WordPopup
            :visible="playerStore.showWordPopup"
            :word="playerStore.selectedWord.word"
            :pronunciation="playerStore.selectedWord.pronunciation"
            :definition="playerStore.selectedWord.definition"
          />
        </div>

        <PlayerControls
          :playing="playerStore.playing"
          :current-time="playerStore.currentTime"
          :duration="playerStore.duration"
          @toggle-play="handleTogglePlay"
          @seek="handleSeek"
        />
      </div>

      <!-- 字幕列表侧边栏 -->
      <aside class="player-page__sidebar">
        <SubtitleList
          :subtitles="playerStore.subtitles"
          :active-id="playerStore.activeSubtitleId"
          @select="handleSubtitleSelect"
        />
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* 全屏布局，固定高度 */
.player-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--md-sys-color-background);
}

/* 响应式容器：移动端上下布局，桌面左右布局 */
.player-page__container {
  display: flex;
  flex: 1;
  min-height: 0;
  padding-top: 64px;
  flex-direction: column;
}

@media (min-width: 840px) {
  .player-page__container {
    flex-direction: row;
  }
}

.player-page__video-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  background-color: #000;
}

.player-page__video-wrapper {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 侧边栏：移动端在底部，桌面在右侧 */
.player-page__sidebar {
  display: flex;
  width: 100%;
  max-height: 40vh;
  flex-direction: column;
  flex-shrink: 0;
  background-color: var(--md-sys-color-surface);
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

@media (min-width: 840px) {
  .player-page__sidebar {
    width: 320px;
    max-height: none;
    border-top: none;
    border-left: 1px solid var(--md-sys-color-outline-variant);
  }
}
</style>
