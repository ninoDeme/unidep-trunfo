import {
  decodeGameString,
  encodeGameString,
  type Jogada,
  type JogoState
} from 'trunfo-lib/models/jogo'
import { onMounted, ref, shallowRef } from 'vue'
import {
  ClientMessageType,
  is_server_message,
  ServerMessageType,
  type ClientMessage,
  type ServerMessage
} from 'trunfo-lib/messages'

const jogo = ref<JogoState | null>(null)
const loadingJogo = ref<boolean>(false)
const errorJogo = ref<string | null>(null)
const oponenteConectado = ref<boolean>(false)
const jogadaOponente = ref<Jogada | null>(null)
const usuario = ref<0 | 1 | null>(null)
let currPartStr: string | null = null
let socket: null | WebSocket = null
const codigoOponente = ref<null | { url: string; codigo: string }>(null)

async function getJogo(partidaString: string, nome?: string) {
  try {
    currPartStr = partidaString
    jogo.value = null
    loadingJogo.value = true

    let partida = decodeGameString(partidaString)
    usuario.value = partida.jogador

    codigoOponente.value = {
      codigo: partida.sala.toString().padStart(6, '0'),
      url: `https://${location.host}/jogo/${encodeGameString({ ...partida, jogador: partida.jogador ? 0 : 1 })}`
    }

    socket = new WebSocket('/api/jogo/ws/' + partidaString)

    await new Promise<void>((resolve) => (socket!.onopen = () => resolve()))

    socket.onerror = (e) => {
      console.error(e)
      errorJogo.value = (e as any).message
    }

    socket.onmessage = (ev) => {
      let message = JSON.parse(ev.data.toString())

      if (is_server_message(message)) {
        receivedMessage(message)
      }
    }

    socket.onclose = console.log

    if (nome) {
      socket.send(
        JSON.stringify(<ClientMessage>{
          m_type: ClientMessageType.Nome,
          data: nome
        })
      )
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

const filaJogada = shallowRef<{
  resolve: () => any
  reject: (message: string) => any
  jogada_id: number
} | null>(null)

function enviarJogada(jogada: Jogada) {
  if (!socket) {
    throw new Error('Jogo não inicializado')
  }
  if (filaJogada.value) {
    throw new Error('Jogada em andamento')
  }

  const jogada_id = Math.floor(Math.random() * 99999980)

  let promise = new Promise<void>((resolve, reject) => {
    filaJogada.value = {
      resolve,
      reject,
      jogada_id
    }
    socket!.send(
      JSON.stringify(<ClientMessage>{
        m_type: ClientMessageType.Jogada,
        data: [jogada_id, jogada]
      })
    )
  })

  return promise
}

function receivedMessage(message: ServerMessage) {
  console.log(ServerMessageType[message.s_type], message)
  if (message.s_type === ServerMessageType.Ready) {
    jogo.value = message.data[0]
    oponenteConectado.value = message.data[1]
  } else if (message.s_type === ServerMessageType.OponenteStatus) {
    oponenteConectado.value = message.data
  } else if (message.s_type === ServerMessageType.OponenteNomeado) {
    if (usuario.value == null || jogo.value?.[usuario.value ? 0 : 1] == null) {
      console.error("Jogo não inicializado")
      return;
    };
    jogo.value[usuario.value ? 0 : 1].nome = message.data;
  } else if (message.s_type === ServerMessageType.Error) {
    errorJogo.value = message.data[1]
  } else if (message.s_type === ServerMessageType.JogadaInvalida) {
    if (!filaJogada.value || filaJogada.value.jogada_id !== message.data.jogada_id) {
      // HUMMMMMMMMMMmm
      return location.reload()
    }
    filaJogada.value.reject(message.data.message)
    jogo.value = message.data.server_state
  } else if (message.s_type === ServerMessageType.JogadaSucesso) {
    if (!filaJogada.value || filaJogada.value.jogada_id !== message.data.jogada_id) {
      // HUMMMMMMMMMMmm
      return location.reload()
    }
    filaJogada.value.resolve()
  } else if (message.s_type === ServerMessageType.OponenteJogou) {
    jogadaOponente.value = message.data[1]
  } else {
    console.error('Not Implemented: ' + ServerMessageType[(message as any).s_type as never])
  }
}

export function useJogo(partidaString: string, nome?: string) {
  onMounted(() => {
    if (!socket && !currPartStr) {
      getJogo(partidaString, nome)
    }
  })
  return {
    jogo,
    loadingJogo,
    errorJogo,
    getJogo,
    usuario,
    enviarJogada,
    oponenteConectado,
    codigoOponente,
    jogadaOponente
  }
}
