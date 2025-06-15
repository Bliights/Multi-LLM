import { Router } from "express";
import AI_Model from "../models/model";
import { encryptAPIKey } from "../cryptoUtils";
import { Op } from "sequelize";

const aiModelRouter = Router();

aiModelRouter.get("/", async (req, res) => {
    try {
        const models = await AI_Model.findAll();
        res.status(200).json(models);
    } catch (error) {
        console.error("Error fetching AI models: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

aiModelRouter.get("/:name", async (req, res) => {
    const name = req.params.name.toLowerCase();
    try {
        const model = await AI_Model.findOne({ where: {  model: {[Op.iLike]: name } } });
        if (!model) {
            res.status(404).json({ error: "AI model not found." });
            return;
        }
        res.status(200).json(model);
    } catch (error) {
        console.error("Error fetching AI model: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

aiModelRouter.post("/", async (req, res) => {
    const { model, default_api_key } = req.body;
    try {
        if (!model || !default_api_key) {
            res.status(400).json({ error: "Mandatory fields are missing." });
            return;
        }
        // Check if model already exists
        const existingModel = await AI_Model.findOne({ where: { model } });
        if (existingModel) {
            res.status(409).json({ message: "Model already exist." });
            return;
        }

        const encryptedApiKey = encryptAPIKey(default_api_key);
        // if not create new model
        const newModel = await AI_Model.create({ model, default_api_key: encryptedApiKey});
        res.status(201).json(newModel);
    } catch (error) {
        console.error("Error creating AI model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

aiModelRouter.put("/:id", async (req, res) => {
    const modelId = parseInt(req.params.id, 10);
    const { model, default_api_key } = req.body;
    try {
        const existingModel = await AI_Model.findByPk(modelId);
        if (!existingModel) {
            res.status(404).json({ error: "AI model not found." });
            return;
        }
        const encryptedApiKey = encryptAPIKey(default_api_key);

        await existingModel.update({ model, default_api_key: encryptedApiKey });
        res.status(200).json(existingModel);
    } catch (error) {
        console.error("Error updating AI model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

aiModelRouter.delete("/:id", async (req, res) => {
    const modelId = parseInt(req.params.id, 10);
    try {
        const model = await AI_Model.findByPk(modelId);
        if (!model) {
            res.status(404).json({ error: "AI model not found." });
            return;
        }
        await model.destroy();
        res.status(200).json({ message: "AI model deleted successfully." });
    } catch (error) {
        console.error("Error deleting AI model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default aiModelRouter;