<!--
  Video Player Component (视频播放器组件)

  这是一个简单的视频播放器封装，负责：
  - 渲染 HTML5 <video> 元素
  - 监听播放进度和元数据加载事件
  - 向父组件暴露视频元素引用

  为什么要封装 <video> 元素？
  - 统一事件处理：将原生事件转换为 Vue emit
  - 提供 ref 访问：父组件可以调用 play()、pause() 等方法
  - 样式封装：统一视频容器的样式

  企业项目经验：
  - 即使是简单的原生元素，也值得封装成组件
  - 封装让代码更易测试、更易维护
  - 未来可以轻松添加功能（如错误处理、加载状态）
-->

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

// 向父组件发送事件的原因：
// - 父组件需要知道当前播放时间（用于同步字幕）
// - 父组件需要知道视频总时长（用于进度条）
//
// 企业项目经验：
// - 组件应该"向上通信"（emit 事件），而不是"向下操作"（调用父组件方法）
// - 这是 Vue 的单向数据流原则
const emit = defineEmits<{
  timeupdate: [time: number]
  loadedmetadata: [duration: number]
}>()

// ref<HTMLVideoElement> 的作用：
// - 获取原生 video 元素的引用
// - 父组件可以通过 ref 调用 play()、pause()、seek() 等方法
//
// 企业项目经验：
// - 对于需要命令式操作的元素（如 video、canvas），使用 ref
// - 对于纯展示的元素，不需要 ref
const videoRef = ref<HTMLVideoElement>()

const handleTimeUpdate = (event: Event) => {
  const video = event.target as HTMLVideoElement
  emit('timeupdate', video.currentTime)
}

const handleLoadedMetadata = (event: Event) => {
  const video = event.target as HTMLVideoElement
  emit('loadedmetadata', video.duration)
}

// defineExpose 的作用：
// - 让父组件可以访问 videoRef
// - 父组件可以调用 videoRef.value.play() 等方法
//
// 企业项目经验：
// - 默认情况下，<script setup> 中的变量对父组件不可见
// - 只暴露必要的 API，保持组件封装性
defineExpose({
  videoRef,
})
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  border-radius: var(--md-sys-shape-corner-medium);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player__video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain; /* 保持宽高比，完整显示视频 */
}
</style>
