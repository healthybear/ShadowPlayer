<!--
  Subtitle List Item Component (字幕列表项组件)

  这是虚拟滚动列表中的单个字幕项。

  显示内容：
  - 时间戳（如 "00:01:23"）
  - 原文字幕
  - 翻译字幕

  交互效果：
  - 点击跳转到对应时间
  - Ripple 效果
  - State Layer（hover）
  - Active 状态高亮

  企业项目经验：
  - 列表项组件应该尽量简单，避免复杂计算
  - 虚拟滚动会频繁创建/销毁组件，性能很重要
  - 不要在列表项中使用 watch、computed（除非必要）
-->

<template>
  <div
    class="subtitle-list-item"
    :class="{ 'subtitle-list-item--active': active }"
    @click="handleClick"
  >
    <div class="subtitle-list-item__time">{{ time }}</div>
    <div class="subtitle-list-item__text">{{ text }}</div>
    <div class="subtitle-list-item__translation">{{ translation }}</div>
  </div>
</template>

<script setup lang="ts">
import { useMaterialRipple } from '@/composables/useMaterialRipple'

interface Props {
  time: string
  text: string
  translation: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
})

const emit = defineEmits<{
  click: []
}>()

const { createRipple } = useMaterialRipple()

const handleClick = (event: MouseEvent) => {
  createRipple(event, event.currentTarget as HTMLElement)
  emit('click')
}
</script>

<style scoped>
.subtitle-list-item {
  position: relative;
  padding: 12px 16px;
  cursor: pointer;
  overflow: hidden;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

/* State Layer 效果 */
.subtitle-list-item:hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--md-sys-color-on-surface);
  opacity: 0.08;
  pointer-events: none;
}

/* Active 状态：背景色 + 左侧强调条
 * 企业项目经验：
 * - 当前播放的字幕要明显高亮
 * - 左侧强调条是常见的设计模式
 * - padding-left 调整确保内容对齐
 */
.subtitle-list-item--active {
  background-color: var(--md-sys-color-secondary-container);
  border-left: 4px solid var(--md-sys-color-secondary);
  padding-left: 12px;
}

.subtitle-list-item__time {
  font-size: var(--md-sys-typescale-label-small-size);
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 4px;
}

.subtitle-list-item__text {
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 4px;
}

.subtitle-list-item__translation {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
}
</style>
