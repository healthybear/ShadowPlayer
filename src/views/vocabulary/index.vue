<!--
  Vocabulary Page (词汇表页面)

  页面结构：
  - 页面标题 + 统计标签 + 操作按钮
  - 词汇卡片列表
  - 支持跳转回视频

  响应式布局：
  - 移动端：单列
  - 平板及以上：单列（词汇信息较多，单列更易阅读）

  企业项目经验：
  - 词汇表是学习应用的核心功能
  - 显示完整上下文，帮助用户回忆学习场景
  - 跳转回视频是"从具体场景复习"的关键
-->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElInput, ElIcon, ElEmpty, ElButton, ElMessageBox, ElMessage } from 'element-plus'
import { Search, Loading, VideoPlay, Delete } from '@element-plus/icons-vue'
import { useVocabulary } from '@/composables/useVocabulary'
import type { VocabularyItem } from '@/db/schema'

defineOptions({ name: 'VocabularyPageView' })

const router = useRouter()
const vocabulary = ref<VocabularyItem[]>([])
const loading = ref(true)
const searchKeyword = ref('')

const { getVocabularyList, deleteWord, searchVocabulary } = useVocabulary()

/**
 * 加载词汇列表
 */
async function loadVocabulary() {
  loading.value = true
  try {
    vocabulary.value = await getVocabularyList()
  } catch (error) {
    console.error('Failed to load vocabulary:', error)
    ElMessage.error('Failed to load vocabulary')
  } finally {
    loading.value = false
  }
}

/**
 * 过滤词汇列表
 *
 * 使用 normalizedWord 进行搜索，性能更好
 */
const filteredVocabulary = computed(() => {
  if (!searchKeyword.value) return vocabulary.value

  const keyword = searchKeyword.value.toLowerCase()
  return vocabulary.value.filter(item =>
    item.normalizedWord.includes(keyword) ||
    item.word.toLowerCase().includes(keyword) ||
    item.translation?.toLowerCase().includes(keyword)
  )
})

/**
 * 处理单词点击
 *
 * 流程：
 * 1. 构造路由参数：time、subtitleIndex、from
 * 2. 跳转到播放器页面
 *
 * 为什么要传 time 和 subtitleIndex？
 * - time: 视频时间点，用于精确跳转
 * - subtitleIndex: 字幕索引，用于高亮对应字幕
 * - from: 标记来源，用于分析和可能的特殊处理
 *
 * 企业项目经验：
 * - 跳转要携带完整的上下文信息
 * - 不要只跳转到视频，要跳转到精确的时间点
 * - 这是"从具体场景复习"的关键
 * - from 参数虽然当前未使用，但为未来扩展预留
 */
function handleWordClick(item: VocabularyItem) {
  if (!item.videoId || item.timestamp === undefined) {
    ElMessage.warning('Cannot jump to video: missing video information')
    return
  }

  // 构造路由参数
  const query: Record<string, string> = {
    time: item.timestamp.toString(),
    from: 'vocabulary',
  }

  if (item.subtitleIndex !== undefined) {
    query.subtitleIndex = item.subtitleIndex.toString()
  }

  // 跳转到播放器页面
  router.push({
    path: `/player/${item.videoId}`,
    query,
  })
}

/**
 * 处理删除单词
 *
 * 流程：
 * 1. 显示确认对话框
 * 2. 调用 deleteWord()
 * 3. 刷新列表
 *
 * 企业项目经验：
 * - 删除操作要有确认对话框
 * - 删除后要刷新列表
 * - 错误要有友好的提示
 */
async function handleDelete(item: VocabularyItem, event: Event) {
  // 阻止事件冒泡，避免触发 handleWordClick
  event.stopPropagation()

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${item.word}"?`,
      'Confirm Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    await deleteWord(item.id)
    ElMessage.success('Word deleted')
    await loadVocabulary()
  } catch (err) {
    // 用户取消或删除失败
    if (err !== 'cancel') {
      console.error('Failed to delete word:', err)
      ElMessage.error('Failed to delete word')
    }
  }
}

/**
 * 格式化日期
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

/**
 * 格式化时间（秒 -> MM:SS）
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
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
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="stats">
          <span>{{ vocabulary.length }} words</span>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
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
          :class="{ clickable: item.videoId && item.timestamp !== undefined, legacy: item.source === 'legacy' }"
          @click="handleWordClick(item)"
        >
          <div class="item-main">
            <div class="item-header">
              <h3 class="word">{{ item.word }}</h3>
              <el-button
                text
                circle
                size="small"
                @click="(e) => handleDelete(item, e)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <p v-if="item.pronunciation" class="pronunciation">{{ item.pronunciation }}</p>

            <div v-if="item.definitions && item.definitions.length > 0" class="definitions">
              <div
                v-for="(def, index) in item.definitions.slice(0, 2)"
                :key="index"
                class="definition"
              >
                <span class="part-of-speech">{{ def.partOfSpeech }}</span>
                <span class="definition-text">{{ def.definition }}</span>
              </div>
            </div>

            <p v-else-if="item.definition" class="definition-text">{{ item.definition }}</p>

            <p v-if="item.context" class="context">
              <span class="context-label">Context:</span> "{{ item.context }}"
            </p>

            <div v-if="item.source === 'legacy'" class="legacy-notice">
              ⚠️ Legacy data: missing context information
            </div>

            <div class="item-footer">
              <span v-if="item.videoTitle" class="video-title">{{ item.videoTitle }}</span>
              <span v-if="item.timestamp !== undefined" class="timestamp">{{ formatTime(item.timestamp) }}</span>
              <span class="date">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>

          <div v-if="item.videoId && item.timestamp !== undefined" class="item-action">
            <el-icon class="link-icon"><VideoPlay /></el-icon>
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
  gap: 16px;
}

.vocabulary-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.vocabulary-item.legacy {
  background: var(--el-fill-color-lighter);
}

.item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.word {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.pronunciation {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-style: italic;
}

.definitions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.definition {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.part-of-speech {
  font-size: 12px;
  color: var(--el-color-primary);
  font-weight: 500;
  text-transform: lowercase;
}

.definition-text {
  margin: 0;
  font-size: 15px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.context {
  margin: 0;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.context-label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.legacy-notice {
  padding: 8px 12px;
  background: var(--el-color-warning-light-9);
  border-left: 3px solid var(--el-color-warning);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-color-warning-dark-2);
}

.item-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.video-title {
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.timestamp {
  padding: 2px 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 4px;
  font-weight: 500;
}

.date {
  color: var(--el-text-color-placeholder);
}

.item-action {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 16px;
}

.link-icon {
  font-size: 24px;
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

  .vocabulary-item {
    padding: 16px;
  }

  .word {
    font-size: 20px;
  }

  .item-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
