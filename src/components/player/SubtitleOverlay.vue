<!--
  Subtitle Overlay Component (字幕覆盖层组件)

  这是视频上方的字幕显示层。

  设计要点：
  - 半透明黑色背景，确保字幕可读
  - 居中显示
  - pointer-events: none，不阻挡视频点击

  企业项目经验：
  - 字幕是视频播放器的核心功能
  - 背景透明度要适中（太透明看不清，太不透明遮挡视频）
  - 字幕位置要避开控制条
-->

<template>
  <div class="subtitle-overlay">
    <div class="subtitle-overlay__text">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text: string
}

defineProps<Props>()
</script>

<style scoped>
.subtitle-overlay {
  /* 绝对定位，覆盖在视频上方
   * bottom: 60px 避开底部的控制条
   */
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 16px;

  /* pointer-events: none 让点击穿透到视频
   * 企业项目经验：
   * - 覆盖层不应该阻挡用户交互
   * - 用户点击视频时，应该能暂停/播放
   */
  pointer-events: none;
}

.subtitle-overlay__text {
  padding: 8px 16px;

  /* 半透明黑色背景，确保字幕可读
   * 企业项目经验：
   * - 0.8 是经验值，太低看不清，太高遮挡视频
   * - 白色文字 + 黑色背景是最佳对比度
   */
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;

  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  border-radius: var(--md-sys-shape-corner-small);

  /* 限制最大宽度，避免字幕太长
   * 企业项目经验：
   * - 字幕太长会影响阅读体验
   * - 80% 是常见的字幕宽度
   */
  max-width: 80%;
  text-align: center;
}
</style>
