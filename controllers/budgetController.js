import Budget from "../models/budget.js";
import Transaction from "../models/transaction.js";


// ============================
// CREATE Budget
// ============================
export const createBudget = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const budget = await Budget.create({
      ...req.body,
      user, // 👈 attach user
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// GET All Budgets (with usage)
// ============================
export const getBudgets = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const budgets = await Budget.find({ user });

    const result = await Promise.all(
      budgets.map(async (budget) => {

        const spent = await Transaction.aggregate([
          {
            $match: {
              user: user, // 👈 filter by user
              category: budget.category,
              type: "expense",
              date: {
                $gte: budget.startDate,
                $lte: budget.endDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        const totalSpent = spent[0]?.total || 0;

        const remaining = budget.limitAmount - totalSpent;

        const percentUsed =
          budget.limitAmount > 0
            ? (totalSpent / budget.limitAmount) * 100
            : 0;

        let alert = "safe";

        if (percentUsed >= 100) alert = "exceeded";
        else if (percentUsed >= 80) alert = "warning";

        return {
          ...budget._doc,
          spent: totalSpent,
          remaining,
          percentUsed: percentUsed.toFixed(1),
          alert,
        };
      })
    );

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// GET Budget Summary
// ============================
export const getBudgetSummary = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const budgets = await Budget.find({ user });

    const summary = await Promise.all(
      budgets.map(async (budget) => {

        const expenses = await Transaction.aggregate([
          {
            $match: {
              user: user, // 👈 IMPORTANT
              type: "expense",
              category: budget.category,
              date: {
                $gte: budget.startDate,
                $lte: budget.endDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: "$amount" },
            },
          },
        ]);

        const totalSpent = expenses[0]?.totalSpent || 0;

        const remaining = budget.limitAmount - totalSpent;

        const percentageUsed =
          budget.limitAmount > 0
            ? (totalSpent / budget.limitAmount) * 100
            : 0;

        let status = "Safe";

        if (percentageUsed >= 100) status = "Exceeded";
        else if (percentageUsed >= 80) status = "Warning";

        return {
          _id: budget._id,
          category: budget.category,
          limitAmount: budget.limitAmount,
          totalSpent,
          remaining,
          percentageUsed: percentageUsed.toFixed(2),
          status,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
        };
      })
    );

    res.json(summary);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// GET Single Budget
// ============================
export const getBudgetById = async (req, res) => {
  try {
    const user = req.user?._id;

    const budget = await Budget.findOne({
      _id: req.params.id,
      user,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json(budget);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// UPDATE Budget
// ============================
export const updateBudget = async (req, res) => {
  try {
    const user = req.user?._id;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user },
      req.body,
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json(budget);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// DELETE Budget
// ============================
export const deleteBudget = async (req, res) => {
  try {
    const user = req.user?._id;

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({
      message: "Budget deleted",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};