use actix_web::{web::Data, App, HttpServer};
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};
use dotenv::dotenv;
use std::env;

mod routes;
use routes::{fetch_conversations, create_conversation, delete_conversation, update_conversation, get_conversation_by_id,
    fetch_messages, create_message,
    gemini, mistral, gpt, 
};

struct AppState {
    db: Pool<Postgres>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load .env
    dotenv().ok();

    let db_user = env::var("DB_USER_NAME").expect("DB_USER_NAME must be set in .env");
    let db_password = env::var("DB_USER_PW").expect("DB_USER_PW must be set in .env");
    let db_host = env::var("DB_SERV").expect("DB_SERV must be set in .env");
    let db_port = env::var("DB_PORT").expect("DB_PORT must be set in .env");
    let db_name = env::var("DB_NAME").expect("DB_NAME must be set in .env");


    println!("Starting DB connection ...");
    // Connection to the db
    let database_url = format!(
        "postgres://{}:{}@{}:{}/{}",
        db_user, db_password, db_host, db_port, db_name
    );
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to create pool");
    
    println!("Database connection established!");
    println!("Starting Server at http://localhost:8080/");
    // Start the HTTP server on port 8080
    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(AppState { db: pool.clone() }))

            .service(fetch_conversations)
            .service(get_conversation_by_id)
            .service(create_conversation)
            .service(update_conversation)
            .service(delete_conversation)

            .service(fetch_messages)
            .service(create_message)

            .service(gemini)
            .service(mistral)
            .service(gpt)
    })
    .bind("0.0.0.0:8080")? 
    .run()
    .await
}