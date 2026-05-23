# 导航系统完整性检查

## 导航结构

### 全局导航栏 (AppNavbar)

**位置**: [src/components/layout/AppNavbar.vue](../src/components/layout/AppNavbar.vue)

**功能**:
- 固定在页面顶部，所有页面可见
- 显示应用 Logo 和名称
- 提供所有主要页面的导航入口

**导航项**:
1. **Home** - 首页，视频上传和列表
2. **History** - 播放历史记录
3. **Vocabulary** - 收集的词汇
4. **Settings** - 应用设置

**特性**:
- 当前页面高亮显示
- 响应式设计：移动端隐藏文字，只显示图标
- 点击 Logo 返回首页

## 页面导航链路

### 1. 首页 (/)

**路由**: `/`  
**文件**: [src/views/home/index.vue](../src/views/home/index.vue)

**导航入口**:
- 导航栏 "Home" 按钮
- 点击 Logo

**可以导航到**:
- 点击视频卡片 → 播放器页面 (`/player/:id`)
- 导航栏 → 其他页面

### 2. 播放器页面 (/player/:id)

**路由**: `/player/:id`  
**文件**: [src/views/player/index.vue](../src/views/player/index.vue)

**导航入口**:
- 首页点击视频卡片
- 历史记录点击视频
- 词汇页面点击带视频链接的单词

**可以导航到**:
- 错误状态的 "Back to Home" 按钮 → 首页
- 导航栏 → 其他页面
- 浏览器后退按钮

**注意**: 播放器页面没有明显的"返回"按钮（正常播放时），用户需要通过导航栏或浏览器后退返回

### 3. 历史记录页面 (/history)

**路由**: `/history`  
**文件**: [src/views/history/index.vue](../src/views/history/index.vue)

**导航入口**:
- 导航栏 "History" 按钮

**可以导航到**:
- 点击历史记录项 → 播放器页面
- 导航栏 → 其他页面

**功能**:
- 显示所有播放过的视频
- 按最近播放时间排序
- 显示播放进度

### 4. 词汇页面 (/vocabulary)

**路由**: `/vocabulary`  
**文件**: [src/views/vocabulary/index.vue](../src/views/vocabulary/index.vue)

**导航入口**:
- 导航栏 "Vocabulary" 按钮

**可以导航到**:
- 点击带视频链接的单词 → 播放器页面（跳转到特定时间点）
- 导航栏 → 其他页面

**功能**:
- 显示收集的所有单词
- 搜索单词
- 点击单词可跳转到视频中的原始位置

### 5. 设置页面 (/settings)

**路由**: `/settings`  
**文件**: [src/views/settings/index.vue](../src/views/settings/index.vue)

**导航入口**:
- 导航栏 "Settings" 按钮

**可以导航到**:
- 导航栏 → 其他页面

**功能**:
- 查看存储统计
- 导出数据
- 清空所有数据

## 导航流程图

```
┌─────────────────────────────────────────────────────────┐
│                    AppNavbar (全局)                      │
│  [Logo] Home | History | Vocabulary | Settings          │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   ┌─────────┐      ┌──────────┐      ┌──────────┐
   │  Home   │      │ History  │      │Vocabulary│
   │  (/)    │      │(/history)│      │(/vocab)  │
   └─────────┘      └──────────┘      └──────────┘
        │                  │                  │
        │ 点击视频          │ 点击记录          │ 点击单词
        ↓                  ↓                  ↓
   ┌──────────────────────────────────────────────┐
   │         Player (/player/:id)                 │
   │  [导航栏] | [浏览器后退] | [错误时返回按钮]    │
   └──────────────────────────────────────────────┘
```

## 用户操作场景

### 场景 1: 上传并观看视频
1. 用户在首页上传视频
2. 自动跳转到播放器页面
3. 观看完毕后，点击导航栏 "Home" 返回首页

### 场景 2: 继续观看历史视频
1. 用户点击导航栏 "History"
2. 在历史记录中找到之前的视频
3. 点击视频卡片进入播放器
4. 自动从上次位置继续播放

### 场景 3: 复习词汇
1. 用户点击导航栏 "Vocabulary"
2. 浏览收集的单词
3. 点击某个单词
4. 跳转到视频中该单词出现的位置

### 场景 4: 管理数据
1. 用户点击导航栏 "Settings"
2. 查看存储统计
3. 导出数据备份
4. 或清空所有数据重新开始

## 改进建议

### 已实现 ✅
- [x] 全局导航栏
- [x] 所有页面都可访问
- [x] 当前页面高亮
- [x] 响应式设计
- [x] 播放器错误状态的返回按钮

### 可以改进 💡

1. **播放器页面添加返回按钮**
   - 在播放器控制条左侧添加返回按钮
   - 或在视频上方添加面包屑导航

2. **面包屑导航**
   - 在播放器页面显示: Home > Video Name
   - 在词汇详情显示: Vocabulary > Word

3. **快捷键导航**
   - Esc 键返回上一页
   - 数字键快速切换页面

4. **最近访问**
   - 在导航栏添加"最近访问"下拉菜单
   - 快速访问最近的视频

5. **搜索功能**
   - 全局搜索框
   - 搜索视频、单词、历史记录

## 技术实现

### 路由配置

```typescript
// src/router/index.ts
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/player/:id', name: 'player', component: PlayerView },
  { path: '/history', name: 'history', component: HistoryView },
  { path: '/vocabulary', name: 'vocabulary', component: VocabularyView },
  { path: '/settings', name: 'settings', component: SettingsView },
]
```

### 导航组件集成

```vue
<!-- src/App.vue -->
<template>
  <div class="app-layout">
    <AppNavbar />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
```

### 编程式导航

```typescript
// 在组件中使用
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航到播放器
router.push(`/player/${videoId}`)

// 导航到首页
router.push('/')

// 返回上一页
router.back()
```

## 测试清单

- [ ] 从首页可以访问所有其他页面
- [ ] 从任何页面可以返回首页
- [ ] 点击视频卡片正确跳转到播放器
- [ ] 播放器错误时可以返回首页
- [ ] 历史记录可以跳转到播放器
- [ ] 词汇可以跳转到视频特定位置
- [ ] 导航栏当前页面正确高亮
- [ ] 移动端导航栏正常工作
- [ ] 浏览器前进/后退按钮正常工作

## 相关文件

- [AppNavbar.vue](../src/components/layout/AppNavbar.vue) - 全局导航栏
- [App.vue](../src/App.vue) - 应用布局
- [router/index.ts](../src/router/index.ts) - 路由配置
- [views/home/index.vue](../src/views/home/index.vue) - 首页
- [views/player/index.vue](../src/views/player/index.vue) - 播放器
- [views/history/index.vue](../src/views/history/index.vue) - 历史记录
- [views/vocabulary/index.vue](../src/views/vocabulary/index.vue) - 词汇
- [views/settings/index.vue](../src/views/settings/index.vue) - 设置
