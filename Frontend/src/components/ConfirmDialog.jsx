import { useState, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export const useConfirmDialog = () => {
  const { darktheme } = useContext(ThemeContext);
  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", resolve: null });

  const themeStyles = darktheme
    ? {
        background: "#1e1e1e",
        text: "#ffffff",
        border: "#444",
        buttonBg: "#333",
        buttonText: "#fff",
        shadow: "0px 0px 10px rgba(255,255,255,0.2)",
      }
    : {
        background: "#ffffff",
        text: "#212529",
        border: "#ced4da",
        buttonBg: "#f3f4f6",
        buttonText: "#000",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
      };

  const confirm = (title, message) => {
    return new Promise((resolve) => {
      setDialog({ isOpen: true, title, message, resolve });
    });
  };

  const handleClose = (result) => {
    if (dialog.resolve) dialog.resolve(result);
    setDialog({ ...dialog, isOpen: false });
  };

  const ConfirmDialog = () => {
    if (!dialog.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div
          className="p-6 rounded-lg shadow-lg w-96 border transition-transform transform scale-95 animate-fadeIn"
          style={{
            background: themeStyles.background,
            color: themeStyles.text,
            borderColor: themeStyles.border,
            boxShadow: themeStyles.shadow,
          }}
        >
          <h3 className="text-xl font-bold text-red-600">{dialog.title || "Confirm Action"}</h3>
          <p className="mt-2">{dialog.message || "Are you sure you want to proceed?"}</p>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => handleClose(false)}
              className="px-4 py-2 rounded transition-all duration-200"
              style={{
                backgroundColor: themeStyles.buttonBg,
                color: themeStyles.buttonText,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleClose(true)}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmDialog };
};
