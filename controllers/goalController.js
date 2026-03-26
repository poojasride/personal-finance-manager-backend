import Goal from "../models/goal.js";
import Transaction from "../models/transaction.js";


// ============================
// CREATE Goal
// ============================
export const createGoal = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const goal = await Goal.create({
      ...req.body,
      user, // 👈 attach user
    });

    res.status(201).json(goal);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// GET All Goals (with progress)
// ============================
export const getGoals = async (req, res) => {
  try {

    const user = req.user?._id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const goals = await Goal.find({ user });

    const result = goals.map(goal => {

      const progress =
        goal.targetAmount > 0
          ? (goal.savedAmount / goal.targetAmount) * 100
          : 0;

      const remaining =
        goal.targetAmount - goal.savedAmount;

      return {
        ...goal._doc,
        progress: progress.toFixed(1),
        remaining,
      };
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// UPDATE Goal
// ============================
export const updateGoal = async (req, res) => {
  try {

    const user = req.user?._id;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user }, // 👈 ownership check
      req.body,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// DELETE Goal
// ============================
export const deleteGoal = async (req, res) => {
  try {

    const user = req.user?._id;

    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user, // 👈 ownership check
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({
      message: "Goal deleted",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// ADD Savings to Goal
// ============================
export const addSavingsToGoal = async (req, res) => {
  try {

    const user = req.user?._id;
    const { amount } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      user, // 👈 ownership check
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.savedAmount += amount;

    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = "completed";
    }

    await goal.save();

    res.json(goal);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};