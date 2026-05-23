import { onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcutHandlers {
  onTogglePlay?: () => void
  onSeekBackward?: () => void
  onSeekForward?: () => void
  onVolumeUp?: () => void
  onVolumeDown?: () => void
  onToggleFullscreen?: () => void
  onToggleMute?: () => void
  onToggleSubtitle?: () => void
  onDecreaseSpeed?: () => void
  onIncreaseSpeed?: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  function handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    switch (event.key) {
      case ' ':
        event.preventDefault()
        handlers.onTogglePlay?.()
        break
      case 'ArrowLeft':
        event.preventDefault()
        handlers.onSeekBackward?.()
        break
      case 'ArrowRight':
        event.preventDefault()
        handlers.onSeekForward?.()
        break
      case 'ArrowUp':
        event.preventDefault()
        handlers.onVolumeUp?.()
        break
      case 'ArrowDown':
        event.preventDefault()
        handlers.onVolumeDown?.()
        break
      case 'f':
      case 'F':
        event.preventDefault()
        handlers.onToggleFullscreen?.()
        break
      case 'm':
      case 'M':
        event.preventDefault()
        handlers.onToggleMute?.()
        break
      case 'c':
      case 'C':
        event.preventDefault()
        handlers.onToggleSubtitle?.()
        break
      case '<':
      case ',':
        event.preventDefault()
        handlers.onDecreaseSpeed?.()
        break
      case '>':
      case '.':
        event.preventDefault()
        handlers.onIncreaseSpeed?.()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
