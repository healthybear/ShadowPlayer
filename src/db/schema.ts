import Dexie, { type EntityTable } from 'dexie'

/**
 * 视频记录（Video）
 *
 * 存储策略：
 * - 只存储文件句柄（fileHandle），不存储文件内容
 * - 文件句柄是对用户文件系统中文件的引用
 * - 不占用 IndexedDB 存储空间
 * - 需要浏览器支持 File System Access API
 *
 * 为什么不存储 Blob？
 * - 视频文件通常很大（几百 MB 到几 GB）
 * - IndexedDB 有存储限制（通常几 GB）
 * - 存储大文件会导致性能问题
 * - 文件句柄方案更高效、更可靠
 *
 * 企业项目经验：
 * - 大文件不要存储在浏览器数据库中
 * - 使用文件引用而不是文件内容
 * - File System Access API 是现代浏览器的标准
 */
export interface Video {
  id: string
  filename: string
  size: number
  duration: number
  storageType: 'file-handle'
  fileHandle: FileSystemFileHandle
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

/**
 * 词汇表项（Vocabulary Item）
 *
 * 设计思维：显示词、查询词、规范化词的三元分离
 * - word: 用户看到/点击的原始词形（如 "practice,"）
 * - normalizedWord: 去重、缓存、搜索使用的规范化词（如 "practice"）
 * - 这种分离避免了标点、大小写导致的缓存失效和重复检测问题
 *
 * 上下文捕获：
 * - context: 字幕原文，保留学习场景
 * - timestamp: 视频时间点，用于回跳
 * - videoId: 关联的视频 ID
 * - subtitleIndex: 字幕索引，用于精确定位
 *
 * 词典数据：
 * - definitions: 多个释义（按词性分组）
 * - pronunciation: 音标
 * - audioUrl: 发音音频 URL
 *
 * 数据来源标记：
 * - source: 'captured' 表示从播放器捕获的完整数据
 * - source: 'legacy' 表示旧版本数据，可能缺少上下文
 *
 * 企业项目经验：
 * - 显式区分新旧数据，而不是用空字符串/0 掩盖缺失
 * - 缺失值用 undefined，而不是填充假数据
 * - 这样可以在 UI 层正确处理"无数据"的情况
 */
export interface VocabularyItem {
  id: string
  word: string                    // 用户看到的原始词形（displayText）
  normalizedWord: string          // 规范化词（用于去重、缓存、搜索）

  // 捕获上下文（新数据要求完整）
  context?: string                // 字幕原文；历史数据可能缺失
  timestamp?: number              // 视频时间点（秒）；历史数据可能缺失
  videoId?: string                // 关联的视频 ID；历史数据可能缺失
  subtitleIndex?: number          // 字幕索引；历史数据可能缺失
  createdAt: number               // 创建时间

  // 词典数据（可选，来自 API）
  pronunciation?: string          // 音标
  audioUrl?: string               // 发音音频 URL
  definitions?: Array<{           // 多个释义
    partOfSpeech: string          // 词性（noun, verb, adjective...）
    definition: string            // 释义
    example?: string              // 例句
  }>

  // 用户自定义（可选）
  translation?: string            // 用户添加的翻译
  notes?: string                  // 用户笔记

  // 元数据（可选）
  videoTitle?: string             // 视频标题（冗余，性能优化）
  source: 'captured' | 'legacy'   // 数据来源标记

  // 废弃字段（保留兼容性）
  definition?: string             // 旧版本的单个释义字段
  subtitleId?: string             // 旧版本字段，不再使用
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

    /**
     * Version 3: 词汇表功能完整实现
     *
     * 新增索引：
     * - normalizedWord: 用于快速查找和去重
     * - [normalizedWord+videoId+subtitleIndex]: 复合索引，支持精确的重复检测
     *
     * 为什么需要复合索引？
     * - 业务规则：同一个词在同一视频的同一字幕位置视为重复
     * - 单列索引无法高效支持这种三元组查询
     * - 复合索引让重复检测从 O(n) 降到 O(1)
     *
     * 数据迁移策略：
     * - 为旧数据生成 normalizedWord（转小写）
     * - 标记旧数据为 source='legacy'
     * - 不填充假的 context/timestamp，保持 undefined
     *
     * 企业项目经验：
     * - 索引设计要匹配查询模式，而不是随意添加
     * - 数据迁移要显式标记新旧数据，便于后续处理
     * - 缺失值用 undefined，不要用空字符串或 0 掩盖问题
     */
    this.version(3).stores({
      videos: 'id, uploadedAt, lastPlayedAt',
      subtitles: 'id, videoId, uploadedAt',
      progress: 'videoId, lastPlayedAt',
      vocabulary: 'id, normalizedWord, videoId, createdAt, [normalizedWord+videoId+subtitleIndex]'
    }).upgrade(tx => {
      // 迁移旧数据：生成 normalizedWord 和 source 标记
      return tx.table('vocabulary').toCollection().modify(item => {
        // 生成 normalizedWord（如果不存在）
        if (!item.normalizedWord && item.word) {
          item.normalizedWord = item.word.toLowerCase().trim()
        }

        // 标记为 legacy 数据（如果没有 source 字段）
        if (!item.source) {
          item.source = 'legacy'
        }

        // 不填充 context/timestamp/subtitleIndex
        // 企业项目经验：缺失值保持 undefined，不要伪造数据
      })
    })
  }
}

export const db = new ShadowPlayerDB()
