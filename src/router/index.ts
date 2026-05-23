import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
    },
    {
      path: '/player/:id',
      name: 'player',
      component: () => import('@/views/player/index.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/history/index.vue'),
    },
    {
      path: '/vocabulary',
      name: 'vocabulary',
      component: () => import('@/views/vocabulary/index.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/settings/index.vue'),
    },
  ],
})

export default router
