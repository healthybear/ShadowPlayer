<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, VideoPlay, Clock, Collection, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const navItems = [
  { path: '/', name: 'Home', icon: HomeFilled },
  { path: '/history', name: 'History', icon: Clock },
  { path: '/vocabulary', name: 'Vocabulary', icon: Collection },
  { path: '/settings', name: 'Settings', icon: Setting },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <nav class="app-navbar">
    <div class="navbar-container">
      <div class="navbar-brand" @click="navigateTo('/')">
        <el-icon :size="24"><VideoPlay /></el-icon>
        <span class="brand-text">ShadowPlayer</span>
      </div>

      <div class="navbar-menu">
        <div
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="navigateTo(item.path)"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-text">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.navbar-brand:hover {
  opacity: 0.8;
}

.brand-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.navbar-menu {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--el-text-color-regular);
}

.nav-item:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.nav-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}

.nav-text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
    height: 56px;
  }

  .brand-text {
    display: none;
  }

  .navbar-menu {
    gap: 4px;
  }

  .nav-item {
    padding: 8px 12px;
  }

  .nav-text {
    display: none;
  }
}
</style>
