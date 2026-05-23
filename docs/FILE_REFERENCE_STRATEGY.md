# 文件引用策略

## 设计原则

ShadowPlayer 采用**文件引用存储**而非完整文件存储，以实现以下目标：

1. **节省存储空间**：不复制视频文件到 IndexedDB，只保存文件引用
2. **支持大文件**：不受 IndexedDB 存储配额限制
3. **支持网络存储**：可以引用局域网共享文件夹中的视频文件
4. **快速上传**：无需等待大文件传输到数据库

## 技术实现

### 1. File System Access API

使用现代浏览器的 [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) 获取文件句柄（FileSystemFileHandle）：

```typescript
// 获取文件引用
const [fileHandle] = await window.showOpenFilePicker({
  types: [{
    description: 'Video files',
    accept: { 'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'] }
  }],
  multiple: false
})

// 保存到数据库
const video: Video = {
  id: uuidv4(),
  filename: file.name,
  storageType: 'file-handle',
  fileHandle: fileHandle,  // 只保存引用，不保存文件内容
  // ...
}
```

### 2. 数据库 Schema

```typescript
interface Video {
  id: string
  filename: string
  size: number
  duration: number
  storageType: 'file-handle' | 'blob'  // 存储类型
  fileHandle?: FileSystemFileHandle    // 文件引用（推荐）
  blob?: Blob                          // 完整文件（降级方案）
  uploadedAt: number
  lastPlayedAt?: number
}
```

### 3. 播放时访问文件

```typescript
async function getVideoBlob(video: Video): Promise<Blob | null> {
  if (video.storageType === 'file-handle' && video.fileHandle) {
    // 通过文件引用读取文件
    const file = await video.fileHandle.getFile()
    return file
  }
  
  if (video.storageType === 'blob' && video.blob) {
    // 降级方案：直接返回存储的 Blob
    return video.blob
  }
  
  throw new Error('Video file not found')
}
```

### 4. 内存管理

播放视频时需要创建 Object URL，使用完毕后必须清理：

```typescript
// 创建 Object URL
const blob = await getVideoBlob(video)
const videoUrl = URL.createObjectURL(blob)

// 组件卸载时清理
onUnmounted(() => {
  if (videoUrl) {
    URL.revokeObjectURL(videoUrl)
  }
})
```

## 浏览器兼容性

### 支持 File System Access API 的浏览器

- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Opera 72+
- ❌ Firefox（部分支持，需要启用实验性功能）
- ❌ Safari（不支持）

### 降级方案

对于不支持 File System Access API 的浏览器，自动降级到 Blob 存储：

```typescript
if ('showOpenFilePicker' in window) {
  // 使用文件引用
  const [fileHandle] = await window.showOpenFilePicker()
  await uploadVideo(file, fileHandle)
} else {
  // 降级：保存完整文件
  await uploadVideo(file)
}
```

## 使用限制

### 1. 文件必须可访问

文件引用要求原始文件保持可访问状态：

- ✅ **可以**：本地硬盘上的文件
- ✅ **可以**：局域网共享文件夹中的文件（网络连接正常时）
- ❌ **不可以**：已删除的文件
- ❌ **不可以**：已移动到其他位置的文件
- ❌ **不可以**：断开连接的网络驱动器上的文件

### 2. 权限管理

浏览器会记住文件访问权限，但可能在以下情况下要求重新授权：

- 浏览器重启后
- 清除浏览器数据后
- 长时间未访问该文件

### 3. 错误处理

当文件不可访问时，系统会显示友好的错误提示：

```
Cannot access video file. The file may have been moved, deleted, 
or is on a disconnected network drive. Please re-upload the video.
```

## 最佳实践

### 1. 推荐的文件存储位置

- **本地文件**：放在固定的文件夹中，避免移动或删除
- **网络文件**：使用稳定的局域网共享，确保网络连接可靠

### 2. 备份策略

文件引用本身不包含视频内容，因此：

- ✅ 可以导出学习数据（生词、进度、字幕）
- ❌ 无法导出视频文件本身
- 💡 建议：视频文件单独备份到云盘或外部硬盘

### 3. 性能优化

- 文件引用读取速度取决于存储介质：
  - SSD：非常快
  - HDD：较快
  - 局域网：取决于网络速度
  - 云盘同步文件夹：可能较慢

## 相关文件

- `src/composables/useVideoStorage.ts` - 视频存储逻辑
- `src/components/home/VideoUploader.vue` - 文件上传组件
- `src/components/player/VideoPlayerContainer.vue` - 播放器容器
- `src/db/schema.ts` - 数据库 Schema 定义

## 参考资料

- [File System Access API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [FileSystemFileHandle - MDN](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle)
- [URL.createObjectURL() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
- [URL.revokeObjectURL() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL)
