<script setup lang="ts">
import { ref } from 'vue'
import { Search, Sort, Delete } from '@element-plus/icons-vue'

interface Props {
  totalCount: number
  selectedCount?: number
}

defineProps<Props>()

const emit = defineEmits<{
  search: [keyword: string]
  sort: [type: 'date' | 'name' | 'duration']
  deleteSelected: []
  clearSelection: []
}>()

const searchKeyword = ref('')
const sortType = ref<'date' | 'name' | 'duration'>('date')

function handleSearch() {
  emit('search', searchKeyword.value)
}

function handleSort(type: 'date' | 'name' | 'duration') {
  sortType.value = type
  emit('sort', type)
}

function handleDeleteSelected() {
  emit('deleteSelected')
}

function handleClearSelection() {
  emit('clearSelection')
}
</script>

<template>
  <div class="video-toolbar">
    <div class="toolbar-left">
      <el-input
        v-model="searchKeyword"
        :prefix-icon="Search"
        placeholder="Search videos..."
        clearable
        @input="handleSearch"
        @clear="handleSearch"
      />

      <el-dropdown @command="handleSort">
        <el-button :icon="Sort">
          Sort by: {{ sortType === 'date' ? 'Date' : sortType === 'name' ? 'Name' : 'Duration' }}
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="date">Upload Date</el-dropdown-item>
            <el-dropdown-item command="name">File Name</el-dropdown-item>
            <el-dropdown-item command="duration">Duration</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="toolbar-right">
      <span class="video-count">{{ totalCount }} videos</span>

      <template v-if="selectedCount && selectedCount > 0">
        <span class="selected-count">{{ selectedCount }} selected</span>
        <el-button type="danger" :icon="Delete" @click="handleDeleteSelected">
          Delete Selected
        </el-button>
        <el-button @click="handleClearSelection">
          Clear Selection
        </el-button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.video-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 300px;
}

.toolbar-left .el-input {
  max-width: 300px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.selected-count {
  font-size: 14px;
  color: var(--el-color-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .video-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
    min-width: auto;
  }

  .toolbar-left .el-input {
    max-width: none;
  }

  .toolbar-right {
    justify-content: space-between;
  }
}
</style>
