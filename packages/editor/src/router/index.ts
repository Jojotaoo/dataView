import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Editor',
    component: () => import('../pages/EditorPage.vue'),
  },
  {
    path: '/preview',
    name: 'Preview',
    component: () => import('@demo/preview'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
