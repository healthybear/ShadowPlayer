const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/x-matroska']
const SUPPORTED_EXTENSIONS = ['.mp4', '.webm', '.mkv']
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2GB

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateVideoFile(file: File): ValidationResult {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Unsupported file format. Please select MP4, WebM, or MKV files.'
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 2GB limit. Please select a smaller file.'
    }
  }

  if (file.type && !SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: 'File MIME type does not match extension. The file may be corrupted.'
    }
  }

  return { valid: true }
}

export function validateSubtitleFile(file: File): ValidationResult {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

  if (extension !== '.srt' && extension !== '.vtt') {
    return {
      valid: false,
      error: 'Unsupported subtitle format. Please upload SRT or VTT files.'
    }
  }

  return { valid: true }
}

export async function extractVideoMetadata(file: File): Promise<{
  duration: number
  width: number
  height: number
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      })
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Unable to process video file. The file may be corrupted.'))
    }

    video.src = URL.createObjectURL(file)
  })
}
