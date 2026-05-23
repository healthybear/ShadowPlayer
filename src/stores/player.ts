// Player Store
// 管理播放器的状态和业务逻辑

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Subtitle } from '@/api/types'
import * as playerApi from '@/api/player'

/**
 * 企业项目经验：播放器 Store 的设计考虑
 *
 * 1. 状态管理：
 *    - 播放状态（playing, currentTime, duration）
 *    - 字幕数据（subtitles, currentSubtitle）
 *    - UI 状态（showWordPopup, selectedWord）
 *
 * 2. 为什么需要 Store？
 *    - 播放器状态可能被多个组件使用（控制条、字幕列表、进度条）
 *    - 统一管理避免 props drilling
 *    - 方便实现播放进度自动保存
 */
export const usePlayerStore = defineStore('player', () => {
  // 视频信息
  const videoId = ref<string>('')
  const poster = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 播放状态
  const playing = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)

  // 字幕数据
  const subtitles = ref<Subtitle[]>([])
  const activeSubtitleId = ref<string>('')

  // 单词弹窗状态
  const showWordPopup = ref(false)
  const selectedWord = ref({
    word: '',
    pronunciation: '',
    definition: '',
  })

  // 计算属性
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const currentSubtitle = computed(() => {
    return subtitles.value.find(s => s.id === activeSubtitleId.value) || null
  })

  /**
   * 加载播放器数据
   */
  async function loadVideo(id: string) {
    videoId.value = id
    loading.value = true
    error.value = null

    try {
      const data = await playerApi.fetchPlayerData(id)
      poster.value = data.poster
      subtitles.value = data.subtitles

      // 默认激活第一条字幕
      if (subtitles.value.length > 0) {
        activeSubtitleId.value = subtitles.value[0]?.id || ''
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load video'
      console.error('Failed to load video:', err)
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 切换播放/暂停
   */
  function togglePlay() {
    playing.value = !playing.value
  }

  /**
   * 跳转到指定时间
   */
  function seek(time: number) {
    currentTime.value = time
  }

  /**
   * 选择字幕
   */
  function selectSubtitle(id: string) {
    activeSubtitleId.value = id
  }

  /**
   * 显示单词弹窗
   */
  function showWord(word: string, pronunciation: string, definition: string) {
    selectedWord.value = { word, pronunciation, definition }
    showWordPopup.value = true
  }

  /**
   * 隐藏单词弹窗
   */
  function hideWord() {
    showWordPopup.value = false
  }

  /**
   * 保存播放进度
   *
   * 企业项目经验：
   * - 应该使用防抖，避免频繁调用
   * - 实际项目中可以使用 watchDebounced 自动保存
   */
  async function saveProgress() {
    if (!videoId.value) return

    try {
      await playerApi.saveProgress(videoId.value, currentTime.value, duration.value)
    }
    catch (err) {
      console.error('Failed to save progress:', err)
    }
  }

  return {
    // 视频信息
    videoId,
    poster,
    loading,
    error,

    // 播放状态
    playing,
    currentTime,
    duration,

    // 字幕数据
    subtitles,
    activeSubtitleId,

    // 单词弹窗
    showWordPopup,
    selectedWord,

    // 计算属性
    progress,
    currentSubtitle,

    // 方法
    loadVideo,
    togglePlay,
    seek,
    selectSubtitle,
    showWord,
    hideWord,
    saveProgress,
  }
})
