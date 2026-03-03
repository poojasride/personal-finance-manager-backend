import express from "express";

import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  addSavingsToGoal,
} from "../controllers/goalController.js";

const router = express.Router();

router.post("/", createGoal);

router.get("/", getGoals);

router.put("/:id", updateGoal);

router.delete("/:id", deleteGoal);

router.post("/:id/add-savings", addSavingsToGoal);

export default router;