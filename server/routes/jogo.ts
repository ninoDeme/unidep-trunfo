import { FastifyInstance } from "fastify";
import { decodeGameString, jogar, JogoState, PartidaParams } from 'trunfo-lib/models/jogo';
import { getAllCartas } from "./carta";
import { CartaTrunfo } from "trunfo-lib/models/carta";
import { Modelo } from "trunfo-lib/models/modelo";
import { generateCodigo, generateLast, generateTable } from "trunfo-lib/models/codigo";
import { getAllModelos } from "./modelo";
import { WebSocket } from "ws";
import { ClientMessage, ClientMessageType, is_client_message, ServerMessage, ServerMessageType } from 'trunfo-lib/messages'

export interface Jogo {
  0?: WebSocket
  1?: WebSocket
  jogo_state: JogoState,
  modelo: Modelo,
  cartas: CartaTrunfo[]
  cartasMap: Map<number, CartaTrunfo>;
  timeoutClose?: any;
}

async function routes(fastify: FastifyInstance, _options: unknown) {
  const salas = new Map<string, Jogo>();
  let cartas_cache: Promise<CartaTrunfo[]>;
  let modelos_cache: Promise<Map<number, Modelo>>;

  // let table: string[] | undefined = generateTable(3);
  // let rand_table: string[] | undefined = [...table].sort(() => Math.random() - 0.5)
  //
  // const cipher_table = new Map(table.map((c, i) => [c, rand_table![i]]))
  // const cipher_table_rev = new Map(table.map((c, i) => [rand_table![i], c]))
  //
  // table = undefined;
  // rand_table = undefined;
  //
  async function createJogo(info_partida: PartidaParams): Promise<Jogo> {
    if (salas.has(info_partida.sala)) throw new Error("Jogo já existe");

    if (!cartas_cache) {
      cartas_cache = getAllCartas(fastify);
    }
    if (!modelos_cache) {
      modelos_cache = getAllModelos(fastify).then(m => new Map(m.map(modelo => [modelo.id_modelo, modelo])))
    }

    let cartas = await cartas_cache.then(c => c.filter(carta => carta.id_modelo === info_partida.id_modelo))
    let modelo = await modelos_cache.then(m => m.get(info_partida.id_modelo));

    if (!modelo) throw new Error("Baralho/Modelo não existe")

    let jogo_state = initJogoState(cartas, modelo);

    let jogo = {
      modelo,
      cartas,
      jogo_state,
      cartasMap: new Map(cartas.map(c => [c.id_carta, c]))
    };
    salas.set(info_partida.sala, jogo);

    return jogo;
  }

  function initJogoState(all_cartas: CartaTrunfo[], modelo: Modelo): JogoState {

    let cartas = all_cartas.map(c => c.id_carta).sort(() => Math.random() * 2 - 1)
    if (cartas.length % 2 === 1) {
      cartas.pop()
    }

    let cartasJogador0 = cartas.slice(0, cartas.length / 2)
    let cartasJogador1 = cartas.slice(cartas.length / 2)

    let res: JogoState = {
      0: {
        nome: null,
        cartaAtual: cartasJogador0.pop()!,
        cartasBaralho: cartasJogador0
      },
      1: {
        nome: null,
        cartaAtual: cartasJogador1.pop()!,
        cartasBaralho: cartasJogador1
      },
      jogadas: [],
      monte: [],
      id_modelo: modelo.id_modelo,
      ganhador: null
    }

    return res
  }

  fastify.get<{
    Params: {
      partida: string;
    };
  }>("/ws/:partida", { websocket: true }, async (socket, request) => {
    let partida = request.params.partida
    let info_partida = decodeGameString(partida);
    let sala = salas.get(info_partida.sala) ?? await createJogo(info_partida);;

    if (sala.timeoutClose != null) {
      clearTimeout(sala.timeoutClose);
      sala.timeoutClose = undefined;
    }

    if (sala[info_partida.jogador] != null) {
      console.error("Jogador ja cadastrado");
      sala[info_partida.jogador]!.close(1000, "Jogador ja cadastrado");
    }

    const oponente: 0 | 1 = info_partida.jogador ? 0 : 1;
    sala[info_partida.jogador] = socket;

    socket.on("close", () => {
      console.log("Jogador desconectou: " + info_partida.jogador);
      sala[info_partida.jogador] = undefined;
      if (sala[oponente]) {
        sala[oponente].send(JSON.stringify(<ServerMessage>{
          s_type: ServerMessageType.OponenteStatus,
          data: false
        }));
      } else {
        sala.timeoutClose = setTimeout(() => {
          salas.delete(info_partida.sala);
        }, 120000)
      }
    })

    function dealWithMessage(message: ClientMessage) {
      console.log(ClientMessageType[message.m_type], message.data);
      if (message.m_type === ClientMessageType.Nome) {
        sala.jogo_state[info_partida.jogador].nome = message.data
        if (sala[oponente]?.OPEN) {
          sala[oponente].send(JSON.stringify(<ServerMessage>{
            s_type: ServerMessageType.OponenteNomeado,
            data: message.data
          }))
        }
      } else if (message.m_type === ClientMessageType.Jogada) {
        try {
          let jogada_cliente = message.data[1];
          if (info_partida.jogador !== jogada_cliente.jogador.jogador) {
            throw new Error("Jogador inválido")
          }
          let [jogo_state, jogada] = jogar(jogada_cliente.jogador, sala.jogo_state, sala.cartasMap)

          if (jogada_cliente.ganhador !== jogada.ganhador || jogada_cliente.defendente.id_carta !== jogada.defendente.id_carta) {
            throw new Error("Ocorreu um erro");
          }

          sala.jogo_state = jogo_state;
          socket.send(JSON.stringify(<ServerMessage>{
            s_type: ServerMessageType.JogadaSucesso,
            data: { carta_oponente: jogada.defendente.id_carta, jogada_id: message.data[0] }
          }))

          console.log(sala[oponente]?.OPEN)
          if (sala[oponente]?.OPEN) {
            sala[oponente].send(JSON.stringify(<ServerMessage>{
              s_type: ServerMessageType.OponenteJogou,
              data: message.data
            }))
          }
        } catch (e) {
          let newErro: Error | null = null
          if (!(e instanceof Error)) {
            newErro = new Error(e as any);
          } else {
            newErro = e;
          }
          console.error(e)
          socket.send(JSON.stringify(<ServerMessage>{
            s_type: ServerMessageType.JogadaInvalida,
            data: { message: newErro.message, server_state: sala.jogo_state, jogada_id: message.data[0] }
          }))
        }
      } else {
        console.log(`Não implementado: ${JSON.stringify(message)}`)
      }
    }

    socket.on("message", (data, isBinary) => {
      let parsed = JSON.parse(data.toString());
      if (is_client_message(parsed)) {
        return dealWithMessage(parsed)
      }
      socket.send(JSON.stringify(<ServerMessage>{
        s_type: ServerMessageType.Error,
        data: [400, 'Ultima mensagem invalida']
      }))

    })

    socket.send(JSON.stringify(<ServerMessage>{
      s_type: ServerMessageType.Ready,
      data: [sala.jogo_state, !!sala[oponente]]
    }));

    if (sala[oponente]) {
      sala[oponente].send(JSON.stringify(<ServerMessage>{
        s_type: ServerMessageType.OponenteStatus,
        data: true
      }));
    }
  })

  fastify.get('/create_sala/', async (request, response) => {
    let number = generateCodigo(4);
    while (salas.has(number)) {
      number = generateCodigo(4);
    }

    const player = (Math.random() * 100000) % 2 as 0 | 1;

    const codigo = number + generateLast(number, player);

    response.send(codigo);
  })

  fastify.get<{
    Params: {
      player: string
    }
  }>('/create_sala/:player', async (request, response) => {
    let number = generateCodigo(4);
    while (salas.has(number)) {
      number = generateCodigo(4);
    }

    const player = parseInt(request.params.player);
    if (player !== 0 && player !== 1) {
      throw new Error("invalid url")
    }

    const codigo = number + generateLast(number, player);

    response.send(codigo);
  })
}



export default routes;
