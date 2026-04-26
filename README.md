# ShadowPlayer

一款纯本地运行的语言学习辅助工具，通过播放本地视频 + 字幕精听跟读，帮助你高效学习外语。

> 所有数据保存在浏览器本地，不上传任何文件或记录。

## 功能特性

- **本地视频播放** — 选择本地视频文件或目录，自动识别同目录字幕（`.srt` / `.ass`）
- **4 种字幕模式** — 隐藏 / 仅目标语言 / 仅中文 / 双语切换
- **精听练习** — 单句循环、AB 复读、播放速度调节
- **生词标注** — 点击字幕单词即可查词，支持生词本收藏
- **进度记忆** — 自动保存播放进度，支持断点续播
- **历史记录** — 自动记录观看历史，随时继续

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite |
| UI | Element Plus |
| 状态管理 | Pinia |
| 原子化 CSS | UnoCSS |
| 数据请求 | TanStack Vue Query |

## 开发环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- pnpm

## 快速开始

```sh
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查 + 生产构建
pnpm build

# 预览构建产物
pnpm preview
```

## 常用命令

```sh
pnpm dev          # 启动开发服务器（HMR）
pnpm build        # 类型检查 + 生产构建
pnpm build-only   # 仅构建，跳过类型检查
pnpm type-check   # 仅执行类型检查
pnpm lint         # oxlint + ESLint 检查并修复
pnpm format       # oxfmt 格式化 src/ 目录
```

## IDE 推荐配置

[VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件（请禁用 Vetur）。

## 项目文档

详细架构约定见 [openspec/project.md](openspec/project.md)。
