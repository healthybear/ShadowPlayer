<!--
  Material Design 3 Top App Bar (顶部应用栏)

  Top App Bar 是什么？
  - 页面顶部的导航栏
  - 包含标题、导航按钮、操作按钮
  - 固定在顶部，不随页面滚动

  Material 3 规范：
  - 高度：64px
  - 滚动时显示阴影（elevation-2）
  - 未滚动时无阴影（elevation-0）

  Slots：
  - leading: 左侧区域（返回按钮、菜单按钮）
  - title: 标题区域
  - actions: 右侧操作区域（搜索、更多按钮）

  企业项目经验：
  - Top App Bar 是应用的"门面"，要保持简洁
  - 滚动阴影提供视觉反馈，让用户知道页面可以滚动
  - 固定定位（position: fixed）确保导航始终可见
-->

<template>
  <header
    class="md-top-app-bar"
    :class="{ 'md-top-app-bar--scrolled': scrolled }"
  >
    <div class="md-top-app-bar__leading">
      <slot name="leading" />
    </div>
    <div class="md-top-app-bar__title">
      <slot name="title" />
    </div>
    <div class="md-top-app-bar__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  // scrolled 属性控制是否显示阴影
  // 父组件需要监听页面滚动，传入 scrolled 状态
  //
  // 企业项目经验：
  // - 滚动监听应该在父组件中实现，避免每个 Top App Bar 都监听一次
  // - 使用 IntersectionObserver 或 scroll 事件监听
  scrolled?: boolean
}

withDefaults(defineProps<Props>(), {
  scrolled: false,
})
</script>

<style scoped>
.md-top-app-bar {
  /* 固定定位，始终在顶部
   * 企业项目经验：
   * - 导航栏应该始终可见，方便用户随时切换页面
   * - z-index: 1000 确保在其他内容之上
   */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);

  /* 默认无阴影 */
  box-shadow: var(--md-sys-elevation-level0);

  /* 阴影过渡动画 */
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);

  z-index: 1000;
}

/* 滚动时显示阴影
 * 企业项目经验：
 * - 滚动阴影是重要的视觉反馈
 * - 让用户知道页面可以滚动，导航栏是"悬浮"的
 */
.md-top-app-bar--scrolled {
  box-shadow: var(--md-sys-elevation-level2);
}

.md-top-app-bar__leading {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.md-top-app-bar__title {
  /* flex: 1 让标题占据剩余空间 */
  flex: 1;
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  line-height: var(--md-sys-typescale-title-large-line-height);
}

.md-top-app-bar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}
</style>
