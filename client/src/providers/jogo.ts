import type { CartaTrunfo } from 'trunfo-lib/models/carta'
import { computed, onMounted, ref } from 'vue'

export type JogadorState = {
  nome: string
  cartaAtual: CartaTrunfo | null
  cartasBaralho: CartaTrunfo[]
}

export interface JogoState {
  0: JogadorState
  1: JogadorState

  jogadas: {
    ganhador: 0 | 1
    jogador: 0 | 1
    0: {
      id_model_atributo: number
      id_carta: number
    },
    1: {
      id_model_atributo: number
      id_carta: number
    },
    monte: CartaTrunfo[]
  }[]

  monte: CartaTrunfo[]

  sala: string,
  ganhador: 0 | 1 | null | 3
}

const jogo = ref<JogoState | null>(null)
const loadingJogo = ref<boolean>(false)
const errorJogo = ref<string | null>(null)

async function getJogo(sala: string) {
  try {
    jogo.value = null
    loadingJogo.value = true
    // let res: JogoState = await fetch('/api/modelo').then((res) => res.json())
    //
    let cartas: CartaTrunfo[] = await fetch('/api/carta').then((res) => res.json())
    let modelo = cartas[0].id_modelo
    cartas = cartas.filter((c) => c.id_modelo === modelo).sort(() => Math.random() * 2 - 1)

    if (cartas.length % 2 === 1) {
      cartas.pop()
    }

    let res: JogoState = {
      0: {
        nome: 'Jogador A',
        cartaAtual: {} as any,
        cartasBaralho: cartas.slice(0, cartas.length / 2)
      },
      1: {
        nome: 'Jogador B',
        cartaAtual: {} as any,
        cartasBaralho: cartas.slice(cartas.length / 2)
      },
      jogadas: [],
      monte: [],
      sala,
      ganhador: null
    }

    function getJogador(jogador: 0 | 1) {
      if (!jogo.value) {
        throw new Error()
      }
      if (jogador === 0) {
        return jogo.value[0]
      } else {
        return jogo.value[1]
      }
    }
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
      return 0;
    })

    jogo.value = res

    function jogar(jogador: 0 | 1, id_carta: number, id_modelo_atributo: number) {
      if (!jogo.value) {
        throw new Error()
      }
      if (jogadorAtual.value !== jogador) {
        throw new Error()
      }
      const jogadorAtualObj = getJogador(jogador)
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

      let atributo_defendente = jogador_defendente.cartaAtual.atributos.find(
        (attr) => attr.id_modelo_atributo === id_modelo_atributo
      )!

      let ganhador = null;
      if (atributo_jogador.valor > atributo_defendente.valor) {
        ganhador = jogador
      } else if (atributo_defendente.valor > atributo_jogador.valor) {
        ganhador = jogador_defendente
      }

      if (ganhador == null) {
        let monte = [...jogo.value.monte, carta_jogada, jogador_defendente.cartaAtual];
        let jogador_0 = [...jogo.value[0].cartasBaralho];
        jogador_0.pop();
        let jogador_1 = [...jogo.value[1].cartasBaralho];
        jogador_1.pop();
        jogo.value = {
          ...jogo.value,
          monte,
          0: {
            ...jogo.value[0],
            cartasBaralho: jogador_0,
            cartaAtual: jogador_0[jogador_0.length - 1]
          }
        }
        return null;
      }
      
      
    }

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

export function useJogo(sala: string, searchOnError?: boolean) {
  onMounted(() => {
    if (jogo.value == null && !loadingJogo.value && (searchOnError || !errorJogo.value)) {
      getJogo(sala)
    }
  })
  return {
    jogo,
    loadingJogo,
    errorJogo,
    getJogo
  }
}
