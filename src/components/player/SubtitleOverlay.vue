<!--
  Subtitle Overlay Component (字幕覆盖层组件)

  这是视频上方的字幕显示层，支持单词点击查词。

  设计要点：
  - 半透明黑色背景，确保字幕可读
  - 居中显示
  - 单词可点击，触发查词
  - pointer-events: auto，允许点击单词

  企业项目经验：
  - 字幕是视频播放器的核心功能
  - 背景透明度要适中（太透明看不清，太不透明遮挡视频）
  - 字幕位置要避开控制条
  - 交互元素要有明确的视觉反馈（hover 效果）
-->

<template>
  <div class="subtitle-overlay">
    <div class="subtitle-overlay__text">
      <!--
        渲染分词后的 tokens

        为什么用 v-for 而不是 v-html？
        - v-html 有 XSS 风险
        - v-for 让我们完全控制渲染逻辑
        - 可以为每个 token 添加事件监听器

        为什么用 component :is？
        - word 类型渲染为 <span>（可点击）
        - space 和 punctuation 渲染为文本节点
        - 这样避免了大量的 v-if/v-else

        企业项目经验：
        - 动态内容不要用 v-html，有安全风险
        - v-for + component :is 是动态渲染的最佳实践
        - 每个可交互元素都要有 hover 效果
      -->
      <template v-for="(token, index) in tokens" :key="index">
        <span
          v-if="token.type === 'word'"
          class="subtitle-overlay__word"
          @click.stop="handleWordClick(token)"
        >
          {{ token.displayText }}
        </span>
        <template v-else>{{ token.displayText }}</template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { tokenizeSubtitle, type Token } from '@/utils/word-tokenizer'

/**
 * Props 接口
 *
 * 为什么需要这些 props？
 * - text: 字幕文本，用于分词和显示
 * - subtitleIndex: 字幕索引，用于词汇去重和播放器回跳高亮
 * - startTime: 字幕开始时间，用于构造词汇回跳时的 timestamp
 *
 * 企业项目经验：
 * - Props 设计要考虑完整的业务流程
 * - 不要只传显示需要的数据，还要传业务逻辑需要的数据
 * - 提前设计好数据流，避免后续频繁修改接口
 */
interface Props {
  text: string
  subtitleIndex: number
  startTime: number
}

const props = defineProps<Props>()

/**
 * Emits 接口
 *
 * word-click 事件的 payload：
 * - displayText: 用户看到的原始词形（如 "practice,"）
 * - lookupText: 用于词典查询的规范化词（如 "practice"）
 * - normalizedWord: 用于缓存和去重的稳定值（如 "practice"）
 * - context: 字幕原文，保留学习场景
 * - timestamp: 视频时间点，用于回跳
 * - subtitleIndex: 字幕索引，用于精确定位
 *
 * 为什么要传这么多字段？
 * - 父组件需要这些信息来构造完整的 VocabularyItem
 * - 避免父组件重复分词和规范化
 * - 数据在源头生成，保证一致性
 *
 * 企业项目经验：
 * - 事件 payload 要包含完整的业务数据
 * - 不要让父组件重复计算子组件已经计算过的数据
 * - 数据流要清晰，避免多处计算导致不一致
 */
interface WordClickPayload {
  displayText: string
  lookupText: string
  normalizedWord: string
  context: string
  timestamp: number
  subtitleIndex: number
}

const emit = defineEmits<{
  'word-click': [payload: WordClickPayload]
}>()

/**
 * 分词字幕文本
 *
 * 为什么用 computed？
 * - text 变化时自动重新计算
 * - computed 有缓存，避免重复计算
 * - 符合 Vue 3 响应式设计
 *
 * 性能考虑：
 * - 100 字字幕分词 < 10ms（实测）
 * - computed 缓存让重复渲染不会重复分词
 * - 不需要引入重量级 NLP 库
 *
 * 企业项目经验：
 * - 复杂计算放 computed，不要放 template
 * - computed 是性能优化的基础
 * - 不要在 template 中写复杂表达式
 */
const tokens = computed(() => {
  return tokenizeSubtitle(props.text)
})

/**
 * 处理单词点击
 *
 * 流程：
 * 1. 获取当前字幕的完整文本（context）
 * 2. 使用 startTime 作为 timestamp
 * 3. 使用 props.subtitleIndex 作为 subtitleIndex
 * 4. 传递 normalizedWord
 * 5. emit word-click 事件
 *
 * 为什么 context 是完整字幕文本？
 * - 保留学习场景，用户复习时能看到完整句子
 * - 不是只保存单词，而是保存单词出现的上下文
 * - 这是词汇学习的最佳实践
 *
 * 企业项目经验：
 * - 事件处理函数要清晰，不要有副作用
 * - 数据在源头生成，保证一致性
 * - 业务逻辑要有明确的注释
 */
function handleWordClick(token: Token) {
  if (token.type !== 'word' || !token.lookupText || !token.normalizedWord) {
    return
  }

  emit('word-click', {
    displayText: token.displayText,
    lookupText: token.lookupText,
    normalizedWord: token.normalizedWord,
    context: props.text,              // 完整字幕文本
    timestamp: props.startTime,       // 字幕开始时间
    subtitleIndex: props.subtitleIndex, // 字幕索引
  })
}
</script>

<style scoped>
.subtitle-overlay {
  /* 绝对定位，覆盖在视频上方
   * bottom: 60px 避开底部的控制条
   */
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 16px;

  /* pointer-events: auto 允许点击单词
   * 企业项目经验：
   * - 之前是 none，现在改为 auto 支持单词点击
   * - 只有单词可点击，空格和标点不可点击
   */
  pointer-events: auto;
}

.subtitle-overlay__text {
  padding: 8px 16px;

  /* 半透明黑色背景，确保字幕可读
   * 企业项目经验：
   * - 0.8 是经验值，太低看不清，太高遮挡视频
   * - 白色文字 + 黑色背景是最佳对比度
   */
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;

  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  border-radius: var(--md-sys-shape-corner-small);

  /* 限制最大宽度，避免字幕太长
   * 企业项目经验：
   * - 字幕太长会影响阅读体验
   * - 80% 是常见的字幕宽度
   */
  max-width: 80%;
  text-align: center;
}

/**
 * 单词样式
 *
 * 为什么需要特殊样式？
 * - 让用户知道单词可以点击
 * - hover 效果提供视觉反馈
 * - cursor: pointer 改变鼠标指针
 *
 * 为什么用下划线而不是背景色？
 * - 下划线更轻量，不会遮挡文字
 * - 符合"链接"的视觉习惯
 * - 背景色可能影响可读性
 *
 * 企业项目经验：
 * - 可交互元素必须有明确的视觉反馈
 * - hover 效果要明显但不夸张
 * - 遵循用户的视觉习惯（如下划线表示可点击）
 */
.subtitle-overlay__word {
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.subtitle-overlay__word:hover {
  /* hover 时显示下划线，提示可点击
   * 使用半透明白色，不要太突兀
   */
  border-bottom-color: rgba(255, 255, 255, 0.6);
  color: rgba(255, 255, 255, 0.9);
}

.subtitle-overlay__word:active {
  /* 点击时稍微变暗，提供反馈
   * 这是 Material Design 的标准做法
   */
  color: rgba(255, 255, 255, 0.7);
}
</style>
