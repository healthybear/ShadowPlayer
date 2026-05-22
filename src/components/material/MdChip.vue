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

const emit = defineEmits<{
  'update:selected': [value: boolean]
}>()

const { createRipple } = useMaterialRipple()

const handleClick = (event: MouseEvent) => {
  createRipple(event, event.currentTarget as HTMLElement)
  emit('update:selected', !event.currentTarget.classList.contains('md-chip--selected'))
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
  border: 1px solid var(--md-sys-color-outline);
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
}

.md-chip--selected {
  border-color: transparent;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

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
