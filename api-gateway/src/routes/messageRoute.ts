import { Router } from "express";
import axios from "axios";
import {AI_PORT, AI_SERVER} from "../main";
import {Message} from "../models";

const messageRouter = Router();

/**
 * @openapi
 * /messages/{conversationId}:
 *   get:
 *     summary: Get a message for a conversation
 *     tags: [Messages]
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         description: ID of the conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages found
 *       404:
 *         description: Messages not found
 *       500:
 *         description: Server error
 */
messageRouter.get("/:conversationId", async (req, res) => {
    const conversationId = req.params.conversationId;
    try {
        const response = await axios.get<Message>(`http://${AI_SERVER}:${AI_PORT}/messages/${conversationId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /messages:
 *   post:
 *     summary: Create a new Message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversation_id:
 *                 type: string
 *                 example: "c0a80100-0000-4000-8000-000000000001"
 *               sender:
 *                 type: string
 *                 example: "User"
 *               message:
 *                 type: string
 *                 example: "New message"
 *     responses:
 *       201:
 *         description: Message created successfully
 *       400:
 *         description: Missing mandatory fields
 *       500:
 *         description: Server error
 */
messageRouter.post("/", async (req, res) => {
    try {
        const response = await axios.post<Message>(`http://${AI_SERVER}:${AI_PORT}/messages`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating user API key model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default messageRouter;