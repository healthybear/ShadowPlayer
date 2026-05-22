<template>
  <MdCard
    :elevation="2"
    class="upload-card"
  >
    <div class="upload-card__content">
      <el-icon class="upload-card__icon" :size="64">
        <Upload />
      </el-icon>
      <div class="upload-card__title">上传视频</div>
      <div class="upload-card__description">
        支持 MP4、MKV、AVI 等格式
      </div>
    </div>
    <MdFab
      class="upload-card__fab"
      @click="emit('upload')"
    >
      <el-icon :size="24">
        <Plus />
      </el-icon>
    </MdFab>
  </MdCard>
</template>

<script setup lang="ts">
import MdCard from '@/components/material/MdCard.vue'
import MdFab from '@/components/material/MdFab.vue'

const emit = defineEmits<{
  upload: []
}>()
</script>

<style scoped>
.upload-card {
  position: relative;
  border-radius: var(--md-sys-shape-corner-extra-large) !important;
  padding: 48px 24px !important;
  text-align: center;
}

.upload-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-card__icon {
  color: var(--md-sys-color-primary);
  margin-bottom: 16px;
}

.upload-card__title {
  font-size: var(--md-sys-typescale-headline-small-size);
  font-weight: var(--md-sys-typescale-headline-small-weight);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 8px;
}

.upload-card__description {
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
}

.upload-card__fab {
  position: absolute;
  bottom: 16px;
  right: 16px;
}
</style>
