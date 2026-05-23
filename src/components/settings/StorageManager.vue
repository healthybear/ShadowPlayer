<!--
  Storage Manager Component (存储管理组件)

  功能：
  - 显示存储使用情况
  - 导出数据（下载 JSON 文件）
  - 导入数据（上传 JSON 文件）
  - 清空所有数据

  企业项目经验：
  - 危险操作（清空）需要二次确认
  - 显示操作进度和结果反馈
  - 错误处理和用户提示
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { downloadExportedData, importData, clearAllData, getStorageStats } from '@/storage/manager'
import type { StorageStats } from '@/storage/types'

defineOptions({ name: 'StorageManager' })

const stats = ref<StorageStats | null>(null)
const loading = ref(false)
const fileInputRef = ref<HTMLInputElement>()

// 加载存储统计信息
const loadStats = async () => {
  try {
    stats.value = await getStorageStats()
  }
  catch (error) {
    console.error('Failed to load stats:', error)
  }
}

onMounted(() => {
  loadStats()
})

/**
 * 导出数据
 */
const handleExport = async () => {
  loading.value = true
  try {
    await downloadExportedData()
    ElMessage.success('数据导出成功')
  }
  catch (error) {
    ElMessage.error('导出失败：' + (error as Error).message)
  }
  finally {
    loading.value = false
  }
}

/**
 * 导入数据
 */
const handleImport = () => {
  // 触发文件选择
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件类型
  if (!file.name.endsWith('.json')) {
    ElMessage.error('请选择 JSON 文件')
    return
  }

  // 确认导入
  try {
    await ElMessageBox.confirm(
      '导入数据将覆盖现有数据，是否继续？',
      '确认导入',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  }
  catch {
    // 用户取消
    return
  }

  loading.value = true
  try {
    await importData(file, true)
    ElMessage.success('数据导入成功')
    // 刷新统计信息
    await loadStats()
    // 刷新页面以重新加载数据
    window.location.reload()
  }
  catch (error) {
    ElMessage.error('导入失败：' + (error as Error).message)
  }
  finally {
    loading.value = false
    // 清空文件选择
    if (target) target.value = ''
  }
}

/**
 * 清空所有数据
 */
const handleClear = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除所有数据，无法恢复。是否继续？',
      '危险操作',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger',
      },
    )
  }
  catch {
    // 用户取消
    return
  }

  loading.value = true
  try {
    await clearAllData()
    ElMessage.success('数据已清空')
    // 刷新统计信息
    await loadStats()
    // 刷新页面
    window.location.reload()
  }
  catch (error) {
    ElMessage.error('清空失败：' + (error as Error).message)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="storage-manager">
    <h2 class="storage-manager__title">数据管理</h2>
    <p class="storage-manager__description">
      管理您的本地数据，包括词汇表、历史记录和播放进度
    </p>

    <!-- 存储统计 -->
    <div v-if="stats" class="storage-manager__stats">
      <div class="stat-item">
        <span class="stat-label">词汇数量</span>
        <span class="stat-value">{{ stats.vocabularyCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">历史记录</span>
        <span class="stat-value">{{ stats.historyCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">播放进度</span>
        <span class="stat-value">{{ stats.playerProgressCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">存储大小</span>
        <span class="stat-value">{{ stats.estimatedSize }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="storage-manager__actions">
      <el-button
        type="primary"
        :loading="loading"
        @click="handleExport"
      >
        <el-icon class="mr-2"><Download /></el-icon>
        导出数据
      </el-button>

      <el-button
        :loading="loading"
        @click="handleImport"
      >
        <el-icon class="mr-2"><Upload /></el-icon>
        导入数据
      </el-button>

      <el-button
        type="danger"
        plain
        :loading="loading"
        @click="handleClear"
      >
        <el-icon class="mr-2"><Delete /></el-icon>
        清空数据
      </el-button>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileChange"
    >

    <!-- 说明文字 -->
    <div class="storage-manager__help">
      <h3>使用说明</h3>
      <ul>
        <li><strong>导出数据：</strong>将所有数据保存为 JSON 文件，可用于备份或迁移</li>
        <li><strong>导入数据：</strong>从之前导出的 JSON 文件恢复数据</li>
        <li><strong>清空数据：</strong>删除所有本地数据，此操作不可恢复</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.storage-manager {
  max-width: 800px;
  margin: 0 auto;
}

.storage-manager__title {
  margin: 0 0 8px;
  font-size: var(--md-sys-typescale-headline-medium-size);
  font-weight: var(--md-sys-typescale-headline-medium-weight);
  color: var(--md-sys-color-on-surface);
}

.storage-manager__description {
  margin: 0 0 24px;
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
}

/* 统计信息网格 */
.storage-manager__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: var(--md-sys-shape-corner-medium);
}

.stat-label {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
}

.stat-value {
  font-size: var(--md-sys-typescale-headline-small-size);
  font-weight: var(--md-sys-typescale-headline-small-weight);
  color: var(--md-sys-color-on-surface);
}

/* 操作按钮 */
.storage-manager__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
}

/* 帮助文字 */
.storage-manager__help {
  padding: 16px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: var(--md-sys-shape-corner-medium);
}

.storage-manager__help h3 {
  margin: 0 0 12px;
  font-size: var(--md-sys-typescale-title-medium-size);
  font-weight: var(--md-sys-typescale-title-medium-weight);
  color: var(--md-sys-color-on-surface);
}

.storage-manager__help ul {
  margin: 0;
  padding-left: 20px;
}

.storage-manager__help li {
  margin-bottom: 8px;
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.5;
}

.storage-manager__help strong {
  color: var(--md-sys-color-on-surface);
}
</style>
