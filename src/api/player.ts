// Player API
// 使用 IndexedDB 存储播放器相关数据

import type { PlayerState, Subtitle } from './types'
import { db } from '@/storage/db'
import { figmaDesignAssets } from '@/config/figmaDesignAssets'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 获取播放器数据
 *
 * @param videoId - 视频 ID
 *
 * 企业项目经验：
 * - 播放器数据包含视频元信息和字幕
 * - 从 IndexedDB 读取字幕数据
 * - 如果没有字幕，返回空数组
 */
export async function fetchPlayerData(videoId: string): Promise<PlayerState> {
  await delay(100)

  try {
    // 从 IndexedDB 获取字幕数据
    const subtitleData = await db.subtitles.get(videoId)

    return {
      videoId,
      poster: figmaDesignAssets.player.poster,
      subtitles: subtitleData?.subtitles || [],
    }
  }
  catch (error) {
    console.error('Failed to fetch player data:', error)
    throw new Error('获取播放器数据失败')
  }
}

/**
 * 保存播放进度
 *
 * 企业项目经验：
 * - 播放进度应该定期保存（如每 5 秒）
 * - 使用 put 而不是 add，自动更新已存在的记录
 */
export async function saveProgress(videoId: string, currentTime: number, duration: number): Promise<void> {
  await delay(50)

  try {
    await db.playerProgress.put({
      videoId,
      currentTime,
      duration,
      lastPlayedAt: new Date().toISOString(),
    })
  }
  catch (error) {
    console.error('Failed to save progress:', error)
    throw new Error('保存播放进度失败')
  }
}

/**
 * 获取播放进度
 */
export async function getProgress(videoId: string): Promise<{ currentTime: number, duration: number } | null> {
  try {
    const progress = await db.playerProgress.get(videoId)
    if (!progress) return null

    return {
      currentTime: progress.currentTime,
      duration: progress.duration,
    }
  }
  catch (error) {
    console.error('Failed to get progress:', error)
    return null
  }
}

/**
 * 保存字幕数据
 *
 * 企业项目经验：
 * - 字幕数据可能很大，使用 IndexedDB 而不是 localStorage
 * - 使用 put 自动更新已存在的记录
 */
export async function saveSubtitles(videoId: string, subtitles: Subtitle[]): Promise<void> {
  try {
    await db.subtitles.put({
      videoId,
      subtitles,
    })
  }
  catch (error) {
    console.error('Failed to save subtitles:', error)
    throw new Error('保存字幕失败')
  }
}
