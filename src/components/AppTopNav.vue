<script setup lang="ts">
defineOptions({ name: 'AppTopNav' })

const props = withDefaults(
  defineProps<{
    /** 对应 Figma: 8:330 player / 8:341+ history / 8:372 vocabulary / 1:73 home */
    navPreset: 'home' | 'history' | 'vocabulary' | 'player'
  }>(),
  { navPreset: 'home' },
)

const route = useRoute()

const links = [
  { to: '/', key: 'home' as const, label: 'Home' },
  { to: '/history', key: 'history' as const, label: 'History' },
  { to: '/vocabulary', key: 'vocabulary' as const, label: 'Vocabulary' },
] as const

type Visual =
  | 'primary' /** 蓝 + 下划线 */
  | 'inactive' /** 灰、无下划线 */
  | 'player-home' /** 8:330: 灰 + 灰下划线 */
  | 'player-history' /** 8:330: 仅蓝字 */
  | 'player-inactive' /** 8:330: 灰字 */

function getVisual(
  key: (typeof links)[number]['key'],
  path: string,
): Visual {
  if (props.navPreset === 'player') {
    if (key === 'home') return 'player-home'
    if (key === 'history') return 'player-history'
    return 'player-inactive'
  }

  const presetActive: Record<
    Exclude<typeof props.navPreset, 'player'>,
    (typeof links)[number]['key'] | null
  > = {
    home: path === '/' ? 'home' : null,
    history: path === '/history' ? 'history' : null,
    vocabulary: path === '/vocabulary' ? 'vocabulary' : null,
  }

  const want = presetActive[props.navPreset as Exclude<typeof props.navPreset, 'player'>]
  if (want == null) return 'inactive'
  return want === key ? 'primary' : 'inactive'
}

const linkStates = computed(() => {
  const p = route.path
  return links.map((l) => ({
    l,
    v: getVisual(l.key, p),
  }))
})
</script>

<template>
  <header class="app-top-nav">
    <div class="app-top-nav__container">
      <RouterLink to="/" class="app-top-nav__logo">
        ShadowPlayer
      </RouterLink>

      <nav class="app-top-nav__menu">
        <RouterLink
          v-for="{ l, v } in linkStates"
          :key="l.key"
          :to="l.to"
          :class="['app-top-nav__link', `app-top-nav__link--${v}`]"
        >
          {{ l.label }}
        </RouterLink>
      </nav>

      <el-avatar
        :size="36"
        src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        aria-label="账户"
        class="app-top-nav__avatar"
      />
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--el-index-top);
  width: 100%;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 2px rgba(243, 244, 246, 0.5);
  padding-bottom: 1px;

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 32px;
    box-sizing: border-box;
  }

  &__logo {
    display: inline-flex;
    align-items: center;
    height: 28px;
    max-width: 121px;
    flex-shrink: 0;
    font-size: 18px;
    font-weight: 700;
    line-height: 28px;
    letter-spacing: -0.45px;
    color: var(--el-color-primary);
    text-decoration: none;
  }

  &__menu {
    display: flex;
    align-items: stretch;
    height: 100%;
    flex-shrink: 0;
    gap: 32px;
  }

  &__link {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    font-size: var(--el-font-size-base);
    font-weight: 500;
    line-height: 20px;
    letter-spacing: -0.35px;
    transition: color var(--el-transition-duration);

    // Primary state: 蓝 + 下划线
    &--primary {
      padding-top: 12px;
      padding-bottom: 14px;
      color: var(--el-color-primary);
      border-bottom: 2px solid var(--el-color-primary);
    }

    // Inactive state: 灰、无下划线
    &--inactive {
      padding-top: 11.5px;
      padding-bottom: 12.5px;
      color: var(--el-text-color-secondary);
    }

    // Player-home state: 灰 + 灰下划线
    &--player-home {
      padding-top: 12px;
      padding-bottom: 14px;
      color: var(--el-text-color-secondary);
      border-bottom: 2px solid var(--el-text-color-secondary);
    }

    // Player-history state: 仅蓝字
    &--player-history {
      padding-top: 11.5px;
      padding-bottom: 12.5px;
      color: var(--el-color-primary);
    }

    // Player-inactive state: 灰字
    &--player-inactive {
      padding-top: 11.5px;
      padding-bottom: 12.5px;
      color: var(--el-text-color-secondary);
    }
  }

  &__avatar {
    flex-shrink: 0;
    cursor: pointer;
  }
}
</style>
