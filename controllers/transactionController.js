import Transaction from "../models/transaction.js";
import Budget from "../models/budget.js";

import {
  checkBudgetLimit,
  checkGoalProgress,
} from "../services/notificationService.js";

// CREATE Transaction
export const createTransaction = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      type,
      category,
      date,
      isRecurring,
      recurringInterval,
    } = req.body;

    let nextRecurringDate = null;

    // Handle recurring logic
    if (isRecurring && recurringInterval) {
      const baseDate = date ? new Date(date) : new Date();

      switch (recurringInterval) {
        case "daily":
          nextRecurringDate = new Date(
            baseDate.setDate(baseDate.getDate() + 1),
          );
          break;

        case "weekly":
          nextRecurringDate = new Date(
            baseDate.setDate(baseDate.getDate() + 7),
          );
          break;

        case "monthly":
          nextRecurringDate = new Date(
            baseDate.setMonth(baseDate.getMonth() + 1),
          );
          break;

        case "yearly":
          nextRecurringDate = new Date(
            baseDate.setFullYear(baseDate.getFullYear() + 1),
          );
          break;

        default:
          nextRecurringDate = null;
      }
    }

    const newTransaction = await Transaction.create({
      user: req.user._id,
      title,
      description,
      amount,
      type,
      category,
      date,
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval : null,
      nextRecurringDate,
    });

    // After saving transaction
    if (newTransaction.type === "expense") {
      const budget = await Budget.findOne({
        category: newTransaction.category,
        startDate: { $lte: newTransaction.date },
        endDate: { $gte: newTransaction.date },
      });

      if (budget) {
        const totalExpense = await Transaction.aggregate([
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

        const spent = totalExpense.length > 0 ? totalExpense[0].totalSpent : 0;

        if (spent > budget.limitAmount) {
          console.log("🚨 Budget Exceeded!");
        }
      }
    }

    // ADD THIS CODE
    await checkBudgetLimit(req.user._id);
    await checkGoalProgress(req.user._id);

    res.status(201).json({
      success: true,
      data: newTransaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET All Transactions with filters
export const getTransactions = async (req, res) => {
  try {
    const { category, type, startDate, endDate } = req.query;

    const user = req.user?._id; // 👈 get logged-in user

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let filter = { user }; // 👈 IMPORTANT (filter by user)

    if (category) filter.category = category;

    if (type) filter.type = type;

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET Single Transaction
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction)
      return res.status(404).json({
        message: "Transaction not found",
      });

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE Transaction
export const updateTransaction = async (req, res) => {
  try {
    const { date, isRecurring, recurringInterval } = req.body;

    let nextRecurringDate = null;

    // Handle recurring logic
    if (isRecurring && recurringInterval) {
      const baseDate = date ? new Date(date) : new Date();

      switch (recurringInterval) {
        case "daily":
          nextRecurringDate = new Date(baseDate);
          nextRecurringDate.setDate(nextRecurringDate.getDate() + 1);
          break;

        case "weekly":
          nextRecurringDate = new Date(baseDate);
          nextRecurringDate.setDate(nextRecurringDate.getDate() + 7);
          break;

        case "monthly":
          nextRecurringDate = new Date(baseDate);
          nextRecurringDate.setMonth(nextRecurringDate.getMonth() + 1);
          break;

        case "yearly":
          nextRecurringDate = new Date(baseDate);
          nextRecurringDate.setFullYear(nextRecurringDate.getFullYear() + 1);
          break;

        default:
          nextRecurringDate = null;
      }
    }

    const updateData = {
      ...req.body,
      nextRecurringDate,
    };

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    // After saving transaction
    if (transaction.type === "expense") {
      const budget = await Budget.findOne({
        category: transaction.category,
        startDate: { $lte: transaction.date },
        endDate: { $gte: transaction.date },
      });

      if (budget) {
        const totalExpense = await Transaction.aggregate([
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

        const spent = totalExpense.length > 0 ? totalExpense[0].totalSpent : 0;

        if (spent > budget.limitAmount) {
          console.log("🚨 Budget Exceeded!");
        }
      }
    }

    // ADD THIS CODE
    await checkBudgetLimit(req.user._id);
    await checkGoalProgress(req.user._id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE Transaction
export const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Transaction deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategorySummary = async (req, res) => {
  const result = await Transaction.aggregate([
    {
      $match: { type: "expense" },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  res.json(result);
};

export const getMonthlyExpenses = async (req, res) => {
  const result = await Transaction.aggregate([
    {
      $match: { type: "expense" },
    },
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

  res.json(result);
};
