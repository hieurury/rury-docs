import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/docs',
      name: 'Docs',
      component: () => import('@/views/DocsView.vue'),
    },
    {
      path: '/docs/:courseSlug/:lessonSlug?',
      name: 'DocDetail',
      component: () => import('@/views/DocDetailView.vue'),
    },
    {
      path: '/editor',
      name: 'Editor',
      component: () => import('@/views/EditorView.vue'),
    },
    {
      path: '/code-block',
      name: 'CodeBlock',
      component: () => import('@/views/CodeBlockView.vue'),
    },
    {
      path: '/contribute',
      name: 'Contribute',
      component: () => import('@/views/ContributeView.vue'),
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

export default router