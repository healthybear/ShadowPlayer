import { ref, watch, type Ref } from 'vue'

/**
 * useVideoPlayer Composable
 *
 * 状态思维：谁是 Source of Truth？
 *
 * 错误思维：
 * - 调用 video.play() 后立即设置 isPlaying = true
 * - 假设操作一定成功
 * - Vue 状态是 source of truth
 *
 * 正确思维：
 * - 视频元素（HTMLVideoElement）是 source of truth
 * - Vue 状态是视频状态的"镜像"
 * - 通过监听 DOM 事件同步状态
 *
 * 为什么这样设计？
 * 1. video.play() 可能失败（自动播放策略、网络错误等）
 * 2. 用户可能通过浏览器控件操作（右键菜单、媒体键）
 * 3. 浏览器可能自动暂停（标签页切换、资源不足）
 *
 * 企业项目经验：
 * - 与外部系统交互时，永远不要假设操作成功
 * - 监听事件是唯一可靠的状态同步方式
 * - 这个模式适用于所有 DOM API（Canvas、WebSocket、WebRTC 等）
 */

export interface VideoPlayerControls {
  isPlaying: Ref<boolean>
  currentTime: Ref<number>
  duration: Ref<number>
  volume: Ref<number>
  isMuted: Ref<boolean>
  playbackRate: Ref<number>
  isFullscreen: Ref<boolean>
  play: () => Promise<void>
  pause: () => void
  togglePlay: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  toggleMute: () => void
  setPlaybackRate: (rate: number) => void
  toggleFullscreen: () => void
}

export function useVideoPlayer(videoElement: Ref<HTMLVideoElement | null>): VideoPlayerControls {
  // 响应式状态（镜像视频元素的真实状态）
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  const isMuted = ref(false)
  const playbackRate = ref(1)
  const isFullscreen = ref(false)

  /**
   * 播放视频
   *
   * 为什么返回 Promise？
   * - video.play() 返回 Promise<void>
   * - 可能因为自动播放策略被拒绝
   * - 调用方需要处理错误（如显示"点击播放"提示）
   *
   * 为什么不立即设置 isPlaying = true？
   * - play() 可能失败
   * - 等待 'play' 事件才更新状态
   * - 确保状态与真实播放状态一致
   */
  async function play(): Promise<void> {
    const video = videoElement.value
    if (!video) return

    try {
      await video.play()
      // 注意：不在这里设置 isPlaying = true
      // 等待 'play' 事件触发，由事件监听器更新状态
    } catch (error) {
      // 播放失败（通常是自动播放策略）
      console.warn('Video play failed:', error)
      // 状态保持 isPlaying = false（正确反映真实状态）
      throw error // 向上传播错误，让调用方处理
    }
  }

  /**
   * 暂停视频
   *
   * 为什么不返回 Promise？
   * - video.pause() 是同步的，不会失败
   * - 但仍然等待 'pause' 事件更新状态
   */
  function pause(): void {
    const video = videoElement.value
    if (!video) return

    video.pause()
    // 注意：不在这里设置 isPlaying = false
    // 等待 'pause' 事件触发
  }

  function togglePlay(): void {
    if (isPlaying.value) {
      pause()
    } else {
      play().catch(() => {
        // 播放失败，静默处理
        // 实际项目中可能需要显示提示
      })
    }
  }

  function seek(time: number): void {
    const video = videoElement.value
    if (!video) return

    video.currentTime = time
    // currentTime 会通过 'timeupdate' 事件更新
  }

  function setVolume(vol: number): void {
    const video = videoElement.value
    if (!video) return

    const clampedVolume = Math.max(0, Math.min(1, vol))
    video.volume = clampedVolume
    // volume 会通过 'volumechange' 事件更新

    // 特殊逻辑：设置音量时自动取消静音
    if (clampedVolume > 0 && video.muted) {
      video.muted = false
      // isMuted 会通过 'volumechange' 事件更新
    }
  }

  function toggleMute(): void {
    const video = videoElement.value
    if (!video) return

    video.muted = !video.muted
    // isMuted 会通过 'volumechange' 事件更新
  }

  function setPlaybackRate(rate: number): void {
    const video = videoElement.value
    if (!video) return

    video.playbackRate = rate
    // playbackRate 会通过 'ratechange' 事件更新
  }

  function toggleFullscreen(): void {
    const video = videoElement.value
    if (!video) return

    if (!document.fullscreenElement) {
      video.requestFullscreen?.()
      // isFullscreen 会通过 'fullscreenchange' 事件更新
    } else {
      document.exitFullscreen?.()
    }
  }

  /**
   * 生命周期思维：事件监听器的创建与清理
   *
   * 监听哪些事件？
   * - play: 播放开始（包括从暂停恢复）
   * - pause: 播放暂停
   * - ended: 播放结束
   * - timeupdate: 播放进度更新（约每 250ms）
   * - durationchange: 时长变化（视频加载完成）
   * - volumechange: 音量或静音状态变化
   * - ratechange: 播放速度变化
   *
   * 为什么不监听 'playing'？
   * - 'play' 事件在播放开始时触发（即使缓冲中）
   * - 'playing' 事件在实际播放时触发（缓冲完成）
   * - 对于用户体验，'play' 更合适（立即反馈）
   *
   * 企业项目经验：
   * - 完整的事件监听是健壮性的关键
   * - 不要遗漏任何可能改变状态的事件
   * - 参考 MDN 文档确保覆盖所有场景
   */
  watch(videoElement, (video, oldVideo) => {
    // 清理旧的监听器
    if (oldVideo) {
      // 这里不需要清理，因为 oldVideo 会被销毁
    }

    if (!video) return

    // 播放状态事件
    const handlePlay = () => {
      isPlaying.value = true
    }

    const handlePause = () => {
      isPlaying.value = false
    }

    const handleEnded = () => {
      isPlaying.value = false
      // 视频结束时，currentTime 会自动设置为 duration
    }

    // 时间相关事件
    const handleTimeUpdate = () => {
      currentTime.value = video.currentTime
    }

    const handleDurationChange = () => {
      duration.value = video.duration
    }

    // 音量相关事件
    const handleVolumeChange = () => {
      volume.value = video.volume
      isMuted.value = video.muted
    }

    // 播放速度事件
    const handleRateChange = () => {
      playbackRate.value = video.playbackRate
    }

    // 全屏事件（监听 document，不是 video）
    const handleFullscreenChange = () => {
      isFullscreen.value = document.fullscreenElement === video
    }

    // 注册所有事件监听器
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('volumechange', handleVolumeChange)
    video.addEventListener('ratechange', handleRateChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // 初始化状态（同步当前值）
    isPlaying.value = !video.paused
    currentTime.value = video.currentTime
    duration.value = video.duration || 0
    volume.value = video.volume
    isMuted.value = video.muted
    playbackRate.value = video.playbackRate

    // 生命周期思维：清理函数
    // watch 的返回值会在以下情况执行：
    // 1. videoElement 变化（切换到新视频）
    // 2. 组件卸载（onUnmounted）
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.removeEventListener('ratechange', handleRateChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, { immediate: true })

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isFullscreen,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen
  }
}
