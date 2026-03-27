import Transaction from "../models/transaction.js";
import Budget from "../models/budget.js";

// =============================
// 📊 EXPENSE REPORT
// =============================
export const getExpenseReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;

    let filter = {
      user: userId,
      type: "expense",
    };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (category) {
      filter.category = category;
    }

    const expenses = await Transaction.find(filter)
      .sort({ date: -1 })
      .lean();

    const totalAgg = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const total = totalAgg.length > 0 ? totalAgg[0].total : 0;

    let insight = "Spending is under control 👍";
    if (total > 50000) insight = "High spending ⚠️";
    if (total > 100000) insight = "Critical spending 🚨";

    res.json({
      totalExpense: total,
      count: expenses.length,
      expenses,
      insight,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 📊 EXPENSE BY CATEGORY
// =============================
export const getExpenseByCategory = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 💰 INCOME REPORT
// =============================
export const getIncomeReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Transaction.find({
      user: userId,
      type: "income",
    }).lean();

    const totalAgg = await Transaction.aggregate([
      { $match: { user: userId, type: "income" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const total = totalAgg.length > 0 ? totalAgg[0].total : 0;

    res.json({
      totalIncome: total,
      count: incomes.length,
      incomes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 📈 FINANCIAL SUMMARY
// =============================
export const getFinancialSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [incomeAgg, expenseAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const income = incomeAgg[0]?.total || 0;
    const expense = expenseAgg[0]?.total || 0;
    const savings = income - expense;

    let status = "Good 👍";
    if (savings < 0) status = "Loss ⚠️";
    if (savings > 50000) status = "Excellent 💰";

    res.json({
      totalIncome: income,
      totalExpense: expense,
      savings,
      status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 🎯 BUDGET REPORT (OPTIMIZED)
// =============================
export const getBudgetReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const budgets = await Budget.find({ user: userId }).lean();

    // 🔥 Get all expenses grouped once (OPTIMIZED)
    const expenses = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const expenseMap = {};
    expenses.forEach((item) => {
      expenseMap[item._id] = item.total;
    });

    const report = budgets.map((budget) => {
      const spentAmount = expenseMap[budget.category] || 0;
      const remaining = budget.limitAmount - spentAmount;

      let suggestion = "On track 👍";
      if (remaining < 0) suggestion = "Budget exceeded 🚨";
      else if (remaining < 1000) suggestion = "Near limit ⚠️";

      return {
        category: budget.category,
        budgetLimit: budget.limitAmount,
        spentAmount,
        remaining,
        exceeded: spentAmount > budget.limitAmount,
        suggestion,
      };
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 📅 MONTHLY TREND
// =============================
export const getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.user.id;

    const trend = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};