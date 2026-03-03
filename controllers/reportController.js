import Transaction from "../models/transaction.js";
import Budget from "../models/budget.js";


// =============================
// Expense Report
// =============================
export const getExpenseReport = async (req, res) => {
    try {

        const { startDate, endDate, category } = req.query;

        let filter = { type: "expense" };

        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (category) {
            filter.category = category;
        }

        const expenses = await Transaction.find(filter);

        const totalExpense = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        res.json({
            totalExpense: totalExpense[0]?.total || 0,
            count: expenses.length,
            expenses
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// =============================
// Expense Category Chart Data
// =============================
export const getExpenseByCategory = async (req, res) => {
    try {

        const data = await Transaction.aggregate([
            { $match: { type: "expense" } },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        res.json(data);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// =============================
// Income Report
// =============================
export const getIncomeReport = async (req, res) => {

    try {

        const incomes = await Transaction.find({ type: "income" });

        const totalIncome = await Transaction.aggregate([
            { $match: { type: "income" } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        res.json({
            totalIncome: totalIncome[0]?.total || 0,
            count: incomes.length,
            incomes
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};


// =============================
// Financial Summary
// =============================
export const getFinancialSummary = async (req, res) => {

    try {

        const totalIncome = await Transaction.aggregate([
            { $match: { type: "income" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalExpense = await Transaction.aggregate([
            { $match: { type: "expense" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const income = totalIncome[0]?.total || 0;
        const expense = totalExpense[0]?.total || 0;

        res.json({
            totalIncome: income,
            totalExpense: expense,
            savings: income - expense
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};


// =============================
// Budget Report
// =============================
export const getBudgetReport = async (req, res) => {

    try {

        const budgets = await Budget.find();

        const report = [];

        for (let budget of budgets) {

            const spent = await Transaction.aggregate([
                {
                    $match: {
                        type: "expense",
                        category: budget.category
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            const spentAmount = spent[0]?.total || 0;

            report.push({
                category: budget.category,
                budgetLimit: budget.limitAmount,
                spentAmount,
                remaining: budget.limitAmount - spentAmount,
                exceeded: spentAmount > budget.limitAmount
            });
        }

        res.json(report);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};


// =============================
// Monthly Expense Trend (Chart)
// =============================
export const getMonthlyTrend = async (req, res) => {

    try {

        const trend = await Transaction.aggregate([
            { $match: { type: "expense" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json(trend);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};