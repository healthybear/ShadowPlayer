import Dexie, { type EntityTable } from 'dexie'

export interface Video {
  id: string
  filename: string
  size: number
  duration: number
  storageType: 'blob' | 'file-handle'
  blob?: Blob
  fileHandle?: FileSystemFileHandle
  uploadedAt: number
  lastPlayedAt?: number
  thumbnailUrl?: string
}

/**
 * 字幕条目（Subtitle Entry）
 *
 * 类型思维：值对象 vs 实体
 * - 值对象（Value Object）：由属性值决定身份，不需要独立 ID
 * - 实体（Entity）：有独立生命周期，需要唯一 ID
 *
 * SubtitleEntry 是值对象：
 * - 身份由 index（在数组中的位置）决定
 * - 不会独立于 Subtitle 存在
 * - 不需要跨系统追踪
 *
 * 为什么不添加 id 字段？
 * - index 已经唯一标识了字幕条目
 * - 添加 id 会引入冗余数据
 * - 增加内存占用和序列化成本
 *
 * 企业项目经验：
 * - 不是所有数据都需要 UUID
 * - 过度使用 ID 会增加系统复杂度
 * - 根据领域模型选择合适的标识策略
 */
export interface SubtitleEntry {
  index: number        // 字幕序号（唯一标识）
  startTime: number    // 开始时间（秒）
  endTime: number      // 结束时间（秒）
  text: string         // 字幕文本
}

export interface Subtitle {
  id: string
  videoId: string
  filename: string
  language: string
  entries: SubtitleEntry[]
  uploadedAt: number
}

export interface PlaybackProgress {
  videoId: string
  currentTime: number
  duration: number
  percentage: number
  lastPlayedAt: number
  completed: boolean
}

export interface VocabularyItem {
  id: string
  word: string
  translation?: string
  pronunciation?: string
  definition?: string
  videoId?: string
  subtitleId?: string
  createdAt: number
}

export class ShadowPlayerDB extends Dexie {
  videos!: EntityTable<Video, 'id'>
  subtitles!: EntityTable<Subtitle, 'id'>
  progress!: EntityTable<PlaybackProgress, 'videoId'>
  vocabulary!: EntityTable<VocabularyItem, 'id'>

  constructor() {
    super('ShadowPlayerDB')
    this.version(1).stores({
      videos: 'id, uploadedAt, lastPlayedAt',
      subtitles: 'id, videoId, uploadedAt',
      progress: 'videoId, lastPlayedAt'
    })
    this.version(2).stores({
      videos: 'id, uploadedAt, lastPlayedAt',
      subtitles: 'id, videoId, uploadedAt',
      progress: 'videoId, lastPlayedAt',
      vocabulary: 'id, word, videoId, createdAt'
    })
  }
}

export const db = new ShadowPlayerDB()
