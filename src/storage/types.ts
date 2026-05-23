// Storage Types
// 存储层的类型定义

import type { VocabularyWord, VideoItem, Subtitle } from '@/api/types'

/**
 * 播放进度记录
 */
export interface PlayerProgress {
  videoId: string
  currentTime: number
  duration: number
  lastPlayedAt: string
}

/**
 * 字幕数据
 */
export interface SubtitleData {
  videoId: string
  subtitles: Subtitle[]
}

/**
 * 导出数据格式
 *
 * 企业项目经验：
 * - 包含版本号，支持未来的数据迁移
 * - 包含导出时间戳，方便用户识别备份
 * - 使用明确的数据结构，便于验证
 */
export interface ExportData {
  version: string
  exportedAt: string
  data: {
    vocabulary: VocabularyWord[]
    history: VideoItem[]
    playerProgress: Record<string, PlayerProgress>
    subtitles: Record<string, SubtitleData>
  }
}

/**
 * 存储统计信息
 */
export interface StorageStats {
  vocabularyCount: number
  historyCount: number
  playerProgressCount: number
  subtitlesCount: number
  estimatedSize: string // 如 "2.5 MB"
}
