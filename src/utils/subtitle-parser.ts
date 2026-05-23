import type { SubtitleEntry } from '@/db/schema'

export function parseTimestamp(timestamp: string): number {
  const parts = timestamp.replace(',', '.').split(':')

  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number)
    return h * 3600 + m * 60 + s
  } else if (parts.length === 2) {
    const [m, s] = parts.map(Number)
    return m * 60 + s
  }

  return 0
}

export function parseSRT(content: string): SubtitleEntry[] {
  const blocks = content.trim().split(/\n\s*\n/)
  const entries: SubtitleEntry[] = []

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 3) continue

    const index = parseInt(lines[0])
    if (isNaN(index)) continue

    const timeLine = lines[1]
    const match = timeLine.match(/(\S+)\s*-->\s*(\S+)/)
    if (!match) continue

    const [, start, end] = match
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
    const line = lines[i].trim()

    if (line.includes('-->')) {
      const match = line.match(/(\S+)\s*-->\s*(\S+)/)
      if (match) {
        const [, start, end] = match
        const textLines: string[] = []

        i++
        while (i < lines.length && lines[i].trim() !== '') {
          textLines.push(lines[i])
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

export function findSubtitleAtTime(
  entries: SubtitleEntry[],
  currentTime: number
): SubtitleEntry | null {
  let left = 0
  let right = entries.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const entry = entries[mid]

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

    if (entry.endTime < entry.startTime) {
      warnings.push(`Entry ${entry.index}: endTime < startTime`)
    }

    if (entry.startTime < 0 || entry.endTime < 0) {
      warnings.push(`Entry ${entry.index}: negative timestamp`)
    }

    if (i > 0 && entry.startTime < entries[i - 1].startTime) {
      warnings.push(`Entry ${entry.index}: not in chronological order`)
    }
  }

  return warnings
}
