/**
 * Vocabulary Composable (词汇表组合式函数)
 *
 * 职责：
 * - 词汇表 CRUD 操作
 * - 重复检测
 * - 数据验证
 *
 * 为什么需要 composable？
 * - 封装数据库操作
 * - 提供统一的业务逻辑
 * - 可在多个组件中复用
 *
 * 企业项目经验：
 * - 数据库操作应该封装在 composable 中
 * - 不要在组件中直接操作 db
 * - composable 让业务逻辑可测试、可复用
 */

import { ref } from 'vue'
import { db, type VocabularyItem } from '@/db/schema'

export function useVocabulary() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 添加单词到词汇表
   *
   * 流程：
   * 1. 数据验证
   * 2. 重复检测
   * 3. 写入数据库
   * 4. 错误处理
   *
   * 重复检测规则：
   * - 相同 normalizedWord
   * - 相同 videoId
   * - 相同 subtitleIndex
   * 视为同一条词汇记录，不重复插入
   *
   * 为什么不用"同一个词全局只保留一条"？
   * - 同一个词在不同视频、不同语境下都可能有学习价值
   * - 词汇学习比字典更看重上下文
   * - 这也更符合"从具体场景回跳复习"的产品目标
   *
   * 企业项目经验：
   * - 重复检测规则要匹配业务需求
   * - 使用复合索引让查询从 O(n) 降到 O(1)
   * - 数据验证要在写入前完成，不要依赖数据库约束
   */
  async function addWord(item: Omit<VocabularyItem, 'id' | 'createdAt'>): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // 数据验证
      if (!item.word || !item.normalizedWord) {
        throw new Error('Word and normalizedWord are required')
      }

      // 重复检测
      const isDuplicate = await checkDuplicate(
        item.normalizedWord,
        item.videoId,
        item.subtitleIndex
      )

      if (isDuplicate) {
        throw new Error('This word is already in your vocabulary')
      }

      // 生成 ID 和时间戳
      const newItem: VocabularyItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      }

      // 写入数据库
      await db.vocabulary.add(newItem)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add word'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 检查是否重复
   *
   * 使用复合索引查询：
   * - [normalizedWord+videoId+subtitleIndex]
   *
   * 为什么需要复合索引？
   * - 业务规则本身就是三元组唯一
   * - 不能只靠单列索引再在内存中过滤，否则数据量增长后性能和一致性都会变差
   * - 复合索引让查询从 O(n) 降到 O(1)
   *
   * 边界情况处理：
   * - videoId 或 subtitleIndex 可能是 undefined
   * - 使用 ?? '' 和 ?? -1 转换为稳定的查询键
   * - 这样 undefined 和 '' 会被视为不同的值
   *
   * 企业项目经验：
   * - 索引设计要匹配查询模式
   * - 边界情况要显式处理，不要依赖隐式转换
   * - 性能优化要基于实测数据，不要凭感觉
   */
  async function checkDuplicate(
    normalizedWord: string,
    videoId?: string,
    subtitleIndex?: number
  ): Promise<boolean> {
    try {
      const existing = await db.vocabulary
        .where('[normalizedWord+videoId+subtitleIndex]')
        .equals([normalizedWord, videoId ?? '', subtitleIndex ?? -1])
        .first()

      return existing !== undefined
    } catch (err) {
      console.error('Failed to check duplicate:', err)
      return false // 查询失败时，允许添加（宽松策略）
    }
  }

  /**
   * 删除单词
   *
   * 简单的删除操作，通过 ID 删除
   */
  async function deleteWord(id: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await db.vocabulary.delete(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete word'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新单词
   *
   * 用于编辑模式（Phase 1.5）
   */
  async function updateWord(id: string, updates: Partial<VocabularyItem>): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await db.vocabulary.update(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update word'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取词汇列表
   *
   * 排序：按创建时间倒序（最新的在前）
   *
   * 为什么不用响应式？
   * - 词汇列表可能很大（1000+ 条）
   * - 响应式会增加内存占用和性能开销
   * - 手动刷新更可控
   *
   * 企业项目经验：
   * - 不是所有数据都需要响应式
   * - 大列表用手动刷新，小列表用响应式
   * - 性能优化要基于实际场景
   */
  async function getVocabularyList(): Promise<VocabularyItem[]> {
    loading.value = true
    error.value = null

    try {
      const items = await db.vocabulary
        .orderBy('createdAt')
        .reverse()
        .toArray()
      return items
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load vocabulary'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 按视频 ID 获取词汇列表
   *
   * 用于"查看这个视频的所有生词"功能
   */
  async function getVocabularyByVideo(videoId: string): Promise<VocabularyItem[]> {
    loading.value = true
    error.value = null

    try {
      const items = await db.vocabulary
        .where('videoId')
        .equals(videoId)
        .sortBy('createdAt')
      return items.reverse()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load vocabulary'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索词汇
   *
   * 使用 normalizedWord 索引进行前缀匹配
   *
   * 为什么用 startsWith 而不是 includes？
   * - startsWith 可以利用索引，性能更好
   * - includes 需要全表扫描，性能差
   * - 用户搜索通常是前缀匹配（如搜索 "pra" 找 "practice"）
   *
   * 企业项目经验：
   * - 搜索功能要考虑性能
   * - 能用索引就用索引，不要全表扫描
   * - 前缀匹配比模糊匹配更实用
   */
  async function searchVocabulary(query: string): Promise<VocabularyItem[]> {
    loading.value = true
    error.value = null

    try {
      const normalizedQuery = query.toLowerCase().trim()
      if (!normalizedQuery) {
        return []
      }

      const items = await db.vocabulary
        .where('normalizedWord')
        .startsWith(normalizedQuery)
        .sortBy('createdAt')
      return items.reverse()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search vocabulary'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    addWord,
    checkDuplicate,
    deleteWord,
    updateWord,
    getVocabularyList,
    getVocabularyByVideo,
    searchVocabulary,
  }
}
