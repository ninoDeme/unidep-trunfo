import { createRouter, createWebHistory } from 'vue-router'
import Menu from '../views/Menu.vue'
import Jogo from '@/views/Jogo.vue'
import CriarPartida from '@/views/CriarPartida.vue'
import SeJuntar from '@/views/SeJuntar.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Menu
    },
    {
      path: '/se-juntar',
      name: 'se-juntar',
      component: SeJuntar
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
        }
      ]
    },
    {
      path: '/:catchAll(.*)*',
      redirect: '/'
    }
  ]
})

export default router
