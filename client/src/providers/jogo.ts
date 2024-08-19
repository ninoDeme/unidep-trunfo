import type { CartaTrunfo } from 'trunfo-lib/models/carta'
import type { Modelo } from 'trunfo-lib/models/modelo'
import { onMounted, ref } from 'vue'

export type JogadorState = {
  nome: string
  cartaAtual: CartaTrunfo
  cartasBaralho: CartaTrunfo[]
}

export interface JogoState {
  a: JogadorState,
  b: JogadorState,

  jogadas: {
    ganhador: 'a' | 'b',
    atributo: number,
    carta: CartaTrunfo
  }[],

  sala: string,
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
    let modelo = cartas[0].id_modelo;
    cartas = cartas.filter(c => c.id_modelo === modelo).sort(() => Math.random() * 2 - 1);

    if (cartas.length % 2 === 1) {
      cartas.pop();
    }

    let res: JogoState = {
      a: {
        nome: 'Jogador A',
        cartaAtual: {} as any,
        cartasBaralho: cartas.slice(0, (cartas.length / 2)),
      },
      b: {
        nome: 'Jogador B',
        cartaAtual: {} as any,
        cartasBaralho: cartas.slice((cartas.length / 2)),
      },
      jogadas: [],
      sala
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
