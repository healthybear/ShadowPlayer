/**
 * Figma Design Assets Configuration
 *
 * 这个文件提供设计稿中的占位图片 URL。
 * 在实际开发中，这些 URL 应该替换为真实的图片资源。
 *
 * 教学要点：
 * - 使用配置文件集中管理外部资源 URL
 * - 便于后续替换为真实资源
 * - 类型安全的资源引用
 */

export const figmaDesignAssets = {
  // Player 页面资源
  player: {
    // 视频封面图（占位）
    poster: 'https://via.placeholder.com/1280x720/6750A4/FFFFFF?text=Video+Poster',
  },

  // History 页面资源
  history: {
    // 历史记录缩略图（占位）
    thumb1: 'https://via.placeholder.com/320x180/6750A4/FFFFFF?text=Video+1',
    thumb2: 'https://via.placeholder.com/320x180/6750A4/FFFFFF?text=Video+2',
    thumb3: 'https://via.placeholder.com/320x180/6750A4/FFFFFF?text=Video+3',
  },
} as const

// 类型导出，供其他模块使用
export type FigmaDesignAssets = typeof figmaDesignAssets
