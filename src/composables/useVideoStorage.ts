import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { db, type Video } from '@/db/schema'
import { validateVideoFile, extractVideoMetadata } from '@/utils/video-validator'

const SMALL_FILE_THRESHOLD = 50 * 1024 * 1024 // 50MB

export function useVideoStorage() {
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const uploadStage = ref('')

  function isFileSystemAccessSupported(): boolean {
    return 'showOpenFilePicker' in window
  }

  async function uploadVideo(file: File, fileHandle?: FileSystemFileHandle): Promise<Video> {
    uploading.value = true
    uploadProgress.value = 0

    try {
      uploadStage.value = 'Validating file...'
      uploadProgress.value = 10

      const validation = validateVideoFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      uploadStage.value = 'Extracting metadata...'
      uploadProgress.value = 30

      const metadata = await extractVideoMetadata(file)

      uploadStage.value = 'Storing file reference...'
      uploadProgress.value = 60

      // 企业项目经验：
      // - 大文件不应该存储在 IndexedDB 中
      // - 只存储文件句柄（引用），不占用存储空间
      // - 如果没有 fileHandle，说明浏览器不支持 File System Access API
      if (!fileHandle) {
        throw new Error('File handle is required. Please use a browser that supports File System Access API.')
      }

      const video: Video = {
        id: uuidv4(),
        filename: file.name,
        size: file.size,
        duration: metadata.duration,
        storageType: 'file-handle',
        fileHandle: fileHandle,
        uploadedAt: Date.now()
      }

      uploadProgress.value = 80

      await db.videos.add(video)

      uploadProgress.value = 100
      uploadStage.value = 'Complete'

      return video
    } catch (error) {
      throw error
    } finally {
      uploading.value = false
    }
  }

  async function getVideo(id: string): Promise<Video | undefined> {
    return await db.videos.get(id)
  }

  async function getVideoBlob(video: Video): Promise<Blob | null> {
    // 企业项目经验：
    // - 只支持 file-handle 模式，不再支持 blob 模式
    // - 这样可以避免大文件占用 IndexedDB 存储空间
    if (video.storageType === 'file-handle' && video.fileHandle) {
      try {
        // 检查文件访问权限
        // 注意：queryPermission 和 requestPermission 是 File System Access API 的方法
        // TypeScript 类型定义可能不完整，使用 any 断言
        const handle = video.fileHandle as any
        const permission = await handle.queryPermission({ mode: 'read' })

        if (permission === 'denied') {
          throw new Error('File access permission denied. Please re-upload the video.')
        }

        // 如果权限是 'prompt'，请求用户授权
        if (permission === 'prompt') {
          const newPermission = await handle.requestPermission({ mode: 'read' })
          if (newPermission === 'denied') {
            throw new Error('File access permission denied. Please re-upload the video.')
          }
        }

        // 权限已授予，读取文件
        const file = await video.fileHandle.getFile()
        return file
      } catch (error) {
        console.error('Failed to access file handle:', error)

        // 如果是权限错误，给出更友好的提示
        if (error instanceof Error && error.message.includes('permission')) {
          throw error
        }

        // 其他错误（文件不存在、网络驱动器断开等）
        throw new Error('Cannot access video file. The file may have been moved, deleted, or is on a disconnected network drive. Please re-upload the video.')
      }
    }

    throw new Error('Video file not found in storage. Please re-upload the video.')
  }

  async function getAllVideos(): Promise<Video[]> {
    return await db.videos.orderBy('uploadedAt').reverse().toArray()
  }

  async function getRecentVideos(limit: number = 10): Promise<Video[]> {
    return await db.videos
      .orderBy('lastPlayedAt')
      .reverse()
      .limit(limit)
      .toArray()
  }

  async function deleteVideo(id: string): Promise<void> {
    await db.videos.delete(id)
    await db.subtitles.where('videoId').equals(id).delete()
    await db.progress.delete(id)
  }

  async function updateLastPlayed(id: string): Promise<void> {
    await db.videos.update(id, { lastPlayedAt: Date.now() })
  }

  return {
    uploading,
    uploadProgress,
    uploadStage,
    uploadVideo,
    getVideo,
    getVideoBlob,
    getAllVideos,
    getRecentVideos,
    deleteVideo,
    updateLastPlayed,
    isFileSystemAccessSupported
  }
}
