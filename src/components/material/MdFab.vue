<!--
  Material Design 3 Floating Action Button (FAB - 浮动操作按钮)

  FAB 是什么？
  - 页面上最重要的操作按钮
  - 圆形、悬浮、有阴影
  - 通常固定在屏幕右下角

  Material 3 规范：
  - Small: 40x40px，用于紧凑布局
  - Medium: 56x56px，标准尺寸（最常用）
  - Large: 96x96px，用于强调重要操作

  交互效果：
  - Ripple: 点击时的波纹效果
  - State Layer: hover 时的半透明覆盖层（8%）
  - Elevation: hover 时阴影增强（3 → 4）

  企业项目经验：
  - FAB 应该只用于最重要的操作（如"新建"、"上传"）
  - 一个页面最多只有一个 FAB
  - FAB 的位置应该固定，不随滚动消失
-->

<template>
  <button
    class="md-fab"
    :class="[`md-fab--${size}`, 'md-elevation-3']"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useMaterialRipple } from '@/composables/useMaterialRipple'

interface Props {
  // 限制为 'small' | 'medium' | 'large' 而不是 string 的原因：
  // 1. Material Design 3 只定义了这 3 个尺寸
  // 2. TypeScript 会在编译时检查，防止传入无效值
  // 3. IDE 会提供自动补全，提高开发效率
  //
  // 企业项目经验：
  // - 字面量类型让 API 更清晰、更安全
  // - 限制选项能避免设计不一致
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
})

// TypeScript 类型定义的 emit 好处：
// 1. 父组件使用时有自动补全
// 2. 传错参数类型会编译报错
// 3. 重构时可以全局搜索引用
//
// 企业项目经验：
// - 大型项目中，类型安全能避免 90% 的低级错误
// - emit 的类型定义是组件 API 的一部分
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { createRipple } = useMaterialRipple()

const handleClick = (event: MouseEvent) => {
  // 先创建 ripple 效果，再触发 click 事件
  // 这样用户能立即看到视觉反馈
  createRipple(event, event.currentTarget as HTMLElement)
  emit('click', event)
}
</script>

<style scoped>
.md-fab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;

  /* FAB 必须是圆形 */
  border-radius: 50%;

  /* 使用 primary-container 而不是 primary 的原因：
   * - primary-container 是更柔和的背景色
   * - 符合 Material 3 的"低对比度"设计原则
   */
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);

  cursor: pointer;

  /* overflow: hidden 让 ripple 效果不会溢出圆形边界 */
  overflow: hidden;

  /* 阴影过渡动画，让 hover 效果更平滑 */
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* Material 3 规范的 FAB 尺寸
 * 企业项目经验：
 * - 不要随意设置尺寸，应该从规范中选择
 * - Medium 是最常用的尺寸
 */
.md-fab--small {
  width: 40px;
  height: 40px;
}

.md-fab--medium {
  width: 56px;
  height: 56px;
}

.md-fab--large {
  width: 96px;
  height: 96px;
}

/* Hover 效果：阴影增强 + State Layer
 * 企业项目经验：
 * - 阴影增强表示"按钮抬起"，符合物理直觉
 * - State Layer 提供额外的视觉反馈
 */
.md-fab:hover {
  box-shadow: var(--md-sys-elevation-level4);
}

.md-fab:hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--md-sys-color-on-primary-container);
  opacity: 0.08;
  pointer-events: none;
}

/* Active 效果：阴影减弱 + State Layer 增强
 * 表示"按钮被按下"
 */
.md-fab:active {
  box-shadow: var(--md-sys-elevation-level3);
}

.md-fab:active::before {
  opacity: 0.12;
}
</style>
