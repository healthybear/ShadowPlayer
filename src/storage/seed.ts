// Seed Data
// 首次启动时的初始示例数据

import { db } from './db'
import type { VocabularyWord, VideoItem } from '@/api/types'
import { figmaDesignAssets } from '@/config/figmaDesignAssets'

/**
 * 初始词汇数据
 */
const initialVocabulary: VocabularyWord[] = [
  {
    id: '1',
    word: 'ubiquitous',
    definition: '无所不在的，普遍存在的',
    example: 'Smartphones have become ubiquitous in modern society.',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    word: 'meticulous',
    definition: '严谨的，极精细的',
    example: 'She was meticulous in her research methodology.',
    createdAt: '2024-01-16T14:20:00Z',
  },
  {
    id: '3',
    word: 'paradigm',
    definition: '范例，典范',
    example: 'This discovery represents a paradigm shift in physics.',
    createdAt: '2024-01-17T09:15:00Z',
  },
  {
    id: '4',
    word: 'eloquent',
    definition: '雄辩的，口才流利的',
    example: 'The speaker gave an eloquent presentation.',
    createdAt: '2024-01-18T16:45:00Z',
  },
]

/**
 * 初始历史记录数据
 */
const initialHistory: VideoItem[] = [
  {
    id: '1',
    title: 'Business_English_Module_04_Negotiations.mp4',
    date: '2 hours ago',
    progress: 42,
    thumb: figmaDesignAssets.history.thumb1,
    duration: '45m',
  },
  {
    id: '2',
    title: 'Interview_Tips_Confidence_Workshop.mkv',
    date: 'Yesterday',
    progress: 85,
    thumb: figmaDesignAssets.history.thumb2,
    duration: '1h 20m',
  },
  {
    id: '3',
    title: 'Daily_Phrases_Part_01_Greetings.mp4',
    date: '3 days ago',
    progress: 100,
    thumb: figmaDesignAssets.history.thumb3,
    duration: '25m',
  },
]

/**
 * 检查数据库是否为空
 */
async function isDatabaseEmpty(): Promise<boolean> {
  const [vocabCount, historyCount] = await Promise.all([
    db.vocabulary.count(),
    db.history.count(),
  ])

  return vocabCount === 0 && historyCount === 0
}

/**
 * 初始化数据库
 *
 * 企业项目经验：
 * - 首次启动时提供示例数据，帮助用户理解功能
 * - 只在数据库为空时插入，避免覆盖用户数据
 * - 使用事务确保数据一致性
 */
export async function seedDatabase(): Promise<void> {
  try {
    // 检查是否需要初始化
    const isEmpty = await isDatabaseEmpty()

    if (!isEmpty) {
      console.log('Database already has data, skipping seed')
      return
    }

    console.log('Seeding database with initial data...')

    // 使用事务插入初始数据
    await db.transaction('rw', [db.vocabulary, db.history], async () => {
      await Promise.all([
        db.vocabulary.bulkAdd(initialVocabulary),
        db.history.bulkAdd(initialHistory),
      ])
    })

    console.log('Database seeded successfully')
  }
  catch (error) {
    console.error('Failed to seed database:', error)
    // 不抛出错误，允许应用继续运行
  }
}
