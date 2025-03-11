import React, { useState, useEffect, useContext } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { ArrowUp, ArrowDown, PiggyBank } from "lucide-react";
import API_BASE_URL from "../config";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrencyContext } from "../contexts/Currencycontext";
import convertCurrency from "../convertCurrency";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { darktheme } = useContext(ThemeContext);
  const { currency } = useContext(CurrencyContext);
  // console.log(darktheme);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    budgetUtilization: { used: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
  const [transactions, setTransactions] = useState([]);
  
  const themeStyles = darktheme
    ? {
        background: "#1e1e1e",
        text: "#ffffff",
        cardBg: "#2a2a2a",
        border: "#444",
        tableHeader: "#333",
        hoverBg: "#333",
        shadow: "0px 0px 10px rgba(255,255,255,0.2)",
        gridColor: "#555", 
        chartTextColor: "#fff",
      }
    : {
        background: "#f9f9f9",
        text: "#212529",
        cardBg: "#ffffff",
        border: "#ced4da",
        tableHeader: "#e5e5e5",
        hoverBg: "#f3f3f3",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
        gridColor: "#ddd",  
        chartTextColor: "#333",
      };

      const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { color: themeStyles.chartTextColor },
          },
          title: {
            display: true,
            text: "Monthly Cash Flow",
            font: { size: 16 },
            color: themeStyles.chartTextColor,
          },
          tooltip: {
            callbacks: { label: (context) => `${currency.symbol} ${context.parsed.y.toFixed(2)}` },
          },
        },
        scales: {
          x: {
            ticks: { color: themeStyles.chartTextColor },
            grid: { color: themeStyles.gridColor },
          },
          y: {
            ticks: { color: themeStyles.chartTextColor },
            grid: { color: themeStyles.gridColor },
          },
        },
      };

      const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: themeStyles.chartTextColor },
          },
          title: {
            display: true,
            text: "Spending Categories",
            font: { size: 16 },
            color: themeStyles.chartTextColor,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                return `${context.label}: ${currency.symbol} ${context.parsed} (${((context.parsed / total) * 100).toFixed(1)}%)`;
              },
            },
          },
        },
      };
    
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const [summaryRes, barRes, pieRes, expensesRes, incomesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/chart/summary`, { headers }),
          fetch(`${API_BASE_URL}/chart/chart-data`, { headers }),
          fetch(`${API_BASE_URL}/chart/pie-chart-data`, { headers }),
          fetch(`${API_BASE_URL}/expense`, { headers }),
          fetch(`${API_BASE_URL}/income`, { headers }),
        ]);
        const summaryData = await summaryRes.json();
        const convertedTotalIncome = await convertCurrency("INR", currency, summaryData.totalIncome);
        const convertedTotalExpenses = await convertCurrency("INR", currency, summaryData.totalExpenses);
        const convertedBalance = await convertCurrency("INR", currency, summaryData.balance);
        const convertedUsedBudget = await convertCurrency("INR", currency, summaryData.budgetUtilization.used);
        const convertedTotalBudget = await convertCurrency("INR", currency, summaryData.budgetUtilization.total);
        setSummary({
          totalIncome: convertedTotalIncome,
          totalExpenses: convertedTotalExpenses,
          balance: convertedBalance,
          budgetUtilization: { used: convertedUsedBudget, total: convertedTotalBudget },
        });
        const barData = await barRes.json();
        const convertedBarIncome = await convertCurrency("INR", currency, barData.income);
        const convertedBarExpenses = await convertCurrency("INR", currency, barData.expenses);
        setBarChartData({
          labels: barData.labels,
          datasets: [
            { label: "Income", data: [Number(convertedBarIncome)] , backgroundColor: "rgba(75, 192, 192, 0.6)" },
            { label: "Expenses", data: [Number(convertedBarExpenses)], backgroundColor: "rgba(255, 99, 132, 0.6)" },
          ],
        });
        const pieData = await pieRes.json();
        const convertedAmounts = await Promise.all(
          pieData.amounts.map(async (amount) =>Number(await convertCurrency("INR", currency, amount)))
        );
        setPieChartData({
          labels: pieData.categories,
          datasets: [{ data: convertedAmounts, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"] }],
        });
        const expenses = await expensesRes.json();
        const incomes = await incomesRes.json();
        const allTransactions = [...expenses.map(e => ({ ...e, type: "expense" })), ...incomes.map(i => ({ ...i, type: "income" }))]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);
        const convertedTransactions = await Promise.all(
          allTransactions.map(async (transaction) => ({
            ...transaction,
            amount: Number(await convertCurrency("INR", currency, transaction.amount))
          }))
        );
        setTransactions(convertedTransactions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">🔄 Loading...</div>;
  }
  return (
    <div className="p-8 min-h-screen" style={{ background: themeStyles.background, color: themeStyles.text }}>
      <h1 
        className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Financial Dashboard</h1>
      <p className="text-lg leading-relaxed">Track income, expenses, and budgets in one place.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {[
          { label: "Total Income", value: summary.totalIncome, color: "text-green-500", icon: <ArrowUp size={20} /> },
          { label: "Total Expenses", value: summary.totalExpenses, color: "text-red-500", icon: <ArrowDown size={20} /> },
          { label: "Net Balance", value: summary.balance, color: summary.balance >= 0 ? "text-green-500" : "text-red-500", icon: summary.balance >= 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} /> },
          { label: "Budget Used", value: `${((summary.budgetUtilization.used / summary.budgetUtilization.total) * 100).toFixed(1) || 0}%`, color: "text-gray-500", icon: <PiggyBank size={20} /> },
        ].map((item, index) => (
          <div key={index} className="p-6 rounded-xl shadow-md border transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{ background: themeStyles.cardBg, borderColor: themeStyles.border }}>
            <h3 className="mb-2">{item.label}</h3>
            <p className={`text-2xl font-semibold ${item.color}`}>{currency.symbol} {item.value.toLocaleString()}</p>
            <p className="flex items-center gap-2 text-sm mt-2">{item.icon} This Month</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div 
          className="p-6 rounded-xl shadow-md" 
          style={{ background: themeStyles.cardBg }}>
          <h2>Income vs Expenses</h2>
          <div 
            className="relative h-[300px]">
              <Bar 
                data={barChartData} 
                options={barChartOptions} /></div>
        </div>
        <div 
          className="p-6 rounded-xl shadow-md" 
          style={{ background: themeStyles.cardBg }}>
          <h2>Expense Breakdown</h2>
          <div 
            className="relative h-[300px]">
              <Pie 
                data={pieChartData} 
                options={pieChartOptions}/></div>
        </div>
      </div>
      <div 
        className="p-6 rounded-xl shadow-md mt-12" 
        style={{ background: themeStyles.cardBg }}>
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-center py-4">No recent transactions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr style={{ background: themeStyles.tableHeader }}>
                  <th className="p-4 text-left border-b font-semibold">Date</th>
                  <th className="p-4 text-left border-b font-semibold">Description</th>
                  <th className="p-4 text-left border-b font-semibold">Category</th>
                  <th className="p-4 text-left border-b font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="border-b">
                    <td className="p-4">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="p-4">{transaction.description}</td>
                    <td className="p-4">{transaction.category}</td>
                    <td className={`p-4 font-semibold ${transaction.type === "expense" ? "text-red-500" : "text-green-500"}`}>{currency.symbol} {transaction.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
