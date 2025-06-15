CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    default_api_key TEXT NOT NULL
);

CREATE TABLE user_api_keys (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    model_id INT REFERENCES models(id) ON DELETE CASCADE,
    api_key TEXT NOT NULL
);

INSERT INTO users (id, name, email, password) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'alice', 'alice@example.com', '$2b$10$7ddsTfm9JGknFqM5eRp9wOV6vgTMat0VrAOqtQfkYPIGKfzglJmVO'),
('550e8400-e29b-41d4-a716-446655440001', 'bob', 'bob@example.com', '$2b$10$7ddsTfm9JGknFqM5eRp9wOV6vgTMat0VrAOqtQfkYPIGKfzglJmVO'),
('550e8400-e29b-41d4-a716-446655440002', 'charlie', 'charlie@example.com', '$2b$10$7ddsTfm9JGknFqM5eRp9wOV6vgTMat0VrAOqtQfkYPIGKfzglJmVO'),
('550e8400-e29b-41d4-a716-446655440003', 'david', 'david@example.com', '$2b$10$7ddsTfm9JGknFqM5eRp9wOV6vgTMat0VrAOqtQfkYPIGKfzglJmVO'),
('550e8400-e29b-41d4-a716-446655440004', 'eve', 'eve@example.com', '$2b$10$7ddsTfm9JGknFqM5eRp9wOV6vgTMat0VrAOqtQfkYPIGKfzglJmVO');


INSERT INTO models (model, default_api_key) VALUES
('GPT', 'Your_GPT_key_encrypted'),
('Mistral', 'Your_Mistral_key_encrypted'),
('Gemini', 'Your_Gemini_key_encrypted');


INSERT INTO user_api_keys (user_id, model_id, api_key)
VALUES
('550e8400-e29b-41d4-a716-446655440000', 3, 'alice_Gemini_key_encrypted');