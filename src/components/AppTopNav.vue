<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu } from '@element-plus/icons-vue'
import MdTopAppBar from '@/components/material/MdTopAppBar.vue'

defineOptions({ name: 'AppTopNav' })

const props = withDefaults(
  defineProps<{
    navPreset: 'home' | 'history' | 'vocabulary' | 'player' | 'settings'
  }>(),
  { navPreset: 'home' },
)

const route = useRoute()
const router = useRouter()

const links = [
  { to: '/', key: 'home' as const, label: 'Home' },
  { to: '/history', key: 'history' as const, label: 'History' },
  { to: '/vocabulary', key: 'vocabulary' as const, label: 'Vocabulary' },
] as const

// 菜单项类型定义
type MenuItem = {
  label: string
  icon: string
  path: string
  type?: never
} | {
  type: 'divider'
  label?: never
  icon?: never
  path?: never
}

// 菜单项
const menuItems: MenuItem[] = [
  { label: 'Home', icon: 'House', path: '/' },
  { label: 'History', icon: 'Clock', path: '/history' },
  { label: 'Vocabulary', icon: 'Document', path: '/vocabulary' },
  { label: 'Player', icon: 'VideoPlay', path: '/player' },
  { type: 'divider' },
  { label: 'Settings', icon: 'Setting', path: '/settings' },
]

type Visual =
  | 'primary'
  | 'inactive'
  | 'player-home'
  | 'player-history'
  | 'player-inactive'

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
    settings: null, // settings 页面不高亮导航链接
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

const scrolled = computed(() => props.navPreset !== 'home')

// 处理菜单项点击
const handleMenuCommand = (path: string) => {
  router.push(path)
}
</script>

<template>
  <MdTopAppBar :scrolled="scrolled">
    <template #leading>
      <RouterLink to="/" class="app-top-nav__logo">
        ShadowPlayer
      </RouterLink>
    </template>

    <template #title>
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
    </template>

    <template #actions>
      <!-- 菜单按钮 -->
      <el-dropdown trigger="click" @command="handleMenuCommand">
        <el-button circle :icon="Menu" class="app-top-nav__menu-button" />
        <template #dropdown>
          <el-dropdown-menu>
            <template v-for="(item, index) in menuItems" :key="index">
              <el-dropdown-item v-if="item.type === 'divider'" divided />
              <el-dropdown-item v-else :command="item.path">
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
  </MdTopAppBar>
</template>

<style scoped>
.app-top-nav__logo {
  display: inline-flex;
  align-items: center;
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  color: var(--md-sys-color-primary);
  text-decoration: none;
  letter-spacing: -0.45px;
}

.app-top-nav__menu {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 32px;
  margin-left: 24px;
}

.app-top-nav__link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  line-height: 20px;
  letter-spacing: 0.1px;
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  padding: 20px 0;
  position: relative;
}

.app-top-nav__link--primary {
  color: var(--md-sys-color-primary);
}

.app-top-nav__link--primary::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--md-sys-color-primary);
}

.app-top-nav__link--inactive {
  color: var(--md-sys-color-on-surface-variant);
}

.app-top-nav__link--player-home {
  color: var(--md-sys-color-on-surface-variant);
}

.app-top-nav__link--player-home::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--md-sys-color-on-surface-variant);
}

.app-top-nav__link--player-history {
  color: var(--md-sys-color-primary);
}

.app-top-nav__link--player-inactive {
  color: var(--md-sys-color-on-surface-variant);
}

/* 菜单按钮样式 */
.app-top-nav__menu-button {
  background-color: transparent;
  border: none;
  color: var(--md-sys-color-on-surface);
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.app-top-nav__menu-button:hover {
  background-color: var(--md-sys-color-surface-variant);
}
</style>
