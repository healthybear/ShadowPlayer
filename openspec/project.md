# ShadowPlayer 项目上下文

## 项目概述

ShadowPlayer 是一个纯本地运行的语言学习辅助工具，基于 Vue 3 + Element Plus 单体前端应用构建，采用 Vite + TypeScript 严格模式开发，不依赖任何后端服务，所有数据存储于浏览器本地（IndexedDB / localStorage）。

核心场景：用户选择本地视频文件 → 自动识别同目录字幕（.srt / .ass）→ 通过字幕切换模式（隐藏 / 仅目标语言 / 仅中文 / 双语）辅助跟读和精听 → 支持调速、单句循环、AB 复读、生词标注与点击查词，播放进度和历史记录自动保存、支持断点续播。技术方案为：组件自动导入（unplugin）+ 原子化 CSS（UnoCSS）+ 客户端状态管理（Pinia）+ TanStack Query 用于本地数据读写封装。

## 技术栈

| 类别 | 技术 | 版本 |
| --- | --- | --- |
| 核心框架 | Vue 3 | ^3.5 |
| 语言 | TypeScript | ~6.0 |
| 构建工具 | Vite | ^8.0 |
| 包管理 | pnpm | - |
| UI 组件库 | Element Plus（中文 locale，暗色模式已接入） | ^2.13 |
| 图标 | @element-plus/icons-vue（全局注册） | ^2.3 |
| 状态管理 | Pinia（Setup Store 写法） | ^3.0 |
| 路由 | Vue Router（Web History 模式） | ^5.0 |
| 服务端状态 | TanStack Vue Query | ^5 |
| HTTP 请求 | Axios，封装于 `src/utils/request.js` | ^1 |
| 工具函数 | VueUse / lodash-es / dayjs | ^14 / ^4 / ^1 |
| 原子化 CSS | UnoCSS（presetWind4 + presetAttributify） | ^66 |
| 自动导入 | unplugin-auto-import（Vue/VueRouter/Pinia API） | ^21 |
| 组件按需引入 | unplugin-vue-components（Element Plus Resolver） | ^32 |
| Lint | ESLint ^10 + oxlint ~1.60（双引擎，oxlint 优先） | - |
| 格式化 | oxfmt（Prettier 已禁用） | ^0.45 |
| 类型检查 | vue-tsc | ^3.2 |
| Node.js | `^20.19.0 \|\| >=22.12.0` | - |

## 仓库结构

```
shadowplayer/                  # 单体应用根目录
├── src/
│   ├── assets/                # 静态资源（全局 CSS、图片）
│   ├── components/            # 跨模块公共组件（自动按需引入）
│   │   └── icons/             # 纯图标组件
│   ├── router/
│   │   └── index.ts           # 路由定义与注册，导出 router 实例
│   ├── stores/                # Pinia store（Setup Store 写法）
│   ├── styles/
│   │   └── element/
│   │       └── index.scss     # Element Plus 主题变量覆盖
│   ├── utils/
│   │   └── request.js         # Axios 封装实例（baseURL: /api）
│   ├── views/                 # 页面级组件（按功能模块组织）
│   │   ├── player/            # 核心播放器页面（视频播放、字幕控制、AB复读）
│   │   ├── history/           # 历史记录页面
│   │   └── vocabulary/        # 生词本页面
│   ├── App.vue                # 根组件，包裹 ElConfigProvider
│   └── main.ts                # 应用入口，注册全局插件和图标
├── openspec/                  # 项目上下文文档
├── uno.config.ts              # UnoCSS 配置（含 Element Plus 对齐 token）
├── vite.config.ts             # Vite 构建配置
├── eslint.config.ts           # ESLint 配置
├── .oxlintrc.json             # oxlint 配置
└── tsconfig.app.json          # 应用 TypeScript 配置（含路径别名 @）
```

## 应用内部结构约定（src/）

```
src/
├── views/
│   └── <模块>/                    # 按功能模块分目录（player / history / vocabulary）
│       ├── index.vue              # 模块入口页（路由懒加载目标）
│       ├── components/            # 模块私有组件（不对外暴露）
│       │   └── <组件名>.vue
│       ├── composables/           # 模块私有 composable（useSubtitle、useABRepeat 等）
│       │   └── use<功能>.ts
│       └── types.ts               # 模块内 TS 类型定义
├── components/                    # 跨模块公共组件（自动注册，PascalCase 命名）
├── composables/                   # 全局 composable（useProgress、useHistory 等）
├── stores/
│   └── use<模块>Store.ts          # 每个 store 独立文件，Setup Store 写法
├── router/
│   └── index.ts                   # 集中定义路由，非首屏路由使用 () => import() 懒加载
├── utils/
│   ├── request.js                 # HTTP 封装，业务层通过此实例发请求
│   ├── subtitle.ts                # 字幕解析工具（.srt / .ass 解析）
│   └── storage.ts                 # 本地存储封装（IndexedDB / localStorage）
└── styles/
    └── element/
        └── index.scss             # 仅覆盖 Element Plus CSS 变量，不写业务样式
```

## 架构约定（MUST 遵守）

1. **自动导入**：Vue / Vue Router / Pinia 的 API（`ref`、`useRouter`、`defineStore` 等）MUST 直接使用，不得手动 import，由 unplugin-auto-import 处理。

