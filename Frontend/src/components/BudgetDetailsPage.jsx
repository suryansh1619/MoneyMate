import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash, PlusCircle } from "lucide-react";
import API_BASE_URL from "../config";
import AddTransactionDialog from "./AddTransactionDialog";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrencyContext } from "../contexts/Currencycontext";
import convertCurrency from "../convertCurrency";
import MessageDialog from "./MessageDialog";
import {useConfirmDialog} from "./ConfirmDialog";

const BudgetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darktheme } = useContext(ThemeContext);
  const { currency } = useContext(CurrencyContext);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    customCategory: "",
  });

  const categories = [
    "Groceries",
    "Rent",
    "Transportation",
    "Utilities",
    "Entertainment",
    "Dining Out",
    "Healthcare",
    "Education",
    "Savings",
    "Other",
  ];

  useEffect(() => {
    fetchBudgetDetails();
  }, []);

  const fetchBudgetDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/budget/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const convertAmounts = async (data, currency) => {
        const convertedMainAmount = Number(await convertCurrency("INR", currency, data.amount));
        const convertedExpenses = await Promise.all(
          data.expenses.map(async (expense) => ({
            ...expense,
            amount: Number(await convertCurrency("INR", currency, expense.amount)),
          }))
        );
        return {
          ...data,
          amount: convertedMainAmount, 
          expenses:convertedExpenses,
        };
      };
      const convertedData = await convertAmounts(response.data, currency);
      setBudget(convertedData);
      setExpenses(convertedData.expenses);
    } 
    catch (error) {
      console.error("Error fetching budget details:", error);
    }
  };

  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", type:""});

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const category = formData.category === "Other" ? formData.customCategory : formData.category;
      const convertedExpenseAmount = await convertCurrency(currency,"INR",formData.amount);
      const expenseAmount = parseFloat(convertedExpenseAmount);
      const convertedTotalSpentAmount = await convertCurrency(currency,"INR",expenses.reduce((sum, expense) => sum + expense.amount, 0));
      const totalSpent = parseFloat(convertedTotalSpentAmount);
      const convertedBudgetAmount=await convertCurrency(currency,"INR",budget.amount);
      const remainingBudget = parseFloat(convertedBudgetAmount)-totalSpent;
      if (expenseAmount > remainingBudget) {
        setDialog({ isOpen: true, title: "Error", message: `⚠️ Cannot add expense! Only ${currency.symbol} ${remainingBudget.toFixed(2)} remaining.` ,type:"error"});
        return;
      }
      await axios.post(
        `${API_BASE_URL}/budget/${budget.id}/expense`,
        { ...formData, category, amount: expenseAmount },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchBudgetDetails();
      setIsTransactionModalOpen(false);
      setFormData({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        customCategory: "",
      });
    } 
    catch (error) {
      alert("Error adding expense: " + error.message);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const confirmDelete = await confirm(
      "Delete Expense",
      "Are you sure you want to delete this expense?"
    );
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/transaction/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== expenseId));
    } 
    catch (error) {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense: " + (error.response?.data?.error || error.message));
    }
  };

  if (!budget) return <div className="text-center text-xl mt-10">Loading...</div>;

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = budget.amount - totalSpent;
  const percentageUsed = ((totalSpent / budget.amount) * 100).toFixed(1);

  const themeStyles = darktheme
    ? {
        background: "#1e1e1e",
        text: "#ffffff",
        border: "#444",
        cardBg: "#2a2a2a",
        inputBg: "#333",
        buttonBg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
        progressBar: "bg-green-500",
      }
    : {
        background: "#ffffff",
        text: "#000",
        border: "#ced4da",
        cardBg: "#ffffff",
        inputBg: "#fff",
        buttonBg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
        progressBar: "bg-green-600",
      };

  return (
    <div 
      className="p-6 max-w-5xl mx-auto min-h-screen" 
      style={{ background: themeStyles.background, color: themeStyles.text }}>
        <ConfirmDialog />
        <MessageDialog
          isOpen={dialog.isOpen}
          onClose={() => setDialog(false)}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
        />
      <div className="flex justify-between items-center mb-6">
        <button
          className="py-2 px-5 rounded-md transition"
          style={{ background: themeStyles.border, color: themeStyles.text }}
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <button
          className="flex items-center gap-2 py-2 px-5 rounded-md transition"
          style={{ background:themeStyles.buttonBg , color:themeStyles.text }}
          onClick={() => setIsTransactionModalOpen(true)}
        >
          <PlusCircle size={20} /> Add Transaction
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-5">{budget.emoji} {budget.name} Budget</h1>
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Total Budget", value: budget.amount, bg: themeStyles.cardBg },
          { label: "Spent", value: totalSpent, bg: "bg-red-500 text-white" },
          { label: "Remaining", value: remainingBudget, bg: "bg-green-500 text-white" },
        ].map((box, index) => (
          <div 
            key={index} 
            className={`p-5 border rounded-lg text-center shadow-lg ${box.bg}`}>
            <p>{box.label}</p>
            <h3 className="mt-2 text-2xl font-bold">{currency.symbol} {box.value.toFixed(2)}</h3>
          </div>
        ))}
      </div>
      <div className="my-6">
        <h2 className="text-lg font-bold mb-2">Budget Usage</h2>
        <div className="w-full bg-gray-300 rounded-full h-6">
          <div 
            className={`h-full rounded-full transition-all duration-300 ease-in-out ${themeStyles.progressBar}`} 
            style={{ width: `${percentageUsed}%` }}></div>
        </div>
        <div className="flex justify-between mt-2">
          <p>Used: {percentageUsed}%</p>
          <p>{currency.symbol} {totalSpent.toFixed(2)} out of {currency.symbol} {budget.amount.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="space-y-4">
            {expenses.slice(0).reverse().map((expense) => (
              <div 
                key={expense.id} 
                className="flex justify-between items-center p-4 border rounded-lg shadow-md" 
                style={{ background: themeStyles.cardBg }}>
                <div>
                  <h3 className="text-lg font-bold">{expense.description}</h3>
                  <p className="text-gray-400">{expense.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold">{currency.symbol} {expense.amount.toFixed(2)}</h3>
                  <Trash 
                    className="cursor-pointer text-red-500 hover:text-red-700" 
                    onClick={() => handleDeleteExpense(expense.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddTransactionDialog
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleAddExpense}
        categories={categories}
      />
    </div>
  );
};

export default BudgetDetailsPage;
