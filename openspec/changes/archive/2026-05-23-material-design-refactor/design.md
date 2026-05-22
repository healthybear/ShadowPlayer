# Material Design 3 设计方案

## 设计系统架构

### 1. Design Tokens

Material Design 3 的核心是 Design Tokens 系统，定义所有视觉属性的基础值。

#### 颜色系统

基于 Material Color System，从主色 `#6750A4` 生成完整配色方案：

```css
:root {
  /* Primary - 主色（紫色，教育感） */
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-on-primary-container: #21005D;

  /* Secondary - 辅助色 */
  --md-sys-color-secondary: #625B71;
  --md-sys-color-on-secondary: #FFFFFF;
  --md-sys-color-secondary-container: #E8DEF8;
  --md-sys-color-on-secondary-container: #1D192B;

  /* Tertiary - 第三色 */
  --md-sys-color-tertiary: #7D5260;
  --md-sys-color-on-tertiary: #FFFFFF;
  --md-sys-color-tertiary-container: #FFD8E4;
  --md-sys-color-on-tertiary-container: #31111D;

  /* Error - 错误色 */
  --md-sys-color-error: #B3261E;
  --md-sys-color-on-error: #FFFFFF;
  --md-sys-color-error-container: #F9DEDC;
  --md-sys-color-on-error-container: #410E0B;

  /* Surface - 表面色 */
  --md-sys-color-surface: #FFFBFE;
  --md-sys-color-on-surface: #1C1B1F;
  --md-sys-color-surface-variant: #E7E0EC;
  --md-sys-color-on-surface-variant: #49454F;

  /* Background - 背景色 */
  --md-sys-color-background: #FFFBFE;
  --md-sys-color-on-background: #1C1B1F;

  /* Outline - 边框色 */
  --md-sys-color-outline: #79747E;
  --md-sys-color-outline-variant: #CAC4D0;
}
```

#### 字体系统

Material 3 定义了 5 个字体类别：

```css
:root {
  /* Display - 最大标题 */
  --md-sys-typescale-display-large: 400 57px/64px 'Roboto', sans-serif;
  --md-sys-typescale-display-medium: 400 45px/52px 'Roboto', sans-serif;
  --md-sys-typescale-display-small: 400 36px/44px 'Roboto', sans-serif;

  /* Headline - 页面标题 */
  --md-sys-typescale-headline-large: 400 32px/40px 'Roboto', sans-serif;
  --md-sys-typescale-headline-medium: 400 28px/36px 'Roboto', sans-serif;
  --md-sys-typescale-headline-small: 400 24px/32px 'Roboto', sans-serif;

  /* Title - 组件标题 */
  --md-sys-typescale-title-large: 400 22px/28px 'Roboto', sans-serif;
  --md-sys-typescale-title-medium: 500 16px/24px 'Roboto', sans-serif;
  --md-sys-typescale-title-small: 500 14px/20px 'Roboto', sans-serif;

  /* Body - 正文 */
  --md-sys-typescale-body-large: 400 16px/24px 'Roboto', sans-serif;
  --md-sys-typescale-body-medium: 400 14px/20px 'Roboto', sans-serif;
  --md-sys-typescale-body-small: 400 12px/16px 'Roboto', sans-serif;

  /* Label - 标签/按钮 */
  --md-sys-typescale-label-large: 500 14px/20px 'Roboto', sans-serif;
  --md-sys-typescale-label-medium: 500 12px/16px 'Roboto', sans-serif;
  --md-sys-typescale-label-small: 500 11px/16px 'Roboto', sans-serif;
}
```

#### 形状系统（圆角）

```css
:root {
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-full: 9999px;
}
```

#### 高度系统（阴影）

```css
:root {
  --md-sys-elevation-level0: none;
  --md-sys-elevation-level1: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level2: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level3: 0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3);
  --md-sys-elevation-level4: 0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3);
  --md-sys-elevation-level5: 0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3);
}
```

---

## Element Plus 主题定制

将 Element Plus 的 CSS 变量映射到 Material Design Tokens：

```scss
:root {
  // 颜色映射
  --el-color-primary: var(--md-sys-color-primary);
  --el-color-primary-light-3: var(--md-sys-color-primary-container);
  --el-color-primary-light-9: var(--md-sys-color-primary-container);
  
  --el-color-success: #2E7D32;
  --el-color-danger: var(--md-sys-color-error);
  --el-color-error: var(--md-sys-color-error);

  // 文字颜色
  --el-text-color-primary: var(--md-sys-color-on-surface);
  --el-text-color-regular: var(--md-sys-color-on-surface-variant);
  --el-text-color-secondary: var(--md-sys-color-on-surface-variant);

  // 背景颜色
  --el-bg-color: var(--md-sys-color-surface);
  --el-bg-color-page: var(--md-sys-color-background);

  // 边框颜色
  --el-border-color: var(--md-sys-color-outline-variant);
  --el-border-color-lighter: var(--md-sys-color-outline-variant);

  // 圆角 - Material 3 使用更大的圆角
  --el-border-radius-base: var(--md-sys-shape-corner-medium);
  --el-border-radius-small: var(--md-sys-shape-corner-small);
  --el-border-radius-round: var(--md-sys-shape-corner-full);

  // 字体
  --el-font-family: 'Roboto', sans-serif;

  // 阴影 - 使用 Material elevation
  --el-box-shadow-light: var(--md-sys-elevation-level1);
  --el-box-shadow: var(--md-sys-elevation-level2);
  --el-box-shadow-dark: var(--md-sys-elevation-level3);
}
```

---

## 组件设计

### Material 基础组件

#### MdCard - Material 卡片
#### MdFab - Floating Action Button  
#### MdChip - Filter Chip

详细实现见 specs。

---

## 页面重构设计

### Home 页面

使用 MdCard + MdFab 实现上传卡片，elevation-2，extra-large 圆角。

### Player 页面

拆分为：VideoPlayer、SubtitleOverlay、WordPopup、PlayerControls、SubtitleList 组件。

### History/Vocabulary 页面

使用 MdCard 展示列表项，统一 elevation-1。

---

## 文件结构

```
src/
├── styles/
│   ├── material-tokens.css
│   ├── element-plus-material.scss
│   └── material-utilities.css
├── components/
│   ├── material/
│   ├── player/
│   ├── home/
│   └── ...
└── views/
```

---

## 实现优先级

1. Phase 1: 基础设施（tokens、theme）
2. Phase 2: Material 基础组件
3. Phase 3: 页面组件拆分
4. Phase 4: 页面重构
5. Phase 5: 清理 SCSS
