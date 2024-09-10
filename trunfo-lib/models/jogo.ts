import { type CartaTrunfo } from "./carta";

export type PartidaParams = {
  sala: string;
  id_modelo: number;
  jogador: 0 | 1;
}

export function getJogadorAtual(jogo: JogoState): 0 | 1 {
  for (let ultimaJogada of [...jogo.jogadas].reverse()) {
    if (ultimaJogada.ganhador != null) {
      return ultimaJogada.ganhador
    }
  }
  return 0
}

export function jogar(jogada_p: { jogador: 0 | 1, id_carta: number, id_modelo_atributo: number }, jogo: JogoState, cartas: Map<number, CartaTrunfo>): [JogoState, Jogada] {
  const { jogador, id_carta, id_modelo_atributo } = jogada_p;
  let jogadorAtual = getJogadorAtual(jogo);
  if (jogadorAtual !== jogador) {
    throw new Error("Jogador não está no seu turno")
  }
  const jogadorAtualObj = jogo[jogador];
  if (jogadorAtualObj.cartaAtual == null) {
    throw new Error("Jogador não possuí mais cartas")
  }
  let carta_jogada = cartas?.get(jogadorAtualObj.cartaAtual)
  if (!carta_jogada || carta_jogada.id_carta !== id_carta) {
    throw new Error("Jogo Dessíncronizado")
  }
  let atributo_jogador = carta_jogada.atributos.find(
    (attr) => attr.id_modelo_atributo === id_modelo_atributo
  )
  if (!atributo_jogador) {
    throw new Error("Atributo não existe")
  }

  let jogador_defendente = jogo[jogador ? 0 : 1];
  if (!jogador_defendente.cartaAtual) {
    throw new Error("Oponente não possuí mais cartas")
  }

  let carta_defendente = cartas.get(jogador_defendente.cartaAtual);
  if (!carta_defendente) {
    throw new Error("Carta do oponente não é valida");
  }

  let atributo_defendente = carta_defendente.atributos.find(
    (attr) => attr.id_modelo_atributo === id_modelo_atributo
  )!

  let ganhador: 0 | 1 | null = null
  if (atributo_jogador.valor > atributo_defendente.valor) {
    ganhador = jogador
  } else if (atributo_defendente.valor > atributo_jogador.valor) {
    ganhador = jogador ? 0 : 1
  }

  if (ganhador == null) {
    let jogador_0 = [...jogo[0].cartasBaralho]
    let jogador_1 = [...jogo[1].cartasBaralho]
    let ganhadorJogo: 0 | 1 | null = null
    let jogada = {
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
        ...jogo,
        0: {
          ...jogo[0],
          cartaAtual: jogador_0.pop()!,
          cartasBaralho: jogador_0
        },
        1: {
          ...jogo[1],
          cartaAtual: jogador_1.pop()!,
          cartasBaralho: jogador_1
        },
        ganhador: ganhadorJogo,
        jogadas: [...jogo.jogadas, jogada]
      },
      jogada
    ]
  }

  let jogador_0 = [...jogo[0].cartasBaralho]
  let jogador_1 = [...jogo[1].cartasBaralho]
  let ganhadorJogo: 1 | 0 | null = null
  let pontos_0 = jogo[0].pontos;
  let pontos_1 = jogo[1].pontos;
  if (ganhador === 0) {
    pontos_0++;
    if (pontos_0 === 5) {
      ganhadorJogo = 0;
    }
  }
  if (ganhador === 1) {
    pontos_1++;
    if (pontos_1 === 5) {
      ganhadorJogo = 1;
    }
  }
  let jogada = {
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
      ...jogo,
      ganhador: ganhadorJogo,
      0: {
        ...jogo[0],
        pontos: pontos_0,
        cartaAtual: jogador_0.pop() ?? null,
        cartasBaralho: jogador_0
      },
      1: {
        ...jogo[1],
        pontos: pontos_1,
        cartaAtual: jogador_1.pop() ?? null,
        cartasBaralho: jogador_1
      },
      jogadas: [...jogo.jogadas, jogada]
    },
    jogada
  ]
}

export type JogadorState = {
  nome: string | null
  pontos: number
  cartaAtual: number | null
  cartasBaralho: number[]
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
}

export interface JogoState {
  0: JogadorState
  1: JogadorState

  jogadas: Jogada[]
  id_modelo: number

  ganhador: 0 | 1 | null
}
