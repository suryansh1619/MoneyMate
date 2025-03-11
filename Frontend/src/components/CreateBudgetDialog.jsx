import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import API_BASE_URL from "../config";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrencyContext } from "../contexts/Currencycontext";
import convertCurrency from "../convertCurrency";

const CreateBudgetDialog = ({ onClose, fetchBudgets, editingBudget }) => {
  const { darktheme } = useContext(ThemeContext);
  const { currency } = useContext(CurrencyContext);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    emoji: "💰",
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        name: editingBudget.name || "",
        amount: editingBudget.amount.toString() || "",
        emoji: editingBudget.emoji || "💰",
      });
    }
  }, [editingBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const convertedAmount = await convertCurrency(currency,"INR",formData.amount);
      if (editingBudget) {
        await axios.put(
          `${API_BASE_URL}/budget/${editingBudget.id}/edit`,
          {
            ...formData,
            amount: parseFloat(convertedAmount),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } 
      else {
        await axios.post(
          `${API_BASE_URL}/budget`,
          {
            ...formData,
            amount: parseFloat(convertedAmount),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      fetchBudgets();
      onClose();
    } 
    catch (error) {
      alert("Error saving budget: " + error.message);
    }
  };

  const themeStyles = darktheme
    ? {
        main_bg: "white",
        background: "#1e1e1e",
        text: "#ffffff",
        inputBg: "#333",
        border: "#444",
        buttonBg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
        hoverBg: "#555",
        shadow: "0px 0px 10px rgba(255,255,255,0.2)",
        emojiBg: "#2a2a2a",
      }
    : {
        main_bg: "black",
        background: "#ffffff",
        text: "#000",
        inputBg: "#fff",
        border: "#ced4da",
        buttonBg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
        hoverBg: "#f3f3f3",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
        emojiBg: "#f9f9f9",
      };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 transition-opacity" style={{ background: themeStyles.main_bg }}>
      <div
        className="p-6 rounded-lg w-full max-w-md shadow-lg transform scale-100 transition-transform duration-300"
        style={{ background: themeStyles.background, color: themeStyles.text, boxShadow: themeStyles.shadow }}
      >
        <h2 className="text-2xl font-bold mb-5 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {editingBudget ? "Edit Budget" : "Create New Budget"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-center relative">
            <label className="block font-bold mb-2">Emoji</label>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-3xl p-3 border rounded-lg transition duration-200"
              style={{ background: themeStyles.emojiBg, borderColor: themeStyles.border }}
            >
              {formData.emoji}
            </button>
            {showEmojiPicker && (
              <div className="absolute mt-2 z-10 p-2 rounded-lg shadow-md"
                style={{ background: themeStyles.emojiBg, borderColor: themeStyles.border }}>
                <EmojiPicker
                  onEmojiClick={(emoji) => {
                    setFormData({ ...formData, emoji: emoji.emoji });
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-1">Budget Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded-lg transition duration-200"
              style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-1">Budget Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-3 border rounded-lg transition duration-200"
              style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }}
              required
            />
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold transition duration-200"
              style={{ background: themeStyles.border, color: themeStyles.text }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-semibold transition duration-200"
              style={{ background: themeStyles.buttonBg, color: themeStyles.text }}
            >
              {editingBudget ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBudgetDialog;
