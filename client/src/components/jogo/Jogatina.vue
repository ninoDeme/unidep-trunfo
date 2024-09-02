<script setup lang="ts">
import Carta from '@/components/Carta.vue'
import { useCartas } from '@/providers/cartas'
import { type UseJogoReturn } from '@/providers/jogo'
import { useModelos } from '@/providers/modelos'
import { Bars4Icon, FlagIcon, QuestionMarkCircleIcon, ViewColumnsIcon } from '@heroicons/vue/24/outline'
import type { CartaTrunfoAtributo } from 'trunfo-lib/models/carta'
import { jogar, type Jogada, type JogoState } from 'trunfo-lib/models/jogo'
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

let router = useRouter()

let { modelos } = useModelos()
let { cartas } = useCartas()

let { jogo, loadingJogo, errorJogo, usuario, enviarJogada, jogadaOponente } = inject<UseJogoReturn>(
  'jogo',
  () => {
    throw new Error()
  },
  true
)

let podeJogar = computed(
  () => jogadorAtual.value === usuario.value && !atributoEscolhido.value && !nextJogoState.value
)
let modelo = computed(() => {
  if (!modelos.value) return null
  if (!jogo.value) return null
  return modelos.value.get(jogo.value.id_modelo)!
})

let adversario = computed(() => (usuario.value == null ? null : usuario.value ? 0 : 1))

const jogadorAtual = computed(() => {
  if (!jogo.value) {
    return null
  }
  for (let ultimaJogada of [...jogo.value.jogadas].reverse()) {
    if (ultimaJogada.ganhador != null) {
      return ultimaJogada.ganhador
    }
  }
  return 0
})

async function jogar_atributo(atributo: CartaTrunfoAtributo) {
  if (usuario.value == null) return
  if (jogo.value?.[usuario.value].cartaAtual == null) return
  if (jogadorAtual.value == null) return
  if (cartas.value === null) return

  try {
    let [jogoState, jogada] = jogar(
      {
        jogador: jogadorAtual.value,
        id_carta: jogo.value[usuario.value].cartaAtual!,
        id_modelo_atributo: atributo.id_modelo_atributo
      },
      jogo.value,
      cartas.value
    )

    await enviarJogada(jogada)
    on_jogada(jogada, jogoState)
  } catch (e) {
    if (e instanceof Error) {
      toast(e.message, {
        type: 'error',
        theme: 'colored',
      })
    }
    console.error(e)
  }
}

watch(
  jogadaOponente,
  () => {
    if (!jogadaOponente.value) return
    if (!jogo.value) return
    if (cartas.value === null) return

    let [jogoState, jogada] = jogar(
      {
        jogador: jogadaOponente.value.jogador.jogador,
        id_carta: jogadaOponente.value.jogador.id_carta,
        id_modelo_atributo: jogadaOponente.value.jogador.id_modelo_atributo
      },
      jogo.value!,
      cartas.value!
    )

    on_jogada(jogada, jogoState)
  },
  { immediate: true }
)

function on_jogada(jogada: Jogada, jogoState: JogoState) {
  animacaoVirar.value = true
  virar.value = false
  nextJogoState.value = jogoState
  setTimeout(() => {
    atributoEscolhido.value =
      cartas.value
        ?.get(jogo.value?.[usuario.value ?? 0].cartaAtual!)
        ?.atributos.find(
          (attr) => attr.id_modelo_atributo === jogada.jogador.id_modelo_atributo
        ) ?? null
    ganhador.value = jogada.ganhador ?? 2
  }, 2000)
}

function continueJogo() {
  if (nextJogoState.value) {
    atributoEscolhido.value = null
    virar.value = true

    jogo.value = nextJogoState.value
    nextJogoState.value = null
    setTimeout(() => {
      animacaoVirar.value = true
    }, 250)
  }

  if (jogo.value?.ganhador != null) {
    router.push('/')
  }
}

let nextJogoState = ref<null | JogoState>(null)
const animacaoVirar = ref(false)
const virar = ref(true)
const ganhador = ref<null | 0 | 1 | 2>(null)

const atributoEscolhido = ref<CartaTrunfoAtributo | null>(null)
const atributoEscolhidoAdversario = computed(() => {
  if (atributoEscolhido.value == null) return null
  if (adversario.value == null) return null
  let cartaAdversario = jogo.value?.[adversario.value]?.cartaAtual
  if (!cartaAdversario) return null

  return (
    cartas.value
      ?.get(cartaAdversario)
      ?.atributos.find(
        (attr) => attr.id_modelo_atributo === atributoEscolhido.value?.id_modelo_atributo
      ) ?? null
  )
})
const textoBottomTela = computed(() => {
  if (jogo.value?.ganhador != null) {
    return '\xa0'
  }
  if (podeJogar.value) {
    return 'Selecione uma informação de sua carta'
  }
  if (atributoEscolhido.value) {
    return 'Pressione na tela para continuar'
  }
  if (jogadorAtual.value !== null && jogadorAtual.value === adversario.value) {
    return 'Espere o oponente vazer sua jogada'
  }
  return '\xa0'
})

const topDivEl = ref<null | HTMLElement>(null)
const widthCarta = ref(250)
let resizeObs: ResizeObserver | null = null
let expandSidebar = ref(false);

