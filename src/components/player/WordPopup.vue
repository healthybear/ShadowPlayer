<!--
  Word Popup Component (单词弹窗组件)

  点击字幕中的单词时，显示单词释义并支持添加到词汇表。

  状态机设计：
  - closed: 关闭状态
  - loading: 正在查询 API
  - display: 显示查询结果
  - manual: 手动输入（API 失败时的降级方案）

  显示内容：
  - 单词本身（displayText）
  - 音标
  - 释义列表（按词性分组）
  - 上下文
  - 播放音频按钮（可选）
  - Add to Vocabulary 按钮

  交互效果：
  - 缩放动画（md-scale transition）
  - 固定定位，不随页面滚动
  - 高 elevation，确保在最上层

  企业项目经验：
  - 弹窗是常见的交互模式
  - 状态机让复杂 UI 逻辑清晰
  - 动画让交互更自然
  - 降级方案确保功能可用
-->

<template>
  <!-- Transition 是 Vue 的内置组件，提供进入/离开动画
       name="md-scale" 使用 Material Design 的缩放动画

       企业项目经验：
       - 弹窗应该有动画，不要突然出现/消失
       - 缩放动画是最常见的弹窗动画
       - Vue 的 Transition 组件让动画实现变得简单
  -->
  <Transition name="md-scale">
    <MdCard
      v-if="visible"
      :elevation="3"
      class="word-popup"
    >
      <!-- Loading 状态 -->
      <div v-if="state === 'loading'" class="word-popup__loading">
        <el-icon class="is-loading word-popup__loading-icon">
          <Loading />
        </el-icon>
        <div class="word-popup__word">{{ displayText }}</div>
        <div class="word-popup__loading-text">Loading definition...</div>
      </div>

      <!-- Display 状态：显示词典信息 -->
      <div v-else-if="state === 'display' && dictionaryResult" class="word-popup__content">
        <div class="word-popup__header">
          <div class="word-popup__word">{{ displayText }}</div>
          <el-button
            text
            circle
            size="small"
            class="word-popup__close-btn"
            @click="handleClose"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <div v-if="dictionaryResult.pronunciation" class="word-popup__pronunciation">
          {{ dictionaryResult.pronunciation }}
          <el-button
            v-if="dictionaryResult.audioUrl"
            text
            circle
            size="small"
            :loading="audioPlaying"
            @click="handlePlayAudio"
          >
            <el-icon><VideoPlay /></el-icon>
          </el-button>
        </div>

        <div class="word-popup__definitions">
          <div
            v-for="(def, index) in dictionaryResult.definitions.slice(0, 3)"
            :key="index"
            class="word-popup__definition"
          >
            <span class="word-popup__part-of-speech">{{ def.partOfSpeech }}</span>
            <span class="word-popup__definition-text">{{ def.definition }}</span>
          </div>
        </div>

        <div v-if="context" class="word-popup__context">
          <div class="word-popup__context-label">Context:</div>
          <div class="word-popup__context-text">{{ context }}</div>
        </div>

        <div class="word-popup__actions">
          <el-button
            type="primary"
            size="small"
            :loading="adding"
            @click="handleAddToVocabulary"
          >
            Add to Vocabulary
          </el-button>
        </div>
      </div>

      <!-- Manual 状态：手动输入 -->
      <div v-else-if="state === 'manual'" class="word-popup__content">
        <div class="word-popup__header">
          <div class="word-popup__word">{{ displayText }}</div>
          <el-button
            text
            circle
            size="small"
            class="word-popup__close-btn"
            @click="handleClose"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <div class="word-popup__error">
          {{ errorMessage || 'Word not found in dictionary' }}
        </div>

        <div class="word-popup__manual-form">
          <el-input
            v-model="manualPronunciation"
            placeholder="Pronunciation (optional)"
            size="small"
          />
          <el-input
            v-model="manualDefinition"
            type="textarea"
            placeholder="Definition"
            :rows="3"
            size="small"
          />
        </div>

        <div class="word-popup__actions">
          <el-button
            type="primary"
            size="small"
            :loading="adding"
            :disabled="!manualDefinition"
            @click="handleAddManual"
          >
            Add to Vocabulary
          </el-button>
          <el-button size="small" @click="handleClose">
            Cancel
          </el-button>
        </div>
      </div>
    </MdCard>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Close, VideoPlay } from '@element-plus/icons-vue'
import MdCard from '@/components/material/MdCard.vue'
import { useDictionaryLookup } from '@/composables/useDictionaryLookup'
import { useVocabulary } from '@/composables/useVocabulary'
import { usePronunciationAudio } from '@/composables/usePronunciationAudio'
import { db } from '@/db/schema'

