import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCategories);

router.post("/", protect, createCategory);

router.put("/:id", updateCategory);

router.delete("/:id", deleteCategory);

export default router;