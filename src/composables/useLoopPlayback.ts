import { ref, watch, type Ref } from 'vue'

/**
 * useLoopPlayback Composable
 *
 * 企业项目经验：循环播放的核心挑战
 *
 * 1. 时间检测的精度问题：
 *    - 视频的 timeupdate 事件不是精确触发的（通常 250ms 一次）
 *    - 不能用 currentTime === endTime 判断，必须用 >=
 *    - 可能会"越过"结束时间（如 endTime=10.0，但 timeupdate 触发时 currentTime=10.3）
 *
 * 2. 为什么用 timeupdate 而不是 setInterval？
 *    - setInterval 和视频播放是两个独立的时钟，会不同步
 *    - 例如：视频卡顿时，setInterval 仍在运行，导致检测不准确
 *    - timeupdate 是视频播放器的原生事件，与播放状态完全同步
 *    - 性能更好：不需要额外的定时器
 *
 * 3. 循环次数的设计：
 *    - count = 0 表示无限循环（最常用）
 *    - count > 0 表示循环指定次数
 *    - currentLoop 从 0 开始计数，每次跳回起点时 +1
 *
 * 4. 边界情况处理：
 *    - 用户在循环区间外 seek → 自动禁用循环
 *    - 启用循环时当前时间不在区间内 → 先跳转到起点
 *    - 循环结束时间 < 当前时间 → 立即跳回起点
 *
 * 为什么需要这个 composable？
 * - 循环播放逻辑复杂，涉及状态管理、事件监听、边界处理
 * - 单独封装便于测试和复用
 * - 避免在组件中写大量的 watch 和事件处理代码
 */

export interface LoopPlaybackControls {
  // 循环状态
  loopEnabled: Ref<boolean>
  loopStart: Ref<number>
  loopEnd: Ref<number>
  loopCount: Ref<number>      // 0 = 无限循环
  currentLoop: Ref<number>    // 当前第几次循环

  // 控制方法
  enableLoop: (start: number, end: number, count?: number) => void
  disableLoop: () => void
  toggleLoop: () => void
}

