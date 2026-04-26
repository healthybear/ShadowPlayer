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

function isPrimary(v: Visual) {
  return v === 'primary'
}

function isPlayerHome(v: Visual) {
  return v === 'player-home'
}

const linkStates = computed(() => {
  const p = route.path
  return links.map((l) => ({
    l,
    v: getVisual(l.key, p),
  }))
})

const headerDataNodeId: Record<typeof props.navPreset, string> = {
  home: '1:73',
  history: '8:341',
  vocabulary: '8:372',
  player: '1:73',
}

const headerButtonDataNodeId: Record<typeof props.navPreset, string> = {
  home: '1:85',
  history: '8:353',
  vocabulary: '8:383',
  player: '1:85',
}
</script>

<template>
  <header
    class="fixed left-0 right-0 top-0 z-top w-full border-b border-[#E5E7EB] bg-white pb-px shadow-[0_1px_2px_rgba(243,244,246,0.5)]"
    data-name="Header - TopAppBar"
    :data-node-id="headerDataNodeId[navPreset]"
  >
    <div
      class="box-border flex h-12 w-full items-center justify-between pl-8 pr-[2.000625rem]"
    >
      <RouterLink
        to="/"
        class="inline-flex h-7 max-w-[121px] shrink-0 items-center text-[18px] font-bold leading-7 tracking-[-0.45px] text-[#2563EB] no-underline"
      >
        ShadowPlayer
      </RouterLink>

      <nav
        class="flex h-full shrink-0 items-stretch gap-8"
        data-name="Nav"
        :data-node-id="navPreset === 'player' ? '8:330' : undefined"
      >
        <RouterLink
          v-for="{ l, v } in linkStates"
          :key="l.key"
          v-slot="{ href, navigate }"
          :to="l.to"
          custom
        >
          <a
            :href="href"
            class="flex flex-col no-underline"
            :class="
              isPlayerHome(v) || isPrimary(v)
                ? 'pt-3'
                : 'pb-[12.5px] pt-[11.5px]'
            "
            @click="navigate"
          >
            <template v-if="isPrimary(v) || isPlayerHome(v)">
              <span
                class="inline-flex flex-col self-start border-b-2 pb-3.5"
                :class="isPlayerHome(v) ? 'border-[#4B5563]' : 'border-[#2563EB]'"
              >
                <span
                  class="h-5 text-sm font-medium leading-5 tracking-[-0.35px]"
                  :class="isPlayerHome(v) ? 'text-[#4B5563]' : 'text-[#2563EB]'"
                >
                  {{ l.label }}
                </span>
              </span>
            </template>
            <span
              v-else
              class="h-5 text-sm font-medium leading-5 tracking-[-0.35px]"
              :class="v === 'player-history' ? 'text-[#2563EB]' : 'text-[#4B5563]'"
            >
              {{ l.label }}
            </span>
          </a>
        </RouterLink>
      </nav>

      <el-avatar
        :size="36"
        :src="figmaDesignAssets.headerProfile"
        aria-label="账户"
        class="shrink-0 cursor-pointer"
        :data-node-id="headerButtonDataNodeId[navPreset]"
      />
    </div>
  </header>
</template>
