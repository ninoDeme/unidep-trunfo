use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Modelo {
  pub id_modelo: i32,
  pub nome: String,
  pub cor_fundo: String,
  pub cor_texto: String,
  pub cor_atributo_fundo: String,
  pub cor_atributo_texto: String,
  pub atributos: Vec<ModeloAtributo>
}


#[derive(Debug, Serialize, Deserialize)]
pub struct ModeloAtributo {
  pub id_modelo_atributo: i32,
  pub ordem: i32,
  pub nome: String,
  pub tipo: i32
}
