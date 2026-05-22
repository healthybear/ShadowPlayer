# Material Design 3 实现细节

本文档记录探索阶段确定的所有技术决策和实现细节。

---

## 技术决策总结

| 决策点 | 选择 | 理由 |
|--------|------|------|
| Ripple 效果 | Vue Composable | 真实 Material 效果，从点击位置扩散 |
| FAB 类型 | 只有圆形 FAB | 简化实现，符合大部分场景 |
| 查词浮层定位 | 固定位置 | 简单，不需要 Floating UI |
| 字幕列表 | DynamicScroller | 支持动态高度，体验更好 |
| 响应式策略 | 基础响应式（平板可用） | 覆盖主流设备，DevTools 测试 |
| 动画复杂度 | 基础过渡 + Element Plus 内置 | 简单高效，不引入额外库 |
| UnoCSS 配置 | 保留旧配置 + 新增 md 前缀 | 向后兼容，渐进式迁移 |

---

## 1. Ripple 效果实现

### Composable 实现

```typescript
// composables/useMaterialRipple.ts
import { onBeforeUnmount } from 'vue'

export function useMaterialRipple() {
  const ripples = new Set<HTMLElement>()

  const createRipple = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    if (!target) return

    const position = getComputedStyle(target).position
    if (position === 'static') {
      target.style.position = 'relative'
    }
    if (getComputedStyle(target).overflow !== 'hidden') {
      target.style.overflow = 'hidden'
    }

    const rect = target.getBoundingClientRect()
    const ripple = document.createElement('span')
    
    const size = Math.max(rect.width, rect.height) * 2
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    ripple.className = 'md-ripple-effect'
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `
    
    target.appendChild(ripple)
    ripples.add(ripple)
    
    const removeRipple = () => {
      ripple.remove()
      ripples.delete(ripple)
    }
    
    ripple.addEventListener('animationend', removeRipple)
    setTimeout(removeRipple, 600)
  }

  onBeforeUnmount(() => {
    ripples.forEach(ripple => ripple.remove())
    ripples.clear()
  })

  return { createRipple }
}
```

### CSS 样式

```css
/* styles/material-utilities.css */
.md-ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  transform: scale(0);
  animation: md-ripple-animation 600ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

@keyframes md-ripple-animation {
  to {
    transform: scale(1);
    opacity: 0;
  }
}
```

### 使用方式

```vue
<template>
  <button @mousedown="createRipple">Click me</button>
</template>

<script setup lang="ts">
import { useMaterialRipple } from '@/composables/useMaterialRipple'
const { createRipple } = useMaterialRipple()
</script>
```

---

## 2. 虚拟滚动实现

### 依赖安装

```bash
pnpm add vue-virtual-scroller
```

### 配置

```typescript
// main.ts
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import VueVirtualScroller from 'vue-virtual-scroller'

app.use(VueVirtualScroller)
```

### SubtitleList 组件

```vue
<template>
  <div class="subtitle-list">
    <DynamicScroller
      :items="subtitles"
      :min-item-size="60"
      key-field="id"
      :buffer="200"
      class="scroller"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
        >
          <SubtitleListItem
            :subtitle="item"
            :active="index === activeIndex"
            @click="handleItemClick(index)"
          />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script setup lang="ts">
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import SubtitleListItem from './SubtitleListItem.vue'

interface Subtitle {
  id: string
  time: string
  text: string
  translation: string
}

defineProps<{
  subtitles: Subtitle[]
  activeIndex: number
}>()

const emit = defineEmits<{
  itemClick: [index: number]
}>()

const handleItemClick = (index: number) => {
  emit('itemClick', index)
}
</script>

<style scoped>
.subtitle-list {
  flex: 1;
  overflow: hidden;
}

.scroller {
  height: 100%;
}
</style>
```

**关键点**：
- 使用 `DynamicScroller` 而不是 `RecycleScroller`（支持动态高度）
- `min-item-size` 设置最小高度估算值（60px）
- 每个 item 必须用 `DynamicScrollerItem` 包裹
- `buffer` 设置为 200（预渲染区域）

---

## 3. 响应式断点

### UnoCSS 配置

```typescript
// uno.config.ts
theme: {
  screens: {
    'compact': '0px',      // 手机竖屏
    'medium': '600px',     // 手机横屏/小平板
    'expanded': '840px',   // 平板/小笔记本
    'large': '1200px',     // 桌面
    'xl': '1600px',        // 大屏
  }
}
```

### 布局策略

#### Home 页面

```vue
<style scoped>
.home-page__main {
  margin: 0 auto;
  padding: 80px 16px 96px;
  max-width: 100%;
}

