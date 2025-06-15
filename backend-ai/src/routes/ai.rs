use actix_web::{web::Json, post, HttpResponse, Responder};
use std::env;
use serde::{Deserialize, Serialize};
use reqwest::{ Client, Response};
use openssl::symm::{decrypt, Cipher};
use hex;
use serde_json::{json, Value};
use actix_web::web::Bytes;
use futures::Stream;


#[derive(Deserialize, Serialize)]
pub struct GeminiRequest {
    contents: Vec<Content>,   
    api_key: String,            
}

#[derive(Deserialize, Serialize)]
pub struct Content {
    pub role: String,
    pub parts: Vec<Part>,
}

#[derive(Deserialize, Serialize)]
pub struct Part {
    pub text: String,
}

#[derive(Deserialize, Serialize)]
pub struct MistralRequest {
    messages: Vec<Message>,
    api_key: String,
}

#[derive(Deserialize, Serialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

fn decrypt_api_key(encrypted_api_key: &str, decryption_key: &str) -> Result<String, &'static str> {
    let parts: Vec<&str> = encrypted_api_key.split(':').collect();
    if parts.len() != 2 {
        return Err("Invalid encrypted key format");
    }

    let iv = hex::decode(parts[0]).map_err(|_| "Invalid IV format")?;
    let encrypted_data = hex::decode(parts[1]).map_err(|_| "Invalid encrypted data format")?;
    
    let cipher = Cipher::aes_256_cbc();
    decrypt(cipher, decryption_key.as_bytes(), Some(&iv), &encrypted_data)
        .map_err(|_| "Decryption failed") 
        .and_then(|decrypted| String::from_utf8(decrypted).map_err(|_| "Decryption failed"))
}

