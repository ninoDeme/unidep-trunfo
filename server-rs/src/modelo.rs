use serde::{Deserialize, Serialize};
use std::rc::Rc;
use crate::db::{get_conn, Pool};
use rusqlite::types::Value;
use actix_web::{error, web, Error, HttpResponse};

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

pub async fn post_modelo(db: web::Data<Pool>, json: web::Json<Modelo>) -> Result<HttpResponse, Error> {
    let result = post_modelo_query(&db, json).await;

    Ok(HttpResponse::Ok().json(result.map_err(Error::from)?))
}

pub async fn get_all_modelos(db: web::Data<Pool>) -> Result<HttpResponse, Error> {
    let result = get_all_modelos_query(&db).await;

    Ok(HttpResponse::Ok().json(result.map_err(Error::from)?))
}


async fn get_all_modelos_query(pool: &Pool) -> Result<Vec<Modelo>, Error> {
    let conn = get_conn(pool).await?;
    web::block(move || {
        let mut stmt = conn.prepare("
            SELECT
                m.id_modelo,
                m.nome,
                m.cor_fundo,
                m.cor_texto,
                m.cor_atributo_fundo,
                m.cor_atributo_texto
            FROM modelo m"
        )?;

        stmt
            .query_map([], |row| {
                let id_modelo = row.get(0)?;

                let mut attr_stmt = conn.prepare("
                SELECT
                    ma.id_modelo_atributo,
                    ma.nome,
                    ma.ordem,
                    ma.tipo
                FROM modelo_atributo ma
                WHERE id_modelo = ?1")?;

                let atributos = attr_stmt.query_map([&id_modelo], |row| {
                    Ok(ModeloAtributo {
                        id_modelo_atributo: row.get(0)?,
                        nome: row.get(1)?,
                        ordem: row.get(2)?,
                        tipo: row.get(3)?
                    })
                }).and_then(Iterator::collect)?;

                Ok(Modelo {
                    id_modelo: id_modelo,
                    nome: row.get(1)?,
                    cor_fundo: row.get(2)?,
                    cor_texto: row.get(3)?,
                    cor_atributo_fundo: row.get(4)?,
                    cor_atributo_texto: row.get(5)?,
                    atributos: atributos
                })
            })
            .and_then(Iterator::collect)
    })
        .await?
        .map_err(error::ErrorInternalServerError)
}

async fn post_modelo_query(pool: &Pool, modelo: web::Json<Modelo>) -> Result<(), Error> {

    let conn = get_conn(pool).await?;
    web::block(move || {
        conn.execute(
          "INSERT OR REPLACE INTO modelo (
            id_modelo,
            nome,
            cor_fundo,
            cor_texto,
            cor_atributo_fundo,
            cor_atributo_texto
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
          (
            &modelo.id_modelo,
            &modelo.nome,
            &modelo.cor_fundo,
            &modelo.cor_texto,
            &modelo.cor_atributo_fundo,
            &modelo.cor_atributo_texto,
          ),
        )?;

        let attr_rc = Rc::new(modelo.atributos.iter().map(|attr| Value::from(attr.id_modelo_atributo)).collect::<Vec<Value>>());
        println!("{:?}", attr_rc);
        
        conn.execute("DELETE FROM carta_atributo as ca
                      WHERE ?1 in (SELECT id_modelo FROM carta JOIN modelo USING(id_modelo) WHERE id_carta = ca.id_carta)
                          AND id_modelo_atributo not in rarray(?2)",
                          (
                              &modelo.id_modelo,
                              &attr_rc
                          ))?;

        conn.execute(
            "DELETE FROM modelo_atributo WHERE id_modelo = ?1 AND id_modelo_atributo not in rarray(?2)",
            (
                &modelo.id_modelo,
                &attr_rc
            )
        )?;

        for atributo in &modelo.atributos {
            conn.execute(
                "INSERT OR REPLACE INTO modelo_atributo (
                    id_modelo_atributo,
                    id_modelo,
                    nome,
                    ordem,
                    tipo
                  ) VALUES (?1, ?2, ?3, ?4, ?5)",
              (
                  &atributo.id_modelo_atributo,
                  &modelo.id_modelo,
                  &atributo.nome,
                  &atributo.ordem,
                  &atributo.tipo
              ),
            )?;
        }
        Ok(())
    })
        .await?
        .map_err(error::ErrorInternalServerError::<rusqlite::Error>)?;

    Ok(())
}