onMounted(() => {
  if (!topDivEl.value) return
  resizeObs = new ResizeObserver(() => {
    if (!topDivEl.value) return
    widthCarta.value = Math.min((topDivEl.value.clientHeight / 660) * 500 - 10, 260)
  })
  resizeObs.observe(topDivEl.value)
  widthCarta.value = Math.min((topDivEl.value.clientHeight / 660) * 500 - 10, 270)
})
onUnmounted(() => {
  resizeObs?.disconnect()
})
</script>

<template>
  <main>
    <div class="wrapper overflow-y-hidden relative flex flex-col">
      <button
        @click="continueJogo()"
        class="absolute left-0 top-0 w-full h-full z-20 px-4 bg-black bg-opacity-60"
        v-if="(atributoEscolhido || jogo?.ganhador != null) && modelo"
      >
        <div class="flex flex-col justify-center items-center max-w-xl mx-auto w-full h-full" v-if="jogo?.ganhador != null">
            <div class="text-2xl font-normal my-16">
              {{ jogo.ganhador === usuario ? 'Você ganhou' : 'Você perdeu' }}
            </div>
        </div>
        <div class="flex flex-col justify-center items-center max-w-xl mx-auto w-full h-full" v-if="atributoEscolhido">
          <div class="flex flex-col justify-center items-center flex-1 w-full">
            <div class="flex flex-col items-center w-full">
              <div class="text-2xl">Informação da carta do oponente</div>
              <div
                v-if="atributoEscolhidoAdversario"
                :style="{
                  backgroundColor: modelo.cor_atributo_fundo,
                  color: modelo.cor_atributo_texto
                }"
                class="flex flex-row justify-between my-1 text-xl w-full"
              >
                <span class="p-2"> {{ atributoEscolhidoAdversario.nome }} </span>
                <span class="p-2"> {{ atributoEscolhidoAdversario.valor }} </span>
              </div>
            </div>
            <div :class="{ 'opacity-0': ganhador == null }" class="text-2xl font-normal my-16">
              {{ ganhador === usuario ? 'Você ganhou' : 'Você perdeu' }}
            </div>

            <div class="flex flex-col items-center w-full">
              <div class="text-2xl">Informação da sua carta</div>
              <div
                :style="{
                  backgroundColor: modelo.cor_atributo_fundo,
                  color: modelo.cor_atributo_texto
                }"
                class="flex flex-row justify-between my-1 text-xl w-full"
              >
                <span class="p-2"> {{ atributoEscolhido.nome }} </span>
                <span class="p-2"> {{ atributoEscolhido.valor }} </span>
              </div>
            </div>
          </div>
        </div>
      </button>
      <div
        class="flex flex-col items-center justify-center flex-1"
        :class="{ 'blur-[1px]': atributoEscolhido }"
      >
        <div
          class="relative w-full flex-1"
          ref="topDivEl"
        >
          <div
            class="absolute top-0 left-0 w-full h-full flex items-center justify-center overflow-hidden"
          >
            <Carta
              :clicar-atributo="!podeJogar && !atributoEscolhido"
              :back="virar"
              v-if="adversario != null && jogo?.[adversario].cartaAtual && modelo"
              :modelo="modelo"
              :carta="cartas?.get(jogo?.[adversario].cartaAtual!)"
              :width="widthCarta"
            ></Carta>
          </div>
          <div v-if="!animacaoVirar"class="absolute z-20 flex items-center h-full top-0 left-0 overflow-x-hidden" :class="expandSidebar ? 'w-max' : 'w-10'">
            <div class="w-full my-auto flex flex-col items-stretch bg-gray-800">
              <button @click="expandSidebar = !expandSidebar" class="bg-gray-700 text-xl p-2 gap-3 mb-px h-10 flex items-center justify-start" type="button">
                <Bars4Icon class="icon"></Bars4Icon>
                <div v-if="expandSidebar">
                  Recolher Menu
                </div>
              </button>
              <button class="bg-gray-700 text-xl p-2 gap-3 mb-px h-10 flex items-center justify-start" type="button">
                <ViewColumnsIcon class="icon"></ViewColumnsIcon>
                <div v-if="expandSidebar">
                  Ver Baralho
                </div>
              </button>
              <button class="bg-gray-700 text-xl p-2 gap-3 mb-px h-10 flex items-center justify-start" type="button">
                <QuestionMarkCircleIcon class="icon"></QuestionMarkCircleIcon>
                <div v-if="expandSidebar">
                  Como Jogar
                </div>
              </button>
              <button class="bg-gray-700 text-xl p-2 gap-3 mb-px h-10 flex items-center justify-start" type="button">
                <FlagIcon class="icon"></FlagIcon>
                <div v-if="expandSidebar">
                  Dessistir
                </div>
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-row items-center gap-4 relative justify-center w-full mt-4">
          <!-- <Baralho class="absolute left-4 bottom-4" v-if="modelo" :modelo="modelo" :cartas-baralho="jogo?.[0].cartasBaralho"/> -->
          <Carta
            v-if="usuario != null && modelo"
            :class="{'opacity-0': !jogo?.[usuario].cartaAtual}"
            :modelo="modelo"
            :carta="cartas?.get(jogo?.[usuario].cartaAtual!)"
            :clicar-atributo="podeJogar"
            @click-attr="jogar_atributo"
            :width="270"
          ></Carta>
        </div>
      </div>
      <div class="py-3 items-stretch justify-center z-50 px-1">
        <div class="text-2xl text-center">{{ textoBottomTela }}</div>
      </div>
    </div>
  </main>
</template>

<style>
.wrapper {
  width: 100dvw;
  height: 100dvh;
}
</style>
