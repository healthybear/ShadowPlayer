<template>
  <MdCard
    :elevation="1"
    class="recent-item"
    @click="handleClick"
  >
    <div class="recent-item__thumbnail">
      <img :src="thumbnail" :alt="title" />
    </div>
    <div class="recent-item__content">
      <div class="recent-item__title">{{ title }}</div>
      <div class="recent-item__metadata">
        <span>{{ duration }}</span>
        <span class="recent-item__separator">•</span>
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
  duration: string
  date: string
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
.recent-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  padding: 0 !important;
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.recent-item:hover {
  box-shadow: var(--md-sys-elevation-level2);
}

.recent-item:hover::before {
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

.recent-item__thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--md-sys-color-surface-variant);
}

.recent-item__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-item__content {
  padding: 16px;
}

.recent-item__title {
  font-size: var(--md-sys-typescale-title-medium-size);
  font-weight: var(--md-sys-typescale-title-medium-weight);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-item__metadata {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  align-items: center;
  gap: 8px;
}

.recent-item__separator {
  opacity: 0.5;
}
</style>
