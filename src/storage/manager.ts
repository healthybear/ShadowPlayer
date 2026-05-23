// Storage Manager
// 管理数据的导入、导出和清空

import { db } from './db'
import type { ExportData, StorageStats } from './types'

/**
 * 导出所有数据
 *
 * 企业项目经验：
 * - 使用 Blob 创建可下载的文件
 * - 包含版本号和时间戳，便于追踪
 * - 使用 JSON 格式，人类可读且易于调试
 */
export async function exportData(): Promise<Blob> {
  try {
    // 从所有表读取数据
    const [vocabulary, history, playerProgressArray, subtitlesArray] = await Promise.all([
      db.vocabulary.toArray(),
      db.history.toArray(),
      db.playerProgress.toArray(),
      db.subtitles.toArray(),
    ])

    // 将数组转换为对象（以 ID 为键）
    // 企业项目经验：对于 1:1 关系的数据，使用对象而不是数组更高效
    const playerProgress: Record<string, any> = {}
    playerProgressArray.forEach((item) => {
      playerProgress[item.videoId] = item
    })

    const subtitles: Record<string, any> = {}
    subtitlesArray.forEach((item) => {
      subtitles[item.videoId] = item
    })

    // 构建导出数据
    const exportData: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        vocabulary,
        history,
        playerProgress,
        subtitles,
      },
    }

    // 转换为 JSON 字符串，使用缩进便于阅读
    const jsonString = JSON.stringify(exportData, null, 2)

    // 创建 Blob
    return new Blob([jsonString], { type: 'application/json' })
  }
  catch (error) {
    console.error('Failed to export data:', error)
    throw new Error('导出数据失败')
  }
}

/**
 * 导入数据
 *
 * @param file - JSON 文件
 * @param clearExisting - 是否清空现有数据（默认 true）
 *
 * 企业项目经验：
 * - 使用事务确保数据一致性（要么全部成功，要么全部失败）
 * - 验证数据格式，防止导入损坏的数据
 * - 提供清空选项，让用户选择合并还是替换
 */
export async function importData(file: File, clearExisting = true): Promise<void> {
  try {
    // 读取文件内容
    const text = await file.text()
    const importData: ExportData = JSON.parse(text)

    // 验证数据格式
    if (!importData.version || !importData.data) {
      throw new Error('Invalid data format')
    }

    // 版本检查（未来可以添加数据迁移逻辑）
    if (importData.version !== '1.0.0') {
      console.warn(`Data version mismatch: ${importData.version}`)
      // 这里可以添加版本转换逻辑
    }

    // 使用事务导入数据
    // 企业项目经验：事务确保原子性，避免部分导入导致数据不一致
    await db.transaction('rw', [db.vocabulary, db.history, db.playerProgress, db.subtitles], async () => {
      // 清空现有数据（如果需要）
      if (clearExisting) {
        await Promise.all([
          db.vocabulary.clear(),
          db.history.clear(),
          db.playerProgress.clear(),
          db.subtitles.clear(),
        ])
      }

      // 导入新数据
      const { vocabulary, history, playerProgress, subtitles } = importData.data

      // 批量插入数据
      // 企业项目经验：使用 bulkAdd 而不是循环 add，性能提升 10 倍以上
      await Promise.all([
        vocabulary.length > 0 ? db.vocabulary.bulkAdd(vocabulary) : Promise.resolve(),
        history.length > 0 ? db.history.bulkAdd(history) : Promise.resolve(),
        Object.values(playerProgress).length > 0
          ? db.playerProgress.bulkAdd(Object.values(playerProgress))
          : Promise.resolve(),
        Object.values(subtitles).length > 0
          ? db.subtitles.bulkAdd(Object.values(subtitles))
          : Promise.resolve(),
      ])
    })

    console.log('Data imported successfully')
  }
  catch (error) {
    console.error('Failed to import data:', error)
    if (error instanceof SyntaxError) {
      throw new Error('无效的 JSON 文件')
    }
    throw new Error('导入数据失败')
  }
}

/**
 * 清空所有数据
 *
 * 企业项目经验：
 * - 危险操作应该有明确的确认机制
 * - 使用事务确保要么全部清空，要么全部保留
 */
export async function clearAllData(): Promise<void> {
  try {
    await db.transaction('rw', [db.vocabulary, db.history, db.playerProgress, db.subtitles], async () => {
      await Promise.all([
        db.vocabulary.clear(),
        db.history.clear(),
        db.playerProgress.clear(),
        db.subtitles.clear(),
      ])
    })

    console.log('All data cleared')
  }
  catch (error) {
    console.error('Failed to clear data:', error)
    throw new Error('清空数据失败')
  }
}

/**
 * 获取存储统计信息
 *
 * 企业项目经验：
 * - 让用户了解存储使用情况
 * - 帮助用户决定是否需要清理数据
 */
export async function getStorageStats(): Promise<StorageStats> {
  try {
    const [vocabularyCount, historyCount, playerProgressCount, subtitlesCount] = await Promise.all([
      db.vocabulary.count(),
      db.history.count(),
      db.playerProgress.count(),
      db.subtitles.count(),
    ])

    // 估算存储大小
    // 企业项目经验：IndexedDB 没有直接的 API 获取大小，只能估算
    // 实际大小可能因浏览器实现而异
    const estimatedSize = await estimateStorageSize()

    return {
      vocabularyCount,
      historyCount,
      playerProgressCount,
      subtitlesCount,
      estimatedSize,
    }
  }
  catch (error) {
    console.error('Failed to get storage stats:', error)
    throw new Error('获取存储统计失败')
  }
}

/**
 * 估算存储大小
 *
 * 企业项目经验：
 * - 使用 StorageManager API（如果可用）
 * - 降级到粗略估算
 */
async function estimateStorageSize(): Promise<string> {
  // 尝试使用 StorageManager API
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      const usageInMB = (estimate.usage || 0) / (1024 * 1024)
      return `${usageInMB.toFixed(2)} MB`
    }
    catch (error) {
      console.warn('Failed to estimate storage:', error)
    }
  }

  // 降级：粗略估算
  return 'Unknown'
}

/**
 * 下载导出的数据
 *
 * 企业项目经验：
 * - 使用 URL.createObjectURL 创建临时下载链接
 * - 自动清理临时 URL，避免内存泄漏
 */
export async function downloadExportedData(): Promise<void> {
  try {
    const blob = await exportData()

    // 生成文件名（包含时间戳）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `shadowplayer-backup-${timestamp}.json`

    // 创建临时下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    // 清理临时 URL
    // 企业项目经验：延迟清理，确保下载已触发
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }
  catch (error) {
    console.error('Failed to download data:', error)
    throw new Error('下载数据失败')
  }
}
