<script setup lang="ts">
defineOptions({ name: 'HistoryPageView' })

import { figmaDesignAssets } from '@/config/figmaDesignAssets'

const items = [
  {
    title: 'Business_English_Module_04_Negotiations.mp4',
    last: 'Last played: 2 hours ago',
    progress: 42,
    duration: '12:45',
    thumb: figmaDesignAssets.history.thumb1,
    finished: false,
  },
  {
    title: 'Interview_Tips_Confidence_Workshop.mkv',
    last: 'Last played: Yesterday',
    progress: 85,
    duration: '08:20',
    thumb: figmaDesignAssets.history.thumb2,
    finished: false,
  },
  {
    title: 'Daily_Phrases_Part_01_Greetings.mp4',
    last: 'Last played: 3 days ago',
    progress: 100,
    duration: '15:55',
    thumb: figmaDesignAssets.history.thumb3,
    finished: true,
  },
] as const
</script>

<template>
  <div class="min-h-screen bg-page" data-node-id="1:368">
    <AppTopNav nav-preset="history" />

    <main class="mx-auto max-w-[900px] px-4 pb-24 pt-20">
      <div class="flex-between gap-4" data-node-id="1:370">
        <div>
          <h1 class="type-page-title" data-node-id="1:373">Playback History</h1>
          <p class="mt-1 text-xs text-secondary" data-node-id="1:375">
            Manage your recently watched learning videos
          </p>
        </div>
        <el-button plain class="border border-danger text-el-danger">
          <el-icon class="mr-1">
            <Delete />
          </el-icon>
          Clear History
        </el-button>
      </div>

      <div class="relative mt-2 pt-2">
        <el-input
          size="large"
          class="shadow-sm"
          placeholder="Search your history by filename..."
        >
          <template #prefix>
            <el-icon class="text-secondary">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="mt-4 flex flex-col gap-3">
        <div
          v-for="(row, i) in items"
          :key="i"
          class="flex gap-4 rounded-lg border bd-lighter bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
          :class="row.finished ? 'opacity-80' : ''"
        >
          <div
            class="relative h-[90px] w-[160px] shrink-0 overflow-hidden rounded bg-fill"
          >
            <img
              :src="row.thumb"
              alt=""
              class="h-full w-full object-cover"
            />
            <span
              class="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white"
            >
              {{ row.duration }}
            </span>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-fill-light">
              <div
                v-if="!row.finished"
                class="absolute bottom-0 left-0 top-0 bg-primary"
                :style="{ width: `${row.progress}%` }"
              />
              <div
                v-else
                class="absolute bottom-0 left-0 right-0 top-0 bg-el-success"
              />
            </div>
          </div>

          <div class="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div>
              <h3 class="type-card-title font-bold">
                {{ row.title }}
              </h3>
              <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-secondary">
                <span class="inline-flex items-center gap-1">
                  <el-icon><Clock /></el-icon>
                  {{ row.last }}
                </span>
                <span v-if="!row.finished" class="inline-flex items-center gap-1">
                  <el-icon><VideoPlay /></el-icon>
                  {{ row.progress }}% Completed
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 text-el-success"
                >
                  <el-icon><CircleCheck /></el-icon>
                  Finished
                </span>
              </div>
            </div>
            <div class="mt-3 flex items-center gap-3">
              <RouterLink v-if="!row.finished" to="/player">
                <el-button type="primary" size="small">
                  Continue Playing
                </el-button>
              </RouterLink>
              <el-button v-else size="small">
                Watch Again
              </el-button>
              <el-button text type="info" size="small" class="!px-0">
                <el-icon class="mr-1"><Delete /></el-icon>
                Delete
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-6 flex items-center justify-center gap-2 text-base text-main"
        data-node-id="1:474"
      >
        <el-button text>
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span class="text-placeholder">...</span>
        <span>12</span>
        <el-button text>
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </main>
  </div>
</template>
