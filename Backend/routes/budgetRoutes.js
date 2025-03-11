const express = require("express");
const prisma = require("../config/database");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: parseInt(id) },
    });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    if (budget.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    await prisma.expense.deleteMany({
      where: { budgetId: parseInt(id) },
    });
    await prisma.budget.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Budget deleted successfully!" });
  } 
  catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { name, amount, emoji } = req.body;
  if (!name || !amount) {
    return res.status(400).json({ error: "Name and amount are required" });
  }
  try {
    const newBudget = await prisma.budget.create({
      data: {
        name,
        amount: parseFloat(amount),
        emoji: emoji || "💰", 
        userId: req.userId, 
      },
    });
    res.json(newBudget);
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to create budget" });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      include: { expenses: true }, 
    });
    res.json(budgets);
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: parseInt(id) },
      include: { expenses: true },
    });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    if (budget.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    res.json(budget);
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to fetch budget details" });
  }
});

router.post("/:id/expense", authenticate, async (req, res) => {
  const { id } = req.params;
  const { description, amount, date, category } = req.body;
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: parseInt(id) },
    });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    if (budget.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const newExpense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        category,
        budgetId: parseInt(id),
        userId: req.userId,
      },
    });
    res.json(newExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});

router.put("/:id/edit", authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, amount, emoji } = req.body;
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: parseInt(id) },
    });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    if (budget.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const updatedBudget = await prisma.budget.update({
      where: { id: parseInt(id) },
      data: {
        name: name || budget.name,
        amount: amount ? parseFloat(amount) : budget.amount,
        emoji: emoji || budget.emoji,
      },
    });
    res.json(updatedBudget);
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to update budget" });
  }
});
module.exports = router;
