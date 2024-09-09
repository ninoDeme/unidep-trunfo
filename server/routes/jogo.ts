import { FastifyInstance } from 'fastify'
import { jogar, JogoState } from 'trunfo-lib/models/jogo'
import { getAllCartas } from './carta'
import { CartaTrunfo } from 'trunfo-lib/models/carta'
import { Modelo } from 'trunfo-lib/models/modelo'
import { decodeCodigo, generateCodigo, generateLast } from 'trunfo-lib/models/codigo'
import TrunfoCrypt from 'trunfo-lib/models/cipher'
import { getAllModelos } from './modelo'
import { WebSocket } from 'ws'
import {
  ClientMessage,
  ClientMessageType,
  is_client_message,
  ServerMessage,
  ServerMessageType
} from 'trunfo-lib/messages'

export interface Jogo {
  0?: WebSocket
  1?: WebSocket
  jogo_state: JogoState
  modelo: Modelo
  cartas: CartaTrunfo[]
  cartasMap: Map<number, CartaTrunfo>
  timeoutClose?: any
}

async function routes(fastify: FastifyInstance, _options: unknown) {
  const salas = new Map<string, Jogo | true>()

  async function createJogo(sala: string, id_modelo: number): Promise<Jogo> {
    if (salas.has(sala)) throw new Error('Jogo já existe')

    let all_cartas = getAllCartas(fastify)
    let modelos = getAllModelos(fastify).then(
      (m) => new Map(m.map((modelo) => [modelo.id_modelo, modelo]))
    )

    let cartas = await all_cartas.then((c) => c.filter((carta) => carta.id_modelo === id_modelo))
    let modelo = await modelos.then((m) => m.get(id_modelo))

    if (!modelo) throw new Error('Baralho/Modelo não existe')

    let jogo_state = initJogoState(cartas, modelo)

    let jogo = {
      modelo,
      cartas,
      jogo_state,
      cartasMap: new Map(cartas.map((c) => [c.id_carta, c]))
    }
    salas.set(sala, jogo)

    return jogo
  }

  function initJogoState(all_cartas: CartaTrunfo[], modelo: Modelo): JogoState {
    let cartas = all_cartas.map((c) => c.id_carta).sort(() => Math.random() * 2 - 1)
    if (cartas.length % 2 === 1) {
      cartas.pop()
    }

    let cartasJogador0 = cartas.slice(0, cartas.length / 2)
    let cartasJogador1 = cartas.slice(cartas.length / 2)

    let res: JogoState = {
      0: {
        nome: null,
        pontos: 0,
        cartaAtual: cartasJogador0.pop()!,
        cartasBaralho: cartasJogador0
      },
      1: {
        nome: null,
        pontos: 0,
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
      partida: string
    }
  }>('/ws/:partida', { websocket: true }, async (socket, request) => {
    let partida = request.params.partida
    let info_partida = decodeCodigo(partida.replaceAll(/D/g, ''))
    if (!info_partida) {
      return socket.close(1000, 'Código Invalido')
    }
    let sala = salas.get(info_partida.sala)

    if (!sala) {
      return socket.close(1000, 'Partida não existe')
    }

    if (sala === true) {
      return socket.close(1000, 'Partida expirou por inatividade')
    }

    if (sala.timeoutClose != null) {
      clearTimeout(sala.timeoutClose)
      sala.timeoutClose = undefined
    }

    if (sala[info_partida.jogador] != null) {
      console.error('Jogador ja cadastrado')
      sala[info_partida.jogador]!.close(1000, 'Jogador ja cadastrado')
    }

    const oponente: 0 | 1 = info_partida.jogador ? 0 : 1
    sala[info_partida.jogador] = socket

    socket.on('close', () => {
      console.log('Jogador desconectou: ' + info_partida.jogador)
      sala[info_partida.jogador] = undefined
      if (sala[oponente]) {
        sala[oponente].send(
          JSON.stringify(<ServerMessage>{
            s_type: ServerMessageType.OponenteStatus,
            data: false
          })
        )
      } else {
        sala.timeoutClose = setTimeout(
          () => {
              console.log("FECHOOOOOOOOOOOU")
            salas.set(info_partida.sala, true)
          },
          60 * 10 * 1000
        )
      }
    })

    function dealWithMessage(message: ClientMessage) {
      console.log(ClientMessageType[message.m_type], message.data)
      if (sala === true || !sala) {
        return
      }
      if (message.m_type === ClientMessageType.Nome) {
        sala.jogo_state[info_partida!.jogador].nome = message.data
        if (sala[oponente]?.OPEN) {
          sala[oponente].send(
            JSON.stringify(<ServerMessage>{
              s_type: ServerMessageType.OponenteNomeado,
              data: message.data
            })
          )
        }
      } else if (message.m_type === ClientMessageType.Jogada) {
        try {
          let jogada_cliente = message.data[1]
          if (info_partida!.jogador !== jogada_cliente.jogador.jogador) {
            throw new Error('Jogador inválido')
          }
          let [jogo_state, jogada] = jogar(jogada_cliente.jogador, sala.jogo_state, sala.cartasMap)

          if (
            jogada_cliente.ganhador !== jogada.ganhador ||
            jogada_cliente.defendente.id_carta !== jogada.defendente.id_carta
          ) {
            throw new Error('Ocorreu um erro')
          }

          sala.jogo_state = jogo_state
          socket.send(
            JSON.stringify(<ServerMessage>{
              s_type: ServerMessageType.JogadaSucesso,
              data: { carta_oponente: jogada.defendente.id_carta, jogada_id: message.data[0] }
            })
          )

          if (sala[oponente]?.OPEN) {
            sala[oponente].send(
              JSON.stringify(<ServerMessage>{
                s_type: ServerMessageType.OponenteJogou,
                data: message.data
              })
            )
          }
        } catch (e) {
          let newErro: Error | null = null
          if (!(e instanceof Error)) {
            newErro = new Error(e as any)
          } else {
            newErro = e
          }
          console.error(e)
          socket.send(
            JSON.stringify(<ServerMessage>{
              s_type: ServerMessageType.JogadaInvalida,
              data: {
                message: newErro.message,
                server_state: sala?.jogo_state,
                jogada_id: message.data[0]
              }
            })
          )
        }
      } else {
        console.log(`Não implementado: ${JSON.stringify(message)}`)
      }
    }

    socket.on('message', (data, isBinary) => {
      let parsed = JSON.parse(data.toString())
      if (is_client_message(parsed)) {
        return dealWithMessage(parsed)
      }
      socket.send(
        JSON.stringify(<ServerMessage>{
          s_type: ServerMessageType.Error,
          data: [400, 'Ultima mensagem invalida']
        })
      )
    })

    setTimeout(() => {
      socket.send(
        JSON.stringify(<ServerMessage>{
          s_type: ServerMessageType.Ready,
          data: {
            jogo: sala.jogo_state,
            oponente_conectado: !!sala[oponente],
            codigo_oponente:
              TrunfoCrypt.encrypt(info_partida.sala + generateLast(info_partida.sala, info_partida.jogador ? 0 : 1)),
            jogador: info_partida.jogador
          }
        })
      )

      if (sala[oponente]) {
        sala[oponente].send(
          JSON.stringify(<ServerMessage>{
            s_type: ServerMessageType.OponenteStatus,
            data: true
          })
        )
      }
    })
  })

  fastify.post('/create_sala', async (request, response) => {
    let id_modelo = (request.body as any)?.['id_modelo'] as unknown
    if (id_modelo == null || typeof id_modelo !== 'number') {
      return response.code(400).send('Modelo Invalido')
    }
    let number = generateCodigo(5)
    while (salas.get(number)) {
      number = generateCodigo(5)
    }

    salas.delete(number)
    createJogo(number, id_modelo)

    const codigo0 = number + generateLast(number, 0)
    const codigo1 = number + generateLast(number, 1)

    response.send({
      0: TrunfoCrypt.encrypt(codigo0),
      1: TrunfoCrypt.encrypt(codigo1)
    })
  })
}

export default routes
