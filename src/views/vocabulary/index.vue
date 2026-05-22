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
import VocabCard from '@/components/vocabulary/VocabCard.vue'

defineOptions({ name: 'VocabularyPageView' })

const words = [
  {
    id: '1',
    word: 'ubiquitous',
    definition: '无所不在的，普遍存在的',
    example: 'Smartphones have become ubiquitous in modern society.',
  },
  {
    id: '2',
    word: 'meticulous',
    definition: '严谨的，极精细的',
    example: 'She was meticulous in her research methodology.',
  },
  {
    id: '3',
    word: 'paradigm',
    definition: '范例，典范',
    example: 'This discovery represents a paradigm shift in physics.',
  },
  {
    id: '4',
    word: 'eloquent',
    definition: '雄辩的，口才流利的',
    example: 'The speaker gave an eloquent presentation.',
  },
] as const

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
            Total 23 Words
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

      <!-- 词汇卡片网格 -->
      <div class="vocabulary-page__grid">
        <VocabCard
          v-for="word in words"
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
