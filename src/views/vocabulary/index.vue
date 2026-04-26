<script setup lang="ts">
defineOptions({ name: 'VocabularyPageView' })

const words = [
  {
    word: 'ubiquitous',
    ipa: '/juːˈbɪk.wɪ.təs/',
    zh: '无所不在的，普遍存在的',
    source: 'BBC Learning English',
    time: '04:12',
  },
  {
    word: 'meticulous',
    ipa: '/məˈtɪk.jə.ləs/',
    zh: '严谨的，极精细的',
    source: 'Scientific American',
    time: '12:45',
  },
  {
    word: 'paradigm',
    ipa: '/ˈpær.ə.daɪm/',
    zh: '范例，典范',
    source: 'TED Talks: Future of AI',
    time: '08:22',
  },
  {
    word: 'eloquent',
    ipa: '/ˈel.ə.kwənt/',
    zh: '雄辩的，口才流利的',
    source: 'The Guardian News',
    time: '01:50',
  },
] as const
</script>

<template>
  <div class="min-h-screen bg-page" data-node-id="1:237">
    <AppTopNav nav-preset="vocabulary" />

    <main class="mx-auto max-w-[960px] px-4 pb-24 pt-20">
      <div class="flex-between mb-8" data-node-id="1:239">
        <div class="flex items-center gap-3">
          <h1 class="type-page-title" data-node-id="1:242">My Vocabulary</h1>
          <span class="tag-primary text-xs font-medium" data-node-id="1:244">
            Total 23 Words
          </span>
        </div>
        <div class="flex gap-2">
          <el-button>
            <el-icon class="mr-1"><Search /></el-icon>
            Search
          </el-button>
          <el-button>
            <el-icon class="mr-1"><Filter /></el-icon>
            Filter
          </el-button>
        </div>
      </div>

      <div
        class="grid grid-cols-1 gap-4 md:grid-cols-2"
        data-node-id="1:256"
      >
        <article
          v-for="(w, i) in words"
          :key="w.word"
          class="relative rounded-lg border bd-lighter bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          :data-node-id="i === 0 ? '1:257' : undefined"
        >
          <div class="flex-between">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-main">
                {{ w.word }}
              </h2>
              <el-button text circle class="!p-0">
                <el-icon><Microphone /></el-icon>
              </el-button>
            </div>
          </div>
          <p class="mt-2 text-caption italic text-secondary">
            {{ w.ipa }}
          </p>
          <div
            class="mt-2 rounded bg-fill-light p-3 text-sm text-main"
            data-node-id="1:270"
          >
            {{ w.zh }}
          </div>
          <div
            class="divider-x mt-4 flex-between pt-3 text-xs text-placeholder"
          >
            <span class="text-[#0060A9]">{{ w.source }}</span>
            <span>{{ w.time }}</span>
          </div>
        </article>
      </div>

      <div class="mt-8 flex justify-center pt-4" data-node-id="1:349">
        <el-button
          type="primary"
          size="large"
          class="!bg-[#0060A9] !border-[#0060A9] shadow-[0_10px_15px_-3px_rgba(0,96,169,0.2)]"
        >
          <el-icon class="mr-2"><Download /></el-icon>
          Export to CSV
        </el-button>
      </div>
    </main>
  </div>
</template>
