// IndexedDB Database
// 使用 Dexie.js 封装 IndexedDB 操作

import Dexie, { type EntityTable } from 'dexie'
import type { VocabularyWord, VideoItem } from '@/api/types'
import type { PlayerProgress, SubtitleData } from './types'

/**
 * ShadowPlayer 数据库
 *
 * 企业项目经验：
 * - 使用 Dexie.js 简化 IndexedDB 操作
 * - 定义清晰的 schema 和索引
 * - 使用 TypeScript 类型确保类型安全
 */
class ShadowPlayerDatabase extends Dexie {
  // 表定义
  vocabulary!: EntityTable<VocabularyWord, 'id'>
  history!: EntityTable<VideoItem, 'id'>
  playerProgress!: EntityTable<PlayerProgress, 'videoId'>
  subtitles!: EntityTable<SubtitleData, 'videoId'>

  constructor() {
    super('shadowplayer_db')

    // 定义数据库 schema
    // 企业项目经验：
    // - 主键自动索引，无需在索引列表中声明
    // - 只为需要查询的字段创建索引（如排序、过滤）
    // - 索引会占用额外空间，不要过度索引
    this.version(1).stores({
      // vocabulary 表
      // 索引：createdAt（用于按时间排序）
      vocabulary: 'id, createdAt',

      // history 表
      // 索引：date（用于按时间排序）
      history: 'id, date',

      // playerProgress 表
      // 索引：lastPlayedAt（用于查找最近播放）
      playerProgress: 'videoId, lastPlayedAt',

      // subtitles 表
      // 无额外索引（通常通过 videoId 直接查询）
      subtitles: 'videoId',
    })
  }
}

// 导出数据库实例
// 企业项目经验：使用单例模式，确保整个应用共享同一个数据库连接
export const db = new ShadowPlayerDatabase()
