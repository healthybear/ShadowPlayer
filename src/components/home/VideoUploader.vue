<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useVideoStorage } from '@/composables/useVideoStorage'

const router = useRouter()
const { uploading, uploadProgress, uploadStage, uploadVideo, isFileSystemAccessSupported } = useVideoStorage()

const dragOver = ref(false)

/**
 * 处理拖放上传
 *
 * 企业项目经验：
 * - 拖放上传无法获取 fileHandle，因为不是用户直接点击
 * - 但我们强制要求 fileHandle，所以拖放后需要再次请求用户选择
 * - 这是 File System Access API 的限制
 */
function handleDrop(event: DragEvent) {
  dragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    if (file) {
      // 拖放的文件无法获取 fileHandle，提示用户点击上传
      ElMessage.warning({
        message: 'Please click to select the file to enable file access',
        duration: 3000
      })
    }
  }
}

/**
 * 打开文件选择器并上传
 *
 * 企业项目经验：
 * - showOpenFilePicker 必须在用户手势（点击）的直接调用栈中执行
 * - 不能在 <input type="file"> 的 change 事件中调用
 * - 直接在按钮点击时调用，确保符合浏览器安全策略
 */
async function openFilePicker() {
  try {
    // 检查浏览器支持
    if (!isFileSystemAccessSupported()) {
      throw new Error('Your browser does not support File System Access API. Please use Chrome, Edge, or Opera.')
    }

    // 打开文件选择器
    // 企业项目经验：
    // - showOpenFilePicker 返回 fileHandle 和 file
    // - fileHandle 是持久引用，file 是当前内容
    // - 我们需要同时保存两者
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'Video files',
        accept: {
          'video/*': ['.mp4', '.webm', '.mkv', '.avi', '.mov']
        }
      }],
      multiple: false
    })

    // 获取文件内容
    const file = await fileHandle.getFile()

    // 上传视频
    const video = await uploadVideo(file, fileHandle)

    ElMessage.success({
      message: 'Upload successful!',
      duration: 2000
    })

    // 跳转到播放页面
    setTimeout(() => {
      router.push(`/player/${video.id}`)
    }, 500)

  } catch (error) {
    // 用户取消选择
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }

    // 其他错误
    console.error('Upload failed:', error)
    ElMessage.error({
      message: error instanceof Error ? error.message : 'Upload failed',
      duration: 3000
    })
  }
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
        <p class="primary-text">Click to select video file</p>
        <p class="secondary-text">File System Access API required</p>
      </div>
      <div class="supported-formats">
        <p>Supports MP4, WebM, MKV, AVI, MOV</p>
        <p>Only stores file reference (no storage space used)</p>
      </div>
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
