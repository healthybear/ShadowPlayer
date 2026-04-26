/**
 * Figma Desktop MCP 导出的静态资源 URL。
 * 图片由本地 Figma 插件服务提供；未启动 Figma 时缩略图可能无法显示。
 */
const B = 'http://localhost:3845/assets/'

export const figmaDesignAssets = {
  /** Header 1:73 右侧 36px 用户按钮 */
  headerProfile: `${B}cf6aaa5557d414d6d9a8c0551dc3862bc622c3dd.svg`,
  home: {
    thumb1: `${B}1bdd66a46bd4b26f357918e31c68b56761dd1937.png`,
    thumb2: `${B}278531f2b45b6544555b44f4e87029ab1db08c9d.png`,
    thumb3: `${B}91f99b1c40e646d3904f472371276efcb0b1e9c1.png`,
  },
  player: {
    poster: `${B}c87733fdd812d4897631518d8adadac2bdb4237f.png`,
  },
  history: {
    thumb1: `${B}91eabbc8f89bc979f1663c7c997cc62b08a1cb9a.png`,
    thumb2: `${B}09f881171976cb8586e2bfb455e3dc34d1d805e8.png`,
    thumb3: `${B}bbd3fcd386adba9e1366a43aad7284abfafd230f.png`,
  },
} as const
