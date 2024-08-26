<script setup lang="ts">
import Carta from '@/components/Carta.vue'
import { useJogo, type Jogada, type JogoState } from '@/providers/jogo'
import { useModelos } from '@/providers/modelos'
import type { CartaTrunfoAtributo } from 'trunfo-lib/models/carta'
import { computed, effect, ref } from 'vue'

let { modelos } = useModelos()

let { partida } = defineProps<{
  partida: string
}>()
let { jogo, loadingJogo, errorJogo, usuario } = useJogo(partida)

let podeJogar = computed(
  () => jogadorAtual.value === usuario.value && !atributoEscolhido.value && !nextJogoState.value
)
let modelo = computed(() => {
  if (!modelos.value) return null
  if (!jogo.value) return null
  return modelos.value.get(jogo.value.id_modelo)!
})

let adversario = computed(() => (usuario.value == null ? null : usuario.value ? 0 : 1))

function getAdversario(jogador: 0 | 1) {
  if (!jogo.value) {
    throw new Error()
  }
  if (jogador === 0) {
    return jogo.value[1]
  } else {
    return jogo.value[0]
  }
}

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

async function jogar(
  jogador: 0 | 1,
  id_carta: number,
  id_modelo_atributo: number
): Promise<[JogoState, Jogada]> {
  if (!jogo.value) {
    throw new Error()
  }
  if (jogadorAtual.value !== jogador) {
    throw new Error()
  }
  const jogadorAtualObj = jogo.value[0]
  let carta_jogada = jogadorAtualObj.cartaAtual
  if (!carta_jogada || carta_jogada.id_carta !== id_carta) {
    throw new Error()
  }
  let atributo_jogador = carta_jogada.atributos.find(
    (attr) => attr.id_modelo_atributo === id_modelo_atributo
  )
  if (!atributo_jogador) {
    throw new Error()
  }

  let jogador_defendente = getAdversario(jogador)
  if (!jogador_defendente.cartaAtual) {
    throw new Error()
  }

  let carta_defendente = jogador_defendente.cartaAtual
  let atributo_defendente = jogador_defendente.cartaAtual.atributos.find(
    (attr) => attr.id_modelo_atributo === id_modelo_atributo
  )!

  let ganhador: 0 | 1 | null = null
  if (atributo_jogador.valor > atributo_defendente.valor) {
    ganhador = jogador
  } else if (atributo_defendente.valor > atributo_jogador.valor) {
    ganhador = jogador ? 0 : 1
  }

  if (ganhador == null) {
    let monte = [...jogo.value.monte, carta_jogada, jogador_defendente.cartaAtual]
    let jogador_0 = [...jogo.value[0].cartasBaralho]
    let jogador_1 = [...jogo.value[1].cartasBaralho]
    let ganhadorJogo: 0 | 1 | null = null
    if (jogador_0.length === 0) {
      ganhadorJogo = 1
    }
    if (jogador_1.length === 0) {
      ganhadorJogo = 0
    }
    let jogada = {
      monte,
      ganhador: null,
      jogador: {
        jogador,
        id_carta,
        id_modelo_atributo
      },
      defendente: {
        id_carta: carta_defendente.id_carta,
        id_model_atributo: atributo_defendente.id_modelo_atributo
      }
    }
    return [
      {
        ...jogo.value,
        monte,
        0: {
          ...jogo.value[0],
          cartaAtual: jogador_0.pop()!,
          cartasBaralho: jogador_0
        },
        1: {
          ...jogo.value[1],
          cartaAtual: jogador_1.pop()!,
          cartasBaralho: jogador_1
        },
        ganhador: ganhadorJogo,
        jogadas: [...jogo.value.jogadas, jogada]
      },
      jogada
    ]
  }

  let jogador_0 = [...jogo.value[0].cartasBaralho]
  let jogador_1 = [...jogo.value[1].cartasBaralho]
  let ganhadorJogo: 1 | 0 | null = null
  if (ganhador === 0) {
    if (jogador_1.length === 0) {
      ganhadorJogo = 0
    } else {
      jogador_0.unshift(jogo.value[1].cartaAtual!)
    }
  }
  if (ganhador === 1) {
    if (jogador_0.length === 0) {
      ganhadorJogo = 1
    } else {
      jogador_1.unshift(jogo.value[0].cartaAtual!)
    }
  }
  let jogada = {
    monte: [],
    ganhador,
    jogador: {
      jogador,
      id_carta,
      id_modelo_atributo
    },
    defendente: {
      id_carta: carta_defendente.id_carta,
      id_model_atributo: atributo_defendente.id_modelo_atributo
    }
  }
  return [
    {
      ...jogo.value,
      monte: [],
      ganhador: ganhadorJogo,
      0: {
        ...jogo.value[0],
        cartaAtual: jogador_0.pop() ?? null,
        cartasBaralho: jogador_0
      },
      1: {
        ...jogo.value[1],
        cartaAtual: jogador_1.pop() ?? null,
        cartasBaralho: jogador_1
      },
      jogadas: [...jogo.value.jogadas, jogada]
    },
    jogada
  ]
}

