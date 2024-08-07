export interface Modelo {
  id_modelo: number;
  nome: string;
  atributos: ModeloAtributo[];
}

export interface ModeloAtributo {
  id_atributo: number;
  ordem: number;
  nome: string;
  tipo: number;
}
