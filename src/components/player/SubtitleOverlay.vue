<template>
  <div class="subtitle-overlay">
    <div class="subtitle-overlay__text">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text: string
}

defineProps<Props>()
</script>

<style scoped>
.subtitle-overlay {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 16px;
  pointer-events: none;
}

.subtitle-overlay__text {
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  border-radius: var(--md-sys-shape-corner-small);
  max-width: 80%;
  text-align: center;
}
</style>
