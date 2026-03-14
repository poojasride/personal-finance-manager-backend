import express from "express";
import { getAIInsight } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/insight", authMiddleware, getAIInsight);

export default router;