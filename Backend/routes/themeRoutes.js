const express = require("express");
const prisma = require("../config/database");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
    try {
        const theme = await prisma.theme.findUnique({
        where: { userId: req.userId },
    });
    if (!theme) {
        return res.status(404).json({ error: "Theme not set for this user." });
    }
    res.json(theme);
    } 
    catch (error) {
        console.error("Error fetching theme:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

router.put("/", authenticate, async (req, res) => {
    const { theme } = req.body;
    if (!theme) {
    return res.status(400).json({ error: "Theme is required." });
    }
    try {
    const updatedTheme = await prisma.theme.upsert({
        where: { userId: req.userId },
        update: { theme },
        create: { userId: req.userId, theme },
    });
    res.json(updatedTheme);
    } 
    catch (error) {
        console.error("Error updating theme:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;