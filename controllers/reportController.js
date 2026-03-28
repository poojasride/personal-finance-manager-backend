export const getExpenseReport = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); // ✅ FIX
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

    console.log("FILTER:", filter); // 🧪 DEBUG

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

    console.log("EXPENSES:", expenses); // 🧪 DEBUG

    const total = totalAgg[0]?.total || 0;

    res.json({
      totalExpense: total,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};