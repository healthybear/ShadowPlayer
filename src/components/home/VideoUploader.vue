<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useVideoStorage } from '@/composables/useVideoStorage'

const router = useRouter()
const { uploading, uploadProgress, uploadStage, uploadVideo } = useVideoStorage()

const dragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
}

function handleDrop(event: DragEvent) {
  dragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFile(event.dataTransfer.files[0])
  }
}

async function processFile(file: File) {
  try {
    // 尝试使用 File System Access API 获取文件引用
    let fileHandle: FileSystemFileHandle | undefined

    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Video files',
            accept: { 'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'] }
          }],
          multiple: false
        })
        fileHandle = handle
        const handleFile = await handle.getFile()
        const video = await uploadVideo(handleFile, fileHandle)

        ElMessage.success({
          message: 'Upload successful!',
          duration: 2000
        })

        setTimeout(() => {
          router.push(`/player/${video.id}`)
        }, 500)
        return
      } catch (err) {
        // 用户取消或不支持，继续使用原始 file
        console.warn('File System Access API failed, using blob storage:', err)
      }
    }

    // 降级方案：保存完整文件内容
    const video = await uploadVideo(file)
    ElMessage.success({
      message: 'Upload successful!',
      duration: 2000
    })

    setTimeout(() => {
      router.push(`/player/${video.id}`)
    }, 500)
  } catch (error) {
    ElMessage.error({
      message: error instanceof Error ? error.message : 'Upload failed',
      duration: 3000
    })
  }
}

function openFilePicker() {
  fileInputRef.value?.click()
}
</script>

<template>
  <div class="video-uploader">
    <div
      v-if="!uploading"
      class="upload-area"
      :class="{ 'drag-over': dragOver }"
      @click="openFilePicker"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="handleDrop"
    >
      <div class="upload-icon">📁</div>
      <div class="upload-text">
        <p class="primary-text">Drag & drop video file here</p>
        <p class="secondary-text">or click to select</p>
      </div>
      <div class="supported-formats">
        <p>Supports MP4, WebM, MKV</p>
        <p>Maximum 2GB</p>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept="video/mp4,video/webm,video/x-matroska"
        style="display: none"
        @change="handleFileSelect"
      >
    </div>

    <div v-else class="upload-progress">
      <div class="progress-icon">⏳</div>
      <div class="progress-info">
        <p class="progress-stage">{{ uploadStage }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
        <p class="progress-percentage">{{ uploadProgress }}%</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--el-bg-color);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.upload-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.upload-text .primary-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.upload-text .secondary-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 24px;
}

.supported-formats {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.supported-formats p {
  margin: 4px 0;
}

.upload-progress {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
  background: var(--el-bg-color);
}

.progress-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.progress-info {
  max-width: 400px;
  margin: 0 auto;
}

.progress-stage {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--el-fill-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--el-color-primary);
  transition: width 0.3s;
}

.progress-percentage {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
