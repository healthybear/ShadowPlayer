<template>
  <div class="player-controls">
    <el-button
      :icon="playing ? 'VideoPause' : 'VideoPlay'"
      circle
      @click="emit('toggle-play')"
    />
    <el-slider
      :model-value="currentTime"
      :max="duration"
      class="player-controls__slider"
      @update:model-value="emit('seek', $event)"
    />
    <span class="player-controls__time">
      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  playing: boolean
  currentTime: number
  duration: number
}

defineProps<Props>()

const emit = defineEmits<{
  'toggle-play': []
  seek: [time: number]
}>()

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--md-sys-color-surface);
  border-radius: var(--md-sys-shape-corner-medium);
}

.player-controls__slider {
  flex: 1;
}

.player-controls__time {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  white-space: nowrap;
}
</style>
