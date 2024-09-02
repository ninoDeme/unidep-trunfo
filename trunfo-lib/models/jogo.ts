import { type CartaTrunfo } from "./carta";

function base64ToBytes(base64: string) {
  const binString = atob(base64);
  return new TextDecoder().decode(
    Uint8Array.from(binString, (m) => m.codePointAt(0)!),
  );
}

function bytesToBase64(input: string) {
  const bytes = new TextEncoder().encode(input);
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

export type PartidaParams = {
  sala: string;
  id_modelo: number;
  jogador: 0 | 1;
}

export function decodeGameString(game: string): PartidaParams {
  let decoded = base64ToBytes(game);
  let values = decoded.split("|");
  return {
    sala: values[0],
    id_modelo: parseInt(values[1]),
    jogador: parseInt(values[2]) as 0 | 1,
  };
}

export function encodeGameString(params: PartidaParams) {
  let { sala, id_modelo, jogador } = params;
  let encoded = bytesToBase64([sala, id_modelo, jogador].join('|'));
  return encoded;
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
  console.log(id_carta, carta_jogada)
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
    let monte = [...jogo.monte, jogadorAtualObj.cartaAtual, jogador_defendente.cartaAtual]
    let jogador_0 = [...jogo[0].cartasBaralho]
    let jogador_1 = [...jogo[1].cartasBaralho]
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
        ...jogo,
        monte,
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
  if (ganhador === 0) {
    if (jogador_1.length <= 1) {
      ganhadorJogo = 0
    } else {
      jogador_0.unshift(jogo[1].cartaAtual!)
    }
  }
  if (ganhador === 1) {
    if (jogador_0.length <= 1) {
      ganhadorJogo = 1
    } else {
      jogador_1.unshift(jogo[0].cartaAtual!)
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
      ...jogo,
      monte: [],
      ganhador: ganhadorJogo,
      0: {
        ...jogo[0],
        cartaAtual: jogador_0.pop() ?? null,
        cartasBaralho: jogador_0
      },
      1: {
        ...jogo[1],
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
  monte: number[]
}

export interface JogoState {
  0: JogadorState
  1: JogadorState

  jogadas: Jogada[]
  id_modelo: number

  monte: number[]

  ganhador: 0 | 1 | null
}
