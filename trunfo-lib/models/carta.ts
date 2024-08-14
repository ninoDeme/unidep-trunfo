import type { Modelo, ModeloAtributo } from "./modelo";

export function gerarIdCarta(): number {
  return Math.floor(Math.random() * 999980) + 10;
}

export interface CartaTrunfo {
  id_carta: number;
  nome: string;
  img?: string;
  descricao?: string;
  super_trunfo: boolean;
  atributos: CartaTrunfoAtributo[];
  id_modelo: number;
}

export interface CartaTrunfoAtributo {
  id_modelo_atributo: number;
  nome: string;
  ordem: number;
  tipo: number;
  valor: number;
  a: boolean;
}

export function novaCarta(modelo: Modelo, data?: Partial<CartaTrunfo>): CartaTrunfo {
  return {
    id_carta: data?.id_carta ?? gerarIdCarta(),
    id_modelo: modelo.id_modelo,
    nome: data?.nome ?? 'Nova Carta',
    img: data?.img ?? undefined,
    descricao: data?.descricao ?? undefined,
    super_trunfo: data?.super_trunfo ?? false,
    atributos: modelo?.atributos?.map((v, i) => novoAtributo(v, data?.atributos?.find(a => a.id_modelo_atributo === v.id_modelo_atributo))) ?? []
  }
}

export function novoAtributo(modeloAtributo: ModeloAtributo, data?: Partial<CartaTrunfoAtributo>): CartaTrunfoAtributo {
  return {
    id_modelo_atributo: modeloAtributo.id_modelo_atributo,
    nome: modeloAtributo.nome,
    tipo: 0,
    valor: data?.valor ?? 0,
    a: data?.a ?? false,
    ordem: modeloAtributo.ordem,
  }
}
