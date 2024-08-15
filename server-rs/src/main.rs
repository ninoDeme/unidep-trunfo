use std::io;

use actix_web::{middleware, web, App, Error as AWError, HttpResponse, HttpServer, Responder};
use r2d2_sqlite::SqliteConnectionManager;

mod db;
pub mod modelo;
pub mod carta;
use db::{Pool, post_modelo_query, get_all_modelos_query};
use modelo::{Modelo, ModeloAtributo};

async fn post_modelo(db: web::Data<Pool>, json: web::Json<Modelo>) -> Result<HttpResponse, AWError> {
    let result = post_modelo_query(&db, json).await;

    Ok(HttpResponse::Ok().json(result.map_err(AWError::from)?))
}

async fn get_all_modelos(db: web::Data<Pool>) -> Result<HttpResponse, AWError> {
    let result = get_all_modelos_query(&db).await;

    Ok(HttpResponse::Ok().json(result.map_err(AWError::from)?))
}

/// Version 2: Calls 4 queries in parallel, as an asynchronous handler
/// Returning Error types turn into None values in the response
// async fn parallel_weather(db: web::Data<Pool>) -> Result<HttpResponse, AWError> {
//     let fut_result = vec![
//         db::execute(&db, Queries::GetTopTenHottestYears),
//         db::execute(&db, Queries::GetTopTenColdestYears),
//         db::execute(&db, Queries::GetTopTenHottestMonths),
//         db::execute(&db, Queries::GetTopTenColdestMonths),
//     ];
//     let result: Result<Vec<_>, _> = join_all(fut_result).await.into_iter().collect();
//
//     Ok(HttpResponse::Ok().json(result.map_err(AWError::from)?))
// }
//
async fn version() -> impl Responder {
    "0.0.2"
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // connect to SQLite DB
    let manager = SqliteConnectionManager::file("banco.db");
    let pool = Pool::new(manager).unwrap();

    log::info!("starting HTTP server at http://localhost:3030");

    // start HTTP server
    HttpServer::new(move || {
        App::new()
            // store db pool as Data object
            .app_data(web::Data::new(pool.clone()))
            .wrap(middleware::Logger::default())
            .service(
                web::scope("/api")
                    .route("/version", web::get().to(version))
                    .route("/modelo", web::get().to(get_all_modelos))
                    .route("/modelo", web::post().to(post_modelo))
            )
    })
    .bind(("127.0.0.1", 3030))?
    .workers(2)
    .run()
    .await
}
