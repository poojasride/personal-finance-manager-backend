import Budget from "../models/budget.js";
import Transaction from "../models/transaction.js";
import Goal from "../models/Goal.js";
import { createNotification } from "../controllers/notificationController.js";

// ===============================
// BUDGET LIMIT CHECK
// ===============================
export const checkBudgetLimit = async (userId) => {
  try {
    const budgets = await Budget.find({ user: userId });

    for (const budget of budgets) {
      const transactions = await Transaction.find({
        user: userId,
        category: budget.category,
        type: "expense",
      });

      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

      if (totalSpent >= budget.amount) {
        await createNotification(
          userId,
          "Budget Limit Reached",
          `You exceeded your ${budget.category} budget.`,
          "budget",
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// ===============================
// UPCOMING BILL ALERT
// ===============================
export const checkUpcomingBills = async (userId) => {
  try {
    const today = new Date();
    const next3Days = new Date();

    next3Days.setDate(today.getDate() + 3);

    const upcomingBills = await Transaction.find({
      user: userId,
      type: "expense",
      nextRecurringDate: {
        $gte: today,
        $lte: next3Days,
      },
    });

    if (upcomingBills.length !== 0) {
      upcomingBills.forEach(async (bill) => {
        await createNotification(
          userId,
          "Upcoming Payment",
          `${bill.title} payment due on ${bill.nextRecurringDate.toDateString()}`,
          `expense`,
        );
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// ===============================
// GOAL PROGRESS CHECK
// ===============================
export const checkGoalProgress = async (userId) => {
  try {
    const goals = await Goal.find({ user: userId });

    for (const goal of goals) {
      const progress = (goal.savedAmount / goal.targetAmount) * 100;

      if (progress >= 100) {
        await createNotification(
          userId,
          "Goal Achieved",
          `Congratulations! You achieved your ${goal.name} goal.`,
          "goal",
        );
      } else if (progress >= 80) {
        await createNotification(
          userId,
          "Goal Progress",
          `You're 80% close to completing ${goal.name}.`,
          "goal",
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// ===============================
// RECURRING EXPENSE REMINDER
// ===============================
export const checkRecurringExpenses = async (userId) => {
  try {
    const today = new Date();

    const recurringExpenses = await Transaction.find({
      user: userId,
      isRecurring: true,
      nextRecurringDate: { $lte: today },
    });

    for (const item of recurringExpenses) {
      await createNotification(
        userId,
        "Recurring Expense Reminder",
        `${item.title} payment is due today.`,
        "expense",
      );

      // UPDATE NEXT RECURRING DATE
      let nextDate = new Date(item.nextRecurringDate);

      if (item.recurringInterval === "daily") {
        nextDate.setDate(nextDate.getDate() + 1);
      }

      if (item.recurringInterval === "weekly") {
        nextDate.setDate(nextDate.getDate() + 7);
      }

      if (item.recurringInterval === "monthly") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      if (item.recurringInterval === "yearly") {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      item.nextRecurringDate = nextDate;

      await item.save();
    }
  } catch (error) {
    console.log(error);
  }
};
