import { ref, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { db, type PlaybackProgress } from '@/db/schema'

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

  function startTracking() {
    const video = videoElement.value
    if (!video) return

    const handleTimeUpdate = () => {
      saveProgress(video.currentTime, video.duration)
    }

    const handlePause = () => {
      saveProgressImmediately(video.currentTime, video.duration)
    }

    const handleEnded = () => {
      saveProgressImmediately(video.duration, video.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    window.addEventListener('beforeunload', () => {
      saveProgressImmediately(video.currentTime, video.duration)
    })

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }

  return {
    progress,
    percentage,
    completed,
    hasProgress,
    loadProgress,
    saveProgress,
    saveProgressImmediately,
    startTracking
  }
}
