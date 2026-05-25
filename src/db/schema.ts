import Dexie, { type EntityTable } from 'dexie'

export interface Video {
  id: string
  filename: string
  size: number
  duration: number
  storageType: 'blob' | 'file-handle'
  blob?: Blob
  fileHandle?: FileSystemFileHandle
  uploadedAt: number
  lastPlayedAt?: number
  thumbnailUrl?: string
}

export interface SubtitleEntry {
  index: number
  startTime: number
  endTime: number
  text: string
}

export interface Subtitle {
  id: string
  videoId: string
  filename: string
  language: string
  entries: SubtitleEntry[]
  uploadedAt: number
}

export interface PlaybackProgress {
  videoId: string
  currentTime: number
  duration: number
  percentage: number
  lastPlayedAt: number
  completed: boolean
}

export interface VocabularyItem {
  id: string
  word: string
  translation?: string
  pronunciation?: string
  definition?: string
  videoId?: string
  subtitleId?: string
  createdAt: number
}

export class ShadowPlayerDB extends Dexie {
  videos!: EntityTable<Video, 'id'>
  subtitles!: EntityTable<Subtitle, 'id'>
  progress!: EntityTable<PlaybackProgress, 'videoId'>
  vocabulary!: EntityTable<VocabularyItem, 'id'>

  constructor() {
    super('ShadowPlayerDB')
    this.version(1).stores({
      videos: 'id, uploadedAt, lastPlayedAt',
      subtitles: 'id, videoId, uploadedAt',
      progress: 'videoId, lastPlayedAt'
    })
    this.version(2).stores({
      videos: 'id, uploadedAt, lastPlayedAt',
      subtitles: 'id, videoId, uploadedAt',
      progress: 'videoId, lastPlayedAt',
      vocabulary: 'id, word, videoId, createdAt'
    })
  }
}

export const db = new ShadowPlayerDB()
