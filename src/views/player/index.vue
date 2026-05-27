<!--
  Player Page (播放器页面)

  页面结构：
  - 视频区域（左侧/上方）
    - 视频播放器
    - 字幕覆盖层
    - 单词弹窗
    - 播放控制条
  - 字幕列表（右侧/下方）

  响应式布局：
  - 移动端：上下布局（视频在上，字幕在下）
  - 桌面：左右布局（视频在左，字幕在右）
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import VideoPlayerContainer from '@/components/player/VideoPlayerContainer.vue'

defineOptions({ name: 'PlayerPageView' })

const route = useRoute()

/**
 * 响应式思维：路由参数的正确读取方式
 *
 * 错误写法：
 * const videoId = route.params.id as string
 *
 * 为什么错误？
 * - route.params.id 是响应式的（Proxy 对象）
 * - 但赋值给常量后，videoId 变成了普通字符串
 * - 路由切换时，videoId 不会更新
 *
 * 正确写法：
 * const videoId = computed(() => route.params.id as string)
 *
 * 为什么正确？
 * - computed 保持了响应式链接
 * - 路由切换时，computed 会重新计算
 * - 子组件会收到新的 prop 值
 *
 * 企业项目经验：
 * - 这是 Vue 3 新手最常犯的错误之一
 * - 记住：从响应式对象读取值时，用 computed 包装
 * - 不要破坏响应式链条
 */
const videoId = computed(() => route.params.id as string)
</script>

<template>
  <div class="player-page">
    <main class="player-page__main">
      <!--
        响应式思维：为什么需要 :key？

        问题：即使 videoId 是响应式的，Vue 仍然会复用组件实例
        - 从 /player/1 切换到 /player/2
        - Vue 发现是同一个组件（VideoPlayerContainer）
        - 只更新 props，不重新创建组件
        - 但组件内部的 onMounted 不会再次执行
        - 导致视频不会重新加载

        解决方案：添加 :key
        - key 变化时，Vue 会销毁旧组件，创建新组件
        - 确保 onMounted 重新执行
        - 确保所有状态重置

        企业项目经验：
        - :key 是强制组件重新创建的标准方法
        - 适用于需要"完全重置"的场景
        - 但要注意性能：重新创建组件比更新 props 慢
        - 这里是必需的，因为需要重新加载视频
      -->
      <VideoPlayerContainer
        :video-id="videoId"
        :key="videoId"
      />
    </main>
  </div>
</template>

<style scoped>
.player-page {
  min-height: calc(100vh - 64px); /* 减去导航栏高度 */
  background-color: var(--md-sys-color-background);
  display: flex;
  flex-direction: column;
}

.player-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  /* 限制最大高度，确保视频不会超出视口 */
  max-height: calc(100vh - 64px);
  overflow: hidden;
}

@media (max-width: 768px) {
  .player-page__main {
    padding: 16px;
    max-height: calc(100vh - 64px);
  }
}
</style>
