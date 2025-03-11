const express = require("express");
const prisma = require("../config/database");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/summary", authenticate, async (req, res) => {
  try {
    const userId = req.userId; 
    const totalIncome = await prisma.income.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const totalExpenses = await prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const budgets = await prisma.budget.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const usedBudget = totalExpenses._sum.amount || 0;
    const totalBudget = budgets._sum.amount || 0;
    const balance = (totalIncome._sum.amount || 0) - usedBudget;
    res.json({
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: usedBudget,
      balance,
      budgetUtilization: { used: usedBudget, total: totalBudget },
    });
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to fetch summary data" });
  }
});

router.get("/chart-data", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const incomeData = await prisma.income.groupBy({
      by: ["date"],
      where: { userId },
      _sum: { amount: true },
      orderBy: { date: "asc" }
    });
    const expenseData = await prisma.expense.groupBy({
      by: ["date"],
      where: { userId },
      _sum: { amount: true },
      orderBy: { date: "asc" }
    });
    const labels = [...new Set([...incomeData, ...expenseData].map(entry =>
      new Date(entry.date).toISOString().slice(0, 7) 
    ))];
    labels.sort();
    const income = labels.map(month =>
      incomeData
        .filter(entry => new Date(entry.date).toISOString().slice(0, 7) === month)
        .reduce((sum, entry) => sum + entry._sum.amount, 0)
    );
    const expenses = labels.map(month =>
      expenseData
        .filter(entry => new Date(entry.date).toISOString().slice(0, 7) === month)
        .reduce((sum, entry) => sum + entry._sum.amount, 0)
    );
    const formattedLabels = labels.map(label => {
      const [year, month] = label.split("-");
      return new Date(year, month - 1).toLocaleString("default", { month: "short", year: "numeric" });
    });
    res.json({ labels: formattedLabels, income, expenses });
  } 
  catch (error) {
    console.error("Chart Data Error:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

router.get("/pie-chart-data", authenticate, async (req, res) => {
  try {
    const userId = req.userId; 
    const categoryTotals = await prisma.expense.groupBy({
      by: ["category"],
      where: { userId },
      _sum: { amount: true },
    });
    const categories = categoryTotals.map((item) => item.category);
    const amounts = categoryTotals.map((item) => item._sum.amount);
    res.json({ categories, amounts });
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to fetch pie chart data" });
  }
});

module.exports = router;