@media (min-width: 600px) {
  .home-page__main {
    max-width: 600px;
    padding: 80px 24px 96px;
  }
}

@media (min-width: 840px) {
  .home-page__main {
    max-width: 800px;
    padding: 80px 32px 96px;
  }
}
</style>
```

#### Player 页面

```vue
<style scoped>
.player-page__container {
  display: flex;
  flex: 1;
  min-height: 0;
  padding-top: 48px;
  flex-direction: column; /* 小屏：纵向 */
}

@media (min-width: 840px) {
  .player-page__container {
    flex-direction: row; /* 大屏：横向 */
  }
}

.player-page__sidebar {
  width: 100%;
  max-height: 40vh; /* 小屏时限制高度 */
}

@media (min-width: 840px) {
  .player-page__sidebar {
    width: 320px;
    max-height: none;
  }
}
</style>
```

**测试方式**：浏览器 DevTools 响应式模式，测试 600px、840px、1200px 断点。

---

## 4. UnoCSS 配置改造

### 保留旧配置 + 新增 Material 3

```typescript
// uno.config.ts
theme: {
  colors: {
    // ========== 保留 Element Plus 色系（向后兼容）==========
    primary: {
      DEFAULT: '#409EFF',
      // ...
    },
    
    // ========== 新增 Material 3 色系 ==========
    md: {
      // Primary
      'primary': '#6750A4',
      'on-primary': '#FFFFFF',
      'primary-container': '#EADDFF',
      'on-primary-container': '#21005D',
      
      // Secondary
      'secondary': '#625B71',
      'on-secondary': '#FFFFFF',
      'secondary-container': '#E8DEF8',
      'on-secondary-container': '#1D192B',
      
      // Surface
      'surface': '#FFFBFE',
      'on-surface': '#1C1B1F',
      'surface-variant': '#E7E0EC',
      'on-surface-variant': '#49454F',
      
      // Error
      'error': '#B3261E',
      'on-error': '#FFFFFF',
      'error-container': '#F9DEDC',
      'on-error-container': '#410E0B',
      
      // Outline
      'outline': '#79747E',
      'outline-variant': '#CAC4D0',
    }
  },
  
  transitionTimingFunction: {
    'md-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'md-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
    'md-decelerated': 'cubic-bezier(0, 0, 0, 1)',
    'md-accelerated': 'cubic-bezier(0.4, 0, 1, 1)',
  },
  
  transitionDuration: {
    'md-short': '100ms',
    'md-medium': '200ms',
    'md-long': '400ms',
    'md-extra-long': '500ms',
  }
}
```

**使用方式**：
```html
<!-- 旧代码兼容 -->
<div class="bg-primary text-white">

<!-- 新代码 Material 3 -->
<div class="bg-md-primary text-md-on-primary">
```

---

## 5. State Layer 实现

```css
/* styles/material-utilities.css */
.md-state-layer {
  position: relative;
}

.md-state-layer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0;
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  border-radius: inherit;
}

.md-state-layer:hover::before { opacity: 0.08; }
.md-state-layer:focus-visible::before { opacity: 0.12; }
.md-state-layer:active::before { opacity: 0.16; }
```

**使用示例**：
```vue
<div class="subtitle-item md-state-layer" :class="{ 'is-active': active }">
  <p>Subtitle text...</p>
</div>
```

---

## 6. 动画策略

### 自定义 Material 过渡

```css
/* styles/material-utilities.css */

/* 淡入淡出 */
.md-fade-enter-active,
.md-fade-leave-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.md-fade-enter-from,
.md-fade-leave-to {
  opacity: 0;
}

/* 缩放淡入 */
.md-scale-enter-active,
.md-scale-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.md-scale-enter-from,
.md-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 滑入（从下） */
.md-slide-up-enter-active,
.md-slide-up-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.md-slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.md-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
```

**使用**：
```vue
<template>
  <transition name="md-scale">
    <div v-if="show" class="word-popup">...</div>
  </transition>
