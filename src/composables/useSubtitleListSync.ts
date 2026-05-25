import { ref, computed, watch, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { SubtitleEntry } from '@/db/schema'

/**
 * useSubtitleListSync Composable
 *
 * 企业项目经验：字幕列表同步的核心挑战
 *
 * 1. 性能问题：
 *    - 视频播放时，timeupdate 事件每 250ms 触发一次
 *    - 如果每次都调用 scrollToItem，会导致卡顿
 *    - 解决方案：只在 currentSubtitle 变化时滚动（而不是每次 timeupdate）
 *
 * 2. 虚拟滚动的特殊性：
 *    - 普通 DOM 可以用 scrollIntoView
 *    - 虚拟滚动的 DOM 节点可能未渲染，scrollIntoView 不适用
 *    - 必须使用 vue-virtual-scroller 的 scrollToItem(index) API
 *
 * 3. 用户体验：
 *    - 用户手动滚动时，不应该自动滚动（会打断阅读）
 *    - 使用 3 秒超时，3 秒后恢复自动滚动
 *
 * 为什么需要这个 composable？
 * - 字幕列表同步逻辑复杂，单独封装便于测试和复用
 * - 避免在组件中写大量的 watch 和状态管理代码
 * - 符合 Vue 3 Composition API 的最佳实践
 */

export interface SubtitleListSyncOptions {
  // 当前播放的字幕（来自 useSubtitle）
  currentSubtitle: Ref<SubtitleEntry | null>

  // 所有字幕列表
  subtitles: Ref<SubtitleEntry[]>

  // DynamicScroller 的 ref（用于调用 scrollToItem）
  scrollerRef: Ref<any>
}

export function useSubtitleListSync(options: SubtitleListSyncOptions) {
  const { currentSubtitle, subtitles, scrollerRef } = options

  // 是否启用自动滚动（用户手动滚动时会暂时禁用）
  const autoScrollEnabled = ref(true)

  // 自动滚动禁用的超时 ID
  let autoScrollTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * 当前字幕在列表中的索引
   *
   * 为什么使用 computed？
   * - 当 currentSubtitle 或 subtitles 变化时，自动重新计算
   * - 避免手动维护索引状态
   * - computed 有缓存，只在依赖变化时重新计算
   *
   * 企业项目经验：
   * - 索引查找是 O(n) 操作，但字幕数量通常不超过 1000 条
   * - computed 的缓存机制确保不会频繁计算
   * - 如果字幕数量超过 10000 条，可以考虑使用 Map 优化查找
   */
  const currentSubtitleIndex = computed(() => {
    if (!currentSubtitle.value) return -1
    return subtitles.value.findIndex(s => s.id === currentSubtitle.value!.id)
  })

  /**
   * 滚动到指定索引的字幕
   *
   * 为什么使用 debounce？
   * - 虽然我们只在 currentSubtitle 变化时滚动，但仍然可能快速切换
   * - 例如用户快速拖动进度条，可能在 1 秒内触发多次字幕切换
   * - debounce 100ms 确保只执行最后一次滚动
   *
   * 企业项目经验：
   * - debounce 是性能优化的常用手段
   * - 100ms 是经验值：用户感知不到延迟，但能显著减少滚动次数
   * - 如果 debounce 时间太长（如 500ms），用户会感觉滚动"慢半拍"
   */
  const scrollToIndex = useDebounceFn((index: number) => {
    if (!autoScrollEnabled.value) return
    if (index === -1) return
    if (!scrollerRef.value) return

    // 调用 DynamicScroller 的 scrollToItem 方法
    // 参数：索引
    // 注意：vue-virtual-scroller 会自动处理滚动动画
    scrollerRef.value.scrollToItem(index)
  }, 100)

  /**
   * 用户手动滚动时调用
   *
   * 交互逻辑：
   * 1. 用户手动滚动 → 禁用自动滚动 3 秒
   * 2. 3 秒后 → 恢复自动滚动
   * 3. 如果用户在 3 秒内再次手动滚动 → 重置计时器
   *
   * 为什么是 3 秒？
   * - 太短（如 1 秒）：用户还在阅读，自动滚动就恢复了，体验差
   * - 太长（如 10 秒）：用户可能忘记了自己手动滚动过，期望自动滚动
   * - 3 秒是经验值，平衡了两者
   *
   * 企业项目经验：
   * - 这种"临时禁用"的模式在很多场景都适用
   * - 例如：视频播放器的控制条（鼠标移动时显示，3 秒后隐藏）
   * - 关键是找到合适的超时时间，需要用户测试验证
   */
  function onUserScroll() {
    // 禁用自动滚动
    autoScrollEnabled.value = false

    // 清除之前的超时
    if (autoScrollTimeout) {
      clearTimeout(autoScrollTimeout)
    }

    // 3 秒后恢复自动滚动
    autoScrollTimeout = setTimeout(() => {
      autoScrollEnabled.value = true
      autoScrollTimeout = null
    }, 3000)
  }

  /**
   * 监听 currentSubtitle 变化，自动滚动到对应位置
   *
   * 为什么用 watch 而不是 watchEffect？
   * - watch 可以明确指定依赖（currentSubtitle）
   * - watchEffect 会自动收集依赖，但这里我们只关心 currentSubtitle
   * - watch 的语义更清晰："当 currentSubtitle 变化时，执行滚动"
   *
   * 企业项目经验：
   * - watch 和 watchEffect 的选择取决于场景
   * - 依赖明确时用 watch，依赖复杂时用 watchEffect
   * - watch 的可读性更好，便于维护
   */
  watch(currentSubtitle, () => {
    const index = currentSubtitleIndex.value
    if (index !== -1) {
      scrollToIndex(index)
    }
  })

  return {
    currentSubtitleIndex,
    autoScrollEnabled,
    onUserScroll,
  }
}
