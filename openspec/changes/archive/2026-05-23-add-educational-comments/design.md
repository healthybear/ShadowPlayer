# 教学注释设计方案

## 注释架构

### 注释分层策略

基于文件的重要性和复杂度，采用三层注释密度：

```
🔥 核心文件（高密度注释）
   每个关键决策都要注释
   ↓
📦 组件文件（中密度注释）
   工程化决策和复杂逻辑要注释
   ↓
📄 页面文件（低密度注释）
   架构层面的说明
```

---

## 注释模板

### 1. 类型设计注释

**适用场景：** 使用联合类型、字面量类型等非显而易见的类型设计

**模板：**
```typescript
interface Props {
  // [解释为什么这样设计类型]
  // 1. [业务原因]
  // 2. [技术原因 - 类型安全]
  // 3. [最佳实践说明]
  propertyName: Type
}
```

**示例：**
```typescript
interface Props {
  // 限制为 0-5 而不是 number 的原因：
  // 1. Material Design 3 规范只定义了 6 个 elevation 级别
  // 2. TypeScript 会在编译时检查，防止传入无效值
  // 3. 这是"让错误的代码无法编译"的类型安全实践
  elevation?: 0 | 1 | 2 | 3 | 4 | 5
}
```

---

### 2. 性能优化注释

**适用场景：** computed、虚拟滚动、数据结构选择等性能相关代码

**模板：**
```typescript
// [使用 X 而不是 Y 的原因：]
// 1. [性能指标：时间复杂度、内存占用等]
// 2. [可测试性/可维护性考虑]
// 3. [可维护性考虑]
// 
// 企业项目经验：[这个做法在大型项目中的价值]
const implementation = ...
```

**示例：**
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

---

### 3. 数据结构选择注释

**适用场景：** 选择特定数据结构（Set vs Array, Map vs Object）

**模板：**
```typescript
// 使用 [数据结构 X] 而不是 [数据结构 Y] 的原因：
// - [操作 A] 是 O(x)，[操作 B] 是 O(y)
// - [其他优势]
// 
// 企业项目经验：[选择正确数据结构的重要性]
const dataStructure = new DataStructure()
```

**示例：**
```typescript
// 使用 Set 而不是 Array 的原因：
// - Set.delete() 是 O(1)，Array.splice() 是 O(n)
// - 频繁添加/删除时，Set 性能更好
// 
// 企业项目经验：选择正确的数据结构能带来数量级的性能提升
const ripples = new Set<HTMLElement>()
```

---

### 4. 生命周期管理注释

**适用场景：** cleanup、事件监听器移除、内存泄漏防范

**模板：**
```typescript
const cleanup = () => {
  // [清理的内容]
  // 企业项目经验：[为什么必须清理，不清理会怎样]
}

onBeforeUnmount(cleanup)
```

**示例：**
```typescript
const cleanup = () => {
  // 组件卸载时清理所有未完成的 ripple
  // 企业项目经验：任何动态创建的 DOM 都必须有清理机制，否则内存泄漏
  ripples.forEach(ripple => ripple.remove())
  ripples.clear()
}

onBeforeUnmount(cleanup)
```

---

### 5. 虚拟滚动注释

**适用场景：** 使用 vue-virtual-scroller 或其他虚拟滚动库

**模板：**
```vue
<VirtualScroller
  // 虚拟滚动优化：[简短说明]
  // 
  // 为什么需要？
  // - [问题场景]
  // - [解决方案]
  // 
  // 参数调优：
  // - [参数1]: [说明和取值原因]
  // - [参数2]: [说明和取值原因]
  // 
  // 企业项目经验：[最佳实践]
  :param1="value1"
  :param2="value2"
>
```

**示例：**
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

---

### 6. CSS 变量系统注释

**适用场景：** Design Tokens、主题系统

**模板：**
```css
.component {
  /* 使用 [技术] 而不是 [替代方案] 的原因：
   * 1. [优势1]
   * 2. [优势2]
   * 3. [优势3]
   * 
   * 企业项目经验：[最佳实践]
   */
  property: var(--token-name);
}
```

**示例：**
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
}
```

---

### 7. Emit 类型定义注释

**适用场景：** 使用 TypeScript 定义 emit 事件

**模板：**
```typescript
// TypeScript 类型定义的 emit 好处：
// 1. [IDE 支持]
// 2. [类型安全]
// 3. [重构支持]
// 
// 企业项目经验：[大型项目中的价值]
const emit = defineEmits<{
  eventName: [param: Type]
}>()
```

**示例：**
```typescript
// TypeScript 类型定义的 emit 好处：
// 1. 父组件使用时有自动补全
// 2. 传错参数类型会编译报错
// 3. 重构时可以全局搜索引用
// 
// 企业项目经验：大型项目中，类型安全能避免 90% 的低级错误
const emit = defineEmits<{
  select: [id: string]
}>()
```

---

### 8. 算法逻辑注释

**适用场景：** 非显而易见的计算、几何计算、业务逻辑

**模板：**
```typescript
// [计算的目的]
// [为什么这样计算]
// 
// [几何原理/业务原理]：[详细解释]
const result = calculation()
```

**示例：**
```typescript
// 计算 ripple 的直径 = 容器的最长边
// 为什么？确保 ripple 能覆盖整个容器（从角落点击时）
// 
// 几何原理：矩形对角线 = √(w² + h²)，但 max(w,h) 更简单且足够
const size = Math.max(rect.width, rect.height)
```

---

### 9. Design Tokens 注释

**适用场景：** material-tokens.css 文件

**模板：**
```css
/* ========================================
 * [Token 类别名称]
 * ======================================== */

