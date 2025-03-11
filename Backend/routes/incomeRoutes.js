const express = require("express");
const prisma = require("../config/database");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  const { source, category, amount, date } = req.body;
  try {
    const newIncome = await prisma.income.create({
      data: { 
        source, 
        category, 
        amount: parseFloat(amount), 
        date: new Date(date), 
        userId: req.userId 
      },
    });
    res.json(newIncome);
  } 
  catch (error) {
    res.status(400).json({ error: "Failed to add income" });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: req.userId }, 
    });
    res.json(incomes);
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to fetch incomes" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { source, category, amount, date } = req.body;
  try {
    const income = await prisma.income.findUnique({
      where: { id: parseInt(id) },
    });
    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }
    if (income.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const updatedIncome = await prisma.income.update({
      where: { id: parseInt(id) },
      data: { source, category, amount: parseFloat(amount), date: new Date(date) },
    });
    res.json(updatedIncome);
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to update income" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const income = await prisma.income.findUnique({
      where: { id: parseInt(id) },
    });
    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }
    if (income.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    await prisma.income.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Income deleted successfully" });
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to delete income" });
  }
});

module.exports = router;
