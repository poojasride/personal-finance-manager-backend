import Transaction from "../models/transaction.js";
import Goal from "../models/goal.js";

// ==============================
// 📊 FINANCIAL FORECAST
// ==============================
export const getFinancialForecast = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ get logged-in user

    console.log("userId:", userId);

    // Monthly income avg
    const income = await Transaction.aggregate([
      { $match: { type: "income", user: userId } },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    console.log("income:", income);

    // Monthly expense avg
    const expense = await Transaction.aggregate([
      { $match: { type: "expense", user: userId } }, // ✅ filter user
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    console.log("expense:", expense);

    const avgIncome =
      income.reduce((a, b) => a + b.total, 0) / (income.length || 1);

    const avgExpense =
      expense.reduce((a, b) => a + b.total, 0) / (expense.length || 1);

    const monthlySavings = avgIncome - avgExpense;

    console.log("monthlySavings:", monthlySavings);
    res.json({
      avgIncome,
      avgExpense,
      monthlySavings,
      projectedYearlySavings: monthlySavings * 12,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// 🎯 GOAL FORECAST
// ==============================
export const forecastGoalCompletion = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ ensure goal belongs to user
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    // ✅ get avg monthly income for user
    const transactions = await Transaction.aggregate([
      { $match: { type: "income", user: userId } }, // filter user
      {
        $group: {
          _id: null,
          avgIncome: { $avg: "$amount" },
        },
      },
    ]);

    const monthlySavings = transactions[0]?.avgIncome || 0;

    const remaining = goal.targetAmount - goal.savedAmount;

    if (monthlySavings <= 0) {
      return res.json({
        monthsNeeded: "Infinity",
        estimatedCompletionDate: null,
        message: "No savings detected",
      });
    }

    const monthsNeeded = remaining / monthlySavings;

    res.json({
      monthsNeeded: Math.ceil(monthsNeeded),
      estimatedCompletionDate: new Date(
        Date.now() + monthsNeeded * 30 * 24 * 60 * 60 * 1000,
      ),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
