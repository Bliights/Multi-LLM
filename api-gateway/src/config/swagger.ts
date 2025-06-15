import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "api-gateway",
            version: "1.0.0"
        },
        servers: [
            {
                url: "http://localhost:4000"
            }
        ],
        tags: [
            {
                name: "Ai",
                description: "Operations related to Ai"
            },
            {
                name: "Conversations",
                description: "Operations related to Conversations"
            },
            {
                name: "Messages",
                description: "Operations related to Messages"
            },
            {
                name: "Model",
                description: "Operations related to Models"
            },
            {
                name: "User_API_Keys",
                description: "Operations related to User API Keys"
            },
            {
                name: "Users",
                description: "Operations related to Users"
            },
        ],
        components: {
            schemas: {
                Ai: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "I have answer ! " },
                    },
                },
                Conversations: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "c0a80100-0000-4000-8000-000000000001" },
                        user_id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
                        model_id: { type: "integer", example: 1 },
                        title: { type: "string", example: "How to handle bully" },
                        created_at: { type: "date", example: "2025-03-09T12:16:22.125Z" },
                        updated_at: { type: "date", example: "2025-03-09T12:16:22.125Z" },
                    },
                },
                Messages: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        conversations_id: { type: "string", example: "c0a80100-0000-4000-8000-000000000001" },
                        sender: { type: "string", example: "AI" },
                        message: { type: "string", example: "Fight back" },
                        date: { type: "date", example: "2025-03-09T12:16:22.125Z" },
                    },
                },
                Model: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        model: { type: "string", example: "GPT-4" },
                        default_api_key: { type: "string", example: "default_api_key" },
                    },
                },
                User_API_Keys: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        user_id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
                        model_id: { type: "integer", example: "GPT-4" },
                        api_key: { type: "string", example: "api_key" },
                    },
                },
                Users: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
                        name: { type: "string", example: "test" },
                        email: { type: "string", example: "test.test@gmail.com" },
                        password: { type: "string", example: "$2b$10$83uVprkX1xYjS54/rFTNwu4kmI7igd2FASZSwcnDknCDgoRAOjdmG" },
                        role: { type: "string", example: "user" },
                        created_at: { type: "date", example: "2025-03-09T12:16:22.125Z" },
                    },
                },
            }
        },
    },
    apis: ["./dist/routes/**/*.js"],
}
const swaggerDoc = swaggerJsDoc(swaggerOptions);

export default swaggerDoc;