<!--
  Subtitle Uploader Component (字幕上传组件)

  功能：
  - 上传字幕文件（SRT, VTT 格式）
  - 文件验证和解析
  - 错误处理

  企业项目经验：
  - 字幕上传应该简单快捷，不需要复杂的拖拽区域
  - 立即解析并验证字幕格式，给用户即时反馈
  - 解析失败时提供清晰的错误信息
-->

<template>
  <div class="subtitle-uploader">
    <el-button
      type="primary"
      :icon="uploading ? 'Loading' : 'Upload'"
      :loading="uploading"
      @click="handleClick"
    >
      {{ uploading ? 'Uploading...' : 'Upload Subtitle' }}
    </el-button>

    <!-- 隐藏的文件输入框 -->
    <!--
      为什么使用隐藏的 input？
      - 原生 <input type="file"> 样式难以定制
      - 通过 ref 调用 click() 触发文件选择器
      - accept 属性限制文件类型

      企业项目经验：
      - 自定义上传 UI 时，仍然使用原生 input 作为底层
      - .srt 和 .vtt 是最常见的字幕格式
    -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".srt,.vtt"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { parseSRT, parseVTT } from '@/utils/subtitle-parser'
import { db } from '@/db/schema'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  videoId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  uploaded: [subtitleId: string]
}>()

const fileInputRef = ref<HTMLInputElement>()
const uploading = ref(false)

// 点击按钮时触发文件选择器
function handleClick() {
  if (uploading.value) return
  fileInputRef.value?.click()
}

// 文件选择后的处理
async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  uploading.value = true

  try {
    // 验证文件类型
    // 企业项目经验：
    // - 前端验证文件扩展名，避免用户选择错误文件
    // - 后续还要验证文件内容，确保格式正确
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension !== 'srt' && extension !== 'vtt') {
      throw new Error('Unsupported subtitle format. Please select SRT or VTT files.')
    }

    // 读取文件内容
    const content = await readFileAsText(file)

    // 解析字幕
    // 企业项目经验：
    // - 解析失败时抛出错误，让用户知道文件格式有问题
    // - 不同格式使用不同的解析器
    let entries
    if (extension === 'srt') {
      entries = parseSRT(content)
    } else {
      entries = parseVTT(content)
    }

    // 验证解析结果
    if (!entries || entries.length === 0) {
      throw new Error('No subtitle entries found. The file may be empty or corrupted.')
    }

    // 保存到数据库
    // 企业项目经验：
    // - 字幕与视频关联，通过 videoId 建立关系
    // - 存储原始文件名，方便用户识别
    const subtitleId = uuidv4()
    await db.subtitles.add({
      id: subtitleId,
      videoId: props.videoId,
      filename: file.name,
      language: detectLanguage(file.name), // 从文件名推测语言
      entries,
      uploadedAt: Date.now()
    })

    ElMessage.success({
      message: `Subtitle uploaded successfully! (${entries.length} entries)`,
      duration: 2000
    })

    // 通知父组件
    emit('uploaded', subtitleId)

  } catch (error) {
    console.error('Subtitle upload failed:', error)
    ElMessage.error({
      message: error instanceof Error ? error.message : 'Failed to upload subtitle',
      duration: 3000
    })
  } finally {
    uploading.value = false
    // 清空 input value，允许重复选择同一文件
    input.value = ''
  }
}

// 读取文件内容为文本
// 企业项目经验：
// - 使用 Promise 包装 FileReader，让代码更简洁
// - 字幕文件通常很小（< 1MB），可以一次性读取
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file, 'UTF-8')
  })
}

// 从文件名推测语言
// 企业项目经验：
// - 字幕文件名通常包含语言代码（如 movie.en.srt, movie.zh.srt）
// - 这是一个简单的启发式方法，不保证 100% 准确
function detectLanguage(filename: string): string {
  const lower = filename.toLowerCase()

  if (lower.includes('.en.') || lower.includes('english')) return 'en'
  if (lower.includes('.zh.') || lower.includes('chinese')) return 'zh'
  if (lower.includes('.ja.') || lower.includes('japanese')) return 'ja'
  if (lower.includes('.ko.') || lower.includes('korean')) return 'ko'
  if (lower.includes('.es.') || lower.includes('spanish')) return 'es'
  if (lower.includes('.fr.') || lower.includes('french')) return 'fr'

  // 默认返回 'unknown'
  return 'unknown'
}
</script>

<style scoped>
.subtitle-uploader {
  display: inline-block;
}
</style>
