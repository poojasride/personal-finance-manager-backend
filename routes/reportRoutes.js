import express from "express";

import {
  getExpenseReport,
  getIncomeReport,
  getFinancialSummary,
  getBudgetReport,
  getExpenseByCategory,
  getMonthlyTrend,
} from "../controllers/reportController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/expenses", protect, getExpenseReport);

router.get("/income", protect, getIncomeReport);

router.get("/summary", protect, getFinancialSummary);

router.get("/budgets", protect, getBudgetReport);

router.get("/expense-category", protect, getExpenseByCategory);

router.get("/monthly-trend", protect, getMonthlyTrend);

export default router;
