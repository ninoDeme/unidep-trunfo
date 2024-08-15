use actix_web::{error, web, Error};
use rusqlite::Statement;

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

use crate::modelo::{Modelo, ModeloAtributo};

async fn get_conn(pool: &Pool) -> Result<Connection, Error> {
    let pool = pool.clone();

    web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)
}

pub async fn get_all_modelos_query(pool: &Pool) -> Result<Vec<Modelo>, Error> {
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

pub async fn post_modelo_query(pool: &Pool, modelo: web::Json<Modelo>) -> Result<(), Error> {

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
        )
    })
        .await
        .map_err(error::ErrorInternalServerError)?;

    // for atributo in modelo.atributos {
    //
    // }
    Ok(())
}
//
// fn get_coldest_years(conn: Connection) -> WeatherAggResult {
//     let stmt = conn.prepare(
//         "
//         SELECT cast(strftime('%Y', date) as int) as theyear,
//                 sum(tmax) as total
//         FROM nyc_weather
//         WHERE tmax <> 'TMAX'
//         GROUP BY theyear
//         ORDER BY total ASC LIMIT 10",
//     )?;
//
//     get_rows_as_annual_agg(stmt)
// }
//
// fn get_rows_as_annual_agg(mut statement: Statement) -> WeatherAggResult {
//     statement
//         .query_map([], |row| {
//             Ok(WeatherAgg::AnnualAgg {
//                 year: row.get(0)?,
//                 total: row.get(1)?,
//             })
//         })
//         .and_then(Iterator::collect)
// }
//
// fn get_hottest_months(conn: Connection) -> WeatherAggResult {
//     let stmt = conn.prepare(
//         "SELECT cast(strftime('%Y', date) as int) as theyear,
//                 cast(strftime('%m', date) as int) as themonth,
//                 sum(tmax) as total
//         FROM nyc_weather
//         WHERE tmax <> 'TMAX'
//         GROUP BY theyear, themonth
//         ORDER BY total DESC LIMIT 10",
//     )?;
//
//     get_rows_as_month_agg(stmt)
// }
//
// fn get_coldest_months(conn: Connection) -> WeatherAggResult {
//     let stmt = conn.prepare(
//         "SELECT cast(strftime('%Y', date) as int) as theyear,
//                 cast(strftime('%m', date) as int) as themonth,
//                 sum(tmax) as total
//         FROM nyc_weather
//         WHERE tmax <> 'TMAX'
//         GROUP BY theyear, themonth
//         ORDER BY total ASC LIMIT 10",
//     )?;
//
//     get_rows_as_month_agg(stmt)
// }
//
// fn get_rows_as_month_agg(mut statement: Statement) -> WeatherAggResult {
//     statement
//         .query_map([], |row| {
//             Ok(WeatherAgg::MonthAgg {
//                 year: row.get(0)?,
//                 month: row.get(1)?,
//                 total: row.get(2)?,
//             })
//         })
//         .and_then(Iterator::collect)
// }
