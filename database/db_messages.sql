CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    model_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(10) CHECK (sender IN ('AI', 'User')),
    message TEXT NOT NULL,
    date TIMESTAMP DEFAULT NOW()
);

INSERT INTO conversations (id, user_id, model_id, title) VALUES
('c0a80100-0000-4000-8000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 1, 'Alice talks to GPT-4'),
('c0a80100-0000-4000-8000-000000000002', '550e8400-e29b-41d4-a716-446655440001', 2, 'Bob chats with Mistral 7B'),
('c0a80100-0000-4000-8000-000000000003', '550e8400-e29b-41d4-a716-446655440002', 2, 'Charlie tests Mistral 7B'),
('c0a80100-0000-4000-8000-000000000004', '550e8400-e29b-41d4-a716-446655440003', 3, 'David explores Gemini AI'),
('c0a80100-0000-4000-8000-000000000005', '550e8400-e29b-41d4-a716-446655440004', 3, 'Eve interacts with Gemini AI');

INSERT INTO messages (conversation_id, sender, message) VALUES
('c0a80100-0000-4000-8000-000000000001', 'User', 'Hello GPT-4, how are you?'),
('c0a80100-0000-4000-8000-000000000001', 'AI', 'I am an AI, I do not have feelings, but I am here to help you!'),
('c0a80100-0000-4000-8000-000000000002', 'User', 'Mistral, how do you compare to GPT-4?'),
('c0a80100-0000-4000-8000-000000000002', 'AI', 'Each model has different strengths. GPT-4 is larger, but I am optimized for efficiency.'),
('c0a80100-0000-4000-8000-000000000003', 'User', 'Mistral, how do you compare to GPT-4?'),
('c0a80100-0000-4000-8000-000000000003', 'AI', 'Each model has different strengths. GPT-4 is larger, but I am optimized for efficiency.'),
('c0a80100-0000-4000-8000-000000000004', 'User', 'Gemini, what do you think about deep learning?'),
('c0a80100-0000-4000-8000-000000000004', 'AI', 'Deep learning is a powerful technique in AI that enables models like me to process vast amounts of data.'),
('c0a80100-0000-4000-8000-000000000005', 'User', 'Gemini, what do you think about deep learning?'),
('c0a80100-0000-4000-8000-000000000005', 'AI', 'Deep learning is a powerful technique in AI that enables models like me to process vast amounts of data.');