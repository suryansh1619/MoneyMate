import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const AddIncomeDialog = ({ onClose, onSave, editingIncome }) => {
  const { darktheme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    source: "",
    category: "",
    amount: "",
    date: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        source: editingIncome.source || "",
        category: editingIncome.category || "",
        amount: editingIncome.amount.toString() || "",
        date: new Date(editingIncome.date).toISOString().slice(0, 16),
      });
    }
  }, [editingIncome]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const themeStyles = darktheme
    ? {
        main_bg:"white",
        background: "#1e1e1e",
        text: "#ffffff",
        border: "#444",
        inputBackground: "#333",
        buttonBg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
        buttonText: "#fff",
        shadow: "0px 0px 10px rgba(255,255,255,0.2)",
      }
    : {
        main_bg:"black",
        background: "#ffffff",
        text: "#212529",
        border: "#ced4da",
        inputBackground: "#fff",
        buttonBg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
        buttonText: "#000",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
      };

  return (
    <div
      className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 transition-opacity"
      style={{ background:themeStyles.main_bg}}>
      <div
        className="p-6 rounded-lg w-full max-w-md shadow-lg transform scale-100 transition-transform duration-300"
        style={{ background: themeStyles.background, color: themeStyles.text, boxShadow: themeStyles.shadow }}
      >
        <h2 
          className="text-2xl font-bold mb-5 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {editingIncome ? "Edit Income" : "Add New Income"}
        </h2>
        <form onSubmit={handleSubmit}>
          {["Source", "Category", "Amount"].map((field) => (
            <input
              key={field}
              type={field === "Amount" ? "number" : "text"}
              placeholder={field}
              value={formData[field.toLowerCase()]}
              onChange={(e) => setFormData({ ...formData, [field.toLowerCase()]: e.target.value })}
              className="w-full p-4 mb-4 border rounded-lg text-lg focus:ring-2 transition duration-200"
              style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
              required
            />
          ))}
          <input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-4 mb-4 border rounded-lg text-lg"
            style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
            required
          />
          <div className="flex justify-center gap-3">
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
              style={{ background: themeStyles.buttonBg, color: themeStyles.buttonText }}
            >
              {editingIncome ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomeDialog;