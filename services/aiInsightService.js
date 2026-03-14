export const generateFinancialInsight = (transactions, income) => {

  const categoryTotals = {};

  // Calculate total spending per category
  transactions.forEach((t) => {
    if (t.type === "expense") {
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  // Find highest spending category
  let topCategory = "";
  let maxAmount = 0;

  for (const category in categoryTotals) {
    if (categoryTotals[category] > maxAmount) {
      maxAmount = categoryTotals[category];
      topCategory = category;
    }
  }

  const percent = Math.round((maxAmount / income) * 100);

  return `You spent ${percent}% of your income on ${topCategory} this month. Consider reducing this expense to improve savings.`;
};