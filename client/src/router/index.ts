import { createRouter, createWebHistory } from 'vue-router'
import Conectar from '../views/Conectar.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Conectar
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
          redirect: '/criador/modelo'
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
