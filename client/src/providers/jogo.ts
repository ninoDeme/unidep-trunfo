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
  }[]
  id_modelo: number

  monte: CartaTrunfo[]

  sala: string
  ganhador: 0 | 1 | null
}

const jogo = ref<JogoState | null>(null)
const loadingJogo = ref<boolean>(false)
const errorJogo = ref<string | null>(null)

async function getJogo(sala: string) {
  try {
    jogo.value = null
    loadingJogo.value = true

    let cartas: CartaTrunfo[] = await fetch('/api/carta').then((res) => res.json())
    let id_modelo = cartas[0].id_modelo
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
      return 0
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
        jogo.value = {
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
          jogadas: [
            ...jogo.value.jogadas,
            {
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
          ]
        }
        return jogo.value.jogadas[jogo.value.jogadas.length - 1]
      }

      let jogador_0 = [...jogo.value[0].cartasBaralho]
      let jogador_1 = [...jogo.value[1].cartasBaralho]
      let ganhadorJogo: 1 | 0 | null = null
      if (ganhador === 0) {
        if (jogador_1.length === 0) {
          ganhadorJogo = 0
        } else {
          jogador_0.unshift(jogador_1.pop()!)
        }
      }
      if (ganhador === 1) {
        if (jogador_0.length === 0) {
          ganhadorJogo = 1
        } else {
          jogador_1.unshift(jogador_1.pop()!)
        }
      }
      jogo.value = {
        ...jogo.value,
        monte: [],
        ganhador: ganhadorJogo,
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
        jogadas: [
          ...jogo.value.jogadas,
          {
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
        ]
      }
      return jogo.value.jogadas[jogo.value.jogadas.length - 1]
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
