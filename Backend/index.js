const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const authRoutes = require("./routes/authRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const chartRoutes = require("./routes/chartRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const guestRoutes = require("./routes/guestRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const themeRoutes = require('./routes/themeRoutes')
const currencyRoutes = require('./routes/currencyRoutes')

app.use(cors({
  origin: ["https://budgethub.vercel.app", "http://localhost:5173"],
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
}));

app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is Running!");
});

app.use("/auth", authRoutes);
app.use("/budget", budgetRoutes);
app.use("/chart", chartRoutes);
app.use("/expense", expenseRoutes);
app.use("/guest", guestRoutes);
app.use("/income", incomeRoutes);
app.use("/transaction", transactionRoutes);
app.use("/theme", themeRoutes);
app.use("/currency", currencyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
