use serde::{Deserialize, Serialize};
use crate::db::{get_conn, Pool};
use actix_web::{error, web, Error, HttpResponse, HttpRequest};
use actix_multipart::form::{text::Text as MPText, MultipartForm, Limits, FieldReader};
use actix_multipart::Field;
use actix_multipart::MultipartError;

use futures_util::future::LocalBoxFuture;
use futures_util::TryStreamExt as _;
// use mime::Mime;

use std::path::Path;

use tokio::process::{Command};
use std::process::Stdio;
use tokio::io::AsyncWriteExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct CartaTrunfo {
  id_carta: i64,
  nome: String,
  descricao: Option<String>,
  img: Option<String>,
  super_trunfo: bool,
  atributos: Vec<CartaTrunfoAtributo>,
  id_modelo: i64
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CartaTrunfoAtributo {
  id_modelo_atributo: i64,
  nome: String,
  ordem: i64,
  tipo: i64,
  valor: f64,
  a: bool
}

pub async fn limpa_imagens(pool: &Pool) -> Result<(), Error> {

    let conn = get_conn(pool).await?;

    let path = Path::new("./uploads/carta");
    let dirs = path.read_dir().expect("Could not read carta directory")
        .map(|x| x.unwrap()).collect::<Vec<_>>();

    if dirs.is_empty() {
        return Ok(());
    };

    let mut imagens = web::block(move || {
        let mut stmt = conn.prepare("
            SELECT
              c.id_carta
            FROM carta c"
        )?;

        stmt
            .query_map([], |row| {
                row.get(0)
            })
        .and_then(Iterator::collect::<Result<Vec<u32>, rusqlite::Error>>)
    })
        .await?
        .map_err(error::ErrorInternalServerError)?
        .into_iter()
        .map(|id_carta| format!("carta-{}.webp", id_carta));

    for file in dirs {
        let file_name = file.file_name().into_string().unwrap();
        if !imagens.any(|img| img == file_name) {
            tokio::fs::remove_file(file.path().as_path()).await.expect("Error while cleaning imgs");
        };
    };

    Ok(())

  // const contents = await fs_p.readdir(path.join("uploads", "carta"));
  // if (!contents.length) return;
  //
  // const cartas = await fastify.db.all<{ id_carta: string }[]>(`
  //       SELECT
  //         id_carta
  //       FROM carta
  //   `);
  //
  // for (let file of contents) {
  //   let id_carta_aquivo = /carta-(\d+).webp$/.exec(file)?.[1];
  //   if (!id_carta_aquivo) continue;
  //
  //   if (!cartas.some((c) => c.id_carta == id_carta_aquivo)) {
  //     fs_p.unlink(path.join("uploads", "carta", file));
  //   }
  // }
}

#[derive(Debug)]
struct WebpImg {
    pub size: usize,
    pub name: String
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
    img: Option<WebpImg>
}

pub async fn post_carta(db: web::Data<Pool>, MultipartForm(form): MultipartForm<CartaForm>) -> Result<HttpResponse, Error> {
    println!("{:?}", form);
    limpa_imagens(&db).await?;
    let result = post_carta_query(&db, form).await;

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
                          valor: row.get(3)?,
                          a: row.get(4)?,
                          tipo: row.get(5)?,
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

async fn post_carta_query(pool: &Pool, form: CartaForm) -> Result<(), Error> {


    let carta: CartaTrunfo = serde_json::from_str(form.carta.into_inner().as_str()).unwrap();
    println!("{:?}", carta);
     let conn = get_conn(pool).await?;
     web::block(move || {
         conn.execute(
           "INSERT OR REPLACE INTO carta (
              id_carta,
              nome,
              descricao,
              super_trunfo,
              id_modelo
           ) VALUES (?1, ?2, ?3, ?4, ?5)",
           (
             &carta.id_carta,
             &carta.nome,
             &carta.descricao,
             (if carta.super_trunfo {1} else {0}),
             &carta.id_modelo,
           ),
         )?;
    
         conn.execute(
             "DELETE FROM carta_atributo WHERE id_carta = ?1",
             (
                 &carta.id_carta,
             )
         )?;
    
         for atributo in &carta.atributos {
             conn.execute(
                 "INSERT OR REPLACE INTO carta_atributo (
                     id_modelo_atributo,
                     id_carta,
                     valor,
                     a
                   ) VALUES (?1, ?2, ?3, ?4)",
               (
                   &atributo.id_modelo_atributo,
                   &carta.id_carta,
                   &atributo.valor,
                   (if atributo.a {1} else {0}),
               ),
             )?;
         }
         Ok(())
     })
         .await?
         .map_err(error::ErrorInternalServerError::<rusqlite::Error>)?;
    
    Ok(())
}