/**
 * Props 接口
 *
 * 为什么需要这么多 props？
 * - displayText: 用户看到的原始词形，用于 UI 展示
 * - lookupText: 用于词典查询的规范化词
 * - normalizedWord: 用于缓存和去重的稳定值
 * - context: 字幕原文，保留学习场景
 * - timestamp: 视频时间点，用于回跳
 * - videoId: 关联的视频 ID
 * - subtitleIndex: 字幕索引，用于精确定位
 *
 * 企业项目经验：
 * - UI 展示字段、第三方 API 输入字段、数据库主业务字段通常不是同一个值
 * - 提前拆开能避免后续大量条件分支
 * - Props 设计要考虑完整的业务流程
 */
interface Props {
  visible: boolean
  displayText: string
  lookupText: string
  normalizedWord: string
  context: string
  timestamp: number
  videoId: string
  subtitleIndex: number
}

const props = defineProps<Props>()

/**
 * Emits 接口
 *
 * 为什么不用 `added: [VocabularyItem]`？
 * - WordPopup 内部已经负责调用 useVocabulary.addWord() 完成写库
 * - 父组件只关心"添加成功"这个结果，用成功事件即可
 * - 降低父子组件的数据耦合，让 WordPopup 只暴露最小必要接口
 *
 * 企业项目经验：
 * - 组件接口要最小化，不要暴露内部实现细节
 * - 父组件不需要知道 VocabularyItem 的完整结构
 * - 事件名要清晰，表达业务含义
 */
const emit = defineEmits<{
  close: []
  added: []
}>()

/**
 * 状态机
 *
 * 为什么用状态机？
 * - 弹窗有多个状态，状态转换逻辑复杂
 * - 状态机让状态转换清晰、可预测
 * - 避免用多个 boolean 变量管理状态（容易出现非法状态）
 *
 * 状态转换：
 * closed -> loading（打开弹窗时）
 * loading -> display（API 成功）
 * loading -> manual（API 失败）
 * display/manual -> closed（关闭弹窗）
 *
 * 企业项目经验：
 * - 复杂 UI 用状态机，不要用多个 boolean
 * - 状态机让代码更易理解、更易测试
 * - 非法状态在编译时就能发现
 */
type PopupState = 'closed' | 'loading' | 'display' | 'manual'
const state = ref<PopupState>('closed')

// Composables
const { loading: dictionaryLoading, error: dictionaryError, result: dictionaryResult, fetchWord } = useDictionaryLookup()
const { addWord } = useVocabulary()
const { playing: audioPlaying, playAudio } = usePronunciationAudio()

// 状态
const adding = ref(false)
const errorMessage = ref<string | null>(null)
const manualPronunciation = ref('')
const manualDefinition = ref('')

/**
 * 监听 visible 和 lookupText 变化
 *
 * 流程：
 * 1. 弹窗打开时，切换到 loading 状态
 * 2. 调用 API 查询单词
 * 3. 根据结果切换到 display 或 manual 状态
 * 4. 弹窗关闭时，重置状态
 * 5. lookupText 变化时（用户点击新词），重新查询
 *
 * 为什么要监听 lookupText？
 * - 用户可能在弹窗未关闭时点击另一个单词
 * - 只监听 visible 会导致弹窗内容与当前选中词失配
 * - 监听 lookupText 确保每次点击新词都会重新查询
 *
 * 企业项目经验：
 * - 弹窗组件要能多次打开/关闭
 * - 每次打开都要重新查询（可能是不同的单词）
 * - 关闭时要清理状态，避免下次打开显示旧数据
 * - watch 多个依赖时，要考虑所有可能的变化场景
 */
watch(() => [props.visible, props.lookupText] as const, async ([newVisible, newLookupText], [oldVisible, oldLookupText]) => {
  if (newVisible && (!oldVisible || newLookupText !== oldLookupText)) {
    // 弹窗打开或单词变化，重新查询
    state.value = 'loading'
    errorMessage.value = null
    manualPronunciation.value = ''
    manualDefinition.value = ''

    // 查询单词
    await fetchWord(newLookupText)

    // 根据结果切换状态
    if (dictionaryError.value) {
      state.value = 'manual'
      errorMessage.value = dictionaryError.value
    } else if (dictionaryResult.value) {
      state.value = 'display'
    } else {
      state.value = 'manual'
      errorMessage.value = 'Failed to load definition'
    }
  } else if (!newVisible) {
    // 关闭弹窗
    state.value = 'closed'
  }
})

/**
 * 处理关闭
 */
function handleClose() {
  emit('close')
}

/**
 * 处理播放音频
 */
async function handlePlayAudio() {
  if (dictionaryResult.value?.audioUrl) {
    await playAudio(dictionaryResult.value.audioUrl)
  }
}

/**
 * 处理添加到词汇表
 *
 * 流程：
 * 1. 获取视频标题（用于词汇表展示）
 * 2. 构造 VocabularyItem
 * 3. 调用 useVocabulary.addWord()
 * 4. 显示成功提示
 * 5. emit added 事件
 * 6. 关闭弹窗
 *
 * 为什么需要获取视频标题？
 * - 词汇表页面需要显示"来源视频标题"
 * - 帮助用户回忆学习场景
 * - 这是 proposal 中明确要求的功能
 *
 * 错误处理：
 * - 重复添加：显示提示，不关闭弹窗
 * - 其他错误：显示错误消息，不关闭弹窗
 *
 * 企业项目经验：
 * - 异步操作要有 loading 状态
 * - 错误要有用户友好的提示
 * - 成功后要有明确的反馈
 */
