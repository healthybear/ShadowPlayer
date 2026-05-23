<!--
  History Page (历史记录页面)

  页面结构：
  - 页面标题 + 清空按钮
  - 搜索框
  - 历史记录网格
  - 分页器

  响应式布局：
  - 移动端：单列
  - 平板：2 列
  - 桌面：3 列
-->

<script setup lang="ts">
import { onMounted } from 'vue'
import HistoryItem from '@/components/history/HistoryItem.vue'
import { useHistoryStore } from '@/stores/history'

defineOptions({ name: 'HistoryPageView' })

// 使用 Pinia store 管理历史记录
const historyStore = useHistoryStore()

// 组件挂载时加载数据
onMounted(() => {
  historyStore.fetchHistory()
})

const handleItemClick = (id: string) => {
  console.log('History item clicked:', id)
}

const handleClearHistory = async () => {
  // 企业项目经验：危险操作应该有二次确认
  if (confirm('Are you sure you want to clear all history?')) {
    try {
      await historyStore.clearHistory()
    }
    catch (err) {
      console.error('Failed to clear history:', err)
    }
  }
}

const handlePageChange = (page: number) => {
  historyStore.fetchHistory(page)
}
</script>

<template>
  <div class="history-page">
    <AppTopNav nav-preset="history" />

    <main class="history-page__main">
      <div class="history-page__header">
        <div class="history-page__header-left">
          <h1 class="history-page__title">Playback History</h1>
          <p class="history-page__subtitle">
            Manage your recently watched learning videos
          </p>
        </div>
        <el-button plain type="danger" @click="handleClearHistory">
          <el-icon class="mr-2">
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

      <!-- 加载状态 -->
      <div v-if="historyStore.loading" class="history-page__loading">
        <el-icon class="is-loading" :size="32">
          <Loading />
        </el-icon>
        <p>Loading history...</p>
      </div>

      <!-- 错误状态 -->
      <el-alert
        v-else-if="historyStore.error"
        type="error"
        :title="historyStore.error"
        show-icon
        :closable="false"
      />

      <!-- 响应式网格布局 -->
      <div v-else class="history-page__list">
        <HistoryItem
          v-for="item in historyStore.items"
          :key="item.id"
          :thumbnail="item.thumb"
          :title="item.title"
          :date="item.date"
          :progress="item.progress"
          @click="handleItemClick(item.id)"
        />
      </div>

      <el-pagination
        v-if="!historyStore.loading && historyStore.total > 0"
        class="history-page__pagination"
        layout="prev, pager, next"
        :total="historyStore.total"
        :page-size="historyStore.pageSize"
        :current-page="historyStore.currentPage"
        @current-change="handlePageChange"
      />
    </main>
  </div>
</template>

<style scoped>
.history-page {
  min-height: 100vh;
  background-color: var(--md-sys-color-background);
}

.history-page__main {
  max-width: 900px;
  margin: 0 auto;
  padding: 80px 16px 96px;
}

.history-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.history-page__header-left {
  flex: 1;
}

.history-page__title {
  margin: 0;
  font-size: var(--md-sys-typescale-headline-large-size);
  font-weight: var(--md-sys-typescale-headline-large-weight);
  color: var(--md-sys-color-on-surface);
}

.history-page__subtitle {
  margin: 4px 0 0;
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
}

.history-page__search {
  margin-top: 16px;
}

/* 加载和错误状态 */
.history-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
  color: var(--md-sys-color-on-surface-variant);
}

/* 响应式网格：1/2/3 列 */
.history-page__list {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 600px) {
  .history-page__list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 840px) {
  .history-page__list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.history-page__pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
