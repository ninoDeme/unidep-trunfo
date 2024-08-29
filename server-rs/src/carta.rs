use serde::{Deserialize, Serialize};
use crate::db::{get_conn, Pool};
use actix_web::{error, web, Error, HttpResponse, HttpRequest};
use actix_multipart::form::{json::Json as MPJson, text::Text as MPText, tempfile::TempFile, bytes::Bytes as MPBytes, MultipartForm, Limits, FieldReader};
use actix_multipart::Field;
use actix_multipart::MultipartError;

use futures_util::future::LocalBoxFuture;
use futures_util::TryStreamExt as _;
// use mime::Mime;


use tokio::process::{Command};
use std::process::Stdio;
use tokio::io::AsyncWriteExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct CartaTrunfo {
  id_carta: i32,
  nome: String,
  descricao: Option<String>,
  img: Option<String>,
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

#[derive(Debug)]
struct WebpImg {
    size: usize,
    name: String
}

impl<'t> FieldReader<'t> for WebpImg {
    type Future = LocalBoxFuture<'t, Result<Self, MultipartError>>;

    fn read_field(req: &'t HttpRequest, mut field: Field, limits: &'t mut Limits) -> Self::Future {
        Box::pin(async move {

            let id_carta = req.match_info().get("id_carta").unwrap();

            let mut child = Command::new("cwebp")
                .arg("-q")
                .arg("80")
                .arg("-resize")
                .arg("1000")
                .arg("0")
                .arg("-o")
                .arg(format!("./uploads/carta/carta-{}.webp", id_carta))
                .arg("--")
                .arg("-")
                .stdin(Stdio::piped())
                .stdout(Stdio::null())
                .spawn()
                .expect("Failed to launch cwebp");
                    
            let mut stdin = child.stdin.take().expect("Failed to open stdin");

            let mut size = 0;
            while let Some(chunk) = field.try_next().await? {
                limits.try_consume_limits(chunk.len(), false)?;
                stdin.write_all(chunk.as_ref()).await.unwrap();
                size += chunk.len();
            }
            drop(stdin);

            child.wait().await.unwrap();

            println!("{}", size);
            Ok(WebpImg {
                size,
                name: format!("./uploads/carta/carta-{}.webp", id_carta)
            })
        })
    }
}


#[derive(Debug, MultipartForm)]
pub struct CartaForm {
    carta: MPText<String>,
    img: WebpImg
}

pub async fn post_carta(db: web::Data<Pool>, MultipartForm(form): MultipartForm<CartaForm>) -> Result<HttpResponse, Error> {
    println!("{:?}", form);
    let result = post_carta_query(&db).await;

    Ok(HttpResponse::Ok().json(result.map_err(Error::from)?))
}

pub async fn get_all_cartas(db: web::Data<Pool>) -> Result<HttpResponse, Error> {
    let result = get_all_cartas_query(&db).await;

    Ok(HttpResponse::Ok().json(result.map_err(Error::from)?))
}


async fn get_all_cartas_query(pool: &Pool) -> Result<Vec<CartaTrunfo>, Error> {
    let conn = get_conn(pool).await?;
    web::block(move || {
        let mut stmt = conn.prepare("
            SELECT
              c.id_carta,
              c.nome,
              c.descricao,
              c.super_trunfo,
              c.id_modelo
            FROM carta c"
        )?;

        stmt
            .query_map([], |row| {
                let id_carta = row.get(0)?;
                let id_modelo = row.get(4)?;

                let mut attr_stmt = conn.prepare("
                    SELECT
                      ca.id_modelo_atributo,
                      ma.nome,
                      ma.ordem,
                      ca.valor,
                      ca.a,
                      ma.tipo
                    FROM carta_atributo ca
                      JOIN modelo_atributo ma ON ca.id_modelo_atributo = ma.id_modelo_atributo AND id_modelo = ?1
                    WHERE id_carta = ?2")?;

                let atributos = attr_stmt.query_map([&id_modelo, &id_carta], |row| {
                    Ok(CartaTrunfoAtributo {
                          id_modelo_atributo: row.get(0)?,
                          nome: row.get(1)?,
                          ordem: row.get(2)?,
                          tipo: row.get(3)?,
                          valor: row.get(4)?,
                          a: row.get(5)?,
                    })
                }).and_then(Iterator::collect)?;

                Ok(CartaTrunfo {
                    id_carta: id_carta,
                    nome: row.get(1)?,
                    img: None,
                    descricao: row.get(2)?,
                    super_trunfo: row.get(3)?,
                    id_modelo: id_modelo,
                    atributos: atributos
                })
            })
            .and_then(Iterator::collect)
    })
        .await?
        .map_err(error::ErrorInternalServerError)
}

async fn post_carta_query(pool: &Pool) -> Result<(), Error> {

    // println!("{:?}", value);

    // let conn = get_conn(pool).await?;
    // web::block(move || {
    //     conn.execute(
    //       "INSERT OR REPLACE INTO modelo (
    //         id_modelo,
    //         nome,
    //         cor_fundo,
    //         cor_texto,
    //         cor_atributo_fundo,
    //         cor_atributo_texto
    //       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    //       (
    //         &modelo.id_modelo,
    //         &modelo.nome,
    //         &modelo.cor_fundo,
    //         &modelo.cor_texto,
    //         &modelo.cor_atributo_fundo,
    //         &modelo.cor_atributo_texto,
    //       ),
    //     )?;
    //
    //     let attr_rc = Rc::new(modelo.atributos.iter().map(|attr| Value::from(attr.id_modelo_atributo)).collect::<Vec<Value>>());
    //     println!("{:?}", attr_rc);
    //
    //     conn.execute("DELETE FROM carta_atributo as ca
    //                   WHERE ?1 in (SELECT id_modelo FROM carta JOIN modelo USING(id_modelo) WHERE id_carta = ca.id_carta)
    //                       AND id_modelo_atributo not in rarray(?2)",
    //                       (
    //                           &modelo.id_modelo,
    //                           &attr_rc
    //                       ))?;
    //
    //     conn.execute(
    //         "DELETE FROM modelo_atributo WHERE id_modelo = ?1 AND id_modelo_atributo not in rarray(?2)",
    //         (
    //             &modelo.id_modelo,
    //             &attr_rc
    //         )
    //     )?;
    //
    //     for atributo in &modelo.atributos {
    //         conn.execute(
    //             "INSERT OR REPLACE INTO modelo_atributo (
    //                 id_modelo_atributo,
    //                 id_modelo,
    //                 nome,
    //                 ordem,
    //                 tipo
    //               ) VALUES (?1, ?2, ?3, ?4, ?5)",
    //           (
    //               &atributo.id_modelo_atributo,
    //               &modelo.id_modelo,
    //               &atributo.nome,
    //               &atributo.ordem,
    //               &atributo.tipo
    //           ),
    //         )?;
    //     }
    //     Ok(())
    // })
    //     .await?
    //     .map_err(error::ErrorInternalServerError::<rusqlite::Error>)?;
    //
    Ok(())
}

//
// async fn post_carta_query(pool: &Pool, modelo: web::Json<Modelo>) -> Result<(), Error> {
//
//     let conn = get_conn(pool).await?;
//     web::block(move || {
//         conn.execute(
//           "INSERT OR REPLACE INTO modelo (
//             id_modelo,
//             nome,
//             cor_fundo,
//             cor_texto,
//             cor_atributo_fundo,
//             cor_atributo_texto
//           ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
//           (
//             &modelo.id_modelo,
//             &modelo.nome,
//             &modelo.cor_fundo,
//             &modelo.cor_texto,
//             &modelo.cor_atributo_fundo,
//             &modelo.cor_atributo_texto,
//           ),
//         )?;
//
//         let attr_rc = Rc::new(modelo.atributos.iter().map(|attr| Value::from(attr.id_modelo_atributo)).collect::<Vec<Value>>());
//         println!("{:?}", attr_rc);
//
//         conn.execute("DELETE FROM carta_atributo as ca
//                       WHERE ?1 in (SELECT id_modelo FROM carta JOIN modelo USING(id_modelo) WHERE id_carta = ca.id_carta)
//                           AND id_modelo_atributo not in rarray(?2)",
//                           (
//                               &modelo.id_modelo,
//                               &attr_rc
//                           ))?;
//
//         conn.execute(
//             "DELETE FROM modelo_atributo WHERE id_modelo = ?1 AND id_modelo_atributo not in rarray(?2)",
//             (
//                 &modelo.id_modelo,
//                 &attr_rc
//             )
//         )?;
//
//         for atributo in &modelo.atributos {
//             conn.execute(
//                 "INSERT OR REPLACE INTO modelo_atributo (
//                     id_modelo_atributo,
//                     id_modelo,
//                     nome,
//                     ordem,
//                     tipo
//                   ) VALUES (?1, ?2, ?3, ?4, ?5)",
//               (
//                   &atributo.id_modelo_atributo,
//                   &modelo.id_modelo,
//                   &atributo.nome,
//                   &atributo.ordem,
//                   &atributo.tipo
//               ),
//             )?;
//         }
//         Ok(())
//     })
//         .await?
//         .map_err(error::ErrorInternalServerError::<rusqlite::Error>)?;
//
//     Ok(())
// }
