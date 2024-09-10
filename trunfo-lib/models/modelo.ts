export interface Modelo {
  id_modelo: number;
  nome: string;
  cor_fundo: string;
  cor_texto: string;
  cor_atributo_fundo: string;
  cor_atributo_texto: string;
  atributos: ModeloAtributo[];
}

export interface ModeloAtributo {
  id_modelo_atributo: number;
  ordem: number;
  nome: string;
  tipo: number;
}

export function gerarIdModelo(): number {
  return Math.floor(Math.random() * 999980) + 10;
}

export function novoModelo(data?: Partial<Modelo>): Modelo {
  return {
    id_modelo: data?.id_modelo ?? gerarIdModelo(),
    nome: data?.nome ?? 'Novo Modelo',
    cor_fundo: data?.cor_fundo ?? '#111827',
    cor_texto: data?.cor_texto ?? '#FEEEF0',
    cor_atributo_fundo: data?.cor_atributo_fundo ?? '#374151',
    cor_atributo_texto: data?.cor_atributo_texto ?? '#FFFFFF',
    atributos: data?.atributos?.map((v, i) => novoModeloAtributo(i + 1, v)) ?? []
  }
}

export function novoModeloAtributo(ordem: number, data?: Partial<ModeloAtributo>): ModeloAtributo {
  return {
    id_modelo_atributo: data?.id_modelo_atributo ?? gerarIdModelo(),
    nome: data?.nome ?? 'Novo Atributo',
    tipo: data?.tipo ?? 0,
    ordem,
  }
}
