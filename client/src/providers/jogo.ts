import type { CartaTrunfo } from 'trunfo-lib/models/carta'
import { decodeGameString } from 'trunfo-lib/models/jogo'
import { computed, onMounted, ref } from 'vue'

export type JogadorState = {
  nome: string
  cartaAtual: CartaTrunfo | null
  cartasBaralho: CartaTrunfo[]
}

export type Jogada = {
  ganhador: 0 | 1 | null
  jogador: {
    jogador: 0 | 1
    id_modelo_atributo: number
    id_carta: number
  }
  defendente: {
    id_model_atributo: number
    id_carta: number
  }
  monte: CartaTrunfo[]
}

export interface JogoState {
  0: JogadorState
  1: JogadorState

  jogadas: Jogada[]
  id_modelo: number

  monte: CartaTrunfo[]

  sala: number
  partidaString: string
  ganhador: 0 | 1 | null
}

const jogo = ref<JogoState | null>(null)
const loadingJogo = ref<boolean>(false)
const errorJogo = ref<string | null>(null)
const usuario = ref<0 | 1 | null>(null)

async function getJogo(partidaString: string) {
  try {
    jogo.value = null
    loadingJogo.value = true

    let partida = decodeGameString(partidaString)
    usuario.value = partida.jogador

    let cartas: CartaTrunfo[] = await fetch('/api/carta').then((res) => res.json())
    let id_modelo = partida.id_modelo;
    cartas = cartas.filter((c) => c.id_modelo === id_modelo).sort(() => Math.random() * 2 - 1)

    if (cartas.length % 2 === 1) {
      cartas.pop()
    }

    let cartasJogador0 = cartas.slice(0, cartas.length / 2)
    let cartasJogador1 = cartas.slice(cartas.length / 2)

    let res: JogoState = {
      0: {
        nome: 'Jogador A',
        cartaAtual: cartasJogador0.pop()!,
        cartasBaralho: cartasJogador0
      },
      1: {
        nome: 'Jogador B',
        cartaAtual: cartasJogador1.pop()!,
        cartasBaralho: cartasJogador1
      },
      jogadas: [],
      monte: [],
      id_modelo,
      sala: partida.sala,
      partidaString: partidaString,
      ganhador: null
    }
    jogo.value = res

    return jogo.value
  } catch (e) {
    if (e instanceof Error) {
      errorJogo.value = e.message
    } else {
      errorJogo.value = 'Ocoreu um erro, tente novamente mais tarde'
    }
    throw e
  } finally {
    loadingJogo.value = false
  }
}

export function useJogo(partida: string, searchOnError?: boolean) {
  onMounted(() => {
    if (
      (jogo.value == null || jogo.value.partidaString !== partida) &&
      !loadingJogo.value &&
      (searchOnError || !errorJogo.value)
    ) {
      getJogo(partida)
    }
  })
  return {
    jogo,
    loadingJogo,
    errorJogo,
    getJogo,
    usuario
  }
}
