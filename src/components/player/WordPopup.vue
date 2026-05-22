<template>
  <Transition name="md-scale">
    <MdCard
      v-if="visible"
      :elevation="3"
      class="word-popup"
    >
      <div class="word-popup__word">{{ word }}</div>
      <div class="word-popup__pronunciation">{{ pronunciation }}</div>
      <div class="word-popup__definition">{{ definition }}</div>
    </MdCard>
  </Transition>
</template>

<script setup lang="ts">
import MdCard from '@/components/material/MdCard.vue'

interface Props {
  visible: boolean
  word: string
  pronunciation?: string
  definition: string
}

withDefaults(defineProps<Props>(), {
  pronunciation: '',
})
</script>

<style scoped>
.word-popup {
  position: fixed;
  bottom: 35%;
  left: calc(50% + 64px);
  width: 256px;
  z-index: 1000;
}

.word-popup__word {
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 4px;
}

.word-popup__pronunciation {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 12px;
}

.word-popup__definition {
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface);
  line-height: 1.5;
}
</style>
