import { Router } from "express";
import axios from "axios";
import {AUTH_PORT, AUTH_SERVER} from "../main";
import {UserApiKeys} from "../models";

const userApiKeysRouter = Router();

/**
 * @openapi
 * /user-api-keys:
 *   get:
 *     summary: Get all User API Keys
 *     tags: [User_API_Keys]
 *     description: Retrieve all User API Keys currently available.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User_API_Keys'
 *       500:
 *         description: Server Error
 */
userApiKeysRouter.get("/", async (req, res) => {
    try {
        const response = await axios.get<UserApiKeys>(`http://${AUTH_SERVER}:${AUTH_PORT}/user-api-keys`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error while fetching data", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /user-api-keys/{userId}:
 *   get:
 *     summary: Get a User api key by user ID
 *     tags: [User_API_Keys]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User api key found
 *       404:
 *         description: User api key not found
 *       500:
 *         description: Server error
 */
userApiKeysRouter.get("/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const response = await axios.get<UserApiKeys>(`http://${AUTH_SERVER}:${AUTH_PORT}/user-api-keys/${userId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /user-api-keys/{userId}/{modelId}:
 *   get:
 *     summary: Get a User api key by user ID and model ID
 *     tags: [User_API_Keys]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *       - name: modelId
 *         in: path
 *         required: true
 *         description: ID of the model
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User api key found
 *       404:
 *         description: User api key not found
 *       500:
 *         description: Server error
 */
userApiKeysRouter.get("/:userId/:modelId", async (req, res) => {
    const userId = req.params.userId;
    const modelId = parseInt(req.params.modelId,10);
    try {
        const response = await axios.get<UserApiKeys>(`http://${AUTH_SERVER}:${AUTH_PORT}/user-api-keys/${userId}/${modelId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /user-api-keys:
 *   post:
 *     summary: Create a new User api key
 *     tags: [User_API_Keys]
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
 *               api_key:
 *                 type: string
 *                 example: "my-secret-api-key"
 *     responses:
 *       201:
 *         description: User api key created successfully
 *       400:
 *         description: Missing mandatory fields
 *       409:
 *         description: User api key already exists
 *       500:
 *         description: Server error
 */
userApiKeysRouter.post("/", async (req, res) => {
    try {
        const response = await axios.post<UserApiKeys>(`http://${AUTH_SERVER}:${AUTH_PORT}/user-api-keys`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating user API key model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /user-api-keys:
 *   put:
 *     summary: Update a User api key
 *     tags: [User_API_Keys]
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
 *               api_key:
 *                 type: string
 *                 example: "new-secret-api"
 *     responses:
 *       201:
 *         description: User api key created successfully
 *       400:
 *         description: Missing mandatory fields
 *       500:
 *         description: Server error
 */
userApiKeysRouter.put("/", async (req, res) => {
    try {
        const response= await axios.put<UserApiKeys>(`http://${AUTH_SERVER}:${AUTH_PORT}/user-api-keys`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error updating user API key model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /user-api-keys/{id}:
 *   delete:
 *     summary: Delete a User api key by ID
 *     tags: [User_API_Keys]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user api key
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User api key deleted successfully
 *       404:
 *         description: User api key not found
 *       500:
 *         description: Server error
 */
userApiKeysRouter.delete("/:id", async (req, res) => {
    const userApiKeysId = parseInt(req.params.id, 10);
    try {
        const response = await axios.delete(`http://${AUTH_SERVER}:${AUTH_PORT}/user-api-keys/${userApiKeysId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error deleting user API key model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default userApiKeysRouter;