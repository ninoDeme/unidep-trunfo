import { type JogoState, type Jogada } from "./models/jogo"

export enum ClientMessageType {
  Jogada,
  Nome
}

export type ClientMessage = {
  m_type: ClientMessageType.Jogada,
  data: [number, Jogada]
} | {
  m_type: ClientMessageType.Nome,
  data: string
}

export function is_client_message(value: unknown): value is ClientMessage {
  return !!(value && typeof value === 'object' && "m_type" in value && 'data' in value)
}

export enum ServerMessageType {
  Ready,
  OponenteStatus,
  OponenteJogou,
  OponenteNomeado,
  Error,
  JogadaInvalida,
  JogadaSucesso,
}

export type ServerMessage = {
  s_type: ServerMessageType.Error,
  data: [code: number, message: string]
} | {
  s_type: ServerMessageType.Ready,
  data: {jogo: JogoState, oponente_conectado: boolean, codigo_oponente: string, jogador: 0 | 1 }
} | {
  s_type: ServerMessageType.JogadaInvalida,
  data: {jogada_id: number, message: string, server_state: JogoState}
} | {
  s_type: ServerMessageType.JogadaSucesso,
  data: { carta_oponente: number, jogada_id: number }
} | {
  s_type: ServerMessageType.OponenteNomeado,
  data: string
} | {
  s_type: ServerMessageType.OponenteJogou,
  data: [number, Jogada]
} | {
  s_type: ServerMessageType.OponenteStatus,
  data: boolean
}

export function is_server_message(value: unknown): value is ServerMessage {
  return !!(value && typeof value === 'object' && "s_type" in value && 'data' in value)
}
