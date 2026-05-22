/**
 * Material Design 3 Ripple Effect (波纹效果)
 *
 * Ripple 是 Material Design 的标志性交互反馈效果：
 * - 从点击位置向外扩散的圆形波纹
 * - 提供即时的视觉反馈，让用户知道点击被识别
 * - 符合"物理隐喻"设计原则（像水波纹一样扩散）
 *
 * 实现原理：
 * 1. 监听 click 事件获取点击坐标
 * 2. 在点击位置创建一个圆形 <span> 元素
 * 3. 用 CSS animation 让圆形从小到大扩散并淡出
 * 4. 动画结束后移除 DOM 元素，避免内存泄漏
 *
 * 为什么要封装成 composable？
 * - 可复用：多个组件可以共享同一个 ripple 逻辑
 * - 可测试：逻辑独立，易于单元测试
 * - 生命周期管理：自动清理，防止内存泄漏
 *
 * 企业项目经验：
 * - 交互反馈是用户体验的关键，不要忽视这些"小细节"
 * - 动态创建的 DOM 必须有清理机制，否则会导致内存泄漏
 * - Composable 是 Vue 3 中复用逻辑的最佳实践
 *
 * @see https://m3.material.io/foundations/interaction/states/state-layers
 */

import { onBeforeUnmount } from 'vue'

export function useMaterialRipple() {
  // 使用 Set 而不是 Array 的原因：
  // - Set.delete() 是 O(1)，Array.splice() 是 O(n)
  // - 频繁添加/删除 ripple 元素时，Set 性能更好
  // - Set 自动去重（虽然这里用不到，但是额外的保障）
  //
  // 企业项目经验：选择正确的数据结构能带来数量级的性能提升
  const ripples = new Set<HTMLElement>()

  const createRipple = (event: MouseEvent, container: HTMLElement) => {
    const rect = container.getBoundingClientRect()

    // 计算 ripple 的直径 = 容器的最长边
    // 为什么？确保 ripple 能覆盖整个容器（从角落点击时也能完全覆盖）
    //
    // 几何原理：
    // - 矩形对角线长度 = √(width² + height²)
    // - 但 max(width, height) 更简单且足够（稍大一点也无妨）
    const size = Math.max(rect.width, rect.height)

    // 计算 ripple 的起始位置（圆心在点击位置）
    // - event.clientX/Y: 点击位置相对于视口的坐标
    // - rect.left/top: 容器相对于视口的坐标
    // - size / 2: 圆形的半径，让圆心对齐点击位置
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    // 创建 ripple DOM 元素
    const ripple = document.createElement('span')
    ripple.className = 'md-ripple'
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    container.appendChild(ripple)
    ripples.add(ripple)

    const removeRipple = () => {
      ripple.remove()
      ripples.delete(ripple)
    }

    // 动画结束后自动清理 DOM
    // 企业项目经验：任何动态创建的 DOM 都必须有清理机制，否则内存泄漏
    ripple.addEventListener('animationend', removeRipple)

    // 返回清理函数，允许调用者手动清理
    // 使用场景：组件销毁时立即清理所有 ripple，不等动画结束
    return removeRipple
  }

  const cleanup = () => {
    // 组件卸载时清理所有未完成的 ripple
    // 为什么需要？
    // - 如果组件在 ripple 动画进行中被销毁，DOM 元素会残留
    // - 残留的 DOM 元素会导致内存泄漏
    // - 事件监听器也会残留，进一步加剧内存泄漏
    //
    // 企业项目经验：
    // - Vue 组件生命周期管理是防止内存泄漏的关键
    // - 任何副作用（DOM 操作、事件监听、定时器）都要在 onBeforeUnmount 中清理
    ripples.forEach(ripple => {
      ripple.remove()
    })
    ripples.clear()
  }

  // Vue 3 生命周期钩子：组件卸载前执行
  // 确保组件销毁时清理所有 ripple，防止内存泄漏
  onBeforeUnmount(cleanup)

  return {
    createRipple,
    cleanup,
  }
}
