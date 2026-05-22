# Material Design 3 全面重构

## 概述

将 ShadowPlayer 从当前的混合样式系统（Element Plus 默认主题 + 零散的 SCSS BEM）全面重构为 Material Design 3 风格，建立统一的设计语言和组件系统。

## 问题陈述

当前 UI 实现存在以下问题：

1. **样式系统混乱**
   - 之前使用 UnoCSS 原子类，现在改成了冗长的 SCSS BEM
   - 280-520 行的 SCSS 只是在重复 CSS 基础属性
   - 没有充分利用 UnoCSS 的优势

2. **Element Plus 集成敷衍**
   - 只替换了进度条、分页等基础组件
   - 没有使用布局组件（`el-container`、`el-card`）
   - 没有统一的主题定制

3. **视觉设计平庸**
   - 使用 Element Plus 默认样式，没有品牌特色
   - 缺乏统一的视觉语言（间距、圆角、阴影随意）
   - 没有微交互和动画

4. **组件结构不合理**
   - 页面组件过于臃肿（player/index.vue 520 行）
   - 重复代码多（列表项、卡片等未抽取）
   - 查词浮层等硬编码在模板中

## 目标

### 设计目标
- 采用 Material Design 3 (Material You) 设计语言
- 主色：`#6750A4`（紫色，教育感/温暖）
- 建立完整的 Design Token 系统
- 实现流畅的微交互和动画

### 技术目标
- 深度定制 Element Plus，使其符合 Material 3 风格
- 回归 UnoCSS 原子类 + CSS 变量
- 组件化：拆分页面为可复用的小组件
- 删除所有 SCSS BEM 代码

## 范围

### 包含
- ✅ 建立 Material Design 3 Token 系统（颜色、字体、圆角、阴影、间距）
- ✅ 定制 Element Plus 主题（覆盖 CSS 变量）
- ✅ 创建 Material 基础组件（MdCard、MdFab、MdChip、MdTopAppBar）
- ✅ 重构所有页面（Home、Player、History、Vocabulary）
- ✅ 组件化拆分（VideoPlayer、SubtitleList、PlayerControls 等）
- ✅ 添加微交互（ripple、hover、focus 状态）
- ✅ 删除所有 SCSS 文件

### 不包含
- ❌ 功能逻辑变更（仍然是静态数据展示）
- ❌ 路由和状态管理调整
- ❌ 响应式适配（暂时只考虑桌面端）
- ❌ 暗色主题（后续单独实现）

## 成功标准

1. **视觉一致性**
   - 所有页面遵循 Material 3 设计规范
   - 颜色、圆角、阴影、间距使用统一的 Token
   - Element Plus 组件看起来像 Material 3 组件

2. **代码质量**
   - 删除所有 SCSS 文件，使用 UnoCSS + CSS 变量
   - 页面组件不超过 150 行
   - 可复用组件抽取到 `src/components/`

3. **用户体验**
   - 交互流畅，有适当的动画和反馈
   - 视觉层次清晰，信息易读
   - 符合 Material 3 的交互规范（ripple、state layer）

## 风险和依赖

### 风险
- Element Plus 的某些组件可能难以完全定制为 Material 风格
- 一次性重构工作量大，可能引入回归问题

### 缓解措施
- 优先改造 Home 页面，验证方案可行性
- 保持 git 提交粒度，便于回滚
- 改造完成后进行视觉回归测试

### 依赖
- UnoCSS 已配置
- Element Plus 已安装
- Figma 设计资源（缩略图等）需要保留

## 实现策略

### 阶段 1：设计系统基础
1. 创建 Material Design 3 Token 文件
2. 定制 Element Plus 主题
3. 创建 Material 基础组件

### 阶段 2：组件拆分
1. 拆分 Player 页面组件
2. 拆分 Home 页面组件
3. 拆分 History/Vocabulary 页面组件

### 阶段 3：页面重构
1. 重构 Home 页面
2. 重构 Player 页面
3. 重构 History 页面
4. 重构 Vocabulary 页面

### 阶段 4：清理和优化
1. 删除所有 SCSS 文件
2. 优化动画和交互
3. 代码审查和测试

## 时间估算

- 设计系统基础：2-3 小时
- 组件拆分：3-4 小时
- 页面重构：4-5 小时
- 清理优化：1-2 小时

**总计：10-14 小时**

## 替代方案

### 方案 A：渐进式改造
- 先改造一个页面验证方案
- 风险低，但周期长

### 方案 B：引入 Vuetify 3
- 使用现成的 Material 组件库
- 但需要替换 Element Plus，迁移成本高

### 方案 C：保持现状，局部优化
- 只优化样式，不重构架构
- 治标不治本

**选择：一次性重构（当前方案）**
- 彻底解决问题
- 建立长期可维护的设计系统
- 用户已明确要求全部重做
