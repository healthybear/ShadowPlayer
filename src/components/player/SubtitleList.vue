<template>
  <div class="subtitle-list">
    <DynamicScroller
      :items="subtitles"
      :min-item-size="60"
      :buffer="200"
      class="subtitle-list__scroller"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
        >
          <SubtitleListItem
            :time="item.time"
            :text="item.text"
            :translation="item.translation"
            :active="item.id === activeId"
            @click="emit('select', item.id)"
          />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script setup lang="ts">
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import SubtitleListItem from './SubtitleListItem.vue'

interface Subtitle {
  id: string
  time: string
  text: string
  translation: string
}

interface Props {
  subtitles: Subtitle[]
  activeId?: string
}

withDefaults(defineProps<Props>(), {
  activeId: '',
})

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<style scoped>
.subtitle-list {
  height: 100%;
  background-color: var(--md-sys-color-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  overflow: hidden;
}

.subtitle-list__scroller {
  height: 100%;
}
</style>
