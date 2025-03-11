const express = require("express");
const prisma = require("../config/database");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
    try {
        const currency = await prisma.currency.findUnique({
        where: { userId: req.userId },
        });
        if (!currency) {
        return res.status(404).json({ error: "Currency not set for this user." });
        }
        res.json(currency);
    } 
    catch (error) {
        console.error("Error fetching currency:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

router.put("/", authenticate, async (req, res) => {
    const { currency } = req.body;
    if (!currency) {
        return res.status(400).json({ error: "Currency is required." });
    }
    try {
        const updatedCurrency = await prisma.currency.upsert({
        where: { userId: req.userId },
        update: { currency },
        create: { userId: req.userId, currency },
        });
        res.json(updatedCurrency);
    } 
    catch (error) {
        console.error("Error updating currency:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;
