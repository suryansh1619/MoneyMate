import React, { useContext } from "react";
import { X } from "lucide-react";
import { ThemeContext } from "../contexts/ThemeContext";

const AddTransactionDialog = ({ isOpen, onClose, formData, setFormData, handleSubmit, categories }) => {
  const { darktheme } = useContext(ThemeContext);

  const themeStyles = darktheme
    ? {
        main_bg: "white",
        background: "#1e1e1e",
        text: "#ffffff",
        border: "#444",
        inputBackground: "#333",
        buttonBackground: "#0d6efd",
        buttonText: "#fff",
        shadow: "0px 0px 10px rgba(255,255,255,0.2)",
      }
    : {
        main_bg: "black",
        background: "#ffffff",
        text: "#212529",
        border: "#ced4da",
        inputBackground: "#fff",
        buttonBackground: "#000",
        buttonText: "#fff",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
      };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-opacity-50" 
      style={{ background: themeStyles.main_bg }}>
      <div
        className="p-6 rounded-lg shadow-lg w-96"
        style={{ background: themeStyles.background, color: themeStyles.text, boxShadow: themeStyles.shadow }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Transaction</h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit}>
          {["Description", "Amount"].map((field) => (
            <input
              key={field}
              type={field === "Amount" ? "number" : "text"}
              className="block w-full mb-3 p-3 border rounded-md"
              placeholder={field}
              value={formData[field.toLowerCase()]}
              onChange={(e) => setFormData({ ...formData, [field.toLowerCase()]: e.target.value })}
              style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
              required
            />
          ))}
          <input
            type="date"
            className="block w-full mb-3 p-3 border rounded-md"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
            required
          />
          <select
            className="block w-full mb-3 p-3 border rounded-md"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
            required
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {formData.category === "Other" && (
            <input
              type="text"
              className="block w-full mb-3 p-3 border rounded-md"
              placeholder="Enter custom category"
              value={formData.customCategory}
              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
              style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
              required
            />
          )}
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
              style={{ background: themeStyles.buttonBackground, color: themeStyles.buttonText }}
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionDialog;
