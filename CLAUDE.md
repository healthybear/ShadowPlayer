# ShadowPlayer - 教学模板项目

## 项目定位

这是一个面向大学生的**教学模板项目**，目标是展示现代前端工程化和全栈应用架构的最佳实践。

### 目标学习者
- 有编程基础的大学生
- 有过自己的小项目经验
- 缺乏企业级项目经验
- 需要理解"为什么这样做"而不只是"怎么做"

### 教学重点
- 现代前端工程化（构建工具、类型系统、性能优化）
- 全栈应用架构（组件化、状态管理、代码组织）

---

## 注释策略

### 核心原则

**注释的目的：传递企业级项目的工程化思维**

1. **解释"为什么"，不解释"是什么"**
   - ❌ 不好：`// 创建一个 Set` 
   - ✅ 好：`// 使用 Set 而不是 Array，因为 delete() 是 O(1) 而 splice() 是 O(n)`

2. **标注工程化决策**
   - 为什么选择这个库/模式/架构
   - 性能考虑（时间复杂度、内存占用、渲染优化）
   - 可维护性考虑（类型安全、可测试性、可扩展性）

3. **指出企业项目的最佳实践**
   - 使用 `// 企业项目经验：...` 标记
   - 说明这个做法在大型项目中的价值

4. **标注常见陷阱**
   - 新手容易犯的错误
   - 性能陷阱
   - 内存泄漏风险

### 注释密度分层

```
🔥 核心文件（高密度注释）
   - Design Tokens 系统
   - Composables（可复用逻辑）
   - 性能优化相关代码
   → 每个关键决策都要注释

📦 组件文件（中密度注释）
   - 复杂的 computed/watch
   - 非显而易见的 props 设计
   - 性能考虑（虚拟滚动、v-memo 等）
   → 工程化决策要注释

📄 页面文件（低密度注释）
   - 组件组合逻辑
   - 布局结构说明
   → 架构层面的注释
```

### 注释模板

#### 1. 类型设计注释

```typescript
interface Props {
  // 限制为 0-5 而不是 number 的原因：
  // 1. Material Design 3 规范只定义了 6 个 elevation 级别
  // 2. TypeScript 会在编译时检查，防止传入无效值
  // 3. 这是"让错误的代码无法编译"的类型安全实践
  elevation?: 0 | 1 | 2 | 3 | 4 | 5
}
```

#### 2. 性能优化注释

```typescript
// 使用 computed 而不是直接在 template 中计算的原因：
// 1. 性能：computed 有缓存，只在依赖变化时重新计算
// 2. 可测试性：可以单独测试这个逻辑
// 3. 可维护性：复杂逻辑不应该写在 template 里
// 
// 企业项目经验：template 应该尽量"声明式"，复杂计算放 computed
const paddingClass = computed(() => {
  return props.padding ? `p-[${props.padding}]` : ''
})
```

#### 3. 数据结构选择注释

```typescript
// 使用 Set 而不是 Array 的原因：
// - Set.delete() 是 O(1)，Array.splice() 是 O(n)
// - 频繁添加/删除时，Set 性能更好
// 
// 企业项目经验：选择正确的数据结构能带来数量级的性能提升
const ripples = new Set<HTMLElement>()
```

#### 4. 生命周期管理注释

```typescript
const cleanup = () => {
  // 组件卸载时清理所有未完成的 ripple
  // 企业项目经验：任何动态创建的 DOM 都必须有清理机制，否则内存泄漏
  ripples.forEach(ripple => ripple.remove())
  ripples.clear()
}

onBeforeUnmount(cleanup)
```

#### 5. 虚拟滚动注释

