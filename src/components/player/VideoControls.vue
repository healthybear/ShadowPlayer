<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
  subtitleVisible: boolean
  hasSubtitle: boolean
  loopEnabled: boolean
  loopStart: number
  loopEnd: number
  loopCount: number
  currentLoop: number
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
  'toggle-loop': []
  'set-loop-count': [count: number]
}>()

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]
const LOOP_COUNTS = [
  { label: '∞ Infinite', value: 0 },
  { label: '3 times', value: 3 },
  { label: '5 times', value: 5 },
  { label: '10 times', value: 10 },
]

const showLoopMenu = ref(false)

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

/**
 * 格式化循环计数显示
 *
 * 企业项目经验：用户友好的文本显示
 * - 无限循环：显示 "Loop 3/∞"
 * - 有限循环：显示 "Loop 2/5"
 * - 使用 ∞ 符号比 "infinite" 更简洁
 */
function formatLoopCount(current: number, total: number): string {
  if (total === 0) {
    return `Loop ${current}/∞`
  }
  return `Loop ${current}/${total}`
}

</script>

<template>
  <div class="video-controls">
    <!-- Loop Indicator (显示在进度条上方) -->
    <div v-if="loopEnabled" class="loop-indicator">
      <span class="loop-indicator__text">
        🔁 {{ formatTime(loopStart) }} - {{ formatTime(loopEnd) }}
      </span>
      <span class="loop-indicator__count">
        {{ formatLoopCount(currentLoop, loopCount) }}
      </span>
    </div>

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

        <!-- Loop Toggle Button with Settings Menu -->
        <el-dropdown
          trigger="click"
          @command="emit('set-loop-count', $event)"
          @visible-change="showLoopMenu = $event"
        >
          <el-button
            icon="RefreshRight"
            circle
            :type="loopEnabled ? 'primary' : 'default'"
            @click.stop="emit('toggle-loop')"
          />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="option in LOOP_COUNTS"
                :key="option.value"
                :command="option.value"
              >
                {{ option.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

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

/* Loop Indicator (循环状态指示器)
 * 企业项目经验：状态指示器的设计原则
 * - 位置：显示在进度条上方，不遮挡重要内容
 * - 颜色：使用 Material Design 3 的 primary 色系，表示"激活状态"
 * - 信息：显示循环区间时间和当前循环次数
 * - 动画：淡入淡出，不要突然出现/消失
 */
.loop-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  margin-bottom: 4px;
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-radius: var(--md-sys-shape-corner-small);
  font-size: 12px;
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loop-indicator__text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loop-indicator__count {
  font-weight: 500;
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