2. **组件引用**：Element Plus 组件和 `src/components/` 下的公共组件 MUST 直接在模板中使用，不得手动 import，由 unplugin-vue-components 处理。

3. **HTTP 请求**：业务代码 MUST 通过 `src/utils/request.ts` 封装实例发起请求，严禁在业务层直接 `import axios`。

4. **本地数据持久化**：播放进度、历史记录、生词本等数据 MUST 通过 `src/utils/storage.ts` 统一读写，严禁在组件内直接操作 `localStorage` / `indexedDB`。

5. **纯本地原则**：应用 MUST 在无网络环境下完整运行，严禁将用户视频、字幕、生词等任何数据上传至外部服务器。

6. **字幕解析**：.srt / .ass 文件解析 MUST 通过 `src/utils/subtitle.ts` 处理，组件层只消费解析结果，不直接处理原始字幕文本。

7. **客户端状态**：跨组件共享状态（播放器状态、字幕模式、AB点位等）MUST 使用 Pinia Setup Store，以 `use<Name>Store` 命名并独立文件存放于 `src/stores/`。

8. **路径别名**：项目内跨目录引用 MUST 使用 `@/` 别名（指向 `src/`），严禁使用多层 `../../` 相对路径。

9. **样式方案**：布局和间距 SHOULD 优先使用 UnoCSS 原子类或 `uno.config.ts` 中定义的 shortcut；仅当原子类无法表达时 MAY 使用 `<style scoped>`，并与 Element Plus 设计 token 保持一致。

10. **Element Plus 主题覆盖**：MUST 在 `src/styles/element/index.scss` 中覆盖 CSS 变量，严禁在组件内内联覆盖 Element Plus 样式。

11. **组件写法**：所有 Vue 组件 MUST 使用 `<script setup lang="ts">` 写法，严禁 Options API。

12. **类型安全**：启用了 `noUncheckedIndexedAccess`，数组/对象下标访问结果 MUST 做可选链或类型守卫处理。

## 代码规范

- 组件文件 MUST 使用 `<script setup lang="ts">` 单文件组件（SFC）写法
- Props MUST 使用 `defineProps<{ ... }>()` 泛型写法声明类型，不得用 `withDefaults` 包裹普通对象
- 样式 SHOULD 使用 `<style scoped>`；全局样式仅限 `src/assets/` 和 `src/styles/`
- 代码格式化 MUST 通过 `oxfmt`（`npm run format`）处理，Prettier 已禁用
- Lint MUST 先跑 oxlint 再跑 ESLint（`npm run lint` 已按顺序编排）
- `src/utils/request.js` SHOULD 迁移为 `.ts` 并补充响应类型泛型
- 单个文件 SHOULD 控制在 300 行以内；超出时拆分为子组件或独立模块

## 命名规范

| 类型 | 规范 | 示例 |
| --- | --- | --- |
| Vue 组件文件 | PascalCase | `UserProfile.vue`、`MediaCard.vue` |
| 页面入口文件 | 固定为 `index.vue` | `views/player/index.vue` |
| 视图模块目录 | camelCase | `views/playerList/` |
| Pinia store 文件 | `use<Name>Store.ts` | `usePlayerStore.ts` |
| store 导出函数 | `use<Name>Store` | `export const usePlayerStore` |
| 工具函数文件 | camelCase | `formatDuration.ts` |
| CSS 类名（自定义） | kebab-case | `.media-card__title` |
| UnoCSS shortcut | kebab-case | `flex-center`、`type-body` |
| TypeScript 接口 | PascalCase，`I` 前缀可选 | `PlayerInfo`、`ApiResponse<T>` |
| 变量/函数 | camelCase | `const isPlaying = ref(false)` |

## Git 提交规范

格式：`<type>(<scope>): <subject>`

- **type**：`feat` / `fix` / `refactor` / `style` / `docs` / `chore` / `test` / `perf`
- **scope**：模块名或文件名，如 `player`、`router`、`store`
- **subject**：中文或英文均可，动词开头，不超过 50 字符，末尾不加句号

示例：`feat(player): 新增播放进度条拖拽交互`

## 常用命令

```bash
pnpm dev          # 启动开发服务器（Vite HMR）
pnpm build        # 并行执行类型检查 + 生产构建
pnpm build-only   # 仅构建，跳过类型检查
pnpm type-check   # 仅执行 vue-tsc 类型检查
pnpm lint         # 顺序执行 oxlint（fix）→ ESLint（fix）
pnpm format       # oxfmt 格式化 src/ 目录
pnpm preview      # 预览生产构建产物
```

## 环境变量

项目使用 Vite 内置环境变量机制，暂无 `.env` 文件（按需创建）：

| 文件 | 用途 |
| --- | --- |
| `.env` | 全环境共用变量 |
| `.env.development` | 仅开发环境 |
| `.env.production` | 仅生产环境 |

- 客户端可访问的变量 MUST 以 `VITE_` 为前缀，在代码中通过 `import.meta.env.VITE_XXX` 读取
- HTTP 基础路径已固定为 `/api`（见 `src/utils/request.js`），生产环境代理规则需在部署层配置
