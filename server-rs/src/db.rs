use actix_web::{error, web, Error};

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

pub async fn get_conn(pool: &Pool) -> Result<Connection, Error> {
    let pool = pool.clone();

    web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)
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
