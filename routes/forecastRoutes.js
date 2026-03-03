import express from "express";

import {
  getFinancialForecast,
  forecastGoalCompletion,
} from "../controllers/forecastController.js";

const router = express.Router();

router.get("/", getFinancialForecast);

router.get("/goal/:id", forecastGoalCompletion);

export default router;