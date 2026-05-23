<!--
  Settings Page (设置页面)

  页面结构：
  - 页面标题
  - 存储管理组件
-->

<script setup lang="ts">
import StorageManager from '@/components/settings/StorageManager.vue'

defineOptions({ name: 'SettingsPageView' })
</script>

<template>
  <div class="settings-page">
    <AppTopNav nav-preset="settings" />

    <main class="settings-page__main">
      <h1 class="settings-page__title">Settings</h1>

      <StorageManager />
    </main>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: var(--md-sys-color-background);
}

.settings-page__main {
  max-width: 900px;
  margin: 0 auto;
  padding: 80px 16px 96px;
}

.settings-page__title {
  margin: 0 0 32px;
  font-size: var(--md-sys-typescale-headline-large-size);
  font-weight: var(--md-sys-typescale-headline-large-weight);
  color: var(--md-sys-color-on-surface);
}
</style>
