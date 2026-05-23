<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import AppNavbar from '@/components/layout/AppNavbar.vue'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="app-layout">
      <AppNavbar />
      <main class="app-main">
        <RouterView />
      </main>
    </div>
  </el-config-provider>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.app-main {
  flex: 1;
  overflow-y: auto;
}
</style>
