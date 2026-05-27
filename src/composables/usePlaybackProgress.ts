import { ref, watch, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { db, type PlaybackProgress } from '@/db/schema'

/**
 * usePlaybackProgress Composable
 *
 * 生命周期思维：监听器的创建与清理
 *
 * 旧设计的问题：
 * - startTracking() 返回清理函数
 * - 调用方需要保存清理函数
 * - 调用方需要在 onUnmounted 中调用清理函数
 * - 容易忘记，导致内存泄漏
 *
 * 新设计：
 * - 使用 watch 自动管理生命周期
 * - watch 的清理函数会在组件卸载时自动执行
 * - 调用方无需手动管理
 *
 * 企业项目经验：
 * - 好的 API 设计应该"难以误用"
 * - 自动清理优于手动清理
 * - 遵循 Vue 3 Composition API 的最佳实践
 */
export function usePlaybackProgress(videoId: string, videoElement: Ref<HTMLVideoElement | null>) {
  const progress = ref(0)
  const percentage = ref(0)
  const completed = ref(false)
  const hasProgress = ref(false)

  async function loadProgress(): Promise<number> {
    const record = await db.progress.get(videoId)
    if (record) {
      progress.value = record.currentTime
      percentage.value = record.percentage
      completed.value = record.completed
      hasProgress.value = true
      return record.currentTime
    }
    return 0
  }

  /**
   * 保存进度（防抖）
   *
   * 为什么使用 5 秒防抖？
   * - timeupdate 事件每 250ms 触发一次
   * - 每次都写数据库会影响性能
   * - 5 秒是经验值：平衡数据新鲜度和性能
   *
   * 企业项目经验：
   * - IndexedDB 写入是异步的，但仍有开销
   * - 防抖是必需的性能优化
   * - 关键时刻（暂停、结束、页面关闭）需要立即保存
   */
  const saveProgress = useDebounceFn(async (currentTime: number, duration: number) => {
    const pct = duration > 0 ? (currentTime / duration) * 100 : 0
    const isCompleted = pct > 95

    const progressData: PlaybackProgress = {
      videoId,
      currentTime,
      duration,
      percentage: pct,
      lastPlayedAt: Date.now(),
      completed: isCompleted
    }

    await db.progress.put(progressData)

    progress.value = currentTime
    percentage.value = pct
    completed.value = isCompleted
  }, 5000)

  /**
   * 立即保存进度（不防抖）
   *
   * 使用场景：
   * - 视频暂停
   * - 视频结束
   * - 页面关闭（beforeunload）
   *
   * 为什么需要单独的函数？
   * - 防抖函数有延迟，可能丢失最后的进度
   * - 这些场景需要确保数据持久化
   */
  async function saveProgressImmediately(currentTime: number, duration: number) {
    const pct = duration > 0 ? (currentTime / duration) * 100 : 0
    const isCompleted = pct > 95

    const progressData: PlaybackProgress = {
      videoId,
      currentTime,
      duration,
      percentage: pct,
      lastPlayedAt: Date.now(),
      completed: isCompleted
    }

    await db.progress.put(progressData)

    progress.value = currentTime
    percentage.value = pct
    completed.value = isCompleted
  }

  /**
   * 自动追踪播放进度
   *
   * 生命周期思维：使用 watch 自动管理
   * - watch 会在 videoElement 变化时重新执行
   * - watch 的清理函数会在组件卸载时自动执行
   * - 无需调用方手动管理
   *
   * 监听的事件：
   * - timeupdate: 播放进度更新 → 防抖保存
   * - pause: 暂停 → 立即保存
   * - ended: 结束 → 立即保存（标记为完成）
   * - beforeunload: 页面关闭 → 立即保存
   *
   * 企业项目经验：
   * - beforeunload 是保存数据的最后机会
   * - 但不能依赖它（用户可能强制关闭）
   * - 定期保存 + beforeunload 是双重保障
   */
  watch(videoElement, (video) => {
    if (!video) return

    const handleTimeUpdate = () => {
      saveProgress(video.currentTime, video.duration)
    }

    const handlePause = () => {
      saveProgressImmediately(video.currentTime, video.duration)
    }

    const handleEnded = () => {
      // 视频结束时，保存为 100% 完成
      saveProgressImmediately(video.duration, video.duration)
    }

    const handleBeforeUnload = () => {
      // 页面关闭时尝试保存当前进度
      //
      // 重要限制：这是"尽力而为"，不是"保证成功"
      // - IndexedDB 写入是异步的，浏览器不会等待它完成
      // - beforeunload 事件触发后，页面可能立即关闭
      // - 无法使用同步 API（IndexedDB 没有同步版本）
      //
      // 为什么仍然保留这个监听器？
      // - 在某些浏览器/场景下，异步操作可能有时间完成
      // - 总比完全不尝试要好
      // - 真正的保障是定期保存（5秒防抖）+ 暂停/结束时立即保存
      //
      // 企业项目经验：
      // - beforeunload 不可靠是 Web 平台的固有限制
      // - 关键数据必须在用户操作时就保存，不能依赖页面关闭事件
      // - 这是"防御性编程"：多一层保护，但不作为唯一保障
      saveProgressImmediately(video.currentTime, video.duration)
    }

    // 注册事件监听器
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // 生命周期思维：清理函数
    // 这个函数会在以下情况自动执行：
    // 1. videoElement 变化（切换视频）
    // 2. 组件卸载（onUnmounted）
    // 3. watch 被停止（watchEffect 的 stop 函数）
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, { immediate: true })

  return {
    progress,
    percentage,
    completed,
    hasProgress,
    loadProgress,
    saveProgress,
    saveProgressImmediately,
    // 注意：不再导出 startTracking 函数
    // 追踪会自动开始，无需手动调用
  }
}
