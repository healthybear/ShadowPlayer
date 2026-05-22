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
