use actix_web::{web::{Data, Json, Path}, get, post, put, delete, HttpResponse, Responder};
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::NaiveDateTime;

use crate::AppState;

// Structure of the Conversation table
#[derive(Serialize, FromRow)]
pub struct Conversation {
    pub id: Uuid,
    pub user_id: Uuid,
    pub model_id: i32,
    pub title: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Deserialize)]
pub struct NewConversation {
    pub user_id: Uuid,
    pub model_id: i32,
    pub title: String,
}

#[derive(Serialize, FromRow)]
struct DeletedConversation {
    id: Uuid,
}

#[derive(Deserialize)]
pub struct UpdateConversation {
    pub title: Option<String>,
    pub model_id: Option<i32>,
}

#[get("/conversations/{user_id}")]
async fn fetch_conversations(state: Data<AppState>, path: Path<Uuid>) -> impl Responder {
    let user_id = path.into_inner();

    match sqlx::query_as::<_, Conversation>(
        "SELECT id, user_id, model_id, title, created_at, updated_at FROM conversations WHERE user_id = $1"
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await
    {   
        Ok(conversations) => HttpResponse::Ok().json(conversations),
        Err(_) => HttpResponse::InternalServerError().json("Error fetching conversations"),
    }
}

#[get("/conversation/{id}")]
async fn get_conversation_by_id(state: Data<AppState>, path: Path<Uuid>) -> impl Responder {
    let conversation_id = path.into_inner();

    match sqlx::query_as::<_, Conversation>(
        "SELECT id, user_id, model_id, title, created_at, updated_at FROM conversations WHERE id = $1"
    )
    .bind(conversation_id)
    .fetch_all(&state.db)
    .await
    {
        Ok(conversation) => HttpResponse::Ok().json(conversation),
        Err(_) => HttpResponse::InternalServerError().json("Error fetching conversation"),
    }
}


#[post("/conversations")]
async fn create_conversation(state: Data<AppState>, body: Json<NewConversation>) -> impl Responder {
    match sqlx::query_as::<_, Conversation>(
        "INSERT INTO conversations (user_id, model_id, title) VALUES ($1, $2, $3) 
        RETURNING id, user_id, model_id, title, created_at, updated_at",
    )
        .bind(body.user_id)
        .bind(body.model_id)
        .bind(body.title.to_string())   
        .fetch_one(&state.db)
        .await
    {
        Ok(conversation) => HttpResponse::Created().json(conversation),
        Err(_) => HttpResponse::InternalServerError().json("Failed to create conversation"),
    }
}

#[put("/conversations/{id}")]
async fn update_conversation(state: Data<AppState>, path: Path<Uuid>, body: Json<UpdateConversation>) -> impl Responder {
    let conversation_id = path.into_inner();

    // Get the actual conversation
    let existing_conversation = sqlx::query_as::<_, Conversation>(
        "SELECT id, user_id, model_id, title, created_at, updated_at FROM conversations WHERE id = $1"
    )
    .bind(conversation_id)
    .fetch_optional(&state.db)
    .await;

    match existing_conversation {
        Ok(Some(conversation)) => {
            let new_title = body.title.clone().unwrap_or(conversation.title);
            let new_model_id = body.model_id.unwrap_or(conversation.model_id);

            match sqlx::query_as::<_, Conversation>(
                "UPDATE conversations 
                SET title = $1, model_id = $2, updated_at = NOW() 
                WHERE id = $3 
                RETURNING id, user_id, model_id, title, created_at, updated_at"
            )
            .bind(new_title)
            .bind(new_model_id)
            .bind(conversation_id)
            .fetch_one(&state.db)
            .await
            {
                Ok(updated_conversation) => HttpResponse::Ok().json(updated_conversation),
                Err(_) => HttpResponse::InternalServerError().json("Failed to update conversation"),
            }
        }
        Ok(None) => HttpResponse::NotFound().json("Conversation not found"),
        Err(_) => HttpResponse::InternalServerError().json("Error fetching conversation"),
    }
}

#[delete("/conversations/{id}")]
async fn delete_conversation(state: Data<AppState>, path: Path<Uuid>) -> impl Responder {
    let conversation_id = path.into_inner();

    match sqlx::query_as::<_, DeletedConversation>(
        "DELETE FROM conversations WHERE id = $1 RETURNING id"
    )
    .bind(conversation_id)
    .fetch_optional(&state.db)
    .await
    {
        Ok(Some(_)) => HttpResponse::Ok().body("Conversation deleted"),
        Ok(None) => HttpResponse::NotFound().body("Conversation not found"),
        Err(_) => HttpResponse::InternalServerError().body("Failed to delete conversation"),
    }
}