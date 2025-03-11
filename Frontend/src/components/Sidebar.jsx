import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { FaChartBar, FaPiggyBank, FaFileInvoiceDollar, FaCog, FaDollarSign, FaBars, FaTimes } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../config";
import { ThemeContext } from "../contexts/ThemeContext";
import SidebarLink from "./SidebarLink";
export default function Sidebar() {
  const { darktheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(true);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")) || {});
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.isGuest) {
        await axios.delete(`${API_BASE_URL}/guest/logout`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } 
      else {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
    } 
    catch (error) {
      console.error("Logout failed:", error);
      alert("Error logging out, please try again.");
    }
  };

  const isActive = (path) => location.pathname === path;

  const themeStyles = darktheme
    ? {
        sidebarBg: "#1e1e1e",
        text: "#ffffff",
        border: "#444",
        hoverBg: "#333",
        activeBg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
        activeText: "#fff",
        cardBg: "#2a2a2a",
        buttonBg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
        buttonHoverBg: "#0056b3",
      }
    : {
        sidebarBg: "#ffffff",
        text: "#212529",
        border: "#ced4da",
        hoverBg: "#f3f3f3",
        activeBg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
        activeText: "#000",
        cardBg: "#f9f9f9",
        buttonBg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
        buttonHoverBg: "#0056b3",
      };

  return (
    <>
      {isSidebarHidden && (
        <button
          className="fixed top-5 left-5 text-2xl p-3 rounded-md z-50 transition-all"
          style={{ background: themeStyles.buttonBg, color: themeStyles.activeText }}
          onClick={() => {
            setIsSidebarOpen(true);
            setIsSidebarHidden(false);
          }}
        >
          <FaBars />
        </button>
      )}
      <div
        className={`fixed top-0 left-0 h-screen shadow-xl border-r w-64 p-5 transform transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: themeStyles.sidebarBg, color: themeStyles.text, borderColor: themeStyles.border }}
        onTransitionEnd={() => {
          if (!isSidebarOpen) {
            setIsSidebarHidden(true);
          }
        }}
      >
        <button
          className="absolute -top-3 -right-3 p-3 transition-all"
          style={{ color: themeStyles.text }}
          onClick={() => setIsSidebarOpen(false)}
        >
          <FaTimes size={24} />
        </button>
        <div className="p-5 rounded-lg shadow-md text-center mb-5" style={{ background: themeStyles.cardBg }}>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">MoneyMate</h1>
        </div>
        <div className="p-4 rounded-lg mb-5 flex items-center gap-3 shadow-md" style={{ background: themeStyles.hoverBg }}>
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2" style={{ borderColor: themeStyles.border }} />
          ) : (
            <div className="w-12 h-12 rounded-full border-2 flex justify-center items-center text-base font-bold"
              style={{ background: themeStyles.activeBg, color: themeStyles.activeText, borderColor: themeStyles.border }}>
              {user.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col flex-1 truncate">
            <p className="text-sm font-bold truncate">Hello, {user.username || "User"}!</p>
            {user.email && <p className="text-xs truncate">{user.email}</p>}
          </div>
        </div>
        <nav className="flex-grow">
          <SidebarLink to="/dashboard" icon={<FaChartBar />} label="Dashboard" isActive={isActive} themeStyles={themeStyles} />
          <SidebarLink to="/budget" icon={<FaPiggyBank />} label="Budgets" isActive={isActive} themeStyles={themeStyles} />
          <SidebarLink to="/income" icon={<FaDollarSign />} label="Income" isActive={isActive} themeStyles={themeStyles} />
          <SidebarLink to="/expenses" icon={<FaFileInvoiceDollar />} label="Expenses" isActive={isActive} themeStyles={themeStyles} />
          <SidebarLink to="/settings" icon={<FaCog />} label="Settings" isActive={isActive} themeStyles={themeStyles} />
        </nav>
        {user.isGuest && (
          <div className="border rounded-md p-3 mb-3 text-sm shadow-md" style={{ background: "#ffcc00", color: "#333", borderColor: "#ffaa00" }}>
            <strong className="block mb-1">Guest Account</strong>
            <p>Your data won't be saved after logout. Sign up to keep your records.</p>
          </div>
        )}
        <button
          className="py-3 px-5 rounded-md cursor-pointer text-base font-bold transition-colors shadow-md w-full"
          style={{ background: themeStyles.buttonBg, color: themeStyles.activeText }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </>
  );
}
