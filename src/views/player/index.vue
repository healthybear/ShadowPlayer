<script setup lang="ts">
defineOptions({ name: 'PlayerPageView' })

import { figmaDesignAssets } from '@/config/figmaDesignAssets'

const poster = figmaDesignAssets.player.poster
</script>

<template>
  <div class="player-page" data-node-id="1:87">
    <AppTopNav nav-preset="player" />

    <div class="player-page__container">
      <!-- 左侧：视频 + 控制条 -->
      <div class="player-page__video-section" data-node-id="1:89">
        <div class="player-page__video-wrapper" data-node-id="1:90">
          <div class="player-page__video-content" data-node-id="1:92">
            <div class="player-page__video-aspect">
              <img :src="poster" alt="" class="player-page__video-img" />
            </div>
          </div>
          <div class="player-page__video-overlay" data-node-id="1:93" />

          <!-- 字幕区 -->
          <div class="player-page__subtitle-area" data-node-id="1:94">
            <div class="player-page__subtitle-primary" data-node-id="1:95">
              <p class="player-page__subtitle-text">
                I was chasing a
                <span class="player-page__subtitle-highlight">shadow</span>
                that didn't exist.
              </p>
            </div>
            <div class="player-page__subtitle-secondary" data-node-id="1:97">
              <p class="player-page__subtitle-text">
                我当时在追逐一个并不存在的影子。
              </p>
            </div>
          </div>

          <!-- 查词浮层 -->
          <div class="player-page__word-popup" data-node-id="1:99">
            <div class="player-page__word-header">
              <div class="player-page__word-info">
                <h3 class="player-page__word-title">shadow</h3>
                <p class="player-page__word-phonetic">/ˈʃædoʊ/</p>
              </div>
              <el-button text circle size="small">
                <el-icon><Microphone /></el-icon>
              </el-button>
            </div>
            <p class="player-page__word-definition">
              n. 影子；阴影；幻象；<br />
              v. 遮蔽；尾随；
            </p>
            <div class="player-page__word-actions">
              <el-button type="primary" size="small" class="player-page__word-btn">
                <el-icon class="player-page__btn-icon"><Plus /></el-icon>
                Add to Vocab
              </el-button>
              <el-button size="small">
                <el-icon><More /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 控制条 -->
        <div class="player-page__controls" data-node-id="1:121">
          <div class="player-page__progress-bar" data-node-id="1:122">
            <span class="player-page__time-label">12:45</span>
            <el-slider class="player-page__slider" :model-value="45" :show-tooltip="false" />
            <span class="player-page__time-label player-page__time-label--end">24:32</span>
          </div>
          <div class="player-page__control-row" data-node-id="1:132">
            <div class="player-page__control-left">
              <el-button text circle>
                <el-icon><DArrowLeft /></el-icon>
              </el-button>
              <el-button type="primary" circle>
                <el-icon :size="20"><VideoPlay /></el-icon>
              </el-button>
              <el-button text circle>
                <el-icon><DArrowRight /></el-icon>
              </el-button>
              <div class="player-page__divider" />
              <el-button text circle>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
            </div>
            <div class="player-page__control-center">
              <el-tag type="primary" effect="light" class="player-page__tag">
                Subtitle Mode (Bilingual)
              </el-tag>
              <el-tag class="player-page__tag">Speed (1.0x)</el-tag>
              <el-tag class="player-page__tag">AB Repeat</el-tag>
              <el-tag class="player-page__tag">
                <el-icon class="player-page__btn-icon"><RefreshRight /></el-icon>
                Single Loop
              </el-tag>
            </div>
            <div class="player-page__control-right">
              <el-button text circle>
                <el-icon><FullScreen /></el-icon>
              </el-button>
              <el-button text circle>
                <el-icon><Moon /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧字幕列表 -->
      <aside class="player-page__sidebar" data-node-id="1:165">
        <div class="player-page__sidebar-header" data-node-id="1:166">
          <div class="player-page__sidebar-title-row">
            <el-icon><Document /></el-icon>
            <span class="player-page__sidebar-title">Subtitle List</span>
          </div>
          <el-button text size="small">
            <el-icon><Operation /></el-icon>
          </el-button>
        </div>

        <div class="player-page__subtitle-list">
          <div class="player-page__subtitle-item" data-node-id="1:176">
            <div class="player-page__subtitle-item-header">
              <span class="player-page__subtitle-time">01:04</span>
              <el-icon><VideoPlay /></el-icon>
            </div>
            <p class="player-page__subtitle-item-text">
              Sometimes the hardest part is not letting go.
            </p>
            <p class="player-page__subtitle-item-translation">
              有时候最难的部分是不是放手。
            </p>
          </div>

          <div class="player-page__subtitle-item player-page__subtitle-item--active" data-node-id="1:184">
            <div class="player-page__subtitle-item-header">
              <span class="player-page__subtitle-time">12:45</span>
              <el-icon><VideoCamera /></el-icon>
            </div>
            <p class="player-page__subtitle-item-text">
              I was chasing a shadow that didn't exist.
            </p>
            <p class="player-page__subtitle-item-translation">
              我当时在追逐一个并不存在的影子。
            </p>
          </div>

          <div class="player-page__subtitle-item" data-node-id="1:192">
            <div class="player-page__subtitle-item-header">
              <span class="player-page__subtitle-time">13:12</span>
              <el-icon><VideoPlay /></el-icon>
            </div>
            <p class="player-page__subtitle-item-text">
              Reality has a way of catching up to you.
            </p>
            <p class="player-page__subtitle-item-translation">
              现实总是有办法追上你。
            </p>
          </div>

          <div class="player-page__subtitle-item">
            <div class="player-page__subtitle-item-header">
              <span class="player-page__subtitle-time">13:45</span>
              <el-icon><VideoPlay /></el-icon>
            </div>
            <p class="player-page__subtitle-item-text">
              And when it does, you'll need to be ready.
            </p>
            <p class="player-page__subtitle-item-translation">
              当它真的发生时，你需要做好准备。
            </p>
          </div>
        </div>

        <div class="player-page__sidebar-footer" data-node-id="1:216">
          <el-button class="player-page__footer-btn">
            <el-icon class="player-page__btn-icon"><Upload /></el-icon>
            Export
          </el-button>
          <el-button class="player-page__footer-btn">
            <el-icon class="player-page__btn-icon"><MagicStick /></el-icon>
            AI Assist
          </el-button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
