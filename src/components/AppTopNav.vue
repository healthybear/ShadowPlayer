<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MdTopAppBar from '@/components/material/MdTopAppBar.vue'

defineOptions({ name: 'AppTopNav' })

const props = withDefaults(
  defineProps<{
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
      <el-avatar
        :size="36"
        src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        aria-label="账户"
        class="app-top-nav__avatar"
      />
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
  margin-left: 48px;
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

.app-top-nav__avatar {
  cursor: pointer;
}
</style>
