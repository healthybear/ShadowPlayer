<script setup lang="ts">
defineOptions({ name: 'HomePageView' })

const recent = [
  {
    title: 'Blade Runner 2049 - Language Study',
    meta: 'Last watched 2 hours ago • 75% complete',
    thumb: '',
    progress: 75,
  },
  {
    title: 'Italian Cinema: La Dolce Vita',
    meta: 'Last watched yesterday • 30% complete',
    thumb: '',
    progress: 30,
  },
  {
    title: 'French News - Daily Briefing',
    meta: 'Last watched 3 days ago • 95% complete',
    thumb: '',
    progress: 95,
  },
] as const
</script>

<template>
  <div class="home-page" data-node-id="1:2">
    <AppTopNav nav-preset="home" />

    <main class="home-page__main">
      <section class="home-page__upload-card" data-node-id="1:4">
        <div class="home-page__upload-icon" data-node-id="1:6">
          <el-icon :size="24">
            <UploadFilled />
          </el-icon>
        </div>
        <h1 class="home-page__title" data-node-id="1:10">
          Ready to learn?
        </h1>
        <p class="home-page__description" data-node-id="1:12">
          Upload a local video file to start your immersive language session.
        </p>
        <el-button type="primary" size="large" class="home-page__upload-btn">
          <el-icon class="home-page__btn-icon">
            <FolderOpened />
          </el-icon>
          Select Local Video File
        </el-button>
        <p class="home-page__hint" data-node-id="1:18">
          Supports MP4, MKV, and WebM with embedded subtitles
        </p>
      </section>

      <section class="home-page__recent" data-node-id="1:19">
        <div class="home-page__recent-header" data-node-id="1:20">
          <h2 class="home-page__section-title" data-node-id="1:22">Recent Playback</h2>
          <RouterLink to="/history" class="home-page__view-all">
            View all
            <el-icon :size="12">
              <ArrowRight />
            </el-icon>
          </RouterLink>
        </div>

        <div class="home-page__recent-list">
          <div
            v-for="(item, i) in recent"
            :key="i"
            class="home-page__recent-item"
            :data-node-id="i === 0 ? '1:28' : undefined"
          >
            <div class="home-page__recent-thumb">
              <img :src="item.thumb" alt="" class="home-page__recent-img" />
              <el-progress
                class="home-page__recent-progress"
                :percentage="item.progress"
                :show-text="false"
                :stroke-width="4"
              />
            </div>
            <div class="home-page__recent-content">
              <h3 class="home-page__recent-title">
                {{ item.title }}
              </h3>
              <p class="home-page__recent-meta">
                {{ item.meta }}
              </p>
            </div>
            <div class="home-page__recent-actions">
              <RouterLink to="/player">
                <el-button type="primary" plain>
                  Continue
                </el-button>
              </RouterLink>
              <el-button text circle>
                <el-icon>
                  <MoreFilled />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);

  &__main {
    max-width: 800px;
    margin: 0 auto;
    padding: 80px 16px 96px;
  }

  &__upload-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  &__upload-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background-color: var(--el-color-primary-light-9);
    border-radius: 12px;
    color: var(--el-color-primary);
  }

  &__title {
    margin: 0;
    font-size: var(--el-font-size-extra-large);
    font-weight: 700;
    line-height: 28px;
    color: var(--el-text-color-primary);
    text-align: center;
  }

  &__description {
    margin: 0;
    font-size: var(--el-font-size-base);
    line-height: 22px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  &__upload-btn {
    margin-top: 4px;
  }

  &__btn-icon {
    margin-right: 8px;
  }

  &__hint {
    margin: 0;
    font-size: var(--el-font-size-extra-small);
    line-height: 18px;
    color: var(--el-text-color-placeholder);
    text-align: center;
  }

  &__recent {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__recent-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__section-title {
    margin: 0;
    font-size: var(--el-font-size-large);
    font-weight: 600;
    line-height: 26px;
    color: var(--el-text-color-primary);
  }

  &__view-all {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--el-font-size-base);
    color: var(--el-color-primary);
    text-decoration: none;
    transition: opacity var(--el-transition-duration);

    &:hover {
      opacity: 0.8;
    }
  }

  &__recent-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__recent-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  &__recent-thumb {
    position: relative;
    width: 120px;
    height: 68px;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: var(--el-border-radius-small);
    background-color: var(--el-fill-color-light);
  }

  &__recent-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__recent-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }

  &__recent-content {
    flex: 1;
    min-width: 0;
  }

  &__recent-title {
    margin: 0;
    font-size: var(--el-font-size-medium);
    font-weight: 600;
    line-height: 22px;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__recent-meta {
    margin: 4px 0 0;
    font-size: var(--el-font-size-base);
    line-height: 20px;
    color: var(--el-text-color-secondary);
  }

  &__recent-actions {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex-shrink: 0;
  }
}
</style>
