import { ref, type Ref } from 'vue'

export interface VideoPlayerControls {
  isPlaying: Ref<boolean>
  currentTime: Ref<number>
  duration: Ref<number>
  volume: Ref<number>
  isMuted: Ref<boolean>
  playbackRate: Ref<number>
  isFullscreen: Ref<boolean>
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  toggleMute: () => void
  setPlaybackRate: (rate: number) => void
  toggleFullscreen: () => void
}

export function useVideoPlayer(videoElement: Ref<HTMLVideoElement | null>): VideoPlayerControls {
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  const isMuted = ref(false)
  const playbackRate = ref(1)
  const isFullscreen = ref(false)

  function play() {
    const video = videoElement.value
    if (video) {
      video.play()
      isPlaying.value = true
    }
  }

  function pause() {
    const video = videoElement.value
    if (video) {
      video.pause()
      isPlaying.value = false
    }
  }

  function togglePlay() {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  function seek(time: number) {
    const video = videoElement.value
    if (video) {
      video.currentTime = time
      currentTime.value = time
    }
  }

  function setVolume(vol: number) {
    const video = videoElement.value
    if (video) {
      const clampedVolume = Math.max(0, Math.min(1, vol))
      video.volume = clampedVolume
      volume.value = clampedVolume
      if (clampedVolume > 0 && isMuted.value) {
        isMuted.value = false
        video.muted = false
      }
    }
  }

  function toggleMute() {
    const video = videoElement.value
    if (video) {
      video.muted = !video.muted
      isMuted.value = video.muted
    }
  }

  function setPlaybackRate(rate: number) {
    const video = videoElement.value
    if (video) {
      video.playbackRate = rate
      playbackRate.value = rate
    }
  }

  function toggleFullscreen() {
    const video = videoElement.value
    if (!video) return

    if (!document.fullscreenElement) {
      video.requestFullscreen?.()
      isFullscreen.value = true
    } else {
      document.exitFullscreen?.()
      isFullscreen.value = false
    }
  }

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
