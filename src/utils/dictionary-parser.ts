/**
 * Dictionary Parser (词典解析器)
 *
 * 职责：解析 Free Dictionary API 的响应，转换为内部类型
 *
 * 为什么需要单独的 parser？
 * - API 响应格式复杂，嵌套深
 * - 字段可能缺失，需要类型守卫
 * - 内部类型和 API 类型解耦，便于后续切换 API
 *
 * 企业项目经验：
 * - 外部 API 的响应不要直接用于业务逻辑
 * - 创建适配层，将外部格式转换为内部格式
 * - 这样切换 API 时只需修改 parser，不影响业务代码
 */

/**
 * 词典释义
 */
export interface DictionaryDefinition {
  partOfSpeech: string    // 词性（noun, verb, adjective...）
  definition: string      // 释义
  example?: string        // 例句
}

/**
 * 词典查询结果
 */
export interface DictionaryResult {
  word: string                        // 单词
  pronunciation?: string              // 音标
  audioUrl?: string                   // 发音音频 URL
  definitions: DictionaryDefinition[] // 释义列表
}

/**
 * Free Dictionary API 响应类型
 *
 * 这是 API 返回的原始格式，不是我们的业务类型
 * 使用 any 是因为 API 响应格式可能变化，我们用类型守卫来验证
 */
interface FreeDictionaryAPIResponse {
  word: string
  phonetic?: string
  phonetics?: Array<{
    text?: string
    audio?: string
  }>
  meanings?: Array<{
    partOfSpeech: string
    definitions: Array<{
      definition: string
      example?: string
    }>
  }>
}

/**
 * 类型守卫：检查是否是有效的 API 响应
 *
 * 为什么需要类型守卫？
 * - API 响应可能格式错误
 * - 网络错误可能返回 HTML 而不是 JSON
 * - TypeScript 的类型只在编译时有效，运行时需要验证
 *
 * 企业项目经验：
 * - 永远不要信任外部数据
 * - 使用类型守卫在运行时验证数据结构
 * - 这是防御性编程的基础
 */
function isValidAPIResponse(data: any): data is FreeDictionaryAPIResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.word === 'string' &&
    Array.isArray(data.meanings)
  )
}

/**
 * 解析词典 API 响应
 *
 * 处理策略：
 * 1. 验证响应格式
 * 2. 提取音标（优先使用 phonetic，fallback 到 phonetics[0]）
 * 3. 提取音频 URL（查找第一个非空 audio）
 * 4. 提取释义列表（按词性分组）
 * 5. 处理缺失字段（使用 optional chaining 和 nullish coalescing）
 *
 * 为什么音标有两个来源？
 * - API 有时在顶层 phonetic 字段
 * - 有时在 phonetics 数组的第一项
 * - 需要 fallback 逻辑确保能获取到音标
 *
 * 为什么音频 URL 要遍历查找？
 * - phonetics 数组可能有多个元素
 * - 有些元素的 audio 字段是空字符串
 * - 需要找到第一个非空的 audio
 *
 * 企业项目经验：
 * - 外部 API 的数据质量不可控
 * - 需要多层 fallback 确保功能可用
 * - 缺失字段用 undefined，不要用空字符串
 */
export function parseDictionaryResponse(data: any): DictionaryResult | null {
  // 验证响应格式
  if (!isValidAPIResponse(data)) {
    console.warn('Invalid API response format:', data)
    return null
  }

  // 提取音标
  // 优先使用顶层 phonetic，fallback 到 phonetics[0].text
  const pronunciation = data.phonetic || data.phonetics?.[0]?.text

  // 提取音频 URL
  // 查找第一个非空的 audio
  const audioUrl = data.phonetics?.find(p => p.audio)?.audio

  // 提取释义列表
  const definitions: DictionaryDefinition[] = []

  for (const meaning of data.meanings || []) {
    const partOfSpeech = meaning.partOfSpeech || 'unknown'

    for (const def of meaning.definitions || []) {
      if (def.definition) {
        definitions.push({
          partOfSpeech,
          definition: def.definition,
          example: def.example,
        })
      }
    }
  }

  // 如果没有任何释义，返回 null
  if (definitions.length === 0) {
    console.warn('No definitions found in API response:', data)
    return null
  }

  return {
    word: data.word,
    pronunciation,
    audioUrl,
    definitions,
  }
}

/**
 * 解析 API 错误响应
 *
 * Free Dictionary API 的错误格式：
 * {
 *   "title": "No Definitions Found",
 *   "message": "Sorry pal, we couldn't find definitions for the word you were looking for.",
 *   "resolution": "You can try the search again at later time or head to the web instead."
 * }
 *
 * 返回用户友好的错误消息
 */
export function parseAPIError(data: any): string {
  if (typeof data === 'object' && data !== null) {
    if (data.title === 'No Definitions Found') {
      return 'Word not found in dictionary'
    }
    if (data.message) {
      return data.message
    }
  }
  return 'Failed to fetch word definition'
}
