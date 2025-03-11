const express = require("express");
const prisma = require("../config/database");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
    });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    if (expense.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Transaction deleted successfully" });
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

module.exports = router;
