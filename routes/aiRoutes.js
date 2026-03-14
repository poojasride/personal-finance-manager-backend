import express from "express";
import { getAIInsight } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/insight", protect, getAIInsight);

export default router;