```vue
<DynamicScroller
  :items="subtitles"
  // 虚拟滚动优化：只渲染可见区域的 DOM 节点
  // 
  // 为什么需要？
  // - 普通列表：1000 条字幕 = 1000 个 DOM 节点 = 卡顿
  // - 虚拟滚动：1000 条字幕 = ~20 个 DOM 节点（可见区域）= 流畅
  // 
  // 参数调优：
  // - min-item-size: 每项最小高度（px），用于计算滚动位置
  // - buffer: 可见区域外预渲染的像素数，减少快速滚动时的白屏
  //   太小 = 滚动时闪烁，太大 = 性能下降
  // 
  // 企业项目经验：长列表必须用虚拟滚动，这是性能优化的基础
  :min-item-size="60"
  :buffer="200"
>
```

#### 6. CSS 变量系统注释

```css
.md-card {
  /* 使用 CSS 变量而不是硬编码颜色的原因：
   * 1. 主题切换：只需修改变量值，所有组件自动更新
   * 2. 一致性：确保整个应用使用统一的设计系统
   * 3. 可维护性：颜色定义集中管理，不会出现"魔法数字"
   * 
   * 企业项目经验：Design Tokens 是大型应用的设计系统基础
   */
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-medium);
}
```

---

## 技术栈

### 核心框架
- **Vue 3** - 使用 Composition API (`<script setup>`)
- **TypeScript** - 严格类型检查
- **Vite** - 构建工具

### UI 和样式
- **Material Design 3** - 设计系统
- **Element Plus** - 组件库（定制主题）
- **UnoCSS** - 原子化 CSS 框架

### 性能优化
- **vue-virtual-scroller** - 虚拟滚动

### 工程化
- **pnpm** - 包管理器
- **ESLint** - 代码检查
- **Git** - 版本控制

---

## 代码风格

### TypeScript

1. **优先使用类型推断**
   ```typescript
   // ✅ 好
   const count = ref(0)
   
   // ❌ 不必要
   const count: Ref<number> = ref(0)
   ```

2. **Props 使用 interface + withDefaults**
   ```typescript
   interface Props {
     elevation?: 0 | 1 | 2 | 3 | 4 | 5
   }
   
   const props = withDefaults(defineProps<Props>(), {
     elevation: 1,
   })
   ```

3. **Emits 使用类型定义**
   ```typescript
   const emit = defineEmits<{
     select: [id: string]
     update: [value: number]
   }>()
   ```

### Vue 组件

1. **组件职责单一**
   - 每个组件只做一件事
   - 大组件拆分为小组件
   - 可复用逻辑提取为 composables

2. **Props 设计原则**
   - 使用具体类型而不是泛型（`0|1|2` 而不是 `number`）
   - 提供合理的默认值
   - 避免过度配置

3. **样式组织**
   - 优先使用 UnoCSS 原子类
   - 组件特定样式使用 scoped style
   - 全局样式使用 CSS 变量

### 性能最佳实践

1. **长列表使用虚拟滚动**
2. **computed 缓存计算结果**
3. **避免在 template 中写复杂表达式**
4. **合理使用 v-memo 和 v-once**

---

## 项目结构

```
src/
├── components/
│   ├── material/          # Material Design 3 基础组件
│   ├── player/            # 播放器相关组件
│   ├── home/              # 首页组件
│   ├── history/           # 历史记录组件
│   └── vocabulary/        # 词汇表组件
├── composables/           # 可复用逻辑
├── views/                 # 页面组件
├── styles/
│   ├── material-tokens.css           # Material Design 3 tokens
│   ├── element-plus-material.scss    # Element Plus 主题
│   └── material-utilities.css        # 工具类（ripple, state layer）
└── main.ts
```

---

## 开发工作流

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 代码检查
```bash
pnpm lint
```

---

## 给 Claude 的指示

当你在这个项目中工作时：

1. **始终记住这是教学项目** - 注释密度要高于普通生产代码
2. **遵循注释策略** - 参考上面的注释模板
3. **解释工程化决策** - 不只是写代码，要说明为什么这样写
4. **标注最佳实践** - 使用 `// 企业项目经验：...` 标记
5. **保持一致性** - 遵循已有的代码风格和架构模式