fn gemini_stream_api_response(response: Response) -> impl Stream<Item = Result<Bytes, actix_web::Error>> {
    futures::stream::try_unfold(response, |mut response| async {
        match response.chunk().await {
            Ok(Some(chunk)) => {
                let text = String::from_utf8_lossy(&chunk);
                let mut output = String::new();

                for line in text.lines() {
                    if let Some(json_data) = line.strip_prefix("data: ") {
                        match serde_json::from_str::<Value>(json_data) {
                            Ok(parsed) => {
                                if let Some(candidates) = parsed.get("candidates") {
                                    if let Some(first_candidate) = candidates.get(0) {
                                        if let Some(content) = first_candidate.get("content") {
                                            if let Some(parts) = content.get("parts") {
                                                for part in parts.as_array().unwrap_or(&vec![]) {
                                                    if let Some(text_value) = part.get("text") {
                                                        if let Some(text_str) = text_value.as_str() {
                                                            // Create Json
                                                            let json_output = json!({"message": text_str});
                                                            output.push_str(&serde_json::to_string(&json_output).unwrap());
                                                            output.push('\n');
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            Err(_) => return Err(actix_web::error::ErrorInternalServerError("Parsing error")),
                        }
                    }
                }

                if output.is_empty() {
                    return Ok(None); // Stop if no data
                }

                Ok(Some((Bytes::from(output), response)))
            }
            Ok(None) => Ok(None),
            Err(_) => Err(actix_web::error::ErrorInternalServerError("Stream read error")),
        }
    })
}

#[post("/gemini")]
async fn gemini(body: Json<GeminiRequest>) -> impl Responder {
    let decryption_key = match env::var("DECRYPTION_KEY") {
        Ok(key) => key,
        Err(_) => return HttpResponse::InternalServerError().body("DECRYPTION_KEY must be set"),
    };

    let decrypted_api_key = match decrypt_api_key(&body.api_key, &decryption_key) {
        Ok(key) => key,
        Err(_) => return HttpResponse::BadRequest().body("Invalid API key"),
    };

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key={}",
        decrypted_api_key
    );

    let client = Client::new();

    let request_body = json!({
        "contents": body.contents
    });

    match client.post(&url)
        .json(&request_body)
        .send()
        .await
    {
        Ok(response) => {
            let stream = gemini_stream_api_response(response);
            HttpResponse::Ok()
                .insert_header(("Content-Type", "text/event-stream"))
                .streaming(stream)
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to reach Gemini API"),
    }
}

fn mistral_stream_api_response(response: Response) -> impl Stream<Item = Result<Bytes, actix_web::Error>> {
    futures::stream::try_unfold((response, String::new()), |(mut response, mut buffer)| async {
        match response.chunk().await {
            Ok(Some(chunk)) => {
                let text = String::from_utf8_lossy(&chunk);
                buffer.push_str(&text);

                let mut output = String::new();
                let mut remaining_buffer = String::new();

                for line in buffer.lines() {
                    if line.trim() == "data: [DONE]" {
                        return Ok(None);  
                    }

                    if let Some(json_data) = line.strip_prefix("data: ") {
                        match serde_json::from_str::<Value>(json_data) {
                            Ok(parsed) => {
                                if let Some(choices) = parsed.get("choices") {
                                    if let Some(first_choice) = choices.get(0) {
                                        if let Some(delta) = first_choice.get("delta") {
                                            if let Some(content) = delta.get("content") {
                                                if let Some(content_str) = content.as_str() {
                                                    let json_output = json!({ "message": content_str });
                                                    output.push_str(&serde_json::to_string(&json_output).unwrap());
                                                    output.push('\n');
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            Err(_) => {
                                println!("Incomplete JSON waiting for more data...");
                                remaining_buffer.push_str("data: ");
                                remaining_buffer.push_str(json_data);
                            }
                        }
                    }
                }

                buffer = remaining_buffer;

                if output.is_empty() {
                    return Ok(Some((Bytes::new(), (response, buffer))));
                }

                Ok(Some((Bytes::from(output), (response, buffer))))
            }
            Ok(None) => Ok(None),
            Err(_) => Err(actix_web::error::ErrorInternalServerError("Stream read error")),
        }
    })
}

#[post("/mistral")]
async fn mistral(body: Json<MistralRequest>) -> impl Responder {
    let decryption_key = match env::var("DECRYPTION_KEY") {
        Ok(key) => key,
        Err(_) => return HttpResponse::InternalServerError().body("DECRYPTION_KEY must be set"),
    };

    let decrypted_api_key = match decrypt_api_key(&body.api_key, &decryption_key) {
        Ok(key) => key,
        Err(_) => return HttpResponse::BadRequest().body("Invalid API key"),
    };

    let url = "https://api.mistral.ai/v1/chat/completions";

    let client = Client::new();

    let request_body = json!({
        "model": "mistral-large-latest",
        "messages": body.messages,
        "stream": true,
    });

    match client.post(url)
        .header("Authorization", format!("Bearer {}", decrypted_api_key))
        .header("Accept", "text/event-stream")
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
    {
        Ok(response) => {
            let stream = mistral_stream_api_response(response);
            HttpResponse::Ok()
                .insert_header(("Content-Type", "text/event-stream"))
                .streaming(stream)
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to reach Mistral API"),
    }
}

#[post("/gpt")]
async fn gpt(body: Json<MistralRequest>) -> impl Responder {
    let decryption_key = match env::var("DECRYPTION_KEY") {
        Ok(key) => key,
        Err(_) => return HttpResponse::InternalServerError().body("DECRYPTION_KEY must be set"),
    };

    let decrypted_api_key = match decrypt_api_key(&body.api_key, &decryption_key) {
        Ok(key) => key,
        Err(_) => return HttpResponse::BadRequest().body("Invalid API key"),
    };

    let url = "https://api.openai.com/v1/chat/completions";

    let client = Client::new();

    let request_body = json!({
        "model": "gpt-4o-mini",
        "messages": body.messages,
        "stream": true
    });

    match client.post(url)
        .header("Authorization", format!("Bearer {}", decrypted_api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
    {
        Ok(response) => {
            let stream = mistral_stream_api_response(response);
            HttpResponse::Ok()
                .insert_header(("Content-Type", "text/event-stream"))
                .streaming(stream)
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to reach Gemini API"),
    }
}