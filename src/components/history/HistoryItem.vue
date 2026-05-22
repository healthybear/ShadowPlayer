<!--
  History Item Component (历史记录项组件)

  显示观看历史，包含缩略图、标题、日期、观看进度。

  特殊功能：
  - 进度条覆盖在缩略图底部
  - 显示观看进度百分比

  企业项目经验：
  - 历史记录要显示进度，方便用户继续观看
  - 进度条放在缩略图上是常见设计
  - 视觉上更紧凑，信息密度更高
-->

<template>
  <MdCard
    :elevation="1"
    class="history-item"
    @click="handleClick"
  >
    <div class="history-item__thumbnail">
      <img :src="thumbnail" :alt="title" />
      <!-- 进度条覆盖层
           企业项目经验：
           - 进度条放在缩略图底部，不占用额外空间
           - 用户一眼就能看到观看进度
           - 这是视频应用的标准设计
      -->
      <div class="history-item__progress-overlay">
        <el-progress
          :percentage="progress"
          :show-text="false"
          :stroke-width="4"
        />
      </div>
    </div>
    <div class="history-item__content">
      <div class="history-item__title">{{ title }}</div>
      <div class="history-item__metadata">
        <span>{{ date }}</span>
      </div>
    </div>
  </MdCard>
</template>

<script setup lang="ts">
import MdCard from '@/components/material/MdCard.vue'
import { useMaterialRipple } from '@/composables/useMaterialRipple'

interface Props {
  thumbnail: string
  title: string
  date: string
  progress: number // 0-100
}

defineProps<Props>()

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
.history-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  padding: 0 !important;
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.history-item:hover {
  box-shadow: var(--md-sys-elevation-level2);
}

.history-item__thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--md-sys-color-surface-variant);
}

.history-item__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 进度条覆盖层，绝对定位在缩略图底部 */
.history-item__progress-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.history-item__content {
  padding: 16px;
}

.history-item__title {
  font-size: var(--md-sys-typescale-title-medium-size);
  font-weight: var(--md-sys-typescale-title-medium-weight);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item__metadata {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
}
</style>
