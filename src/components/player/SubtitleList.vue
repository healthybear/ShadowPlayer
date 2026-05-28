<!--
  Subtitle List Component (字幕列表组件)

  这个组件使用虚拟滚动技术渲染大量字幕项。

  什么是虚拟滚动（Virtual Scrolling）？
  - 只渲染可见区域的 DOM 元素
  - 滚动时动态创建/销毁元素
  - 无论数据有多少条，DOM 元素数量保持恒定

  为什么需要虚拟滚动？
  - 一部电影可能有 1000+ 条字幕
  - 渲染 1000 个 DOM 元素会导致：
    * 初始渲染慢（可能需要几秒）
    * 滚动卡顿（浏览器需要重排大量元素）
    * 内存占用高
  - 虚拟滚动只渲染 ~20 个元素，性能提升 50 倍

  DynamicScroller vs RecycleScroller：
  - RecycleScroller: 固定高度，性能最好
  - DynamicScroller: 动态高度，更灵活（我们使用这个）
  - 字幕长度不同，需要动态高度

  企业项目经验：
  - 列表超过 100 项时，应该考虑虚拟滚动
  - 虚拟滚动是大型应用的必备技术
  - 用户体验的差异是"能用"和"好用"的区别
-->

<template>
  <div class="subtitle-list">
    <!-- DynamicScroller 是支持动态高度的虚拟滚动容器
         :items - 数据源（所有字幕）
         :min-item-size - 最小高度（用于初始估算）
         :buffer - 缓冲区大小（提前渲染的像素数，避免滚动时闪烁）

         为什么需要 buffer？
         - 快速滚动时，新元素需要时间渲染
         - buffer 让元素提前渲染，用户看不到空白
         - 200px 是经验值，约等于 3-4 个列表项
    -->
    <DynamicScroller
      ref="scrollerRef"
      :items="subtitles"
      :min-item-size="60"
      :buffer="200"
      class="subtitle-list__scroller"
      @scroll="handleScroll"
    >
      <template #default="{ item, index, active }">
        <!-- DynamicScrollerItem 是必需的包装器
             它会测量实际高度，告诉 DynamicScroller

             企业项目经验：
             - 不要忘记这个包装器，否则虚拟滚动不工作
             - :active 是虚拟滚动的内部状态，不是我们的 active prop
        -->
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
        >
          <SubtitleListItem
            :time="item.time"
            :text="item.text"
            :translation="item.translation"
            :active="item.id === activeId"
            @click="emit('select', item.id)"
          />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import SubtitleListItem from './SubtitleListItem.vue'

interface Subtitle {
  id: string
  time: string
  text: string
  translation: string
}

interface Props {
  subtitles: Subtitle[]
  activeId?: string
}

withDefaults(defineProps<Props>(), {
  activeId: '',
})

const emit = defineEmits<{
  select: [id: string]
  scroll: []
}>()

// DynamicScroller 的 ref
// 企业项目经验：
// - 需要暴露给父组件，让父组件可以调用 scrollToItem() 方法
// - 这是虚拟滚动的核心 API，用于程序化滚动
const scrollerRef = ref<InstanceType<typeof DynamicScroller>>()

/**
 * 处理滚动事件
 *
 * 为什么需要这个？
 * - 用户手动滚动时，需要通知父组件
 * - 父组件会暂时禁用自动滚动，避免打断用户阅读
 *
 * 企业项目经验：
 * - 滚动事件频繁触发，但这里不需要 debounce
 * - 因为父组件的 onUserScroll 已经处理了防抖逻辑
 * - 不要在多个层级重复做防抖，会导致延迟累加
 */
function handleScroll() {
  emit('scroll')
}

/**
 * 滚动到指定索引
 *
 * 为什么需要这个方法？
 * - 父组件需要调用这个方法来实现自动滚动
 * - 直接暴露 DynamicScroller 的 scrollToItem 方法
 *
 * 企业项目经验：
 * - 组件封装时，要暴露必要的命令式 API
 * - 不是所有操作都能通过 props 实现（如滚动）
 * - defineExpose 让父组件可以调用子组件的方法
 */
function scrollToItem(index: number) {
  scrollerRef.value?.scrollToItem(index)
}

// 暴露给父组件
// 企业项目经验：
// - 只暴露必要的 API，保持组件封装性
// - scrollToItem 是唯一需要暴露的方法
defineExpose({
  scrollToItem,
})

// 虚拟滚动的性能对比（1000 条数据）：
// - 普通渲染：1000 个 DOM 元素，初始渲染 ~2s，滚动卡顿
// - 虚拟滚动：~20 个 DOM 元素，初始渲染 ~100ms，滚动流畅
//
// 企业项目经验：
// - 虚拟滚动是"必须掌握"的性能优化技术
// - 移动端尤其重要（设备性能较弱）
// - 用户不会等待 2 秒的加载时间
</script>

<style scoped>
.subtitle-list {
  height: 100%;
  background-color: var(--md-sys-color-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  overflow: hidden;
}

/* 虚拟滚动容器必须有固定高度
 * 企业项目经验：
 * - 父容器必须有明确的高度（height: 100% 或固定值）
 * - 否则虚拟滚动无法计算可见区域
 */
.subtitle-list__scroller {
  height: 100%;
}
</style>
