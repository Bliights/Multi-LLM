import { Router } from "express";
import axios from "axios";
import { AUTH_SERVER, AUTH_PORT } from "../main";
import {Model} from "../models";

const aiModelRouter = Router();

/**
 * @openapi
 * /models:
 *   get:
 *     summary: Get all models
 *     tags: [Model]
 *     description: Retrieve all models currently available.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Models'
 *       500:
 *         description: Server Error
 */
aiModelRouter.get("/", async (req, res) => {
    try {
        const response = await axios.get<Model>(`http://${AUTH_SERVER}:${AUTH_PORT}/models`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error while fetching data", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /models/{name}:
 *   get:
 *     summary: Get a model by name
 *     tags: [Model]
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: name of the AI model to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI model found
 *       404:
 *         description: Model not found
 *       500:
 *         description: Server error
 */
aiModelRouter.get("/:name", async (req, res) => {
    const name = req.params.name
    try {
        const response = await axios.get<Model>(`http://${AUTH_SERVER}:${AUTH_PORT}/models/${name}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching AI model: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /models:
 *   post:
 *     summary: Create a new AI model
 *     tags: [Model]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 example: "GPT-4"
 *               default_api_key:
 *                 type: string
 *                 example: "my-secret-api-key"
 *     responses:
 *       201:
 *         description: Model created successfully
 *       400:
 *         description: Missing mandatory fields
 *       409:
 *         description: Model already exists
 *       500:
 *         description: Server error
 */
aiModelRouter.post("/", async (req, res) => {
    try {
        const response = await axios.post<Model>(`http://${AUTH_SERVER}:${AUTH_PORT}/models`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating AI model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /models/{id}:
 *   put:
 *     summary: Update an AI model by ID
 *     tags: [Model]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the AI model to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 example: "Updated-GPT"
 *               default_api_key:
 *                 type: string
 *                 example: "new-api-key"
 *     responses:
 *       200:
 *         description: Model updated successfully
 *       404:
 *         description: Model not found
 *       500:
 *         description: Server error
 */
aiModelRouter.put("/:id", async (req, res) => {
    const modelId = parseInt(req.params.id, 10);
    try {
        const response = await axios.put<Model>(`http://${AUTH_SERVER}:${AUTH_PORT}/models/${modelId}`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error updating AI model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /models/{id}:
 *   delete:
 *     summary: Delete an AI model by ID
 *     tags: [Model]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the AI model to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Model deleted successfully
 *       404:
 *         description: Model not found
 *       500:
 *         description: Server error
 */
aiModelRouter.delete("/:id", async (req, res) => {
    const modelId = parseInt(req.params.id, 10);
    try {
        const response = await axios.delete(`http://${AUTH_SERVER}:${AUTH_PORT}/models/${modelId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error deleting AI model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default aiModelRouter;