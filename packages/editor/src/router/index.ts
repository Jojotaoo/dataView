import { createRouter, createWebHistory } from 'vue-router'
import { PreviewPage } from 'jojotaoo_preview'

const routes = [
  {
    path: '/',
    name: 'Editor',
    component: () => import('../pages/EditorPage.vue'),
  },
  {
    path: '/preview',
    name: 'Preview',
    component: PreviewPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
