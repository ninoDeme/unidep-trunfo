use std::io;

use actix_web::{middleware, web, App, HttpServer, Responder};
use r2d2_sqlite::SqliteConnectionManager;

mod db;
mod modelo;
mod carta;
use modelo::{get_all_modelos, post_modelo};
use carta::{get_all_cartas, post_carta};
use db::{Pool};

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
    let manager = SqliteConnectionManager::file("banco.db").with_init(|db| {
        rusqlite::vtab::array::load_module(&db)?;
        Ok(())
    });
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
                    .route("/carta", web::get().to(get_all_cartas))
                    .route("/carta/{id_carta}", web::post().to(post_carta))
            )
    })
    .bind(("127.0.0.1", 3000))?
    .workers(2)
    .run()
    .await
}
