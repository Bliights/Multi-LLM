import { Router } from "express";
import UserApiKeys from "../models/userApiKeys";
import {encryptAPIKey} from "../cryptoUtils";

const userApiKeysRouter = Router();

userApiKeysRouter.get("/", async (req, res) => {
    try {
        const apiKeys = await UserApiKeys.findAll();
        res.status(200).json(apiKeys);
    } catch (error) {
        console.error("Error fetching user API keys:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

userApiKeysRouter.get("/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const apiKey = await UserApiKeys.findAll({where: {user_id: userId}});
        if (!apiKey) {
            res.status(404).json({ error: "API key not found." });
            return;
        }
        res.status(200).json(apiKey);
    } catch (error) {
        console.error("Error fetching API key:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

userApiKeysRouter.get("/:userId/:modelId", async (req, res) => {
    const userId = req.params.userId;
    const modelId = parseInt(req.params.modelId,10);
    try {
        const apiKey = await UserApiKeys.findAll({where: {user_id: userId, model_id: modelId}});
        if (!apiKey) {
            res.status(404).json({ error: "API key not found." });
            return;
        }
        res.status(200).json(apiKey);
    } catch (error) {
        console.error("Error fetching API key:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

userApiKeysRouter.post("/", async (req, res) => {
    const { user_id, model_id, api_key } = req.body;
    try {
        if (!user_id || !model_id || !api_key) {
            res.status(400).json({ error: "Mandatory fields are missing." });
            return;
        }

        const existingApiKey = await UserApiKeys.findOne({where: { user_id, model_id }});
        if (existingApiKey) {
            res.status(409).json({message: "API key already exist."});
            return;
        }
        const encryptedApiKey = encryptAPIKey(api_key);

        const newApiKey = await UserApiKeys.create({ user_id, model_id, api_key: encryptedApiKey });
        res.status(201).json(newApiKey);
    } catch (error) {
        console.error("Error creating API key:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

userApiKeysRouter.put("/", async (req, res) => {
    const { user_id, model_id, api_key } = req.body;

    try {
        if (!user_id || !model_id || !api_key) {
            res.status(400).json({ error: "Mandatory fields are missing." });
            return;
        }

        const existingApiKey = await UserApiKeys.findOne({where: { user_id, model_id }});
        if (!existingApiKey) {
            res.status(404).json({message: "API key not found."});
            return;
        }

        const encryptedApiKey = encryptAPIKey(api_key);

        await existingApiKey.update({ api_key: encryptedApiKey });

        res.status(200).json({message: "API key updated successfully.", api_key: existingApiKey});
    } catch (error) {
        console.error("Error updating API key:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

userApiKeysRouter.delete("/:id", async (req, res) => {
    const keyId = parseInt(req.params.id, 10);
    try {
        const apiKey = await UserApiKeys.findByPk(keyId);
        if (!apiKey) {
            res.status(404).json({ error: "API key not found." });
            return;
        }
        await apiKey.destroy();
        res.status(200).json({ message: "API key deleted successfully." });
    } catch (error) {
        console.error("Error deleting API key:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default userApiKeysRouter;