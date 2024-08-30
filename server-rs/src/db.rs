use actix_web::{error, web, Error};

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

pub async fn get_conn(pool: &Pool) -> Result<Connection, Error> {
    let pool = pool.clone();

    web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)
}
