import { Router } from "express";
import axios from "axios";
import {AI_PORT, AI_SERVER, AUTH_PORT, AUTH_SERVER} from "../main";
import {Conversation} from "../models";

const conversationRouter = Router();

/**
 * @openapi
 * /conversations/{userId}:
 *   get:
 *     summary: Get a conversation for a user
 *     tags: [Conversations]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversations found
 *       404:
 *         description: Conversations not found
 *       500:
 *         description: Server error
 */
conversationRouter.get("/conversations/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const response = await axios.get<Conversation>(`http://${AI_SERVER}:${AI_PORT}/conversations/${userId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /conversation/{id}:
 *   get:
 *     summary: Get a conversation by ID
 *     tags: [Conversations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation found
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
conversationRouter.get("/conversation/:id", async (req, res) => {
    const conversationId = req.params.id;
    try {
        const response = await axios.get<Conversation>(`http://${AI_SERVER}:${AI_PORT}/conversation/${conversationId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching conversation: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /conversations:
 *   post:
 *     summary: Create a new Conversation
 *     tags: [Conversations]
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
 *               model_id:
 *                 type: int
 *                 example: 4
 *               title:
 *                 type: string
 *                 example: "New title"
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       400:
 *         description: Missing mandatory fields
 *       500:
 *         description: Server error
 */
conversationRouter.post("/conversations", async (req, res) => {
    const { user_id, model_id, title } = req.body;
    try {
        await axios.get(`http://${AUTH_SERVER}:${AUTH_PORT}/users/${user_id}`);

        const response = await axios.post<Conversation>(`http://${AI_SERVER}:${AI_PORT}/conversations`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating user API key model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /conversations/{id}:
 *   put:
 *     summary: Update a conversation by ID
 *     tags: [Conversations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the conversation
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated title"
 *               model_id:
 *                 type: int
 *                 example: 5
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 *       400:
 *         description: Missing mandatory fields
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
conversationRouter.put("/conversations/:id", async (req, res) => {
    const conversationId = req.params.id;
    const updateData = req.body;

    try {
        const response = await axios.put<Conversation>(`http://${AI_SERVER}:${AI_PORT}/conversations/${conversationId}`, updateData);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error updating conversation: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /conversations/{id}:
 *   delete:
 *     summary: Delete a Conversation  by ID
 *     tags: [Conversations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
conversationRouter.delete("/conversations/:id", async (req, res) => {
    const conversationId = req.params.id;
    try {
        const response = await axios.delete(`http://${AI_SERVER}:${AI_PORT}/conversations/${conversationId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default conversationRouter;