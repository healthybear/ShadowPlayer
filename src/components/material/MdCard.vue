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
  elevation?: 0 | 1 | 2 | 3 | 4 | 5
  padding?: string
}

const props = withDefaults(defineProps<Props>(), {
  elevation: 1,
  padding: '16px',
})

const paddingClass = computed(() => {
  return props.padding ? `p-[${props.padding}]` : ''
})
</script>

<style scoped>
.md-card {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}
</style>
