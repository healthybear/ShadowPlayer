// Vocabulary Store
// 管理词汇表的状态和业务逻辑

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { VocabularyWord } from '@/api/types'
import * as vocabularyApi from '@/api/vocabulary'

/**
 * 企业项目经验：Store 的职责
 * 1. 管理状态（data）
 * 2. 封装业务逻辑（methods）
 * 3. 提供计算属性（computed）
 * 4. 处理异步操作（API 调用）
 *
 * 为什么使用 Store 而不是直接在组件中调用 API？
 * - 状态共享：多个组件可以访问同一份数据
 * - 避免重复请求：数据缓存在 store 中
 * - 统一管理：所有词汇相关的逻辑集中在一处
 * - 可测试性：store 可以独立测试
 */
export const useVocabularyStore = defineStore('vocabulary', () => {
  // 状态
  const words = ref<VocabularyWord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  // 企业项目经验：使用 computed 而不是在组件中计算，确保逻辑复用
  const totalWords = computed(() => words.value.length)

  const sortedWords = computed(() => {
    // 按创建时间倒序排列（最新的在前）
    return [...words.value].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  })

  /**
   * 加载词汇列表
   *
   * 企业项目经验：
   * - 使用 loading 状态显示加载指示器
   * - 使用 error 状态处理错误情况
   * - try-catch 捕获异步错误
   */
  async function fetchWords() {
    loading.value = true
    error.value = null

    try {
      words.value = await vocabularyApi.fetchVocabulary()
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch vocabulary'
      console.error('Failed to fetch vocabulary:', err)
    }
    finally {
      // 企业项目经验：finally 确保 loading 状态总是被重置
      loading.value = false
    }
  }

  /**
   * 添加新词汇
   */
  async function addWord(word: Omit<VocabularyWord, 'id' | 'createdAt'>) {
    loading.value = true
    error.value = null

    try {
      const newWord = await vocabularyApi.addVocabulary(word)
      // 乐观更新：立即添加到本地状态，不等待下次 fetch
      words.value.push(newWord)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add word'
      throw err // 重新抛出错误，让调用者处理
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 删除词汇
   */
  async function deleteWord(id: string) {
    loading.value = true
    error.value = null

    try {
      await vocabularyApi.deleteVocabulary(id)
      // 乐观更新：立即从本地状态删除
      words.value = words.value.filter(w => w.id !== id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete word'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  return {
    // 状态
    words,
    loading,
    error,

    // 计算属性
    totalWords,
    sortedWords,

    // 方法
    fetchWords,
    addWord,
    deleteWord,
  }
})
