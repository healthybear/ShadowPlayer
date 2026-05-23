<script setup lang="ts">
interface Props {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
  subtitleVisible: boolean
  hasSubtitle: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'toggle-play': []
  'seek': [time: number]
  'set-volume': [volume: number]
  'toggle-mute': []
  'set-playback-rate': [rate: number]
  'toggle-fullscreen': []
  'toggle-subtitle': []
}>()

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="video-controls">
    <div class="controls-top">
      <el-slider
        :model-value="currentTime"
        :max="duration || 100"
        :show-tooltip="false"
        @update:model-value="emit('seek', $event)"
      />
    </div>

    <div class="controls-bottom">
      <div class="controls-left">
        <el-button
          :icon="isPlaying ? 'VideoPause' : 'VideoPlay'"
          circle
          @click="emit('toggle-play')"
        />

        <div class="time-display">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
      </div>

      <div class="controls-right">
        <el-popover placement="top" :width="40" trigger="hover">
          <template #reference>
            <el-button
              :icon="isMuted ? 'Mute' : 'Microphone'"
              circle
              @click="emit('toggle-mute')"
            />
          </template>
          <el-slider
            :model-value="volume"
            :max="1"
            :step="0.1"
            vertical
            height="100px"
            @update:model-value="emit('set-volume', $event)"
          />
        </el-popover>

        <el-dropdown @command="emit('set-playback-rate', $event)">
          <el-button circle>
            {{ playbackRate }}x
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="rate in PLAYBACK_RATES"
                :key="rate"
                :command="rate"
              >
                {{ rate }}x
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button
          v-if="hasSubtitle"
          icon="ChatDotRound"
          circle
          :type="subtitleVisible ? 'primary' : 'default'"
          @click="emit('toggle-subtitle')"
        />

        <el-button
          icon="FullScreen"
          circle
          @click="emit('toggle-fullscreen')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-controls {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
}

.controls-top {
  margin-bottom: 8px;
}

.controls-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-display {
  font-size: 14px;
  color: white;
  white-space: nowrap;
  min-width: 100px;
}
</style>
