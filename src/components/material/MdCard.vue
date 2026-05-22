<!--
  Material Design 3 Card Component (卡片组件)

  Material Card 是什么？
  - 用于展示内容和操作的容器
  - 有明确的边界（圆角、阴影）
  - 可以包含文字、图片、按钮等任何内容

  Props 设计：
  - elevation: 阴影级别（0-5），控制卡片的"高度"
  - padding: 内边距，支持任意 CSS 值

  使用场景：
  - 列表项（elevation-1）
  - 信息卡片（elevation-1）
  - 悬浮卡片（elevation-2）

  企业项目经验：
  - Card 是最常用的容器组件，几乎每个页面都会用到
  - 统一的 elevation 让界面层次清晰
  - 可配置的 padding 让组件更灵活
-->

<template>
  <div
    class="md-card"
    :class="[`md-elevation-${elevation}`, paddingClass]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 限制为 0-5 而不是 number 的原因：
  // 1. Material Design 3 规范只定义了 6 个 elevation 级别
  // 2. TypeScript 会在编译时检查，防止传入无效值（如 elevation={10}）
  // 3. 这是"让错误的代码无法编译"的类型安全实践
  //
  // 企业项目经验：
  // - 使用字面量类型（literal types）比 number 更安全
  // - 类型系统应该反映业务规则，不只是技术约束
  elevation?: 0 | 1 | 2 | 3 | 4 | 5

  padding?: string
}

const props = withDefaults(defineProps<Props>(), {
  elevation: 1,
  padding: '16px',
})

// 使用 computed 而不是直接在 template 中计算的原因：
// 1. 性能：computed 有缓存，只在依赖变化时重新计算
// 2. 可测试性：可以单独测试这个逻辑
// 3. 可维护性：复杂逻辑不应该写在 template 里
//
// 企业项目经验：
// - template 应该尽量"声明式"，复杂计算放 computed
// - computed 的缓存机制在大型应用中能显著提升性能
const paddingClass = computed(() => {
  return props.padding ? `p-[${props.padding}]` : ''
})
</script>

<style scoped>
.md-card {
  /* 使用 CSS 变量而不是硬编码颜色的原因：
   * 1. 主题切换：只需修改变量值，所有组件自动更新
   * 2. 一致性：确保整个应用使用统一的设计系统
   * 3. 可维护性：颜色定义集中管理，不会出现"魔法数字"
   *
   * 企业项目经验：
   * - Design Tokens 是大型应用的设计系统基础
   * - 永远不要在组件中硬编码颜色值（如 #FFFBFE）
   */
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-medium);

  /* 过渡动画让阴影变化更平滑
   * 使用场景：hover 时增加 elevation
   */
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}
</style>