.player-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color-page);

  &__container {
    display: flex;
    flex: 1;
    min-height: 0;
    padding-top: 48px;
  }

  &__video-section {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    background-color: #000;
  }

  &__video-wrapper {
    position: relative;
    display: flex;
    flex: 1;
    min-height: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__video-content {
    position: relative;
    width: 100%;
    opacity: 0.8;
  }

  &__video-aspect {
    position: relative;
    width: 100%;
    max-height: min(100%, 70vh);
    aspect-ratio: 16 / 9;
  }

  &__video-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__video-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
    pointer-events: none;
  }

  &__subtitle-area {
    position: absolute;
    bottom: 48px;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 0 48px;
  }

  &__subtitle-primary {
    padding: 4px 16px;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: var(--el-border-radius-small);
    backdrop-filter: blur(8px);
  }

  &__subtitle-text {
    margin: 0;
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    line-height: 32px;
    letter-spacing: 0.5px;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }

  &__subtitle-highlight {
    color: var(--el-color-primary);
    text-decoration: underline;
  }

  &__subtitle-secondary {
    padding: 2px 12px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: var(--el-border-radius-small);
    backdrop-filter: blur(8px);

    .player-page__subtitle-text {
      font-size: var(--el-font-size-large);
      font-weight: 400;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  &__word-popup {
    position: absolute;
    bottom: 35%;
    left: calc(50% + 64px);
    width: 256px;
    padding: 16px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
  }

  &__word-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__word-info {
    flex: 1;
  }

  &__word-title {
    margin: 0;
    font-size: var(--el-font-size-base);
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  &__word-phonetic {
    margin: 0;
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-secondary);
  }

  &__word-definition {
    margin: 8px 0 0;
    font-size: var(--el-font-size-small);
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  &__word-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
  }

  &__word-btn {
    flex: 1;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    background-color: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &__progress-bar {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__time-label {
    width: 40px;
    flex-shrink: 0;
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-secondary);

    &--end {
      text-align: right;
    }
  }

  &__slider {
    flex: 1;
  }

  &__control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__control-left,
  &__control-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__divider {
    width: 1px;
    height: 16px;
    margin: 0 8px;
    background-color: var(--el-border-color);
  }

  &__control-center {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__tag {
    cursor: pointer;
    border-radius: 20px;
    padding: 4px 16px;
  }

  &__btn-icon {
    margin-right: 4px;
  }

  &__sidebar {
    display: flex;
    width: 320px;
    flex-direction: column;
    flex-shrink: 0;
    background-color: var(--el-bg-color);
    border-left: 1px solid var(--el-border-color-lighter);
  }

  &__sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__sidebar-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__sidebar-title {
    font-size: var(--el-font-size-small);
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__subtitle-list {
    flex: 1;
    overflow-y: auto;
  }

  &__subtitle-item {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    font-size: var(--el-font-size-small);

    &--active {
      background-color: var(--el-color-primary-light-9);
      border-left: 4px solid var(--el-color-primary);
      border-bottom-color: var(--el-border-color-lighter);

      .player-page__subtitle-time {
        color: var(--el-color-primary);
        font-weight: 700;
      }

      .player-page__subtitle-item-text {
        color: var(--el-color-primary);
        font-weight: 500;
      }

      .player-page__subtitle-item-translation {
        color: rgba(64, 158, 255, 0.8);
      }
    }
  }

  &__subtitle-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-placeholder);
  }

  &__subtitle-time {
    font-size: var(--el-font-size-extra-small);
  }

  &__subtitle-item-text {
    margin: 4px 0;
    color: var(--el-text-color-regular);
  }

  &__subtitle-item-translation {
    margin: 4px 0;
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-secondary);
  }

  &__sidebar-footer {
    display: flex;
    gap: 8px;
    padding: 12px;
    background-color: var(--el-fill-color-lighter);
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &__footer-btn {
    flex: 1;
  }
}
</style>
