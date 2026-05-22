<script setup lang="ts">
import { ref } from 'vue'
import VideoPlayer from '@/components/player/VideoPlayer.vue'
import SubtitleOverlay from '@/components/player/SubtitleOverlay.vue'
import PlayerControls from '@/components/player/PlayerControls.vue'
import WordPopup from '@/components/player/WordPopup.vue'
import SubtitleList from '@/components/player/SubtitleList.vue'

defineOptions({ name: 'PlayerPageView' })

import { figmaDesignAssets } from '@/config/figmaDesignAssets'

const poster = figmaDesignAssets.player.poster

const playing = ref(false)
const currentTime = ref(765)
const duration = ref(1472)
const currentSubtitle = ref('I was chasing a shadow that didn\'t exist.')
const showWordPopup = ref(true)

const subtitles = [
  {
    id: '1',
    time: '01:04',
    text: 'Sometimes the hardest part is not letting go.',
    translation: '有时候最难的部分是不是放手。',
  },
  {
    id: '2',
    time: '12:45',
    text: 'I was chasing a shadow that didn\'t exist.',
    translation: '我当时在追逐一个并不存在的影子。',
  },
  {
    id: '3',
    time: '13:12',
    text: 'Reality has a way of catching up to you.',
    translation: '现实总是有办法追上你。',
  },
  {
    id: '4',
    time: '13:45',
    text: 'And when it does, you\'ll need to be ready.',
    translation: '当它真的发生时，你需要做好准备。',
  },
]

const handleTogglePlay = () => {
  playing.value = !playing.value
}

const handleSeek = (time: number) => {
  currentTime.value = time
}

const handleSubtitleSelect = (id: string) => {
  console.log('Subtitle selected:', id)
}
</script>

<template>
  <div class="player-page">
    <AppTopNav nav-preset="player" />

    <div class="player-page__container">
      <div class="player-page__video-section">
        <div class="player-page__video-wrapper">
          <VideoPlayer :src="poster" />

          <SubtitleOverlay :text="currentSubtitle" />

          <WordPopup
            :visible="showWordPopup"
            word="shadow"
            pronunciation="/ˈʃædoʊ/"
            definition="n. 影子；阴影；幻象"
          />
        </div>

        <PlayerControls
          :playing="playing"
          :current-time="currentTime"
          :duration="duration"
          @toggle-play="handleTogglePlay"
          @seek="handleSeek"
        />
      </div>

      <aside class="player-page__sidebar">
        <SubtitleList
          :subtitles="subtitles"
          :active-id="subtitles[1].id"
          @select="handleSubtitleSelect"
        />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.player-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--md-sys-color-background);
}

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
