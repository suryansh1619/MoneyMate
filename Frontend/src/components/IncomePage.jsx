import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Plus, Edit, Trash2 } from "lucide-react";
import API_BASE_URL from "../config";
import AddIncomeDialog from "./AddIncomeDialog"; 
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import convertCurrency from "../convertCurrency";
import {useConfirmDialog} from "./ConfirmDialog";

const IncomePage = () => {
  const { darktheme } = useContext(ThemeContext);
  const { currency } = useContext(CurrencyContext);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [filter, setFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/income`, {
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
      setIncomes(convertedData);
      setTotalIncome(convertedData.reduce((sum, income) => sum + income.amount, 0));
    } 
    catch (error) {
      console.error("Error fetching incomes:", error);
    }
  };

  const handleSaveIncome = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const convertedAmount = await convertCurrency(currency,"INR",formData.amount);
      const payload = {
        ...formData,
        amount: parseFloat(convertedAmount),
        date: new Date(formData.date).toISOString(),
      };
      if (editingIncome) {
        await axios.put(`${API_BASE_URL}/income/${editingIncome.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } 
      else {
        await axios.post(`${API_BASE_URL}/income`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchIncomes();
      setIsDialogOpen(false);
      setEditingIncome(null);
    } 
    catch (error) {
      console.error("Error saving income:", error);
    }
  };

  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setIsDialogOpen(true);
  };

  const handleDeleteIncome = async (id) => {
    const confirmDelete = await confirm(
      "Delete Income",
      "Are you sure you want to delete this income?"
    );
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/income/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIncomes();
    } 
    catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredIncomes = filter
    ? incomes.filter((income) => income.category === filter)
    : incomes;

  const themeStyles = darktheme
    ? {
        background: "#1e1e1e",
        text: "#ffffff",
        cardBg: "#2a2a2a",
        border: "#444",
        inputBg: "#333",
        buttonBg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
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
        buttonBg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
        tableHeader: "#e5e5e5",
        hoverBg: "#f3f3f3",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
      };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans min-h-screen" style={{ background: themeStyles.background, color: themeStyles.text }}>
      <div className="flex justify-between items-center mb-6">
        <ConfirmDialog />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Income Management</h1>
          <p className="text-lg">Track and manage your income sources efficiently.</p>
        </div>
        <button 
          className="flex items-center gap-2 px-3 py-3 rounded-lg text-lg transition-transform duration-300 hover:scale-105 shadow-md"
          style={{ background:themeStyles.buttonBg, color: themeStyles.text }}
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus size={20} /> Add Income
        </button>
      </div>
      <div className="mb-6">
        <div className="p-6 rounded-xl shadow-md text-center" style={{ background: themeStyles.cardBg, borderColor: themeStyles.border }}>
          <h3 className="text-lg font-semibold">Total Income</h3>
          <p className="text-2xl font-bold text-green-500">{currency.symbol} {totalIncome.toLocaleString()}</p>
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="filter" className="block text-lg font-semibold mb-2">Filter by Category:</label>
        <select 
          id="filter" 
          className="w-full p-3 border rounded-lg text-lg transition duration-200"
          style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }}
          onChange={handleFilterChange}
        >
          <option value="">All Categories</option>
          {Array.from(new Set(incomes.map((income) => income.category))).map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="p-4 md:p-6 rounded-xl shadow-md" style={{ background: themeStyles.cardBg }}>
        <h2 className="text-xl font-semibold mb-4">Income Entries</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr style={{ background: themeStyles.tableHeader }}>
                <th className="p-4 text-left border-b font-semibold whitespace-nowrap">Date</th>
                <th className="p-4 text-left border-b font-semibold whitespace-nowrap">Source</th>
                <th className="p-4 text-left border-b font-semibold whitespace-nowrap">Category</th>
                <th className="p-4 text-left border-b font-semibold whitespace-nowrap">Amount</th>
                <th className="p-4 text-left border-b font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.length > 0 ? (
                filteredIncomes.map((income, index) => (
                  <tr key={income.id} className="border-b transition" style={{ background: index % 2 === 0 ? themeStyles.hoverBg : "transparent" }}>
                    <td className="p-4 whitespace-nowrap">{new Date(income.date).toLocaleDateString()}</td>
                    <td className="p-4 whitespace-nowrap">{income.source}</td>
                    <td className="p-4 whitespace-nowrap">{income.category}</td>
                    <td className="p-4 whitespace-nowrap font-bold text-green-500">{currency.symbol} {income.amount.toFixed(2)}</td>
                    <td className="p-4 whitespace-nowrap">
                      <Edit onClick={() => handleEditIncome(income)} className="text-blue-500 cursor-pointer mr-2" />
                      <Trash2 onClick={() => handleDeleteIncome(income.id)} className="text-red-500 cursor-pointer" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-400">No income records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isDialogOpen && <AddIncomeDialog onClose={() => setIsDialogOpen(false)} onSave={handleSaveIncome} editingIncome={editingIncome} />}
    </div>
  );
};

export default IncomePage;