async function jogar_atributo(atributo: CartaTrunfoAtributo) {
  if (usuario.value == null) return
  if (!jogo.value?.[usuario.value].cartaAtual) return
  if (jogadorAtual.value == null) return

  let [jogoState, jogada] = await jogar(
    jogadorAtual.value,
    jogo.value[usuario.value].cartaAtual!.id_carta,
    atributo.id_modelo_atributo
  )
  virar.value = false
  nextJogoState.value = jogoState
  setTimeout(() => {
    atributoEscolhido.value = atributo
    ganhador.value = jogada.ganhador ?? 2
  }, 2000)
}

function continueJogo() {
  if (!nextJogoState) return
  atributoEscolhido.value = null
  virar.value = true

  setTimeout(() => {
    jogo.value = nextJogoState.value
    nextJogoState.value = null
  }, 300)
}

let nextJogoState = ref<null | JogoState>(null)
const virar = ref(true)
const ganhador = ref<null | 0 | 1 | 2>(null)
const atributoEscolhido = ref<CartaTrunfoAtributo | null>(null)
const atributoEscolhidoAdversario = computed(() => {
  if (!atributoEscolhido.value) return null
  if (!adversario.value) return null
  let cartaAdversario = jogo.value?.[adversario.value]?.cartaAtual
  if (!cartaAdversario) return null

  return (
    cartaAdversario.atributos.find(
      (attr) => attr.id_modelo_atributo === atributoEscolhido.value?.id_modelo_atributo
    ) ?? null
  )
})
const textoBottomTela = computed(() => {
  if (podeJogar.value) {
    return 'Seleciona uma informação de sua carta'
  }
  if (atributoEscolhido.value) {
    return 'Pressione na tela para continuar'
  }
  if (jogadorAtual.value !== null && jogadorAtual.value === adversario.value) {
    return 'Espere o oponente vazer sua jogada'
  }
  if (usuario.value !== null && jogo.value?.ganhador === usuario.value) {
    return 'Você ganhou!'
  }
  if (adversario.value !== null && jogo.value?.ganhador === adversario.value) {
    return 'Você perdeu!'
  }
  return '\xa0'
})
</script>

<template>
  <main>
    <div class="wrapper overflow-y-hidden relative flex flex-col">
      <button
        @click="continueJogo()"
        class="absolute left-0 top-0 w-full h-full z-20 px-4 bg-black bg-opacity-60"
        v-if="atributoEscolhido && modelo"
      >
        <div class="flex flex-col justify-center items-center max-w-xl mx-auto w-full h-full">
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
        <div class="flex flex-row items-center gap-4 relative justify-center w-full">
          <Carta
            @click="virar = !virar"
            @click-attr="jogar_atributo"
            :clicar-atributo="!podeJogar && !atributoEscolhido"
            :back="virar"
            v-if="adversario != null && jogo?.[adversario].cartaAtual && modelo"
            :modelo="modelo"
            :carta="jogo?.[adversario].cartaAtual!"
            :width="260"
          ></Carta>
        </div>
        <div class="flex-1"></div>
        <div class="flex flex-row items-center gap-4 relative justify-center w-full">
          <!-- <Baralho class="absolute left-4 bottom-4" v-if="modelo" :modelo="modelo" :cartas-baralho="jogo?.[0].cartasBaralho"/> -->
          <Carta
            v-if="usuario != null && jogo?.[usuario].cartaAtual && modelo"
            :modelo="modelo"
            :carta="jogo?.[usuario].cartaAtual!"
            :clicar-atributo="podeJogar"
            @click-attr="jogar_atributo"
            :width="270"
          ></Carta>
        </div>
      </div>
      <div class="py-3 items-stretch justify-center z-50">
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
