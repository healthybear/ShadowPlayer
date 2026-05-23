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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/db/schema'
import type { VocabularyItem } from '@/db/schema'

defineOptions({ name: 'VocabularyPageView' })

const router = useRouter()
const vocabulary = ref<VocabularyItem[]>([])
const loading = ref(true)
const searchKeyword = ref('')

async function loadVocabulary() {
  loading.value = true
  try {
    vocabulary.value = await db.vocabulary
      .orderBy('createdAt')
      .reverse()
      .toArray()
  } catch (error) {
    console.error('Failed to load vocabulary:', error)
  } finally {
    loading.value = false
  }
}

const filteredVocabulary = computed(() => {
  if (!searchKeyword.value) return vocabulary.value

  const keyword = searchKeyword.value.toLowerCase()
  return vocabulary.value.filter(item =>
    item.word.toLowerCase().includes(keyword) ||
    item.translation?.toLowerCase().includes(keyword)
  )
})

function handleWordClick(item: VocabularyItem) {
  if (item.videoId) {
    router.push(`/player/${item.videoId}?time=${item.timestamp}`)
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

onMounted(() => {
  loadVocabulary()
})
</script>

<template>
  <div class="vocabulary-page">
    <div class="vocabulary-container">
      <div class="vocabulary-header">
        <h1>Vocabulary</h1>
        <p class="subtitle">Words you've collected while learning</p>
      </div>

      <div class="vocabulary-toolbar">
        <el-input
          v-model="searchKeyword"
          placeholder="Search words..."
          clearable
        >
          <template #prefix>
            <el-icon><i-ep-search /></el-icon>
          </template>
        </el-input>

        <div class="stats">
          <span>{{ vocabulary.length }} words</span>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="32"><i-ep-loading /></el-icon>
        <p>Loading vocabulary...</p>
      </div>

      <div v-else-if="filteredVocabulary.length === 0" class="empty-state">
        <el-empty
          :description="searchKeyword ? 'No matching words found' : 'No vocabulary yet. Start collecting words while watching videos!'"
        />
      </div>

      <div v-else class="vocabulary-list">
        <div
          v-for="item in filteredVocabulary"
          :key="item.id"
          class="vocabulary-item"
          :class="{ clickable: item.videoId }"
          @click="handleWordClick(item)"
        >
          <div class="item-main">
            <h3 class="word">{{ item.word }}</h3>
            <p v-if="item.translation" class="translation">{{ item.translation }}</p>
            <p v-if="item.context" class="context">"{{ item.context }}"</p>
          </div>

          <div class="item-meta">
            <span class="date">{{ formatDate(item.createdAt) }}</span>
            <el-icon v-if="item.videoId" class="link-icon"><i-ep-video-play /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vocabulary-page {
  min-height: calc(100vh - 64px);
  background: var(--el-bg-color);
}

.vocabulary-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

.vocabulary-header {
  margin-bottom: 32px;
}

.vocabulary-header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.vocabulary-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.vocabulary-toolbar .el-input {
  flex: 1;
  max-width: 400px;
}

.stats {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  color: var(--el-text-color-secondary);
}

.loading-state .el-icon {
  margin-bottom: 16px;
}

.vocabulary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vocabulary-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  transition: all 0.3s;
}

.vocabulary-item.clickable {
  cursor: pointer;
}

.vocabulary-item.clickable:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-main {
  flex: 1;
}

.word {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.translation {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--el-text-color-regular);
}

.context {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-style: italic;
}

.item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.date {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.link-icon {
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .vocabulary-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .vocabulary-toolbar .el-input {
    max-width: none;
  }
}
</style>
