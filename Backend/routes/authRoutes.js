const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
    res.json({ token, userId: user.id, username: user.username, email: user.email });
  } 
  catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUsername = await prisma.user.findUnique({ 
      where: { username } 
    });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is not available" });
    }
    const existingEmail = await prisma.user.findUnique({ 
      where: { email } 
    });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`;
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, profilePicture },
    });
    const newUserCurrency = await prisma.currency.create({
      data: { userId: newUser.id, currency: "INR" },
    });

    const newUserTheme = await prisma.theme.create({
      data: { userId: newUser.id, theme: "light" },
    });
    res.json({ message: "User registered successfully!" });
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while registering user" });
  }
});


router.get("/users/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) !== Number(req.userId)) {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});



router.put("/users/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  if (parseInt(id) !== Number(req.userId)) {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  try {
    const existingUser = await prisma.user.findUnique({
      where: { OR: [{ username }, { email }], NOT: { id: parseInt(id) } },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { username, email },
    });
    res.json(updatedUser);
  } 
  catch (error) {
    res.status(400).json({ error: "Failed to update user data" });
  }
});


router.put("/users/:id/password", authenticate, async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  if (parseInt(id) !== Number(req.userId)) {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch=await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword },
    });
    res.json({ message: "Password updated successfully!" });
  } 
  catch (error) {
    res.status(400).json({ error: "Failed to update password" });
  }
});

router.delete("/users/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (parseInt(id) !== Number(req.userId)) {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  try {
    const user = await prisma.user.findUnique({
      where:{id:parseInt(id)},
    })
    if(!user){
      return res.status(404).json({error:"User not found"});
    }
    const isMatch=await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password. Account deletion failed." });
    }
    await prisma.expense.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.income.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.budget.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Account and all related data deleted successfully!" });
  } 
  catch (error) {
    console.error("Failed to delete account:", error);
    res.status(500).json({ error: "Failed to delete account." });
  }
});

router.post("/logout", authenticate, (req, res) => {
  res.json({ message: "Logged out successfully" });
});


module.exports = router;
