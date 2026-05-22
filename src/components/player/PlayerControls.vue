<!--
  Player Controls Component (播放控制组件)

  视频播放器的控制条，包含：
  - 播放/暂停按钮
  - 进度条（可拖动）
  - 时间显示（当前时间 / 总时长）

  交互逻辑：
  - 点击按钮切换播放状态
  - 拖动进度条跳转到指定时间
  - 实时显示播放进度

  企业项目经验：
  - 控制条是视频播放器的标准组件
  - 进度条要支持拖动，不只是显示
  - 时间格式要统一（MM:SS）
-->

<template>
  <div class="player-controls">
    <el-button
      :icon="playing ? 'VideoPause' : 'VideoPlay'"
      circle
      @click="emit('toggle-play')"
    />
    <!-- el-slider 是 Element Plus 的滑块组件
         :model-value - 当前值（不使用 v-model，因为我们要手动控制）
         :max - 最大值（视频总时长）
         @update:model-value - 拖动时触发

         企业项目经验：
         - 进度条是视频播放器的核心交互
         - 用户期望能拖动进度条跳转
         - 不要用只读的进度条
    -->
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

// 时间格式化函数：秒 → MM:SS
// 企业项目经验：
// - 时间格式化是常见需求，应该封装成函数
// - padStart(2, '0') 确保秒数始终是两位（如 "1:05" 而不是 "1:5"）
// - 如果视频超过 1 小时，应该改成 HH:MM:SS 格式
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

/* flex: 1 让进度条占据剩余空间
 * 企业项目经验：
 * - 进度条应该尽可能长，方便精确拖动
 * - 按钮和时间显示固定宽度
 */
.player-controls__slider {
  flex: 1;
}

.player-controls__time {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);

  /* white-space: nowrap 防止时间换行
   * 企业项目经验：
   * - 时间显示不应该换行，会影响布局
   * - 确保容器有足够宽度
   */
  white-space: nowrap;
}
</style>
