import Goal from "../models/goal.js";
import Transaction from "../models/transaction.js";


// CREATE Goal
export const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create(req.body);

    res.status(201).json(goal);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET All Goals with Progress
export const getGoals = async (req, res) => {
  try {

    const goals = await Goal.find();

    const result = goals.map(goal => {

      const progress =
        (goal.savedAmount / goal.targetAmount) * 100;

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


// UPDATE Goal
export const updateGoal = async (req, res) => {
  try {

    const goal =
      await Goal.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(goal);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE Goal
export const deleteGoal = async (req, res) => {
  try {

    await Goal.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Goal deleted",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ADD Savings to Goal
export const addSavingsToGoal = async (req, res) => {
  try {

    const { amount } = req.body;

    const goal =
      await Goal.findById(req.params.id);

    goal.savedAmount += amount;

    if (goal.savedAmount >= goal.targetAmount)
      goal.status = "completed";

    await goal.save();

    res.json(goal);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};