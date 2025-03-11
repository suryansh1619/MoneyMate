const express = require("express");
const prisma = require("../config/database");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", async (req, res) => {
  const { description, amount, date, category, userId } = req.body;
  if (!description || !amount || !date || !category || !userId) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const newExpense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount), 
        date: new Date(date), 
        category,
        userId: parseInt(userId) 
      }
    });
    res.json(newExpense);
  } 
  catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get("/", authenticate, async (req, res) => {
  const { budgetId, category, dateFrom, dateTo } = req.query;
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        budgetId: budgetId ? parseInt(budgetId) : undefined,
        category: category || undefined,
        date: {
          gte: dateFrom ? new Date(dateFrom) : undefined,
          lte: dateTo ? new Date(dateTo) : undefined,
        },
      },
      include: {
        budget: true,
      },
    });
    res.json(expenses);
  } 
  catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/:userId", authenticate, async (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) !== req.userId) {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
    });
    res.json(expenses);
  } 
  catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
