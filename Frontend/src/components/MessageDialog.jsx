import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext"; 

const MessageDialog = ({ isOpen, onClose, title, message, type = "success" }) => {
  const { darktheme } = useContext(ThemeContext);

  const themeStyles = darktheme
    ? {
        mainbg:"#fff",
        background: "#1e1e1e",
        text: "#ffffff",
        border: "#444",
        buttonBg: "#333",
        buttonText: "#fff",
        shadow: "0px 0px 10px rgba(255,255,255,0.2)",
      }
    : {
        mainbg:"#000",
        background: "#ffffff",
        text: "#212529",
        border: "#ced4da",
        buttonBg: "#f3f4f6",
        buttonText: "#000",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
      };

  const typeStyles = {
    success: "text-green-600 border-green-400",
    error: "text-red-600 border-red-400",
    warning: "text-yellow-600 border-yellow-400"
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    style={{backgroundColor: themeStyles.mainbg}}>
      <div
        className={`p-6 rounded-lg shadow-lg w-96 border transition-transform transform scale-95 animate-fadeIn ${typeStyles[type]}`}
        style={{
          background: themeStyles.background,
          color: themeStyles.text,
          borderColor: themeStyles.border,
          boxShadow: themeStyles.shadow,
        }}
      >
        <h3 className={`text-xl font-bold ${typeStyles[type]}`}>
          {title || "✅ Success"}
        </h3>
        <p className="mt-2">{message}</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded transition-all duration-200"
            style={{
              backgroundColor: themeStyles.buttonBg,
              color: themeStyles.buttonText,
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageDialog;
