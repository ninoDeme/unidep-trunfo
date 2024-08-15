use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CartaTrunfo {
  id_carta: i32,
  nome: String,
  descricao: Option<String>,
  super_trunfo: bool,
  atributos: Vec<CartaTrunfoAtributo>,
  id_modelo: i32
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CartaTrunfoAtributo {
  id_modelo_atributo: i32,
  nome: String,
  ordem: i32,
  tipo: i32,
  valor: i32,
  a: bool
}

