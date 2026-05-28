import type { SubtitleEntry } from '@/db/schema'

/**
 * 解析时间戳
 *
 * 支持多种格式：
 * - SRT/VTT: HH:MM:SS,mmm 或 HH:MM:SS.mmm
 * - ASS: H:MM:SS.cc (centiseconds)
 */
export function parseTimestamp(timestamp: string): number {
  const parts = timestamp.replace(',', '.').split(':')

  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number)
    if (h !== undefined && m !== undefined && s !== undefined) {
      return h * 3600 + m * 60 + s
    }
  } else if (parts.length === 2) {
    const [m, s] = parts.map(Number)
    if (m !== undefined && s !== undefined) {
      return m * 60 + s
    }
  }

  return 0
}

/**
 * 解析 ASS 时间戳
 *
 * ASS 格式：H:MM:SS.cc (centiseconds)
 * 例如：0:00:05.50 表示 5.5 秒
 */
function parseASSTimestamp(timestamp: string): number {
  const parts = timestamp.trim().split(':')

  if (parts.length === 3) {
    const h = parseInt(parts[0] || '0')
    const m = parseInt(parts[1] || '0')
    const sParts = (parts[2] || '0').split('.')
    const s = parseInt(sParts[0] || '0')
    const cs = parseInt(sParts[1] || '0') // centiseconds

    return h * 3600 + m * 60 + s + cs / 100
  }

  return 0
}

/**
 * 移除 ASS 样式标签
 *
 * ASS 字幕包含样式标签，如：
 * - {\i1}斜体{\i0}
 * - {\b1}粗体{\b0}
 * - {\c&HFFFFFF&}颜色
 * - {\pos(x,y)}位置
 *
 * 企业项目经验：
 * - 简单的文本播放器不需要渲染这些样式
 * - 移除标签，只保留纯文本
 * - 如果需要完整样式支持，应该使用专门的 ASS 渲染库
 */
function stripASSStyles(text: string): string {
  // 移除所有 {} 包裹的样式标签
  return text.replace(/\{[^}]*\}/g, '').trim()
}

export function parseSRT(content: string): SubtitleEntry[] {
  const blocks = content.trim().split(/\n\s*\n/)
  const entries: SubtitleEntry[] = []

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 3) continue

    const indexStr = lines[0]
    if (!indexStr) continue
    const index = parseInt(indexStr)
    if (isNaN(index)) continue

    const timeLine = lines[1]
    if (!timeLine) continue
    const match = timeLine.match(/(\S+)\s*-->\s*(\S+)/)
    if (!match) continue

    const start = match[1]
    const end = match[2]
    if (!start || !end) continue
    const text = lines.slice(2).join('\n')

    entries.push({
      index,
      startTime: parseTimestamp(start),
      endTime: parseTimestamp(end),
      text
    })
  }

  return entries
}

export function parseVTT(content: string): SubtitleEntry[] {
  if (!content.startsWith('WEBVTT')) {
    throw new Error('Invalid VTT file. Missing WEBVTT header.')
  }

  const lines = content.split('\n')
  const entries: SubtitleEntry[] = []
  let index = 0
  let i = 1

  while (i < lines.length) {
    const currentLine = lines[i]
    if (!currentLine) {
      i++
      continue
    }
    const line = currentLine.trim()

    if (line.includes('-->')) {
      const match = line.match(/(\S+)\s*-->\s*(\S+)/)
      if (match) {
        const start = match[1]
        const end = match[2]
        if (!start || !end) {
          i++
          continue
        }
        const textLines: string[] = []

        i++
        while (i < lines.length) {
          const textLine = lines[i]
          if (!textLine || textLine.trim() === '') break
          textLines.push(textLine)
          i++
        }

        entries.push({
          index: index++,
          startTime: parseTimestamp(start),
          endTime: parseTimestamp(end),
          text: textLines.join('\n')
        })
      }
    }

    i++
  }

  return entries
}

/**
 * 解析 ASS/SSA 字幕
 *
 * ASS (Advanced SubStation Alpha) 格式说明：
 * - 包含 [Script Info]、[V4+ Styles]、[Events] 等段落
 * - 对话行格式：Dialogue: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
 *
 * 企业项目经验：
 * - ASS 是功能最强大的字幕格式，支持复杂样式和特效
 * - 完整支持需要专门的渲染引擎（如 libass）
 * - 这里只提取基本的时间和文本信息
 * - 样式标签被移除，只保留纯文本
 */
export function parseASS(content: string): SubtitleEntry[] {
  const lines = content.split('\n')
  const entries: SubtitleEntry[] = []
  let index = 0
  let inEvents = false

  // 查找 [Events] 段落
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim()
    if (!line) continue

    // 检测 [Events] 段落开始
    if (line === '[Events]') {
      inEvents = true
      continue
    }

    // 检测新段落开始（离开 [Events]）
    if (inEvents && line.startsWith('[') && line.endsWith(']')) {
      break
    }

    // 解析对话行
    if (inEvents && line.startsWith('Dialogue:')) {
      // 格式：Dialogue: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
      const parts = line.substring('Dialogue:'.length).split(',')

      if (parts.length >= 10) {
        const start = parts[1]?.trim()
        const end = parts[2]?.trim()
        // Text 是第 10 个字段之后的所有内容（可能包含逗号）
        const text = parts.slice(9).join(',').trim()

        if (start && end && text) {
          entries.push({
            index: index++,
            startTime: parseASSTimestamp(start),
            endTime: parseASSTimestamp(end),
            text: stripASSStyles(text)
          })
        }
      }
    }
  }

  if (entries.length === 0) {
    throw new Error('No dialogue entries found in ASS file.')
  }

  return entries
}

export function findSubtitleAtTime(
  entries: SubtitleEntry[],
  currentTime: number
): SubtitleEntry | null {
  let left = 0
  let right = entries.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const entry = entries[mid]
    if (!entry) break

    if (currentTime >= entry.startTime && currentTime <= entry.endTime) {
      return entry
    } else if (currentTime < entry.startTime) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }

  return null
}

export function validateSubtitleTiming(entries: SubtitleEntry[]): string[] {
  const warnings: string[] = []

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (!entry) continue

    if (entry.endTime < entry.startTime) {
      warnings.push(`Entry ${entry.index}: endTime < startTime`)
    }

    if (entry.startTime < 0 || entry.endTime < 0) {
      warnings.push(`Entry ${entry.index}: negative timestamp`)
    }

    if (i > 0) {
      const prevEntry = entries[i - 1]
      if (prevEntry && entry.startTime < prevEntry.startTime) {
        warnings.push(`Entry ${entry.index}: not in chronological order`)
      }
    }
  }

  return warnings
}
