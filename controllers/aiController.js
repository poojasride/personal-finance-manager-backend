import Transaction from "../models/transaction.js";
import { generateFinancialInsight } from "../services/aiInsightService.js";

export const getAIInsight = async (req, res) => {
  try {

    const userId = req.user.id;

    const transactions = await Transaction.find({ user: userId });

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const insight = generateFinancialInsight(transactions, income);

    res.json({ insight });

  } catch (error) {
    res.status(500).json({ error: "Failed to generate insight" });
  }
};