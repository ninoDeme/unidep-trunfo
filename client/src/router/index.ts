import { createRouter, createWebHistory } from 'vue-router'
import Conectar from '../views/Conectar.vue'
import Jogo from '@/views/Jogo.vue'
import CriarPartida from '@/views/CriarPartida.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Conectar
    },
    {
      path: '/criar-partida',
      name: 'criar-partida',
      component: CriarPartida
    },
    {
      path: '/jogo/:nomesala',
      name: 'jogo',
      component: Jogo
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
          name: '',
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
