<template>
  <div class="video-player">
    <video
      ref="videoRef"
      class="video-player__video"
      :src="src"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  src: string
}

defineProps<Props>()

const emit = defineEmits<{
  timeupdate: [time: number]
  loadedmetadata: [duration: number]
}>()

const videoRef = ref<HTMLVideoElement>()

const handleTimeUpdate = (event: Event) => {
  const video = event.target as HTMLVideoElement
  emit('timeupdate', video.currentTime)
}

const handleLoadedMetadata = (event: Event) => {
  const video = event.target as HTMLVideoElement
  emit('loadedmetadata', video.duration)
}

defineExpose({
  videoRef,
})
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  background-color: #000;
  border-radius: var(--md-sys-shape-corner-medium);
  overflow: hidden;
}

.video-player__video {
  width: 100%;
  height: auto;
  display: block;
}
</style>
