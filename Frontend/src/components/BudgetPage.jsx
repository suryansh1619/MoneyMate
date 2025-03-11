import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MoreVertical, Edit, Trash } from "lucide-react";
import CreateBudgetDialog from "./CreateBudgetDialog";
import API_BASE_URL from "../config";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrencyContext} from "../contexts/Currencycontext";
import convertCurrency from "../convertCurrency";
import {useConfirmDialog} from "./ConfirmDialog";

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();
  const { darktheme } = useContext(ThemeContext);
  const { currency } = useContext(CurrencyContext);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/budget`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const convertAmounts = async (data, currency) => {
        return await Promise.all(
          data.map(async (item) => {
            const convertedMainAmount = Number(await convertCurrency("INR", currency, item.amount));
            const convertedExpenses = await Promise.all(
              item.expenses.map(async (expense) => ({
                ...expense,
                amount: Number(await convertCurrency("INR", currency, expense.amount)),
              }))
            );
            return {
              ...item,
              amount: convertedMainAmount, 
              expenses: convertedExpenses,
            };
          })
        );
      };
      const convertedData = await convertAmounts(response.data, currency);
      setBudgets(convertedData);
    } 
    catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const handleBudgetClick = (budgetId) => {
    navigate(`/budget/${budgetId}`);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
    setOpenMenu(null);
  };

  const handleDeleteBudget = async (budgetId) => {
    const confirmDelete = await confirm(
      "Delete Budget",
      "Are you sure you want to delete this budget?"
    );
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/budget/${budgetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBudgets();
    } 
    catch (error) {
      console.error("Error deleting budget:", error);
    }
    setOpenMenu(null);
  };

  const themeStyles = darktheme
    ? {
        background: "#1e1e1e",
        text: "#ffffff",
        cardBg: "#2a2a2a",
        border: "#444",
        buttonBg: "#0d6efd",
        progressBar: "bg-green-500",
        hoverBg: "#333",
        menuBg: "#2a2a2a",
        shadow: "0px 0px 10px rgba(255,255,255,0.2)",
      }
    : {
        background: "#f9f9f9",
        text: "#212529",
        cardBg: "#ffffff",
        border: "#ced4da",
        buttonBg: "#000",
        progressBar: "bg-green-600",
        hoverBg: "#f3f3f3",
        menuBg: "#ffffff",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
      };

  return (
    <div className="min-h-screen w-full p-6 font-sans" style={{ background: themeStyles.background, color: themeStyles.text }}>
      <ConfirmDialog />
      <div className="max-w-7xl mx-auto">
        <h1 
          className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            My Budgets</h1>
        <p className="text-center mb-6 text-lg">
          Manage your budgets effectively. Create, track, and monitor your expenses effortlessly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition duration-300 cursor-pointer text-center hover:shadow-md w-full"
            style={{ background: themeStyles.cardBg, borderColor: themeStyles.border, boxShadow: themeStyles.shadow }}
            onClick={() => setIsDialogOpen(true)}
          >
            <span className="text-5xl font-bold" style={{ color: themeStyles.buttonBg }}>+</span>
            <p className="text-lg font-semibold mt-2">Create New Budget</p>
            <p className="text-sm">Add a new budget to track your expenses</p>
          </div>
          {budgets.map((budget) => {
            const expenses = budget.expenses || [];
            const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            const remainingBudget = budget.amount - totalSpent;
            const percentageSpent = (totalSpent / budget.amount) * 100;

            return (
              <div
                key={budget.id}
                className="p-6 border rounded-lg text-left relative cursor-pointer shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl w-full"
                style={{ background: themeStyles.cardBg, borderColor: themeStyles.border, boxShadow: themeStyles.shadow }}
                onClick={() => handleBudgetClick(budget.id)}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-5xl">{budget.emoji}</span>
                  <span className="text-lg font-semibold flex-grow ml-2">{budget.name}</span>
                  <span className="text-md font-bold">{currency.symbol} {budget.amount.toFixed(2)}</span>
                  <div className="relative">
                    <MoreVertical
                      size={22}
                      className="cursor-pointer"
                      style={{ color: themeStyles.text }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === budget.id ? null : budget.id);
                      }}
                    />
                    {openMenu === budget.id && (
                      <div className="absolute top-full right-0 border rounded-lg shadow-lg w-36 z-10"
                        style={{ background: themeStyles.menuBg, borderColor: themeStyles.border }}>
                        <div
                          className="p-3 flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100"
                          style={{ color: themeStyles.text }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBudget(budget);
                          }}
                        >
                          <Edit size={16} /> Edit
                        </div>
                        <div
                          className="p-3 flex items-center gap-2 cursor-pointer text-red-500 hover:bg-red-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBudget(budget.id);
                          }}
                        >
                          <Trash size={16} /> Delete
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentageSpent}%`, backgroundColor: percentageSpent > 80 ? "#f87171" : "#22c55e" }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <p className="text-red-500">Spent: {currency.symbol} {totalSpent.toFixed(2)}</p>
                  <p className="text-green-500">Remaining: {currency.symbol} {remainingBudget.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isDialogOpen && (
        <CreateBudgetDialog
          onClose={() => {
            setIsDialogOpen(false);
            setEditingBudget(null);
          }}
          fetchBudgets={fetchBudgets}
          editingBudget={editingBudget}
        />
      )}
    </div>
  );
};

export default BudgetPage;
