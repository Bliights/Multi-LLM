import express from "express";
import modelRoute from "./routes/modelsRoute";
import swaggerDoc from "./config/swagger";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import userApiKeysRouter from "./routes/userApiKeysRoute";
import userRouter from "./routes/userRoute";
import conversationRouter from "./routes/conversationRoute";
import messageRouter from "./routes/messageRoute";
import aiRouter from "./routes/aiRoute";
import cors from "cors";

dotenv.config();

export const AUTH_SERVER = process.env.BACKEND_AUTH_SERV as string;
export const AUTH_PORT = process.env.BACKEND_AUTH_PORT as string;
export const AI_SERVER = process.env.BACKEND_AI_SERV as string;
export const AI_PORT = process.env.BACKEND_AI_PORT as string;

const app = express();
app.use(express.json());

app.use(cors({
    origin: "http://localhost:4200", // Allow requests from Angular frontend
    credentials: true, // Allow sending cookies (jwt, refreshToken)
}));

// Swagger Documentation
const swaggerUiOptions = {swaggerOptions: {defaultModelsExpandDepth: -1, defaultModelExpandDepth: -1, showModels: false,},};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.get("/api-docs", swaggerUi.setup(swaggerDoc, swaggerUiOptions));

// Swagger JSON
app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(swaggerDoc);
});

// Routes
app.use("/models", modelRoute);
app.use("/user-api-keys", userApiKeysRouter)
app.use("/users", userRouter)
app.use("/", conversationRouter)
app.use("/messages", messageRouter)
app.use("/", aiRouter)

app.listen(4000,()=>{
    console.log("Starting Server at http://localhost:4000/api-docs");
});