<!--
  Settings Page (设置页面)

  页面结构：
  - 页面标题
  - 存储管理组件
-->

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { downloadExportedData, clearAllData, getStorageStats } from '@/storage/manager'
import type { StorageStats } from '@/storage/types'

defineOptions({ name: 'SettingsPageView' })

const stats = ref<StorageStats | null>(null)
const loading = ref(false)

async function loadStats() {
  try {
    stats.value = await getStorageStats()
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

async function handleExport() {
  loading.value = true
  try {
    await downloadExportedData()
    ElMessage.success('Data exported successfully')
  } catch (error) {
    ElMessage.error('Failed to export data')
  } finally {
    loading.value = false
  }
}

async function handleClearData() {
  try {
    await ElMessageBox.confirm(
      'This will delete all your data including videos, vocabulary, and progress. This action cannot be undone.',
      'Clear All Data',
      {
        confirmButtonText: 'Clear All',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    loading.value = true
    await clearAllData()
    await loadStats()
    ElMessage.success('All data cleared')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to clear data')
    }
  } finally {
    loading.value = false
  }
}

loadStats()
</script>

<template>
  <div class="settings-page">
    <div class="settings-container">
      <div class="settings-header">
        <h1>Settings</h1>
        <p class="subtitle">Manage your app settings and data</p>
      </div>

      <div class="settings-section">
        <h2>Storage Management</h2>

        <div v-if="stats" class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Vocabulary</div>
            <div class="stat-value">{{ stats.vocabularyCount }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">History</div>
            <div class="stat-value">{{ stats.historyCount }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Progress Records</div>
            <div class="stat-value">{{ stats.playerProgressCount }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Subtitles</div>
            <div class="stat-value">{{ stats.subtitlesCount }}</div>
          </div>

          <div class="stat-card full-width">
            <div class="stat-label">Estimated Storage</div>
            <div class="stat-value">{{ stats.estimatedSize }}</div>
          </div>
        </div>

        <div class="actions">
          <el-button
            type="primary"
            :loading="loading"
            @click="handleExport"
          >
            Export Data
          </el-button>

          <el-button
            type="danger"
            :loading="loading"
            @click="handleClearData"
          >
            Clear All Data
          </el-button>
        </div>
      </div>

      <div class="settings-section">
        <h2>About</h2>
        <div class="about-content">
          <p><strong>ShadowPlayer</strong></p>
          <p>A video-based language learning tool with shadowing practice.</p>
          <p class="version">Version 1.0.0</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: calc(100vh - 64px);
  background: var(--el-bg-color);
}

.settings-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

.settings-header {
  margin-bottom: 48px;
}

.settings-header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.settings-section {
  margin-bottom: 48px;
  padding: 24px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.settings-section h2 {
  margin: 0 0 24px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
  text-align: center;
}

.stat-card.full-width {
  grid-column: 1 / -1;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.about-content {
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.about-content p {
  margin: 8px 0;
}

.version {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 16px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .actions .el-button {
    width: 100%;
  }
}
</style>
