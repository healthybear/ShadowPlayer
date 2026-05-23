import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './styles/element/index.scss'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'virtual:uno.css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import App from './App.vue'
import router from './router'

// 导入存储初始化
// 企业项目经验：在应用启动时初始化数据库，确保首次使用时有示例数据
import { seedDatabase } from '@/storage/seed'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, { locale: zhCn })
app.use(VueQueryPlugin)
app.use(VueVirtualScroller)
app.use(createPinia())
app.use(router)

// 初始化数据库
seedDatabase().catch((error) => {
  console.error('Failed to seed database:', error)
  // 不阻止应用启动
})

app.mount('#app')