</template>
```

---

## 7. Element Plus 组件定制

### el-button

```scss
/* styles/element-plus-material.scss */
.el-button {
  border-radius: var(--md-sys-shape-corner-large);
  font-weight: 500;
  letter-spacing: 0.1px;
  
  &--primary {
    background: var(--md-sys-color-primary);
    border-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    
    &:hover {
      background: color-mix(in srgb, var(--md-sys-color-primary) 92%, black);
    }
  }
  
  &.is-plain {
    background: transparent;
    border: 1px solid var(--md-sys-color-outline);
    color: var(--md-sys-color-primary);
    
    &:hover {
      background: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
    }
  }
  
  &.is-text {
    border: none;
    color: var(--md-sys-color-primary);
    
    &:hover {
      background: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
    }
  }
}
```

### el-input

```scss
.el-input {
  .el-input__wrapper {
    border-radius: var(--md-sys-shape-corner-extra-small);
    border: 1px solid var(--md-sys-color-outline);
    background: transparent;
    box-shadow: none;
    
    &:hover {
      border-color: var(--md-sys-color-on-surface);
    }
    
    &.is-focus {
      border-color: var(--md-sys-color-primary);
      border-width: 2px;
      box-shadow: none;
    }
  }
}
```

### el-progress

```scss
.el-progress {
  .el-progress-bar__outer {
    background: var(--md-sys-color-surface-variant);
    border-radius: var(--md-sys-shape-corner-full);
  }
  
  .el-progress-bar__inner {
    background: var(--md-sys-color-primary);
    border-radius: var(--md-sys-shape-corner-full);
  }
}
```

---

## 8. 文件结构（最终版）

```
src/
├── styles/
│   ├── material-tokens.css           # Material Design Tokens
│   ├── element-plus-material.scss    # Element Plus 主题定制
│   ├── material-utilities.css        # Ripple、State Layer、过渡
│   └── main.scss                     # 入口
│
├── composables/
│   └── useMaterialRipple.ts          # Ripple composable
│
├── components/
│   ├── material/
│   │   ├── MdCard.vue
│   │   ├── MdFab.vue                 # 只有圆形 FAB
│   │   ├── MdChip.vue
│   │   └── MdTopAppBar.vue
│   │
│   ├── player/
│   │   ├── VideoPlayer.vue
│   │   ├── SubtitleOverlay.vue
│   │   ├── WordPopup.vue             # 固定位置
│   │   ├── PlayerControls.vue
│   │   ├── SubtitleList.vue          # DynamicScroller
│   │   └── SubtitleListItem.vue
│   │
│   ├── home/
│   │   ├── UploadCard.vue
│   │   └── RecentItem.vue
│   │
│   ├── history/
│   │   └── HistoryItem.vue
│   │
│   └── vocabulary/
│       └── VocabCard.vue
│
└── views/
    ├── home/index.vue                # 响应式布局
    ├── player/index.vue              # 响应式布局
    ├── history/index.vue
    └── vocabulary/index.vue
```

---

## 9. 实现顺序

### Phase 1: 基础设施
1. 创建 `material-tokens.css`
2. 创建 `element-plus-material.scss`
3. 创建 `material-utilities.css`
4. 更新 `uno.config.ts`
5. 创建 `useMaterialRipple.ts`
6. 在 `main.ts` 中引入样式和虚拟滚动库

### Phase 2: Material 基础组件
1. MdCard
2. MdFab（只有圆形）
3. MdChip
4. MdTopAppBar

### Phase 3: 页面组件拆分
1. Home 页面组件
2. Player 页面组件
3. History/Vocabulary 页面组件

### Phase 4: 页面重构
1. Home 页面
2. Player 页面
3. History 页面
4. Vocabulary 页面

### Phase 5: 清理
1. 删除所有 SCSS
2. 验证响应式
3. 性能测试

---

## 10. 验收标准

### 视觉一致性
- [ ] 所有颜色使用 Material 3 tokens
- [ ] 所有圆角使用 Material 3 shape 系统
- [ ] 所有阴影使用 Material 3 elevation 系统
- [ ] Element Plus 组件看起来像 Material 3

### 交互体验
- [ ] 所有可点击元素有 Ripple 效果
- [ ] 所有交互元素有 State Layer
- [ ] 过渡动画使用 Material 3 缓动曲线
- [ ] 字幕列表滚动流畅

### 响应式
- [ ] 600px 断点正常显示
- [ ] 840px 断点正常显示
- [ ] 1200px 断点正常显示
- [ ] Player 页面小屏时字幕列表在底部

### 代码质量
- [ ] 删除所有 SCSS 文件
- [ ] 页面组件不超过 150 行
- [ ] 可复用组件抽取到 components
- [ ] 使用 UnoCSS 原子类

---

## 11. 风险和缓解

### 风险 1：虚拟滚动性能
- **缓解**：设置合理的 buffer 值（200）

### 风险 2：Element Plus 定制不完全
- **缓解**：优先定制常用组件

### 风险 3：响应式布局复杂度
- **缓解**：使用 CSS Grid/Flexbox

### 风险 4：Ripple 效果性能
- **缓解**：使用 Set 管理，及时清理

---

## 12. 后续优化方向（不在本次范围）

- 暗色主题支持
- 路由转场动画
- 骨架屏加载状态
- 国际化（i18n）
- 单元测试和 E2E 测试
- 性能监控和优化
- 无障碍（a11y）增强
