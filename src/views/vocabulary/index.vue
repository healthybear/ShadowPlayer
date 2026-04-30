<script setup lang="ts">
defineOptions({ name: 'VocabularyPageView' })

const words = [
  {
    word: 'ubiquitous',
    ipa: '/juːˈbɪk.wɪ.təs/',
    zh: '无所不在的，普遍存在的',
    source: 'BBC Learning English',
    time: '04:12',
  },
  {
    word: 'meticulous',
    ipa: '/məˈtɪk.jə.ləs/',
    zh: '严谨的，极精细的',
    source: 'Scientific American',
    time: '12:45',
  },
  {
    word: 'paradigm',
    ipa: '/ˈpær.ə.daɪm/',
    zh: '范例，典范',
    source: 'TED Talks: Future of AI',
    time: '08:22',
  },
  {
    word: 'eloquent',
    ipa: '/ˈel.ə.kwənt/',
    zh: '雄辩的，口才流利的',
    source: 'The Guardian News',
    time: '01:50',
  },
] as const
</script>

<template>
  <div class="vocabulary-page" data-node-id="1:237">
    <AppTopNav nav-preset="vocabulary" />

    <main class="vocabulary-page__main">
      <div class="vocabulary-page__header" data-node-id="1:239">
        <div class="vocabulary-page__header-left">
          <h1 class="vocabulary-page__title" data-node-id="1:242">My Vocabulary</h1>
          <el-tag type="primary" effect="light" data-node-id="1:244">
            Total 23 Words
          </el-tag>
        </div>
        <div class="vocabulary-page__header-actions">
          <el-button>
            <el-icon class="vocabulary-page__btn-icon"><Search /></el-icon>
            Search
          </el-button>
          <el-button>
            <el-icon class="vocabulary-page__btn-icon"><Filter /></el-icon>
            Filter
          </el-button>
        </div>
      </div>

      <div class="vocabulary-page__grid" data-node-id="1:256">
        <article
          v-for="(w, i) in words"
          :key="w.word"
          class="vocabulary-page__card"
          :data-node-id="i === 0 ? '1:257' : undefined"
        >
          <div class="vocabulary-page__card-header">
            <div class="vocabulary-page__card-title-row">
              <h2 class="vocabulary-page__word">
                {{ w.word }}
              </h2>
              <el-button text circle size="small">
                <el-icon><Microphone /></el-icon>
              </el-button>
            </div>
          </div>
          <p class="vocabulary-page__ipa">
            {{ w.ipa }}
          </p>
          <div class="vocabulary-page__translation" data-node-id="1:270">
            {{ w.zh }}
          </div>
          <div class="vocabulary-page__card-footer">
            <span class="vocabulary-page__source">{{ w.source }}</span>
            <span class="vocabulary-page__time">{{ w.time }}</span>
          </div>
        </article>
      </div>

      <div class="vocabulary-page__export" data-node-id="1:349">
        <el-button type="primary" size="large">
          <el-icon class="vocabulary-page__btn-icon"><Download /></el-icon>
          Export to CSV
        </el-button>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.vocabulary-page {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);

  &__main {
    max-width: 960px;
    margin: 0 auto;
    padding: 80px 16px 96px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__title {
    margin: 0;
    font-size: var(--el-font-size-extra-large);
    font-weight: 700;
    line-height: 28px;
    color: var(--el-text-color-primary);
  }

  &__header-actions {
    display: flex;
    gap: 8px;
  }

  &__btn-icon {
    margin-right: 4px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__card {
    position: relative;
    padding: 20px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__card-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__word {
    margin: 0;
    font-size: var(--el-font-size-large);
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  &__ipa {
    margin: 8px 0 0;
    font-size: var(--el-font-size-extra-small);
    font-style: italic;
    color: var(--el-text-color-secondary);
  }

  &__translation {
    margin-top: 8px;
    padding: 12px;
    background-color: var(--el-fill-color-light);
    border-radius: var(--el-border-radius-small);
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-primary);
  }

  &__card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-placeholder);
  }

  &__source {
    color: var(--el-color-primary);
  }

  &__export {
    display: flex;
    justify-content: center;
    margin-top: 32px;
    padding-top: 16px;
  }
}
</style>
