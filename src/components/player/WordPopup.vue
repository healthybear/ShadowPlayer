<!--
  Word Popup Component (单词弹窗组件)

  点击字幕中的单词时，显示单词释义。

  显示内容：
  - 单词本身
  - 音标（可选）
  - 释义

  交互效果：
  - 缩放动画（md-scale transition）
  - 固定定位，不随页面滚动
  - 高 elevation，确保在最上层

  企业项目经验：
  - 弹窗是常见的交互模式
  - 动画让交互更自然
  - 位置要避开遮挡内容
-->

<template>
  <!-- Transition 是 Vue 的内置组件，提供进入/离开动画
       name="md-scale" 使用 Material Design 的缩放动画

       企业项目经验：
       - 弹窗应该有动画，不要突然出现/消失
       - 缩放动画是最常见的弹窗动画
       - Vue 的 Transition 组件让动画实现变得简单
  -->
  <Transition name="md-scale">
    <MdCard
      v-if="visible"
      :elevation="3"
      class="word-popup"
    >
      <div class="word-popup__word">{{ word }}</div>
      <div class="word-popup__pronunciation">{{ pronunciation }}</div>
      <div class="word-popup__definition">{{ definition }}</div>
    </MdCard>
  </Transition>
</template>

<script setup lang="ts">
import MdCard from '@/components/material/MdCard.vue'

interface Props {
  visible: boolean
  word: string
  pronunciation?: string
  definition: string
}

withDefaults(defineProps<Props>(), {
  pronunciation: '',
})

// 为什么不用 emit 关闭弹窗？
// - 父组件通过 :visible 控制显示/隐藏
// - 这是"受控组件"模式，状态由父组件管理
//
// 企业项目经验：
// - 弹窗通常是受控组件，不是自己管理状态
// - 父组件可能需要在多个地方控制弹窗（如点击外部关闭）
// - 如果需要关闭按钮，应该 emit('update:visible', false)
</script>

<style scoped>
.word-popup {
  /* 固定定位，不随页面滚动
   * bottom: 35% - 在屏幕中下方
   * left: calc(50% + 64px) - 稍微偏右，避开视频中心
   *
   * 企业项目经验：
   * - 弹窗位置要避开重要内容（如视频、字幕）
   * - 固定定位确保弹窗始终可见
   */
  position: fixed;
  bottom: 35%;
  left: calc(50% + 64px);
  width: 256px;
  z-index: 1000;
}

.word-popup__word {
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 4px;
}

.word-popup__pronunciation {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 12px;
}

.word-popup__definition {
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface);
  line-height: 1.5;
}
</style>
