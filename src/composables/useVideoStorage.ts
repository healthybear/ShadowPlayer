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

      uploadStage.value = 'Storing file...'
      uploadProgress.value = 60

      const video: Video = {
        id: uuidv4(),
        filename: file.name,
        size: file.size,
        duration: metadata.duration,
        storageType: fileHandle ? 'file-handle' : 'blob',
        uploadedAt: Date.now()
      }

      if (fileHandle) {
        video.fileHandle = fileHandle
      } else {
        video.blob = file
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
    if (video.storageType === 'blob' && video.blob) {
      return video.blob
    }

    if (video.storageType === 'file-handle' && video.fileHandle) {
      try {
        const file = await video.fileHandle.getFile()
        return file
      } catch (error) {
        console.error('Failed to access file handle:', error)
        throw new Error('Cannot access video file. The file may have been moved, deleted, or is on a disconnected network drive. Please re-upload the video.')
      }
    }

    throw new Error('Video file not found in storage')
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
