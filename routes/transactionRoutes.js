import express from "express";

import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getCategorySummary,
  getMonthlyExpenses,
} from "../controllers/transactionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTransaction);

router.get("/", getTransactions);

router.get("/summary/category", getCategorySummary);

router.get("/summary/monthly", getMonthlyExpenses);

router.get("/:id", getTransactionById);

router.put("/:id", updateTransaction);

router.delete("/:id", deleteTransaction);

export default router;