async function handleAddToVocabulary() {
  if (!dictionaryResult.value) return

  adding.value = true

  try {
    // 获取视频标题
    let videoTitle: string | undefined
    try {
      const video = await db.videos.get(props.videoId)
      videoTitle = video?.filename
    } catch (err) {
      console.warn('Failed to get video title:', err)
      // 获取标题失败不应该阻塞添加流程
    }

    await addWord({
      word: props.displayText,
      normalizedWord: props.normalizedWord,
      context: props.context,
      timestamp: props.timestamp,
      videoId: props.videoId,
      subtitleIndex: props.subtitleIndex,
      pronunciation: dictionaryResult.value.pronunciation,
      audioUrl: dictionaryResult.value.audioUrl,
      definitions: dictionaryResult.value.definitions,
      videoTitle,
      source: 'captured',
    })

    ElMessage.success(`"${props.displayText}" added to vocabulary!`)
    emit('added')
    emit('close')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add word'
    if (message.includes('already in your vocabulary')) {
      ElMessage.warning(message)
    } else {
      ElMessage.error(message)
    }
  } finally {
    adding.value = false
  }
}

/**
 * 处理手动添加
 *
 * 流程：
 * 1. 获取视频标题（用于词汇表展示）
 * 2. 构造 VocabularyItem（使用手动输入的数据）
 * 3. 调用 useVocabulary.addWord()
 * 4. 显示成功提示
 * 5. emit added 事件
 * 6. 关闭弹窗
 *
 * 企业项目经验：
 * - 降级方案要和主流程一样完整
 * - 不要因为是"备选方案"就降低体验
 * - 手动输入也要有完整的错误处理
 */
async function handleAddManual() {
  if (!manualDefinition.value.trim()) {
    ElMessage.warning('Please enter a definition')
    return
  }

  adding.value = true

  try {
    // 获取视频标题
    let videoTitle: string | undefined
    try {
      const video = await db.videos.get(props.videoId)
      videoTitle = video?.filename
    } catch (err) {
      console.warn('Failed to get video title:', err)
      // 获取标题失败不应该阻塞添加流程
    }

    await addWord({
      word: props.displayText,
      normalizedWord: props.normalizedWord,
      context: props.context,
      timestamp: props.timestamp,
      videoId: props.videoId,
      subtitleIndex: props.subtitleIndex,
      pronunciation: manualPronunciation.value || undefined,
      definitions: [{
        partOfSpeech: 'manual',
        definition: manualDefinition.value,
      }],
      videoTitle,
      source: 'captured',
    })

    ElMessage.success(`"${props.displayText}" added to vocabulary!`)
    emit('added')
    emit('close')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add word'
    if (message.includes('already in your vocabulary')) {
      ElMessage.warning(message)
    } else {
      ElMessage.error(message)
    }
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.word-popup {
  /* 固定定位，不随页面滚动
   * bottom: 35% - 在屏幕中下方
   * left: calc(50% + 64px) - 稍微偏右，避开视频中心
   *
   * 企业项目经验：
   * - 弹窗位置要避开重要内容（如视频、字幕）
   * - 固定定位确保弹窗始终可见
   */
  position: fixed;
  bottom: 35%;
  left: calc(50% + 64px);
  width: 320px;
  max-width: 90vw;
  max-height: 60vh;
  overflow-y: auto;
  z-index: 1000;
}

.word-popup__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 12px;
}

.word-popup__loading-icon {
  font-size: 32px;
  color: var(--md-sys-color-primary);
}

.word-popup__loading-text {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
}

.word-popup__content {
  padding: 16px;
}

.word-popup__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.word-popup__word {
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  color: var(--md-sys-color-on-surface);
  flex: 1;
}

.word-popup__close-btn {
  flex-shrink: 0;
}

.word-popup__pronunciation {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 12px;
}

.word-popup__definitions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.word-popup__definition {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.word-popup__part-of-speech {
  font-size: var(--md-sys-typescale-label-small-size);
  color: var(--md-sys-color-primary);
  font-weight: 500;
  text-transform: lowercase;
}

.word-popup__definition-text {
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface);
  line-height: 1.5;
}

.word-popup__context {
  padding: 12px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: var(--md-sys-shape-corner-small);
  margin-bottom: 16px;
}

.word-popup__context-label {
  font-size: var(--md-sys-typescale-label-small-size);
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 4px;
  font-weight: 500;
}

.word-popup__context-text {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.5;
  font-style: italic;
}

.word-popup__error {
  padding: 12px;
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-radius: var(--md-sys-shape-corner-small);
  font-size: var(--md-sys-typescale-body-small-size);
  margin-bottom: 16px;
}

.word-popup__manual-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.word-popup__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
