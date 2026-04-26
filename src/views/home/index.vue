<script setup lang="ts">
defineOptions({ name: 'HomePageView' })


const recent = [
  {
    title: 'Blade Runner 2049 - Language Study',
    meta: 'Last watched 2 hours ago • 75% complete',
    thumb: figmaDesignAssets.home.thumb1,
    progress: 75,
  },
  {
    title: 'Italian Cinema: La Dolce Vita',
    meta: 'Last watched yesterday • 30% complete',
    thumb: figmaDesignAssets.home.thumb2,
    progress: 30,
  },
  {
    title: 'French News - Daily Briefing',
    meta: 'Last watched 3 days ago • 95% complete',
    thumb: figmaDesignAssets.home.thumb3,
    progress: 95,
  },
] as const
</script>

<template>
  <div class="min-h-screen bg-page" data-node-id="1:2">
    <AppTopNav nav-preset="home" />

    <main class="mx-auto max-w-[800px] px-4 pb-24 pt-20">
      <section
        class="flex flex-col items-center gap-3 rounded-lg border bd-lighter bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
        data-node-id="1:4"
      >
        <div
          class="flex size-16 items-center justify-center rounded-xl bg-[#ECF5FF]"
          data-node-id="1:6"
        >
          <el-icon class="text-2xl text-el-primary">
            <UploadFilled />
          </el-icon>
        </div>
        <h1 class="type-page-title text-center" data-node-id="1:10">
          Ready to learn?
        </h1>
        <p class="text-center text-base text-secondary" data-node-id="1:12">
          Upload a local video file to start your immersive language session.
        </p>
        <el-button type="primary" size="large" class="mt-1">
          <el-icon class="mr-2">
            <FolderOpened />
          </el-icon>
          Select Local Video File
        </el-button>
        <p class="text-center text-caption text-placeholder" data-node-id="1:18">
          Supports MP4, MKV, and WebM with embedded subtitles
        </p>
      </section>

      <section class="mt-8 flex flex-col gap-4" data-node-id="1:19">
        <div class="flex-between" data-node-id="1:20">
          <h2 class="type-section" data-node-id="1:22">Recent Playback</h2>
          <RouterLink
            to="/history"
            class="flex items-center gap-1 text-base text-[#0060A9] no-underline"
          >
            View all
            <el-icon class="text-xs">
              <ArrowRight />
            </el-icon>
          </RouterLink>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="(item, i) in recent"
            :key="i"
            class="flex items-center gap-4 rounded-lg border bd-lighter bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
            :data-node-id="i === 0 ? '1:28' : undefined"
          >
            <div
              class="relative h-[68px] w-[120px] shrink-0 overflow-hidden rounded bg-fill-light"
            >
              <img
                :src="item.thumb"
                alt=""
                class="h-full w-full object-cover"
              />
              <el-progress
                class="absolute bottom-0 left-0 right-0"
                :percentage="item.progress"
                :show-text="false"
                :stroke-width="4"
                color="#0060A9"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="type-card-title text-clip">
                {{ item.title }}
              </h3>
              <p class="mt-1 text-base text-secondary">
                {{ item.meta }}
              </p>
            </div>
            <div class="flex shrink-0 items-start gap-2">
              <RouterLink to="/player">
                <el-button type="primary" plain class="rounded-sm">
                  Continue
                </el-button>
              </RouterLink>
              <el-button text circle>
                <el-icon>
                  <MoreFilled />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
