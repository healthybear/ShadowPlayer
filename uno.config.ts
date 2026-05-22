import { defineConfig, presetAttributify, presetWind4 } from 'unocss'

// Element Plus 设计 token（与官方 CSS 变量保持一致）
// https://element-plus.org/zh-CN/guide/theming.html

export default defineConfig({
  presets: [
    presetWind4(),
    presetAttributify(),
  ],

  theme: {
    colors: {
      // Material Design 3 colors (md- prefix)
      md: {
        primary: '#6750A4',
        'on-primary': '#FFFFFF',
        'primary-container': '#EADDFF',
        'on-primary-container': '#21005D',
        secondary: '#625B71',
        'on-secondary': '#FFFFFF',
        'secondary-container': '#E8DEF8',
        'on-secondary-container': '#1D192B',
        tertiary: '#7D5260',
        'on-tertiary': '#FFFFFF',
        'tertiary-container': '#FFD8E4',
        'on-tertiary-container': '#31111D',
        error: '#B3261E',
        'on-error': '#FFFFFF',
        'error-container': '#F9DEDC',
        'on-error-container': '#410E0B',
        surface: '#FFFBFE',
        'on-surface': '#1C1B1F',
        'surface-variant': '#E7E0EC',
        'on-surface-variant': '#49454F',
        background: '#FFFBFE',
        'on-background': '#1C1B1F',
        outline: '#79747E',
        'outline-variant': '#CAC4D0',
      },
      // 主题色阶（对应 --el-color-primary 系列）
      primary: {
        DEFAULT:  '#409EFF',
        'light-3': '#79BBFF',
        'light-5': '#A0CFFF',
        'light-7': '#C6E2FF',
        'light-8': '#D9ECFF',
        'light-9': '#ECF5FF',
        'dark-2':  '#337ECC',
      },
      success: {
        DEFAULT:  '#67C23A',
        'light-3': '#95D475',
        'light-5': '#B3E19D',
        'light-7': '#D1EDB8',
        'light-8': '#E1F3D8',
        'light-9': '#F0F9EB',
        'dark-2':  '#529B2E',
      },
      warning: {
        DEFAULT:  '#E6A23C',
        'light-3': '#EEBE77',
        'light-5': '#F3D19E',
        'light-7': '#F8E3C5',
        'light-8': '#FAECD8',
        'light-9': '#FDF6EC',
        'dark-2':  '#B88230',
      },
      danger: {
        DEFAULT:  '#F56C6C',
        'light-3': '#F89898',
        'light-5': '#FAB6B6',
        'light-7': '#FCD3D3',
        'light-8': '#FDE2E2',
        'light-9': '#FEF0F0',
        'dark-2':  '#C45656',
      },
      info: {
        DEFAULT:  '#909399',
        'light-3': '#B1B3B8',
        'light-5': '#C8C9CC',
        'light-7': '#DEDFE0',
        'light-8': '#E9E9EB',
        'light-9': '#F4F4F5',
        'dark-2':  '#73767A',
      },
      // 文字色（对应 --el-text-color 系列）
      'text-primary':     '#303133',
      'text-regular':     '#606266',
      'text-secondary':   '#909399',
      'text-placeholder': '#A8ABB2',
      'text-disabled':    '#C0C4CC',
      // 边框色（对应 --el-border-color 系列）
      'border':             '#DCDFE6',
      'border-light':       '#E4E7ED',
      'border-lighter':     '#EBEEF5',
      'border-extra-light': '#F2F6FC',
      // 填充背景（对应 --el-fill-color 系列）
      'fill':         '#F0F2F5',
      'fill-light':   '#F5F7FA',
      'fill-lighter': '#FAFAFA',
      'fill-darker':  '#E6E8EB',
      'bg-page':      '#F2F6FC',
    },

    borderRadius: {
      // Material Design 3 shape tokens
      'md-none': '0px',
      'md-extra-small': '4px',
      'md-small': '8px',
      'md-medium': '12px',
      'md-large': '16px',
      'md-extra-large': '28px',
      'md-full': '9999px',
      // 对应 --el-border-radius 系列
      'sm':     '2px',
      'base':   '4px',
      DEFAULT:  '4px',
      'round':  '20px',
      'circle': '50%',
    },

    boxShadow: {
      // 对应 --el-box-shadow 系列
      'base':    '0px 12px 32px 4px rgba(0,0,0,.04), 0px 8px 20px rgba(0,0,0,.08)',
      'light':   '0px 0px 12px rgba(0,0,0,.12)',
      'lighter': '0px 0px 6px rgba(0,0,0,.12)',
      'dark':    '0px 16px 48px 16px rgba(0,0,0,.08), 0px 12px 32px rgba(0,0,0,.12), 0px 8px 16px -8px rgba(0,0,0,.16)',
    },

    spacing: {
      // 4px 基准间距系统
      'xs':   '4px',
      'sm':   '8px',
      'md':   '12px',
      'lg':   '16px',
      'xl':   '24px',
      'xxl':  '32px',
      'xxxl': '48px',
    },

    zIndex: {
      // 对应 --el-index 系列
      'normal': '1',
      'top':    '1000',
      'popper': '2000',
    },

    transitionDuration: {
      // Material Design 3 motion durations
      'md-short1': '50ms',
      'md-short2': '100ms',
      'md-short3': '150ms',
      'md-short4': '200ms',
      'md-medium1': '250ms',
      'md-medium2': '300ms',
      'md-medium3': '350ms',
      'md-medium4': '400ms',
      'md-long1': '450ms',
      'md-long2': '500ms',
      'md-long3': '550ms',
      'md-long4': '600ms',
      // 对应 --el-transition-duration 系列
      'el':      '0.3s',
      'el-fast': '0.2s',
    },

    transitionTimingFunction: {
      // Material Design 3 easing curves
      'md-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'md-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
      'md-emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
      'md-emphasized-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    },
  },

  // Material Design 3 breakpoints
  breakpoints: {
    'md-compact': '0px',
    'md-medium': '600px',
    'md-expanded': '840px',
    'md-large': '1200px',
    'md-extra-large': '1600px',
  },

  shortcuts: {
    // ============ Flex 布局 ============
    'flex-center':     'flex items-center justify-center',
    'flex-between':    'flex items-center justify-between',
    'flex-around':     'flex items-center justify-around',
    'flex-start':      'flex items-center justify-start',
    'flex-end':        'flex items-center justify-end',
    'flex-col-center': 'flex flex-col items-center justify-center',

    // ============ 定位 ============
    'abs-center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'abs-full':   'absolute top-0 left-0 w-full h-full',
    'fixed-full': 'fixed top-0 left-0 w-full h-full',

    // ============ 尺寸 ============
    'size-full':   'w-full h-full',
    'size-screen': 'w-screen h-screen',
    // 对应 Element Plus 组件三档高度规范
    'h-el-sm':   'h-6',    // 24px — small
    'h-el-base': 'h-8',    // 32px — default
    'h-el-lg':   'h-10',   // 40px — large
    // 图标尺寸
    'icon-sm':   'w-3.5 h-3.5',  // 14px
    'icon-base': 'w-4 h-4',      // 16px
    'icon-lg':   'w-[18px] h-[18px]', // 18px

    // ============ 文字颜色（语义） ============
    'text-el-primary':     'text-[#409EFF]',
    'text-el-success':     'text-[#67C23A]',
    'text-el-warning':     'text-[#E6A23C]',
    'text-el-danger':      'text-[#F56C6C]',
    'text-el-info':        'text-[#909399]',
    // 文字层级
    'text-main':        'text-[#303133]',
    'text-regular':     'text-[#606266]',
    'text-secondary':   'text-[#909399]',
    'text-placeholder': 'text-[#A8ABB2]',
    'text-disabled':    'text-[#C0C4CC]',

    // ============ 文字样式（尺寸 + 颜色 + 粗细组合） ============
    // 对应 Element Plus 字号规范：extra-large 20 / large 18 / medium 16 / base 14 / small 13 / extra-small 12
    'type-page-title':  'text-[20px] leading-[1.4] font-semibold text-[#303133]',  // 页面主标题
    'type-section':     'text-[18px] leading-[1.4] font-semibold text-[#303133]',  // 区块标题
    'type-card-title':  'text-[16px] leading-[1.5] font-medium  text-[#303133]',  // 卡片标题
    'type-body-em':     'text-[14px] leading-[1.5] font-medium  text-[#303133]',  // 强调正文
    'type-body':        'text-[14px] leading-[1.5] font-normal  text-[#606266]',  // 普通正文
    'type-caption':     'text-[13px] leading-[1.5] font-normal  text-[#909399]',  // 辅助说明
    'type-hint':        'text-[12px] leading-[1.5] font-normal  text-[#A8ABB2]',  // 提示/备注
    'type-label':       'text-[12px] leading-[1.5] font-medium  text-[#606266]',  // 表单标签

    // ============ 文字截断 ============
    'text-clip':   'overflow-hidden whitespace-nowrap text-ellipsis',
    'text-clip-2': 'overflow-hidden line-clamp-2',
    'text-clip-3': 'overflow-hidden line-clamp-3',

    // ============ 边框 ============
    'bd':         'border border-[#DCDFE6]',
    'bd-light':   'border border-[#E4E7ED]',
    'bd-lighter': 'border border-[#EBEEF5]',
    'divider-x':  'border-t border-[#EBEEF5]',
    'divider-y':  'border-l border-[#EBEEF5]',

    // ============ 背景填充 ============
    'fill-base':    'bg-[#F0F2F5]',
    'fill-light':   'bg-[#F5F7FA]',
    'fill-lighter': 'bg-[#FAFAFA]',
    'bg-page':      'bg-[#F2F6FC]',

    // ============ 状态 Tag（对应 el-tag 样式） ============
    'tag-primary': 'inline-flex items-center px-2 py-0.5 rounded text-xs text-[#409EFF] bg-[#ECF5FF] border border-[#C6E2FF]',
    'tag-success': 'inline-flex items-center px-2 py-0.5 rounded text-xs text-[#67C23A] bg-[#F0F9EB] border border-[#D1EDB8]',
    'tag-warning': 'inline-flex items-center px-2 py-0.5 rounded text-xs text-[#E6A23C] bg-[#FDF6EC] border border-[#F8E3C5]',
    'tag-danger':  'inline-flex items-center px-2 py-0.5 rounded text-xs text-[#F56C6C] bg-[#FEF0F0] border border-[#FCD3D3]',
    'tag-info':    'inline-flex items-center px-2 py-0.5 rounded text-xs text-[#909399] bg-[#F4F4F5] border border-[#DEDFE0]',

    // ============ 卡片 / 容器 ============
    'card':         'rounded bg-white shadow-light p-4 bd-lighter',
    'card-lg':      'rounded bg-white shadow-light p-6 bd-lighter',
    'card-section': 'rounded bg-[#F5F7FA] p-4',
    'glass':        'backdrop-blur-md bg-white/30 border border-white/20',

    // ============ 滚动 ============
    'scroll-y':    'overflow-y-auto overflow-x-hidden',
    'scroll-x':    'overflow-x-auto overflow-y-hidden',
    'scroll-hide': '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',

    // ============ 交互 ============
    'btn-hover':  'cursor-pointer transition-opacity duration-200 hover:opacity-70 active:opacity-50',
    'btn-scale':  'cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95',
    'btn-dim':    'cursor-pointer transition-colors duration-200 hover:bg-[#F5F7FA] active:bg-[#EBEEF5]',
    'no-select':  'select-none',
    'pointer':    'cursor-pointer',
    'disabled':   'opacity-50 cursor-not-allowed pointer-events-none',
  },
})
