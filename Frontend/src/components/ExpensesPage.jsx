import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CreditCard } from "lucide-react";
import API_BASE_URL from "../config";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import convertCurrency from "../convertCurrency";
const ExpensesPage = () => {
  const { darktheme } = useContext(ThemeContext);
  const { currency } = useContext(CurrencyContext);
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/expense`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const convertAmounts = async (data, currency) => {
          return await Promise.all(
            data.map(async (item) => ({
              ...item,
              amount: Number(await convertCurrency("INR", currency, item.amount)), 
            }))
          );
        };
        const convertedData = await convertAmounts(response.data, currency);
        setExpenses(convertedData);
      } 
      catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const themeStyles = darktheme
    ? {
        background: "#1e1e1e",
        text: "#ffffff",
        cardBg: "#2a2a2a",
        border: "#444",
        inputBg: "#333",
        tableHeader: "#444",
        hoverBg: "#333",
        shadow: "0px 0px 10px rgba(255,255,255,0.2)",
      }
    : {
        background: "#f9f9f9",
        text: "#212529",
        cardBg: "#ffffff",
        border: "#ced4da",
        inputBg: "#fff",
        tableHeader: "#e5e5e5",
        hoverBg: "#f3f3f3",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
      };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans min-h-screen" style={{ background: themeStyles.background, color: themeStyles.text }}>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">All Expenses</h1>
          <p className="text-lg">View and manage your transaction history</p>
        </div>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg text-lg transition duration-200"
          style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl shadow-md flex flex-col items-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
          style={{ background: themeStyles.cardBg, borderColor: themeStyles.border }}>
          <CreditCard size={32} className="text-blue-500 mb-2" />
          <h3 className="text-lg font-semibold">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">{currency.symbol} {totalExpenses.toFixed(2)}</p>
          <p className="text-gray-400">{filteredExpenses.length} transactions</p>
        </div>
      </div>
      <div className="p-4 md:pd-6 rounded-xl shadow-md" style={{ background: themeStyles.cardBg }}>
        <h2 className="text-xl font-semibold mb-2">Expense Entries</h2>
        <p className="mb-4">A detailed list of all your expenses</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr style={{ background: themeStyles.tableHeader }}>
                <th className="p-4 text-left border-b font-semibold whitespace-nowrap">Description</th>
                <th className="p-4 text-left border-b font-semibold whitespace-nowrap">Category</th>
                <th className="p-4 text-left border-b font-semibold whitespace-nowrap">Date</th>
                <th className="p-4 text-left border-b font-semibold whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense, index) => (
                  <tr key={expense.id}
                    className={`border-b transition ${index % 2 === 0 ? "bg-opacity-10" : "bg-opacity-20"}`}
                    style={{ background: themeStyles.hoverBg }}>
                    <td className="p-4 whitespace-nowrap">{expense.description}</td>
                    <td className="p-4 whitespace-nowrap">{expense.category}</td>
                    <td className="p-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="p-4 whitespace-nowrap font-bold text-red-500">{currency.symbol}  {expense.amount.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-400">No expenses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
