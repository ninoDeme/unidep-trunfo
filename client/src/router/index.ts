import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/criador',
      name: 'criador',
      children: [
        {
          path: 'modelo',
          name: 'criador-modelo',
          component: () => import('../views/CriadorModelo.vue')
        },
        {
          path: 'carta',
          name: 'criador-carta',
          component: () => import('../views/CriadorCarta.vue')
        },
        {
          path: '',
          redirect: '/'
        },
      ]
    },
    {
      path: '/:catchAll(.*)*',
      redirect: '/'
    }
  ]
})

export default router
