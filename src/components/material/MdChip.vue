<!--
  Material Design 3 Filter Chip (筛选芯片)

  Chip 是什么？
  - 用于筛选、选择的小型交互元素
  - 可以单选或多选
  - 有明确的选中/未选中状态

  使用场景：
  - 筛选器（如"全部"、"进行中"、"已完成"）
  - 标签选择
  - 分类选择

  交互效果：
  - 点击切换选中状态
  - Ripple 效果
  - State Layer（hover/active）

  企业项目经验：
  - Chip 适合用于多个选项的快速切换
  - 选中状态要明显，让用户清楚当前选择
  - 不要用 Chip 做单个按钮，应该用 Button
-->

<template>
  <button
    class="md-chip"
    :class="{ 'md-chip--selected': selected }"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useMaterialRipple } from '@/composables/useMaterialRipple'

interface Props {
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
})

// 使用 v-model 模式（update:selected）的原因：
// - 父组件可以用 v-model:selected="value" 双向绑定
// - 比单独的 :selected 和 @change 更简洁
//
// 企业项目经验：
// - v-model 是 Vue 中实现双向绑定的标准方式
// - 对于有状态的组件（如 Chip、Checkbox），应该支持 v-model
const emit = defineEmits<{
  'update:selected': [value: boolean]
}>()

const { createRipple } = useMaterialRipple()

const handleClick = (event: MouseEvent) => {
  const target = event.currentTarget
  if (!target || !(target instanceof HTMLElement)) return

  createRipple(event, target)
  // 切换选中状态
  emit('update:selected', !target.classList.contains('md-chip--selected'))
}
</script>

<style scoped>
.md-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: var(--md-sys-shape-corner-small);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);

  /* 未选中状态：透明背景 + 边框 */
  border: 1px solid var(--md-sys-color-outline);
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
}

/* 选中状态：填充背景 + 无边框
 * 企业项目经验：
 * - 选中状态要明显，让用户一眼看出当前选择
 * - 使用 secondary-container 而不是 primary，避免过于抢眼
 */
.md-chip--selected {
  border-color: transparent;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

/* State Layer 效果 */
.md-chip:hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: currentColor;
  opacity: 0.08;
  pointer-events: none;
}

.md-chip:active::before {
  opacity: 0.12;
}
</style>
