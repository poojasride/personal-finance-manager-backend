import express from "express";

import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetSummary
} from "../controllers/budgetController.js";

const router = express.Router();

router.post("/", createBudget);

router.get("/", getBudgets);

router.get("/summary", getBudgetSummary);

router.get("/:id", getBudgetById);

router.put("/:id", updateBudget);

router.delete("/:id", deleteBudget);

export default router;