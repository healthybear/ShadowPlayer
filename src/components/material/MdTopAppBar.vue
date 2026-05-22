<template>
  <header
    class="md-top-app-bar"
    :class="{ 'md-top-app-bar--scrolled': scrolled }"
  >
    <div class="md-top-app-bar__leading">
      <slot name="leading" />
    </div>
    <div class="md-top-app-bar__title">
      <slot name="title" />
    </div>
    <div class="md-top-app-bar__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  scrolled?: boolean
}

withDefaults(defineProps<Props>(), {
  scrolled: false,
})
</script>

<style scoped>
.md-top-app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-level0);
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  z-index: 1000;
}

.md-top-app-bar--scrolled {
  box-shadow: var(--md-sys-elevation-level2);
}

.md-top-app-bar__leading {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.md-top-app-bar__title {
  flex: 1;
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  line-height: var(--md-sys-typescale-title-large-line-height);
}

.md-top-app-bar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}
</style>
