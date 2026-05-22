import { onBeforeUnmount } from 'vue'

export function useMaterialRipple() {
  const ripples = new Set<HTMLElement>()

  const createRipple = (event: MouseEvent, container: HTMLElement) => {
    const rect = container.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

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

    ripple.addEventListener('animationend', removeRipple)

    return removeRipple
  }

  const cleanup = () => {
    ripples.forEach(ripple => {
      ripple.remove()
    })
    ripples.clear()
  }

  onBeforeUnmount(cleanup)

  return {
    createRipple,
    cleanup,
  }
}
