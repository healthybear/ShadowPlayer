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
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { createRipple } = useMaterialRipple()

const handleClick = (event: MouseEvent) => {
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
  border-radius: 50%;
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

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

.md-fab:active {
  box-shadow: var(--md-sys-elevation-level3);
}

.md-fab:active::before {
  opacity: 0.12;
}
</style>
