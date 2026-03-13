import Budget from "../models/budget.js";
import Transaction from "../models/transaction.js";


// CREATE Budget
export const createBudget = async (req, res) => {
  try {
    const budget = await Budget.create(req.body);

    res.status(201).json(budget);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET All Budgets with usage monitoring
export const getBudgets = async (req, res) => {
  try {

    const budgets = await Budget.find();

    const result = await Promise.all(
      budgets.map(async (budget) => {

        const spent = await Transaction.aggregate([
          {
            $match: {
              category: budget.category.trim(),
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

        const remaining =
          budget.limitAmount - totalSpent;

        const percentUsed =
          (totalSpent / budget.limitAmount) * 100;

        let alert = "safe";

        if (percentUsed >= 100)
          alert = "exceeded";
        else if (percentUsed >= 80)
          alert = "warning";

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

export const getBudgetSummary = async (req, res) => {
  try {
    const budgets = await Budget.find();

    const summary = await Promise.all(
      budgets.map(async (budget) => {
        // Total expense for this category within budget period
        const expenses = await Transaction.aggregate([
          {
            $match: {
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

        const totalSpent = expenses.length > 0 ? expenses[0].totalSpent : 0;

        const remaining = budget.limitAmount - totalSpent;

        const percentageUsed =
          (totalSpent / budget.limitAmount) * 100;

        let status = "Safe";

        if (percentageUsed >= 100) {
          status = "Exceeded";
        } else if (percentageUsed >= 80) {
          status = "Warning";
        }

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



// GET Single Budget
export const getBudgetById = async (req, res) => {
  try {

    const budget =
      await Budget.findById(req.params.id);

    res.json(budget);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE Budget
export const updateBudget = async (req, res) => {
  try {

    const budget =
      await Budget.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(budget);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE Budget
export const deleteBudget = async (req, res) => {
  try {

    await Budget.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Budget deleted",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};