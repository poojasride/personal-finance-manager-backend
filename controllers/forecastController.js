import Transaction from "../models/transaction.js";
import Goal from "../models/goal.js";

// ==============================
// 📊 FINANCIAL FORECAST
// ==============================
export const getFinancialForecast = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Last 6 months filter
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    let incomeMap = {};
    let expenseMap = {};

    // ✅ Separate income & expense
    transactions.forEach((t) => {
      const key = `${t._id.month}-${t._id.year}`;

      if (t._id.type === "income") {
        incomeMap[key] = t.total;
      } else {
        expenseMap[key] = t.total;
      }
    });

    // ✅ Combine all months
    const months = new Set([
      ...Object.keys(incomeMap),
      ...Object.keys(expenseMap),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    months.forEach((m) => {
      totalIncome += incomeMap[m] || 0;
      totalExpense += expenseMap[m] || 0;
    });

    const monthCount = months.size || 1;

    const avgIncome = totalIncome / monthCount;
    const avgExpense = totalExpense / monthCount;
    const monthlySavings = avgIncome - avgExpense;

    // ✅ Smart suggestion
    let suggestion = "Good job! Keep saving 👍";
    if (monthlySavings < 0) {
      suggestion = "⚠️ You are overspending. Try reducing expenses.";
    } else if (monthlySavings < avgIncome * 0.2) {
      suggestion = "💡 Try to save at least 20% of your income.";
    }

    res.json({
      avgIncome,
      avgExpense,
      monthlySavings,
      projectedYearlySavings: monthlySavings * 12,
      suggestion,
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

    // ✅ Find goal
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    // ✅ Last 6 months transactions
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    let incomeMap = {};
    let expenseMap = {};

    transactions.forEach((t) => {
      const key = `${t._id.month}-${t._id.year}`;

      if (t._id.type === "income") {
        incomeMap[key] = t.total;
      } else {
        expenseMap[key] = t.total;
      }
    });

    const months = new Set([
      ...Object.keys(incomeMap),
      ...Object.keys(expenseMap),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    months.forEach((m) => {
      totalIncome += incomeMap[m] || 0;
      totalExpense += expenseMap[m] || 0;
    });

    const avgIncome = totalIncome / (months.size || 1);
    const avgExpense = totalExpense / (months.size || 1);
    const monthlySavings = avgIncome - avgExpense;

    const remaining = goal.targetAmount - goal.savedAmount;

    // ❌ No savings case
    if (monthlySavings <= 0) {
      return res.json({
        monthlySavings,
        monthsNeeded: "Infinity",
        estimatedCompletionDate: null,
        message: "⚠️ You are not saving money currently",
      });
    }

    const monthsNeeded = Math.ceil(remaining / monthlySavings);

    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setMonth(
      estimatedCompletionDate.getMonth() + monthsNeeded
    );

    // ✅ Extra suggestion
    let suggestion = "On track 👍";
    if (goal.deadline && estimatedCompletionDate > goal.deadline) {
      suggestion = "⚠️ You may miss your deadline. Increase savings!";
    }

    res.json({
      monthlySavings,
      monthsNeeded,
      estimatedCompletionDate,
      suggestion,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};