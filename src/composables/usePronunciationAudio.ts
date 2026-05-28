/**
 * Pronunciation Audio Composable (发音音频组合式函数)
 *
 * 职责：
 * - 播放单词发音
 * - 音频缓存
 * - 错误处理
 *
 * 为什么需要单独的 composable？
 * - 音频播放和词典查询是两个不同的外部依赖
 * - 提前拆边界，后续测试和替换 API 都更容易
 * - 可以独立优化音频加载和播放逻辑
 *
 * 企业项目经验：
 * - 不要把所有功能塞进一个 composable
 * - 单一职责原则同样适用于 composable
 * - 拆分让代码更易测试、更易维护
 */

import { ref } from 'vue'

/**
 * 音频缓存
 *
 * 为什么需要缓存？
 * - 避免每次播放都重新下载
 * - 提升播放响应速度
 * - 减少网络请求
 *
 * 为什么用 Map<string, HTMLAudioElement>？
 * - 键是音频 URL，值是预加载的 Audio 对象
 * - HTMLAudioElement 可以复用，不需要每次创建
 * - preload='auto' 让浏览器自动下载音频
 *
 * 企业项目经验：
 * - 音频、图片等资源要缓存
 * - HTMLAudioElement 是可复用的，不要每次 new Audio()
 * - 缓存策略要匹配资源特征
 */
const audioCache = new Map<string, HTMLAudioElement>()

export function usePronunciationAudio() {
  const playing = ref(false)
  const error = ref<string | null>(null)

  /**
   * 播放发音
   *
   * 流程：
   * 1. 检查缓存
   * 2. 如果没有缓存，创建新的 Audio 对象
   * 3. 播放音频
   * 4. 错误处理
   *
   * 为什么用 preload='auto'？
   * - 让浏览器自动下载音频
   * - 第一次播放可能有延迟，后续播放立即响应
   * - 这是音频预加载的标准做法
   *
   * 为什么要 await audio.play()？
   * - play() 返回 Promise，可能因浏览器策略被拒绝
   * - 必须捕获错误，避免未处理的 Promise rejection
   * - 用户交互触发的播放通常不会被拒绝
   *
   * 企业项目经验：
   * - 音频播放要处理浏览器自动播放策略
   * - play() 可能失败，必须捕获错误
   * - 用户友好的错误消息比技术细节更重要
   */
  async function playAudio(audioUrl: string): Promise<void> {
    if (!audioUrl) {
      error.value = 'No audio URL provided'
      return
    }

    playing.value = true
    error.value = null

    try {
      // 检查缓存
      let audio = audioCache.get(audioUrl)

      if (!audio) {
        // 创建新的 Audio 对象
        audio = new Audio(audioUrl)
        audio.preload = 'auto'

        // 存入缓存
        audioCache.set(audioUrl, audio)
      }

      // 重置播放位置（如果之前播放过）
      audio.currentTime = 0

      // 播放音频
      await audio.play()

      // 监听播放结束
      audio.onended = () => {
        playing.value = false
      }
    } catch (err) {
      playing.value = false

      // 处理不同类型的错误
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          error.value = 'Audio playback blocked by browser. Please interact with the page first.'
        } else if (err.name === 'NotSupportedError') {
          error.value = 'Audio format not supported'
        } else {
          error.value = 'Failed to play audio'
        }
      } else {
        error.value = 'Unknown error occurred'
      }

      console.error('Failed to play audio:', err)
    }
  }

  /**
   * 预加载音频
   *
   * 使用场景：
   * - 在显示 WordPopup 时预加载音频
   * - 用户点击播放按钮时立即响应
   *
   * 为什么需要预加载？
   * - 第一次播放可能有延迟（下载音频）
   * - 预加载让播放更流畅
   * - 这是音频体验优化的常见做法
   *
   * 企业项目经验：
   * - 预加载要在合适的时机（如弹窗打开时）
   * - 不要过度预加载，浪费带宽
   * - 预加载失败不应该阻塞主流程
   */
  function preloadAudio(audioUrl: string): void {
    if (!audioUrl || audioCache.has(audioUrl)) {
      return
    }

    try {
      const audio = new Audio(audioUrl)
      audio.preload = 'auto'
      audioCache.set(audioUrl, audio)
    } catch (err) {
      // 预加载失败，静默处理
      console.warn('Failed to preload audio:', err)
    }
  }

  /**
   * 停止播放
   *
   * 使用场景：
   * - 用户关闭弹窗
   * - 切换到其他单词
   */
  function stopAudio(): void {
    audioCache.forEach(audio => {
      if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
      }
    })
    playing.value = false
  }

  /**
   * 清除缓存
   *
   * 使用场景：
   * - 内存占用过高
   * - 用户手动清理
   */
  function clearCache(): void {
    audioCache.forEach(audio => {
      audio.pause()
      audio.src = ''
    })
    audioCache.clear()
    playing.value = false
  }

  return {
    playing,
    error,
    playAudio,
    preloadAudio,
    stopAudio,
    clearCache,
  }
}
