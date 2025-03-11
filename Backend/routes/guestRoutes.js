const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/guest-login", async (req, res) => {
  try {
    const guestUsername = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    const guestUser = await prisma.user.create({
      data: {
        username: guestUsername,
        email: null, 
        password: "", 
        profilePicture: `https://ui-avatars.com/api/?name=${guestUsername}&background=random&color=fff`,
        isGuest: true, 
      },
    });
    const token = jwt.sign({ userId: guestUser.id, isGuest: true }, process.env.JWT_SECRET, {
      expiresIn: "1h", 
    });
    res.json({ token, userId: guestUser.id, username: guestUser.username });
  } 
  catch (error) {
    console.error("Guest login failed:", error);
    res.status(500).json({ error: "Failed to create guest account" });
  }
});


router.delete("/logout", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.isGuest) {
      await prisma.expense.deleteMany({ where: { userId } });
      await prisma.budget.deleteMany({ where: { userId } });
      await prisma.income.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
      return res.json({ message: "Guest session ended. Data deleted." });
    }
    res.json({ message: "Logged out successfully." });
  } 
  catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to log out" });
  }
});

module.exports =router;