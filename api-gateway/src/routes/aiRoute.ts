import { Router } from "express";
import axios from "axios";
import {AI_PORT, AI_SERVER, AUTH_PORT, AUTH_SERVER} from "../main";
import { Model, UserApiKeys } from "../models";
import { Readable } from "stream";

const aiRouter = Router();

/**
 * @openapi
 * /gemini:
 *   post:
 *     summary: Get the response from Gemini AI
 *     tags: [Ai]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               contents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: ["user", "model"]
 *                       example: "user"
 *                     parts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                             example: "Write a phrase on AI"
 *     responses:
 *       201:
 *         description: Response generated successfully
 *       400:
 *         description: Missing mandatory fields
 *       500:
 *         description: Server error
 */
aiRouter.post("/gemini", async (req, res) => {
    const { user_id, contents } = req.body;

    if (!user_id || !contents || !Array.isArray(contents)) {
        res.status(400).json({ error: "Missing mandatory fields: user_id and contents must be provided" });
        return ;
    }

    try {
        const modelResponse = await axios.get<Model>(`http://${AUTH_SERVER}:${AUTH_PORT}/models/gemini`);
        const model = modelResponse.data;

        if (!model || !model.id) {
            res.status(404).json({ error: "Gemini model not found." });
            return ;
        }

        let api_key: string | undefined;

        try {
            const apiKeyResponse = await axios.get<UserApiKeys[]>(`http://${AUTH_SERVER}:${AUTH_PORT}/user-api-keys/${user_id}/${model.id}`);
            api_key = apiKeyResponse.data[0].api_key;
        } catch (error) {
            console.log(`No user-specific API key found for user ${user_id}, using default.`);
        }

        api_key = api_key || model.default_api_key;

        if (!api_key) {
            res.status(403).json({ error: "No valid API key available for Gemini model." });
            return ;
        }

        const response = await axios.post<Readable>(
            `http://${AI_SERVER}:${AI_PORT}/gemini`,
            { contents, api_key },
            {responseType: "stream"}
        );

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        response.data.on("data", (chunk) => {
            res.write(chunk);
        });

        response.data.on("end", () => {
            res.end();
        });

    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /mistral:
 *   post:
 *     summary: Get the response from Mistral AI
 *     tags: [Ai]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               contents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: ["user", "model"]
 *                       example: "user"
 *                     content:
 *                       type: string
 *                       example: "Write a phrase on AI"
 *     responses:
 *       201:
 *         description: Response generated successfully
 *       400:
 *         description: Missing mandatory fields
 *       500:
 *         description: Server error
 */
aiRouter.post("/mistral", async (req, res) => {
    const { user_id, contents } = req.body;

    if (!user_id || !contents || !Array.isArray(contents)) {
        res.status(400).json({ error: "Missing mandatory fields: user_id and contents must be provided" });
        return ;
    }

    try {
        const modelResponse = await axios.get<Model>(`http://${AUTH_SERVER}:${AUTH_PORT}/models/mistral`);
        const model = modelResponse.data;

        if (!model || !model.id) {
            res.status(404).json({ error: "Mistral model not found." });
            return ;
        }

        let api_key: string | undefined;

        try {
            const apiKeyResponse = await axios.get<UserApiKeys[]>(`http://${AUTH_SERVER}:${AUTH_PORT}/user-api-keys/${user_id}/${model.id}`);
            api_key = apiKeyResponse.data[0].api_key;
        } catch (error) {
            console.log(`No user-specific API key found for user ${user_id}, using default.`);
        }

        api_key = api_key || model.default_api_key;

        if (!api_key) {
            res.status(403).json({ error: "No valid API key available for Mistral model." });
            return ;
        }

        const response = await axios.post<Readable>(
            `http://${AI_SERVER}:${AI_PORT}/mistral`,
            { messages: contents, api_key },
            {responseType: "stream"}
        );

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        response.data.on("data", (chunk) => {
            res.write(chunk);
        });

        response.data.on("end", () => {
            res.end();
        });

    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default aiRouter;