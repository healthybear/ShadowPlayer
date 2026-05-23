// Vocabulary API
// 使用 IndexedDB 存储词汇数据

import type { VocabularyWord } from './types'
import { db } from '@/storage/db'

// 模拟网络延迟（保持 API 的异步特性）
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 获取所有词汇
 *
 * 企业项目经验：
 * - 从 IndexedDB 读取数据
 * - 保持异步 API，便于未来切换到真实后端
 * - 添加错误处理
 */
export async function fetchVocabulary(): Promise<VocabularyWord[]> {
  await delay(100) // 轻微延迟，模拟真实场景

  try {
    return await db.vocabulary.toArray()
  }
  catch (error) {
    console.error('Failed to fetch vocabulary:', error)
    throw new Error('获取词汇失败')
  }
}

/**
 * 添加新词汇
 */
export async function addVocabulary(word: Omit<VocabularyWord, 'id' | 'createdAt'>): Promise<VocabularyWord> {
  await delay(100)

  const newWord: VocabularyWord = {
    ...word,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }

  try {
    await db.vocabulary.add(newWord)
    return newWord
  }
  catch (error) {
    console.error('Failed to add vocabulary:', error)
    throw new Error('添加词汇失败')
  }
}

/**
 * 删除词汇
 */
export async function deleteVocabulary(id: string): Promise<void> {
  await delay(100)

  try {
    await db.vocabulary.delete(id)
  }
  catch (error) {
    console.error('Failed to delete vocabulary:', error)
    throw new Error('删除词汇失败')
  }
}
