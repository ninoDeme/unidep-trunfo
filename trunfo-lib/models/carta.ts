export interface CartaTrunfo {
  id_carta: number;
  nome: string;
  descricao?: string;
  super_trunfo: boolean;
  atributos: CartaTrunfoAtributo[];
  id_modelo: number;
}

export interface CartaTrunfoAtributo {
  id_atributo: number;
  nome: string;
  ordem: number;
  tipo: number;
  valor: number;
  a: boolean;
}

