/**
 * Dictionary Lookup Composable (词典查询组合式函数)
 *
 * 职责：
 * - 调用 Free Dictionary API
 * - 管理查询状态（loading, error, result）
 * - 实现缓存机制
 * - 处理超时和取消
 *
 * 为什么需要 composable？
 * - 封装复杂的异步逻辑
 * - 提供响应式状态
 * - 可在多个组件中复用
 *
 * 企业项目经验：
 * - 外部 API 调用应该封装在 composable 中
 * - 不要在组件中直接写 fetch 代码
 * - composable 让逻辑可测试、可复用
 */

import { ref, type Ref } from 'vue'
import { parseDictionaryResponse, parseAPIError, type DictionaryResult } from '@/utils/dictionary-parser'

/**
 * API 配置
 */
const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en'
const API_TIMEOUT = 5000 // 5 秒超时

/**
 * 缓存：避免重复查询同一个单词
 *
 * 为什么用 Map 而不是对象？
 * - Map 的键可以是任意类型，对象的键只能是字符串
 * - Map 有 size 属性，对象需要 Object.keys().length
 * - Map 的性能更好（特别是频繁增删时）
 *
 * 为什么不用 localStorage？
 * - 词典数据可能很大（音频 URL、多个释义）
 * - localStorage 有 5MB 限制
 * - 内存缓存更快，且会话结束自动清理
 *
 * 企业项目经验：
 * - 缓存策略要匹配数据特征
 * - 临时数据用内存缓存，持久数据用 IndexedDB
 * - 不要滥用 localStorage，它不是数据库
 */
const cache = new Map<string, DictionaryResult>()

/**
 * 当前请求的 AbortController
 *
 * 用于取消上一个未完成的请求
 *
 * 为什么需要取消请求？
 * - 用户快速点击多个单词时，只关心最后一个
 * - 不取消会导致多个请求并发，浪费带宽
 * - 可能出现"后发先至"，显示错误的结果
 *
 * 企业项目经验：
 * - 搜索框、自动完成等场景都需要请求取消
 * - AbortController 是标准 API，兼容性好
 * - 取消请求能显著提升用户体验
 */
let currentController: AbortController | null = null

export function useDictionaryLookup() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<DictionaryResult | null>(null)

  /**
   * 查询单词
   *
   * 流程：
   * 1. 检查缓存
   * 2. 取消上一个请求
   * 3. 调用 API
   * 4. 处理超时
   * 5. 解析响应
   * 6. 存入缓存
   *
   * 错误处理：
   * - 网络错误：显示"Network error"
   * - 超时：显示"Request timeout"
   * - 404：显示"Word not found"
   * - 其他：显示 API 返回的错误消息
   *
   * 企业项目经验：
   * - 异步函数必须有完善的错误处理
   * - 用户友好的错误消息比技术细节更重要
   * - 超时时间要根据实际网络情况调整
   */
  async function fetchWord(word: string): Promise<void> {
    // 重置状态
    loading.value = true
    error.value = null
    result.value = null

    // 检查缓存
    if (cache.has(word)) {
      result.value = cache.get(word)!
      loading.value = false
      return
    }

    // 取消上一个请求
    if (currentController) {
      currentController.abort()
    }

    // 创建新的 AbortController
    currentController = new AbortController()
    const signal = currentController.signal

    // 创建超时定时器
    // 企业项目经验：超时时不仅要 reject，还要 abort 底层请求
    const timeoutId = setTimeout(() => {
      if (currentController) {
        currentController.abort()
      }
    }, API_TIMEOUT)

    try {
      // 发起请求
      const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(word)}`, { signal })

      // 清除超时定时器（请求成功完成）
      clearTimeout(timeoutId)

      // 检查 HTTP 状态
      if (!response.ok) {
        if (response.status === 404) {
          // 单词不存在
          error.value = 'Word not found in dictionary'
        } else {
          // 其他错误（5xx 等）
          const errorData = await response.json().catch(() => null)
          error.value = parseAPIError(errorData)
        }
        return
      }

      // 解析响应
      const data = await response.json()
      const parsed = parseDictionaryResponse(data[0]) // API 返回数组，取第一个

      if (!parsed) {
        error.value = 'Failed to parse API response'
        return
      }

      // 存入缓存
      cache.set(word, parsed)
      result.value = parsed
    } catch (err) {
      // 清除超时定时器（请求失败）
      clearTimeout(timeoutId)

      // 请求被取消
      if (err instanceof Error && err.name === 'AbortError') {
        // 静默处理，不显示错误
        return
      }

      // 网络错误
      if (err instanceof TypeError) {
        error.value = 'Network error. Please check your connection.'
        return
      }

      // 其他错误
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
      currentController = null
    }
  }

  /**
   * 清除缓存
   *
   * 使用场景：
   * - 用户手动刷新
   * - 切换语言
   * - 内存占用过高
   */
  function clearCache(): void {
    cache.clear()
  }

  return {
    loading,
    error,
    result,
    fetchWord,
    clearCache,
  }
}
