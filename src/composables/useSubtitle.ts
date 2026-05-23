import { ref, watch, type Ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { db, type Subtitle, type SubtitleEntry } from '@/db/schema'
import { parseSRT, parseVTT, findSubtitleAtTime, validateSubtitleTiming } from '@/utils/subtitle-parser'
import { validateSubtitleFile } from '@/utils/video-validator'

export function useSubtitle(videoElement: Ref<HTMLVideoElement | null>, videoId: string) {
  const currentSubtitle = ref<SubtitleEntry | null>(null)
  const subtitles = ref<SubtitleEntry[]>([])
  const subtitleVisible = ref(true)
  const hasSubtitle = ref(false)

  async function loadSubtitlesForVideo() {
    const subtitle = await db.subtitles.where('videoId').equals(videoId).first()
    if (subtitle) {
      subtitles.value = subtitle.entries
      hasSubtitle.value = true
    }
  }

  async function uploadSubtitle(file: File, language: string = 'en'): Promise<void> {
    const validation = validateSubtitleFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const content = await file.text()
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

    let entries: SubtitleEntry[]

    try {
      if (extension === '.srt') {
        entries = parseSRT(content)
      } else if (extension === '.vtt') {
        entries = parseVTT(content)
      } else {
        throw new Error('Unsupported subtitle format')
      }
    } catch (error) {
      throw new Error(`Failed to parse subtitle file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    const warnings = validateSubtitleTiming(entries)
    if (warnings.length > 0) {
      console.warn('Subtitle timing issues:', warnings)
    }

    const subtitle: Subtitle = {
      id: uuidv4(),
      videoId,
      filename: file.name,
      language,
      entries,
      uploadedAt: Date.now()
    }

    await db.subtitles.add(subtitle)
    subtitles.value = entries
    hasSubtitle.value = true
    subtitleVisible.value = true
  }

  function updateCurrentSubtitle(time: number) {
    currentSubtitle.value = findSubtitleAtTime(subtitles.value, time)
  }

  function toggleSubtitleVisibility() {
    subtitleVisible.value = !subtitleVisible.value
  }

  watch(videoElement, (video) => {
    if (!video) return

    const handleTimeUpdate = () => {
      updateCurrentSubtitle(video.currentTime)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('seeked', handleTimeUpdate)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('seeked', handleTimeUpdate)
    }
  })

  loadSubtitlesForVideo()

  return {
    currentSubtitle,
    subtitles,
    subtitleVisible,
    hasSubtitle,
    uploadSubtitle,
    toggleSubtitleVisibility,
    updateCurrentSubtitle
  }
}
