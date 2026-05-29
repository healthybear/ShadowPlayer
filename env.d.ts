/// <reference types="vite/client" />

/**
 * File System Access API 类型补充
 *
 * 为什么需要手动声明？
 * - 这个项目使用了 showOpenFilePicker 和 FileSystemFileHandle
 * - 但当前 TypeScript DOM lib 版本没有完整内置这些实验性 API
 * - 将声明集中放在 env.d.ts，避免业务组件里到处分散类型兼容代码
 */
interface FilePickerAcceptType {
  description?: string
  accept: Record<string, string[]>
}

interface OpenFilePickerOptions {
  multiple?: boolean
  types?: FilePickerAcceptType[]
  excludeAcceptAllOption?: boolean
}

interface FileSystemHandle {
  readonly kind: 'file' | 'directory'
  readonly name: string
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: 'file'
  getFile(): Promise<File>
}

interface Window {
  showOpenFilePicker?(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>
}
