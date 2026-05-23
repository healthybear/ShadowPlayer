// History Store
// 管理历史记录的状态和业务逻辑

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { VideoItem } from '@/api/types'
import * as historyApi from '@/api/history'

export const useHistoryStore = defineStore('history', () => {
  // 状态
  const items = ref<VideoItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 分页状态
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  // 计算属性
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  /**
   * 加载历史记录
   *
   * @param page - 页码（可选，默认使用当前页）
   */
  async function fetchHistory(page?: number) {
    if (page !== undefined) {
      currentPage.value = page
    }

    loading.value = true
    error.value = null

    try {
      const result = await historyApi.fetchHistory(currentPage.value, pageSize.value)
      items.value = result.items
      total.value = result.total
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch history'
      console.error('Failed to fetch history:', err)
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 获取最近播放（用于首页）
   *
   * 企业项目经验：
   * - 首页和历史页面共享同一个 store
   * - 但首页只需要前几条数据，不需要分页
   */
  async function fetchRecent(limit = 3): Promise<VideoItem[]> {
    try {
      return await historyApi.fetchRecentVideos(limit)
    }
    catch (err) {
      console.error('Failed to fetch recent videos:', err)
      return []
    }
  }

  /**
   * 清空历史记录
   */
  async function clearHistory() {
    loading.value = true
    error.value = null

    try {
      await historyApi.clearHistory()
      items.value = []
      total.value = 0
      currentPage.value = 1
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to clear history'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 删除单个历史记录
   */
  async function deleteItem(id: string) {
    try {
      await historyApi.deleteHistoryItem(id)
      // 乐观更新
      items.value = items.value.filter(item => item.id !== id)
      total.value -= 1
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete item'
      throw err
    }
  }

  return {
    // 状态
    items,
    loading,
    error,
    currentPage,
    pageSize,
    total,

    // 计算属性
    totalPages,

    // 方法
    fetchHistory,
    fetchRecent,
    clearHistory,
    deleteItem,
  }
})
