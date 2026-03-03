import express from "express";

import {
    getExpenseReport,
    getIncomeReport,
    getFinancialSummary,
    getBudgetReport,
    getExpenseByCategory,
    getMonthlyTrend
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/expenses", getExpenseReport);

router.get("/income", getIncomeReport);

router.get("/summary", getFinancialSummary);

router.get("/budgets", getBudgetReport);

router.get("/expense-category", getExpenseByCategory);

router.get("/monthly-trend", getMonthlyTrend);

export default router;