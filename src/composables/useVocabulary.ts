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
   * 2. 数据清洗（确保可序列化）
   * 3. 重复检测
   * 4. 写入数据库
   * 5. 错误处理
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
   * - IndexedDB 只能存储可序列化的数据，需要清洗
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

      // 数据清洗：确保所有字段都可序列化
      // 企业项目经验：
      // - IndexedDB 使用结构化克隆算法，不支持函数、Symbol、DOM 节点等
      // - 需要将数据转换为纯 JSON 对象
      // - 使用 JSON.parse(JSON.stringify()) 是最简单的方法
      const cleanedItem = JSON.parse(JSON.stringify(item))

      // 生成 ID 和时间戳
      const newItem: VocabularyItem = {
        ...cleanedItem,
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
        return getVocabularyList()
      }

      const indexedItems = await db.vocabulary
        .where('normalizedWord')
        .startsWith(normalizedQuery)
        .sortBy('createdAt')

      // 混合搜索策略：前缀搜索走索引，翻译/上下文等补充字段走内存过滤。
      // 这样既保留大列表下的搜索性能，也不会牺牲学习场景里常用的上下文搜索能力。
      const allItems = await db.vocabulary.toArray()
      const matchedIds = new Set(indexedItems.map(item => item.id))
      const fuzzyMatchedItems = allItems.filter((item) => {
        if (matchedIds.has(item.id)) {
          return false
        }

        const searchableText = [
          item.word,
          item.translation,
          item.context,
          item.definition,
          item.pronunciation,
          item.videoTitle,
          ...(item.definitions?.map(def => `${def.partOfSpeech} ${def.definition} ${def.example ?? ''}`) ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(normalizedQuery)
      })

      return [...indexedItems, ...fuzzyMatchedItems]
        .sort((a, b) => b.createdAt - a.createdAt)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search vocabulary'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 导出词汇表为 CSV
   *
   * CSV 适合导入 Excel / Google Sheets，也便于学生二次整理。
   *
   * 企业项目经验：
   * - CSV 字段要固定顺序，避免后续数据分析脚本频繁适配
   * - 需要处理逗号、引号、换行，避免导出后列错位
   * - 下载链接使用后要及时释放，避免长期页面会话中的内存泄漏
   */
  async function exportVocabularyToCsv(items?: VocabularyItem[]): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const exportItems = items ?? await getVocabularyList()

      const headers = [
        'word',
        'normalizedWord',
        'translation',
        'pronunciation',
        'definitions',
        'context',
        'videoTitle',
        'videoId',
        'timestamp',
        'subtitleIndex',
        'source',
        'createdAt',
      ]

      const escapeCsvField = (value: string | number | undefined): string => {
        if (value === undefined || value === null) {
          return '""'
        }

        const serializedValue = String(value).replace(/"/g, '""')
        return `"${serializedValue}"`
      }

      const rows = exportItems.map((item) => {
        const definitions = item.definitions?.map(def => {
          const example = def.example ? ` (${def.example})` : ''
          return `${def.partOfSpeech}: ${def.definition}${example}`
        }).join(' | ') ?? item.definition ?? ''

        return [
          item.word,
          item.normalizedWord,
          item.translation,
          item.pronunciation,
          definitions,
          item.context,
          item.videoTitle,
          item.videoId,
          item.timestamp,
          item.subtitleIndex,
          item.source,
          new Date(item.createdAt).toISOString(),
        ].map(escapeCsvField).join(',')
      })

      const csvContent = [headers.join(','), ...rows].join('\n')

      // 添加 UTF-8 BOM，避免 Excel 打开中文内容时出现乱码。
      const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)

      link.href = url
      link.download = `shadowplayer-vocabulary-${timestamp}.csv`
      link.click()

      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to export vocabulary'
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
    exportVocabularyToCsv,
  }
}