/* [Token 用途说明]
 * 
 * Material Design 3 规范：[规范说明]
 * 
 * 使用场景：[何时使用这些 tokens]
 */
:root {
  --token-name: value;
}
```

**示例：**
```css
/* ========================================
 * Elevation System (阴影/层级)
 * ======================================== */

/* Material Design 3 的层级系统，通过阴影表现组件的"高度"
 * 
 * Material Design 3 规范：
 * - Level 0: 无阴影，与背景平齐
 * - Level 1: 轻微阴影，卡片、按钮
 * - Level 2: 中等阴影，悬浮卡片、FAB
 * - Level 3-5: 强阴影，模态框、菜单、对话框
 * 
 * 使用场景：
 * - 卡片：elevation-1
 * - 悬浮按钮：elevation-2
 * - 对话框：elevation-3
 * 
 * 企业项目经验：统一的阴影系统能让界面层次清晰，避免随意使用 box-shadow
 */
:root {
  --md-sys-elevation-level0: none;
  --md-sys-elevation-level1: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
  /* ... */
}
```

---

## 文件级注释策略

### 核心文件（高密度）

#### material-tokens.css
- 每个 token 类别（颜色、字体、形状、阴影）都要有分组注释
- 解释 Material Design 3 规范
- 说明使用场景和最佳实践

#### useMaterialRipple.ts
- 函数级注释：说明 Ripple 效果的原理
- 数据结构选择注释（Set vs Array）
- 算法逻辑注释（size 计算）
- 生命周期管理注释（cleanup）

#### uno.config.ts
- 每个扩展配置都要注释
- 解释为什么扩展 UnoCSS
- 说明 Material 3 的设计规范

### 组件文件（中密度）

#### Material 基础组件
- Props 类型设计注释
- Computed 性能注释
- CSS 变量使用注释

#### Player 组件
- SubtitleList: 虚拟滚动注释（重点）
- 其他组件：复杂逻辑和非显而易见的设计

### 页面文件（低密度）

- 页面架构说明（组件如何组合）
- 布局逻辑说明
- 不需要逐行注释

---

## 注释原则

### ✅ 应该注释的

1. **工程化决策**
   - 为什么选择这个库/模式/架构
   - 为什么用 TypeScript 这样定义类型
   - 为什么用这个数据结构

2. **性能考虑**
   - 时间复杂度分析
   - 为什么需要虚拟滚动
   - 为什么用 computed 缓存

3. **最佳实践**
   - 企业项目中的常见做法
   - 大型项目的经验教训
   - 可维护性考虑

4. **常见陷阱**
   - 内存泄漏风险
   - 性能陷阱
   - 新手容易犯的错误

### ❌ 不应该注释的

1. **显而易见的代码**
   ```typescript
   // ❌ 不好
   const count = 0  // 初始化 count 为 0
   
   // ✅ 不需要注释
   const count = 0
   ```

2. **语法解释**
   ```typescript
   // ❌ 不好
   const { name } = props  // 解构 props 获取 name
   
   // ✅ 不需要注释
   const { name } = props
   ```

3. **重复代码内容**
   ```typescript
   // ❌ 不好
   function getUserName() {  // 获取用户名
     return user.name
   }
   
   // ✅ 函数名已经说明了用途
   function getUserName() {
     return user.name
   }
   ```

---

## 实现顺序

### Phase 1: 核心文件
1. material-tokens.css
2. useMaterialRipple.ts
3. uno.config.ts
4. element-plus-material.scss
5. material-utilities.css

### Phase 2: Material 基础组件
1. MdCard.vue
2. MdFab.vue
3. MdChip.vue
4. MdTopAppBar.vue

### Phase 3: Player 组件
1. SubtitleList.vue（重点：虚拟滚动）
2. VideoPlayer.vue
3. SubtitleListItem.vue
4. PlayerControls.vue
5. WordPopup.vue
6. SubtitleOverlay.vue

### Phase 4: 其他组件
1. Home 组件（UploadCard, RecentItem）
2. History 组件（HistoryItem）
3. Vocabulary 组件（VocabCard）

### Phase 5: 页面文件
1. src/views/home/index.vue
2. src/views/player/index.vue
3. src/views/history/index.vue
4. src/views/vocabulary/index.vue

---

## 质量检查清单

完成后检查：

- [ ] 每个核心文件都有详细注释
- [ ] 所有性能优化点都有说明
- [ ] 所有非显而易见的类型设计都有解释
- [ ] 使用了 `// 企业项目经验：...` 标记
- [ ] 没有注释显而易见的代码
- [ ] 注释风格统一
- [ ] 注释准确无误
