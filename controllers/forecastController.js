import Transaction from "../models/transaction.js";
import Goal from "../models/goal.js";


// Forecast savings and expenses
export const getFinancialForecast =
  async (req, res) => {

    try {

      // Monthly income avg
      const income =
        await Transaction.aggregate([
          { $match: { type: "income" } },
          {
            $group: {
              _id: {
                month: { $month: "$date" },
                year: { $year: "$date" }
              },
              total: { $sum: "$amount" }
            }
          }
        ]);

      // Monthly expense avg
      const expense =
        await Transaction.aggregate([
          { $match: { type: "expense" } },
          {
            $group: {
              _id: {
                month: { $month: "$date" },
                year: { $year: "$date" }
              },
              total: { $sum: "$amount" }
            }
          }
        ]);

      const avgIncome =
        income.reduce((a, b) => a + b.total, 0) /
        (income.length || 1);

      const avgExpense =
        expense.reduce((a, b) => a + b.total, 0) /
        (expense.length || 1);

      const monthlySavings =
        avgIncome - avgExpense;

      res.json({
        avgIncome,
        avgExpense,
        monthlySavings,
        projectedYearlySavings:
          monthlySavings * 12,
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
};

export const forecastGoalCompletion =
  async (req, res) => {

    try {

      const goal =
        await Goal.findById(req.params.id);

      const transactions =
        await Transaction.aggregate([
          { $match: { type: "income" } },
          {
            $group: {
              _id: null,
              avgIncome: {
                $avg: "$amount"
              }
            }
          }
        ]);

      const monthlySavings =
        transactions[0]?.avgIncome || 0;

      const remaining =
        goal.targetAmount -
        goal.savedAmount;

      const monthsNeeded =
        remaining / monthlySavings;

      res.json({
        monthsNeeded:
          Math.ceil(monthsNeeded),

        estimatedCompletionDate:
          new Date(
            Date.now() +
            monthsNeeded * 30 * 24 * 60 * 60 * 1000
          ),
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
};