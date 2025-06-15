use actix_web::{web::{Data, Path, Json}, get, post, HttpResponse, Responder};
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;
use uuid::Uuid;

use crate::routes::Conversation;

use crate::AppState;

// Structure of the Message table
#[derive(Serialize, FromRow)]
pub struct Message {
    pub id: i32,
    pub conversation_id: Uuid,
    pub sender: String,  // "IA" or "User"
    pub message: String,
    pub date: NaiveDateTime,
}

#[derive(Deserialize)]
pub struct NewMessage {
    pub conversation_id: Uuid,
    pub sender: String, 
    pub message: String,
}

#[get("/messages/{conversation_id}")]
async fn fetch_messages(state: Data<AppState>, path: Path<Uuid>) -> impl Responder {
    let conversation_id = path.into_inner();

    match sqlx::query_as::<_, Message>(
        "SELECT id, conversation_id, sender, message, date FROM messages WHERE conversation_id = $1"
    )
    .bind(conversation_id)
    .fetch_all(&state.db)
    .await
    {   
        Ok(messages) => HttpResponse::Ok().json(messages),
        Err(_) => HttpResponse::InternalServerError().json("Error fetching messages"),
    }
}

#[post("/messages")]
async fn create_message(state: Data<AppState>, body: Json<NewMessage>) -> impl Responder {
    let mut transaction = match state.db.begin().await {
        Ok(tx) => tx,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to start transaction"),
    };
    
    let message_result = sqlx::query_as::<_, Message>(
        "INSERT INTO messages (conversation_id, sender, message) VALUES ($1, $2, $3) 
        RETURNING id, conversation_id, sender, message, date"
    )
    .bind(body.conversation_id)
    .bind(body.sender.to_string())
    .bind(body.message.to_string())
    .fetch_one(&mut *transaction)
    .await;

    if let Ok(message) = message_result {

        let update_result = sqlx::query_as::<_, Conversation>(
            "UPDATE conversations SET updated_at = NOW() WHERE id = $1
            RETURNING id, user_id, model_id, title, created_at, updated_at"
        )
        .bind(body.conversation_id)
        .fetch_one(&mut *transaction)
        .await;

        if update_result.is_err() {
            transaction.rollback().await.ok();
            return HttpResponse::InternalServerError().body("Failed to update conversation timestamp");
        }

        if let Err(_) = transaction.commit().await {
            return HttpResponse::InternalServerError().body("Failed to commit transaction");
        }

        return HttpResponse::Created().json(message);
    } else {
        transaction.rollback().await.ok();
        return HttpResponse::InternalServerError().body("Failed to create message");
    }
}