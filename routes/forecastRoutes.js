import express from "express";

import {
  getFinancialForecast,
  forecastGoalCompletion,
} from "../controllers/forecastController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
6
router.get("/", protect, getFinancialForecast);
router.get("/goal/:id", protect, forecastGoalCompletion);

export default router;
