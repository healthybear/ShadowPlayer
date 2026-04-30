<script setup lang="ts">
defineOptions({ name: 'HistoryPageView' })

import { figmaDesignAssets } from '@/config/figmaDesignAssets'

const items = [
  {
    title: 'Business_English_Module_04_Negotiations.mp4',
    last: 'Last played: 2 hours ago',
    progress: 42,
    duration: '12:45',
    thumb: figmaDesignAssets.history.thumb1,
    finished: false,
  },
  {
    title: 'Interview_Tips_Confidence_Workshop.mkv',
    last: 'Last played: Yesterday',
    progress: 85,
    duration: '08:20',
    thumb: figmaDesignAssets.history.thumb2,
    finished: false,
  },
  {
    title: 'Daily_Phrases_Part_01_Greetings.mp4',
    last: 'Last played: 3 days ago',
    progress: 100,
    duration: '15:55',
    thumb: figmaDesignAssets.history.thumb3,
    finished: true,
  },
] as const
</script>

<template>
  <div class="history-page" data-node-id="1:368">
    <AppTopNav nav-preset="history" />

    <main class="history-page__main">
      <div class="history-page__header" data-node-id="1:370">
        <div class="history-page__header-left">
          <h1 class="history-page__title" data-node-id="1:373">Playback History</h1>
          <p class="history-page__subtitle" data-node-id="1:375">
            Manage your recently watched learning videos
          </p>
        </div>
        <el-button plain type="danger">
          <el-icon class="history-page__btn-icon">
            <Delete />
          </el-icon>
          Clear History
        </el-button>
      </div>

      <div class="history-page__search">
        <el-input
          size="large"
          placeholder="Search your history by filename..."
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="history-page__list">
        <div
          v-for="(row, i) in items"
          :key="i"
          class="history-page__item"
          :class="{ 'history-page__item--finished': row.finished }"
        >
          <div class="history-page__thumb">
            <img :src="row.thumb" alt="" class="history-page__thumb-img" />
            <span class="history-page__duration">
              {{ row.duration }}
            </span>
            <el-progress
              class="history-page__progress"
              :percentage="row.finished ? 100 : row.progress"
              :status="row.finished ? 'success' : undefined"
              :show-text="false"
              :stroke-width="4"
            />
          </div>

          <div class="history-page__content">
            <div class="history-page__info">
              <h3 class="history-page__item-title">
                {{ row.title }}
              </h3>
              <div class="history-page__meta">
                <span class="history-page__meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ row.last }}
                </span>
                <span
                  v-if="!row.finished"
                  class="history-page__meta-item"
                >
                  <el-icon><VideoPlay /></el-icon>
                  {{ row.progress }}% Completed
                </span>
                <span
                  v-else
                  class="history-page__meta-item history-page__meta-item--success"
                >
                  <el-icon><CircleCheck /></el-icon>
                  Finished
                </span>
              </div>
            </div>
            <div class="history-page__actions">
              <RouterLink v-if="!row.finished" to="/player">
                <el-button type="primary" size="small">
                  Continue Playing
                </el-button>
              </RouterLink>
              <el-button v-else size="small">
                Watch Again
              </el-button>
              <el-button text type="info" size="small">
                <el-icon class="history-page__btn-icon"><Delete /></el-icon>
                Delete
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <el-pagination
        class="history-page__pagination"
        layout="prev, pager, next"
        :total="120"
        :page-size="10"
        data-node-id="1:474"
      />
    </main>
  </div>
</template>

<style scoped lang="scss">
.history-page {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);

  &__main {
    max-width: 900px;
    margin: 0 auto;
    padding: 80px 16px 96px;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  &__header-left {
    flex: 1;
  }

  &__title {
    margin: 0;
    font-size: var(--el-font-size-extra-large);
    font-weight: 700;
    line-height: 28px;
    color: var(--el-text-color-primary);
  }

  &__subtitle {
    margin: 4px 0 0;
    font-size: var(--el-font-size-extra-small);
    line-height: 18px;
    color: var(--el-text-color-secondary);
  }

  &__btn-icon {
    margin-right: 4px;
  }

  &__search {
    position: relative;
    margin-top: 8px;
    padding-top: 8px;
  }

  &__list {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__item {
    display: flex;
    gap: 16px;
    padding: 12px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    &--finished {
      opacity: 0.8;
    }
  }

  &__thumb {
    position: relative;
    width: 160px;
    height: 90px;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: var(--el-border-radius-small);
    background-color: var(--el-fill-color);
  }

  &__thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__duration {
    position: absolute;
    bottom: 4px;
    right: 4px;
    padding: 2px 4px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: var(--el-border-radius-small);
    font-size: 10px;
    color: #fff;
  }

  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    min-width: 0;
    padding: 2px 0;
  }

  &__item-title {
    margin: 0;
    font-size: var(--el-font-size-medium);
    font-weight: 700;
    line-height: 22px;
    color: var(--el-text-color-primary);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-secondary);
  }

  &__meta-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &--success {
      color: var(--el-color-success);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }

  &__pagination {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}
</style>