export function useLoopPlayback(videoElement: Ref<HTMLVideoElement | null>): LoopPlaybackControls {
  // 循环状态
  const loopEnabled = ref(false)
  const loopStart = ref(0)
  const loopEnd = ref(0)
  const loopCount = ref(0)      // 0 = 无限循环
  const currentLoop = ref(0)

  /**
   * 启用循环播放
   *
   * @param start - 循环起点时间（秒）
   * @param end - 循环终点时间（秒）
   * @param count - 循环次数（0 = 无限循环，默认 0）
   *
   * 企业项目经验：
   * - 参数验证很重要：start < end，否则循环逻辑会出错
   * - 启用循环时，如果当前时间不在区间内，应该跳转到起点
   * - 这样用户体验更好：点击字幕 → 立即开始循环播放
   */
  function enableLoop(start: number, end: number, count: number = 0) {
    // 参数验证
    if (start >= end) {
      console.warn('[useLoopPlayback] Invalid loop range: start >= end')
      return
    }

    loopStart.value = start
    loopEnd.value = end
    loopCount.value = count
    currentLoop.value = 0
    loopEnabled.value = true

    // 如果当前时间不在循环区间内，跳转到起点
    const video = videoElement.value
    if (video && (video.currentTime < start || video.currentTime > end)) {
      video.currentTime = start
    }
  }

  /**
   * 禁用循环播放
   *
   * 企业项目经验：
   * - 禁用时应该重置所有状态，避免残留数据
   * - 不需要暂停视频，只是停止循环逻辑
   */
  function disableLoop() {
    loopEnabled.value = false
    currentLoop.value = 0
  }

  /**
   * 切换循环播放状态
   *
   * 用于键盘快捷键（L 键）和 UI 按钮
   *
   * 企业项目经验：
   * - toggle 方法很常见，但要注意：启用时需要有默认的循环区间
   * - 如果没有字幕，默认循环当前 5 秒（这个逻辑在调用方实现）
   */
  function toggleLoop() {
    if (loopEnabled.value) {
      disableLoop()
    } else {
      // 如果没有设置循环区间，调用方需要先设置
      // 这里只是切换状态，不负责设置默认区间
      console.warn('[useLoopPlayback] Cannot enable loop without setting loop range first')
    }
  }

  /**
   * 监听视频元素，设置 timeupdate 事件监听器
   *
   * 为什么用 watch(videoElement) 而不是直接在 onMounted 中监听？
   * - videoElement 可能在组件挂载后才赋值（异步加载）
   * - watch 确保在 videoElement 有值时才添加监听器
   * - 返回清理函数，在 videoElement 变化或组件卸载时自动清理
   *
   * 企业项目经验：
   * - 事件监听器的清理很重要，否则会内存泄漏
   * - watch 的返回值是清理函数，Vue 会自动调用
   * - 这是 Vue 3 Composition API 的最佳实践
   */
  watch(videoElement, (video, oldVideo) => {
    // 清理旧的监听器
    if (oldVideo) {
      oldVideo.removeEventListener('timeupdate', handleTimeUpdate)
      oldVideo.removeEventListener('seeked', handleSeeked)
    }

    // 添加新的监听器
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate)
      video.addEventListener('seeked', handleSeeked)
    }

    // 返回清理函数（组件卸载时调用）
    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handleTimeUpdate)
        video.removeEventListener('seeked', handleSeeked)
      }
    }
  })

  /**
   * 处理 timeupdate 事件：检测是否到达循环终点
   *
   * 循环检测算法：
   * 1. 检查循环是否启用
   * 2. 检查当前时间是否 >= 循环终点
   * 3. 如果是，跳回起点并增加循环计数
   * 4. 如果达到循环次数限制，禁用循环
   *
   * 为什么用 >= 而不是 ===？
   * - timeupdate 事件不是精确触发的
   * - 可能会"越过"结束时间（如 endTime=10.0，但触发时 currentTime=10.3）
   * - 使用 >= 确保不会漏掉循环点
   *
   * 企业项目经验：
   * - 时间相关的判断要考虑精度问题
   * - 视频播放器的时间精度通常是 0.1 秒左右
   * - 不要期望精确到毫秒级别
   */
  function handleTimeUpdate() {
    if (!loopEnabled.value) return

    const video = videoElement.value
    if (!video) return

    // 检测是否到达循环终点
    if (video.currentTime >= loopEnd.value) {
      // 跳回起点
      video.currentTime = loopStart.value

      // 增加循环计数
      currentLoop.value++

      // 检查是否达到循环次数限制
      if (loopCount.value > 0 && currentLoop.value >= loopCount.value) {
        // 达到限制，禁用循环
        disableLoop()
      }
    }
  }

  /**
   * 处理 seeked 事件：用户手动 seek 时检查是否在循环区间外
   *
   * 为什么需要监听 seeked？
   * - 用户可能拖动进度条到循环区间外
   * - 如果不禁用循环，用户会困惑："我明明拖到了其他地方，为什么又跳回来了？"
   * - 自动禁用循环，符合用户预期
   *
   * 边界情况：
   * - 用户在循环区间内 seek → 不禁用循环
   * - 用户在循环区间外 seek → 禁用循环
   *
   * 企业项目经验：
   * - 用户体验的关键：不要让用户感到"失控"
   * - 自动禁用循环是合理的默认行为
   * - 如果用户想继续循环，可以再次点击字幕或按 L 键
   */
  function handleSeeked() {
    if (!loopEnabled.value) return

    const video = videoElement.value
    if (!video) return

    // 检查当前时间是否在循环区间外
    if (video.currentTime < loopStart.value || video.currentTime > loopEnd.value) {
      // 在区间外，禁用循环
      disableLoop()
    }
  }

  return {
    loopEnabled,
    loopStart,
    loopEnd,
    loopCount,
    currentLoop,
    enableLoop,
    disableLoop,
    toggleLoop,
  }
}
