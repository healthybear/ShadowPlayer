// History API
// 使用 IndexedDB 存储历史记录数据

import type { VideoItem } from './types'
import { db } from '@/storage/db'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 获取历史记录
 *
 * @param page - 页码（从 1 开始）
 * @param pageSize - 每页数量
 *
 * 企业项目经验：
 * - 使用 offset/limit 实现分页
 * - 返回总数，便于计算总页数
 */
export async function fetchHistory(page = 1, pageSize = 10): Promise<{
  items: VideoItem[]
  total: number
}> {
  await delay(100)

  try {
    const offset = (page - 1) * pageSize

    // 获取总数和分页数据
    const [total, items] = await Promise.all([
      db.history.count(),
      db.history
        .orderBy('date') // 按日期排序
        .reverse() // 最新的在前
        .offset(offset)
        .limit(pageSize)
        .toArray(),
    ])

    return { items, total }
  }
  catch (error) {
    console.error('Failed to fetch history:', error)
    throw new Error('获取历史记录失败')
  }
}

/**
 * 获取最近播放（用于首页）
 */
export async function fetchRecentVideos(limit = 3): Promise<VideoItem[]> {
  await delay(100)

  try {
    return await db.history
      .orderBy('date')
      .reverse()
      .limit(limit)
      .toArray()
  }
  catch (error) {
    console.error('Failed to fetch recent videos:', error)
    return []
  }
}

/**
 * 清空历史记录
 */
export async function clearHistory(): Promise<void> {
  await delay(100)

  try {
    await db.history.clear()
  }
  catch (error) {
    console.error('Failed to clear history:', error)
    throw new Error('清空历史记录失败')
  }
}

/**
 * 删除单个历史记录
 */
export async function deleteHistoryItem(id: string): Promise<void> {
  await delay(100)

  try {
    await db.history.delete(id)
  }
  catch (error) {
    console.error('Failed to delete history item:', error)
    throw new Error('删除历史记录失败')
  }
}
