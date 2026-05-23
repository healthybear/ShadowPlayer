<!--
  Vocabulary Page (词汇表页面)

  页面结构：
  - 页面标题 + 统计标签 + 操作按钮
  - 词汇卡片网格
  - 导出按钮

  响应式布局：
  - 移动端：单列
  - 平板及以上：2 列
-->

<script setup lang="ts">
import { onMounted } from 'vue'
import VocabCard from '@/components/vocabulary/VocabCard.vue'
import { useVocabularyStore } from '@/stores/vocabulary'

defineOptions({ name: 'VocabularyPageView' })

// 使用 Pinia store 管理状态
// 企业项目经验：组件只负责展示和交互，业务逻辑和数据管理交给 store
const vocabularyStore = useVocabularyStore()

// 组件挂载时加载数据
// 企业项目经验：使用 onMounted 而不是立即执行，确保组件已经渲染
onMounted(() => {
  vocabularyStore.fetchWords()
})

const handleCardClick = (id: string) => {
  console.log('Vocab card clicked:', id)
}
</script>

<template>
  <div class="vocabulary-page">
    <AppTopNav nav-preset="vocabulary" />

    <main class="vocabulary-page__main">
      <div class="vocabulary-page__header">
        <div class="vocabulary-page__header-left">
          <h1 class="vocabulary-page__title">My Vocabulary</h1>
          <el-tag type="primary" effect="light">
            Total {{ vocabularyStore.totalWords }} Words
          </el-tag>
        </div>
        <div class="vocabulary-page__header-actions">
          <el-button>
            <el-icon class="mr-1"><Search /></el-icon>
            Search
          </el-button>
          <el-button>
            <el-icon class="mr-1"><Filter /></el-icon>
            Filter
          </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="vocabularyStore.loading" class="vocabulary-page__loading">
        <el-icon class="is-loading" :size="32">
          <Loading />
        </el-icon>
        <p>Loading vocabulary...</p>
      </div>

      <!-- 错误状态 -->
      <el-alert
        v-else-if="vocabularyStore.error"
        type="error"
        :title="vocabularyStore.error"
        show-icon
        :closable="false"
      />

      <!-- 词汇卡片网格 -->
      <div v-else class="vocabulary-page__grid">
        <VocabCard
          v-for="word in vocabularyStore.sortedWords"
          :key="word.id"
          :word="word.word"
          :definition="word.definition"
          :example="word.example"
          @click="handleCardClick(word.id)"
        />
      </div>

      <div class="vocabulary-page__export">
        <el-button type="primary" size="large">
          <el-icon class="mr-2"><Download /></el-icon>
          Export to CSV
        </el-button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.vocabulary-page {
  min-height: 100vh;
  background-color: var(--md-sys-color-background);
}

.vocabulary-page__main {
  max-width: 960px;
  margin: 0 auto;
  padding: 80px 16px 96px;
}

.vocabulary-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.vocabulary-page__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vocabulary-page__title {
  margin: 0;
  font-size: var(--md-sys-typescale-headline-large-size);
  font-weight: var(--md-sys-typescale-headline-large-weight);
  color: var(--md-sys-color-on-surface);
}

.vocabulary-page__header-actions {
  display: flex;
  gap: 8px;
}

/* 加载和错误状态 */
.vocabulary-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
  color: var(--md-sys-color-on-surface-variant);
}

/* 响应式网格：1/2 列 */
.vocabulary-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 600px) {
  .vocabulary-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.vocabulary-page__export {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 16px;
}
</style>
