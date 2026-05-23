# 用户管理功能

## 已实现的功能

### 1. 视频删除功能

**位置**: [VideoCard.vue](../src/components/home/VideoCard.vue)

**功能**:
- 每个视频卡片左上角有删除按钮（悬停时显示）
- 点击删除按钮会弹出确认对话框
- 确认对话框明确说明将删除所有相关数据（进度、字幕、生词）
- 删除成功后显示成功提示
- 自动刷新视频列表

**用户体验**:
```typescript
// 删除确认对话框
await ElMessageBox.confirm(
  `确定要删除视频 "${props.video.filename}" 吗？这将删除所有相关的学习数据（进度、字幕、生词）。`,
  '删除确认',
  {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }
)
```

**交互设计**:
- 删除按钮默认隐藏，悬停时淡入显示（opacity: 0 → 1）
- 使用危险色（红色）突出操作的严重性
- 点击删除按钮不会触发视频播放（event.stopPropagation）

### 2. 视频搜索功能

**位置**: [VideoToolbar.vue](../src/components/home/VideoToolbar.vue)

**功能**:
- 实时搜索视频文件名
- 支持清空搜索
- 搜索结果即时更新

**实现**:
```typescript
// 在 VideoList.vue 中过滤
if (searchKeyword.value) {
  const keyword = searchKeyword.value.toLowerCase()
  result = result.filter(video =>
    video.filename.toLowerCase().includes(keyword)
  )
}
```

### 3. 视频排序功能

**位置**: [VideoToolbar.vue](../src/components/home/VideoToolbar.vue)

**支持的排序方式**:
- **上传日期** (默认): 最新上传的视频在前
- **文件名**: 按字母顺序排序
- **时长**: 按视频时长排序

**实现**:
```typescript
result.sort((a, b) => {
  switch (sortType.value) {
    case 'name':
      return a.filename.localeCompare(b.filename)
    case 'duration':
      return b.duration - a.duration
    case 'date':
    default:
      return b.uploadedAt - a.uploadedAt
  }
})
```

### 4. 视频统计信息

**位置**: [VideoToolbar.vue](../src/components/home/VideoToolbar.vue)

**显示内容**:
- 视频总数
- 已选择的视频数量（为批量操作预留）

### 5. 加载状态和空状态

**位置**: [VideoList.vue](../src/components/home/VideoList.vue)

**加载状态**:
- 显示加载图标和文字提示
- 防止用户在数据加载时进行操作

**空状态**:
- 当没有视频时显示友好的空状态提示
- 引导用户上传第一个视频

```vue
<div v-if="loading" class="loading">
  <el-icon class="is-loading"><i-ep-loading /></el-icon>
  <p>Loading videos...</p>
</div>

<div v-else-if="videos.length === 0" class="empty-state">
  <el-empty description="No videos yet. Upload your first video to get started!" />
</div>
```

### 6. 响应式设计

**移动端优化**:
- 工具栏在小屏幕上垂直排列
- 视频网格在移动端变为单列
- 搜索框在移动端占满宽度

```css
@media (max-width: 768px) {
  .video-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

## 用户操作流程

### 删除视频
1. 悬停在视频卡片上
2. 点击左上角的红色删除按钮
3. 在确认对话框中点击"删除"
4. 看到成功提示，视频列表自动刷新

### 搜索视频
1. 在工具栏的搜索框中输入关键词
2. 视频列表实时过滤
3. 点击清空按钮或删除所有文字恢复完整列表

### 排序视频
1. 点击工具栏的"Sort by"按钮
2. 从下拉菜单中选择排序方式
3. 视频列表立即重新排序

## 预留的功能（未实现）

### 批量操作
工具栏已预留批量操作的 UI：
- 选择多个视频
- 批量删除
- 清除选择

实现这些功能需要：
1. 在 VideoCard 中添加复选框
2. 在 VideoList 中维护选中状态
3. 实现批量删除逻辑

### 视频信息编辑
可以添加的功能：
- 重命名视频
- 添加标签
- 添加备注

## 技术细节

### 组件通信
```
HomeView (父组件)
  ├─ VideoToolbar (工具栏)
  │   └─ emit: search, sort, deleteSelected
  │
  └─ VideoList (列表容器)
      ├─ expose: loadVideos, handleSearch, handleSort, totalCount
      └─ VideoCard (视频卡片)
          └─ emit: deleted
```

### 数据流
1. **搜索/排序**: HomeView → VideoList → computed videos
2. **删除**: VideoCard → emit deleted → VideoList → loadVideos
3. **上传成功**: VideoUploader → HomeView → VideoList.loadVideos

### 性能优化
- 使用 `computed` 进行搜索和排序，避免不必要的重新计算
- 删除操作使用事务，确保数据一致性
- 列表使用虚拟滚动（如果视频数量很大，可以进一步优化）

## 相关文件

- [VideoCard.vue](../src/components/home/VideoCard.vue) - 视频卡片，包含删除功能
- [VideoList.vue](../src/components/home/VideoList.vue) - 视频列表，包含搜索和排序逻辑
- [VideoToolbar.vue](../src/components/home/VideoToolbar.vue) - 工具栏，包含搜索、排序、统计
- [home/index.vue](../src/views/home/index.vue) - 首页视图，整合所有组件
- [useVideoStorage.ts](../src/composables/useVideoStorage.ts) - 视频存储逻辑，包含删除方法

## 用户反馈

所有操作都有明确的用户反馈：
- ✅ 删除成功 → 绿色成功提示
- ❌ 删除失败 → 红色错误提示
- ⏳ 加载中 → 加载动画
- 📭 无数据 → 空状态提示
- ⚠️ 危险操作 → 确认对话框
