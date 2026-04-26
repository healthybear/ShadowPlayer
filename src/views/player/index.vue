<script setup lang="ts">
defineOptions({ name: 'PlayerPageView' })

import { figmaDesignAssets } from '@/config/figmaDesignAssets'

const poster = figmaDesignAssets.player.poster
</script>

<template>
  <div
    class="flex h-screen flex-col overflow-hidden bg-page"
    data-node-id="1:87"
  >
    <AppTopNav nav-preset="player" />

    <div class="flex min-h-0 flex-1 pt-12">
      <!-- 左侧：视频 + 控制条 -->
      <div
        class="flex min-w-0 flex-1 flex-col bg-black"
        data-node-id="1:89"
      >
        <div
          class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
          data-node-id="1:90"
        >
          <div class="relative w-full opacity-80" data-node-id="1:92">
            <div class="relative aspect-video w-full max-h-[min(100%,70vh)]">
              <img
                :src="poster"
                alt=""
                class="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
            data-node-id="1:93"
          />
          <!-- 字幕区 -->
          <div
            class="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-2 px-12"
            data-node-id="1:94"
          >
            <div
              class="rounded-sm bg-black/40 px-4 py-1 backdrop-blur-sm"
              data-node-id="1:95"
            >
              <p
                class="text-center text-[22px] font-semibold leading-8 tracking-wide text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]"
              >
                I was chasing a
                <span class="text-el-primary underline decoration-solid">
                  shadow
                </span>
                that didn't exist.
              </p>
            </div>
            <div
              class="rounded-sm bg-black/30 px-3 py-0.5 backdrop-blur-sm"
              data-node-id="1:97"
            >
              <p
                class="text-lg text-white/90 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]"
              >
                我当时在追逐一个并不存在的影子。
              </p>
            </div>
          </div>
          <!-- 查词浮层 -->
          <div
            class="absolute bottom-[35%] left-[calc(50%+4rem)] w-64 rounded-lg border bd-lighter bg-white p-4 shadow-lg"
            data-node-id="1:99"
          >
            <div class="flex-between">
              <div>
                <h3 class="text-base font-bold text-main">shadow</h3>
                <p class="text-caption text-secondary">/ˈʃædoʊ/</p>
              </div>
              <el-button text circle class="!p-0">
                <el-icon><Microphone /></el-icon>
              </el-button>
            </div>
            <p class="mt-2 text-sm text-regular leading-relaxed">
              n. 影子；阴影；幻象；<br />
              v. 遮蔽；尾随；
            </p>
            <div class="mt-2 flex gap-2 pt-2">
              <el-button
                type="primary"
                size="small"
                class="flex-1 !bg-[#0060A9] !border-[#0060A9]"
              >
                <el-icon class="mr-1"><Plus /></el-icon>
                Add to Vocab
              </el-button>
              <el-button size="small">
                <el-icon><More /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 控制条 -->
        <div
          class="flex flex-col gap-2 border-t border-border-lighter bg-white px-4 py-3"
          data-node-id="1:121"
        >
          <div class="flex items-center gap-3" data-node-id="1:122">
            <span class="w-10 shrink-0 text-xs text-secondary">12:45</span>
            <div
              class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border-lighter"
            >
              <div
                class="absolute inset-y-0 left-0 w-[55%] rounded-full bg-primary-light-7"
              />
              <div
                class="absolute inset-y-0 left-0 w-[45%] rounded-full bg-primary"
              />
              <div
                class="absolute left-[45%] top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#0060A9] shadow"
              />
            </div>
            <span class="w-10 shrink-0 text-right text-xs text-secondary">
              24:32
            </span>
          </div>
          <div class="flex-between" data-node-id="1:132">
            <div class="flex items-center gap-4">
              <el-button text circle>
                <el-icon><DArrowLeft /></el-icon>
              </el-button>
              <el-button
                type="primary"
                circle
                class="!bg-[#0060A9] !border-[#0060A9]"
              >
                <el-icon :size="20"><VideoPlay /></el-icon>
              </el-button>
              <el-button text circle>
                <el-icon><DArrowRight /></el-icon>
              </el-button>
              <div class="mx-2 h-4 w-px bg-border" />
              <el-button text circle>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <el-tag
                type="primary"
                effect="light"
                class="cursor-pointer rounded-xl !border-primary-light-7 !px-4 !py-1"
              >
                Subtitle Mode (Bilingual)
              </el-tag>
              <el-tag class="cursor-pointer rounded-xl !px-4 !py-1">
                Speed (1.0x)
              </el-tag>
              <el-tag class="cursor-pointer rounded-xl !px-4 !py-1">
                AB Repeat
              </el-tag>
              <el-tag class="cursor-pointer rounded-xl !px-4 !py-1">
                <el-icon class="mr-1"><RefreshRight /></el-icon>
                Single Loop
              </el-tag>
            </div>
            <div class="flex items-center gap-4">
              <el-button text circle>
                <el-icon><FullScreen /></el-icon>
              </el-button>
              <el-button text circle>
                <el-icon><Moon /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧字幕列表 -->
      <aside
        class="flex w-80 shrink-0 flex-col border-l border-border-lighter bg-white"
        data-node-id="1:165"
      >
        <div
          class="flex-between border-b border-border-lighter bg-fill-lighter px-4 py-4"
          data-node-id="1:166"
        >
          <div class="flex items-center gap-2">
            <el-icon><Document /></el-icon>
            <span class="text-sm font-medium text-main">Subtitle List</span>
          </div>
          <el-button text size="small">
            <el-icon><Operation /></el-icon>
          </el-button>
        </div>

        <div class="scroll-y flex-1">
          <div
            class="border-b border-border-extra-light px-4 py-4 text-sm"
            data-node-id="1:176"
          >
            <div class="flex-between text-xs text-placeholder">
              <span>01:04</span>
              <el-icon><VideoPlay /></el-icon>
            </div>
            <p class="mt-1 text-regular">
              Sometimes the hardest part is not letting go.
            </p>
            <p class="mt-1 text-caption">有时候最难的部分是不是放手。</p>
          </div>

          <div
            class="border-b border-l-4 border-solid border-b-border-lighter border-l-[#0060A9] bg-primary-light-9 px-4 py-4 text-sm"
            data-node-id="1:184"
          >
            <div class="flex-between text-xs font-bold text-[#0060A9]">
              <span>12:45</span>
              <el-icon class="text-[#0060A9]"><VideoCamera /></el-icon>
            </div>
            <p class="mt-1 font-medium text-[#0060A9]">
              I was chasing a shadow that didn't exist.
            </p>
            <p class="mt-1 text-caption text-[#0060A9]/80">
              我当时在追逐一个并不存在的影子。
            </p>
          </div>

          <div
            class="border-b border-border-extra-light px-4 py-4 text-sm"
            data-node-id="1:192"
          >
            <div class="flex-between text-xs text-placeholder">
              <span>13:12</span>
              <el-icon><VideoPlay /></el-icon>
            </div>
            <p class="mt-1 text-regular">
              Reality has a way of catching up to you.
            </p>
            <p class="mt-1 text-caption">现实总是有办法追上你。</p>
          </div>

          <div class="border-b border-border-extra-light px-4 py-4 text-sm">
            <div class="flex-between text-xs text-placeholder">
              <span>13:45</span>
              <el-icon><VideoPlay /></el-icon>
            </div>
            <p class="mt-1 text-regular">
              And when it does, you'll need to be ready.
            </p>
            <p class="mt-1 text-caption">当它真的发生时，你需要做好准备。</p>
          </div>
        </div>

        <div
          class="flex gap-2 border-t border-border-lighter bg-fill-lighter p-3"
          data-node-id="1:216"
        >
          <el-button class="flex-1">
            <el-icon class="mr-1"><Upload /></el-icon>
            Export
          </el-button>
          <el-button class="flex-1">
            <el-icon class="mr-1"><MagicStick /></el-icon>
            AI Assist
          </el-button>
        </div>
      </aside>
    </div>
  </div>
</template>
