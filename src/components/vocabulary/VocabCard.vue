<template>
  <MdCard
    :elevation="1"
    class="vocab-card"
    @click="handleClick"
  >
    <div class="vocab-card__word">{{ word }}</div>
    <div class="vocab-card__definition">{{ definition }}</div>
    <div v-if="example" class="vocab-card__example">
      {{ example }}
    </div>
  </MdCard>
</template>

<script setup lang="ts">
import MdCard from '@/components/material/MdCard.vue'
import { useMaterialRipple } from '@/composables/useMaterialRipple'

interface Props {
  word: string
  definition: string
  example?: string
}

withDefaults(defineProps<Props>(), {
  example: '',
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
.vocab-card {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.vocab-card:hover {
  box-shadow: var(--md-sys-elevation-level2);
}

.vocab-card__word {
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 8px;
}

.vocab-card__definition {
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 12px;
  line-height: 1.5;
}

.vocab-card__example {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  font-style: italic;
  padding: 8px 12px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: var(--md-sys-shape-corner-small);
}
</style>
