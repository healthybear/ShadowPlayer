// API 数据类型定义
// 企业项目经验：集中管理类型定义，确保前后端数据结构一致

export interface VocabularyWord {
  id: string
  word: string
  definition: string
  example: string
  createdAt: string
}

export interface VideoItem {
  id: string
  title: string
  duration: string
  date: string
  thumb: string
  progress: number
}

export interface Subtitle {
  id: string
  time: string
  text: string
  translation: string
}

export interface PlayerState {
  videoId: string
  poster: string
  subtitles: Subtitle[]
}
