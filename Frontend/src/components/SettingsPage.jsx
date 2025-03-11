import React, { useState, useEffect,useContext } from "react";
import { useNavigate } from "react-router-dom";
import {Trash2, Lock, User, Sun, Moon, LockKeyhole, SunMoon, TriangleAlert} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrencyContext } from "../contexts/Currencycontext";
import MessageDialog from "./MessageDialog";
import {useConfirmDialog} from "./ConfirmDialog";

const SettingsPage = () => {
  const { darktheme,changetheme } = useContext(ThemeContext);
  const { currency, changeCurrency, currencyList } = useContext(CurrencyContext);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "", email: "", isGuest: false });
  const [password, setPassword] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [deletePassword, setDeletePassword] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) throw new Error("User not logged in");
        const loggedInUser = JSON.parse(storedUser);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/auth/users/${loggedInUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          username: response.data.username,
          email: response.data.email,
          isGuest: response.data.isGuest,
        });
        setIsGuest(response.data.isGuest);
      } 
      catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeletePasswordChange = (e) => {
    setDeletePassword(e.target.value);
  };
  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", type:""});
  const handleSaveChanges = async () => {
    if (isGuest) {
      setDialog({ isOpen: true, title: "Access Denied", message: "Guest accounts cannot update profile!" ,type:"warning"});
      return;
    }
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/auth/users/${loggedInUser.id}`,
        { username: user.username, email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = { ...loggedInUser, ...user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));
      setDialog({ isOpen: true, title: "Success", message: "Profile updated successfully!", type:"success"});
    } 
    catch (error) {
      console.error("Failed to update profile:", error);
      setDialog({ isOpen: true, title: "Error", message: "Failed to update profile. Please try again.", type:"error"});
    }
  };

  const handleUpdatePassword = async () => {
    if (isGuest) {
      setDialog({ isOpen: true, title: "Access Denied", message: "Guest accounts cannot update passwords!", type:"warning"});
      return;
    }
    if (!password.oldPassword) {
      setDialog({ isOpen: true, title: "Missing Password", message: "Please enter your old password", type:"warning"});
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      setDialog({ isOpen: true, title: "Error", message: "New passwords and confirmed Password do not match!", type:"error"});
      return;
    }
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/auth/users/${loggedInUser.id}/password`,
        { oldPassword: password.oldPassword, newPassword: password.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDialog({ isOpen: true, title: "Success", message: "Password updated successfully!", type:"success"});
      setPassword({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } 
    catch (error) {
      setDialog({ isOpen: true, title: "Error", message: "Failed to update password. Please try again.", type:"error"});
      console.error("Failed to update password:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (isGuest) {
      setDialog({ isOpen: true, title: "Access Denied", message: "Guest accounts cannot be deleted!", type:"warning"});
      return;
    }
    if (!deletePassword) {
      setDialog({ isOpen: true, title: "Missing Password", message: "Please enter your password to confirm account deletion.", type:"warning"});
    }
    const confirmDelete = await confirm(
      "Delete Account",
      "Are you sure you want to delete your account? This action is irreversible!"
    );
    if (!confirmDelete) return;
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/auth/users/${loggedInUser.id}`,{
        data: { password: deletePassword },
        headers: { Authorization: `Bearer ${token}` } }
      );
      setDialog({ isOpen: true, title: "Success", message: "Account deleted successfully!", type:"success"});
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
    } 
    catch (error) {
      console.error("Failed to delete account:", error);
      setDialog({ isOpen: true, title: "Error", message: "Incorrect password. Failed to delete account.", type:"error"});
    }
  };

  const themeStyles = darktheme
  ? {
      background: "#1e1e1e",
      text: "#ffffff",
      cardBg: "#2a2a2a",
      border: "#444",
      inputBg: "#333",
      buttonBg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
      buttonText: "#fff",
      alertBg: "#3a3a3a",
      dangerBg: "#a83232",
      dangerHoverBg: "#8b2828",
    }
  : {
      background: "#f9f9f9",
      text: "#212529",
      cardBg: "#ffffff",
      border: "#ced4da",
      inputBg: "#fff",
      buttonBg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
      buttonText: "#000",
      alertBg: "#fef3c7",
      dangerBg: "#dc2626",
      dangerHoverBg: "#b91c1c",
    };

    return (
      <div className="p-6 max-w-3xl mx-auto font-sans min-h-screen" style={{ background: themeStyles.background, color: themeStyles.text }}>
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Settings</h1>
        <p className="mb-6">Manage your account settings and security.</p>
        {isGuest && (
          <div className="p-3 mb-5 text-sm rounded-md" style={{ background: themeStyles.alertBg }}>
            You are logged in as a guest and cannot make changes.
          </div>
        )}
        <ConfirmDialog />
        <MessageDialog
          isOpen={dialog.isOpen}
          onClose={() => setDialog(false)}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
        />
        <div className="p-6 rounded-lg shadow-md mb-8" style={{ background: themeStyles.cardBg, borderColor: themeStyles.border }}>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-x-2"><User size={30} /> Profile Information</h2>
          <label className="block mb-4">
            <span>Username</span>
            <input type="text" name="username" value={user.username} className="w-full p-3 border rounded-md" onChange={handleInputChange} 
              style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }} disabled={isGuest} />
          </label>
          <label className="block mb-4">
            <span>Email Address</span>
            <input type="email" name="email" value={user.email} className="w-full p-3 border rounded-md" onChange={handleInputChange} 
              style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }} disabled={isGuest} />
          </label>
          <button className="w-full py-3 mt-2 rounded-lg font-bold transition-colors" onClick={handleSaveChanges}
            style={{ background: themeStyles.buttonBg, color: themeStyles.buttonText }}>
            <User className="inline mr-2" /> Save Changes
          </button>
        </div>
        <div className="p-6 rounded-lg shadow-md mb-8 flex justify-between items-center" style={{ background: themeStyles.cardBg, borderColor: themeStyles.border }}>
          <h2 className="text-xl font-bold flex items-center gap-x-2"><SunMoon size={30} /> Theme Preference</h2>
          <button onClick={changetheme} className="p-3 rounded-full transition-colors"
            style={{ background: themeStyles.buttonBg, color: themeStyles.buttonText }}>
            {darktheme ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
        <div className="p-6 rounded-lg shadow-md mb-8 flex justify-between items-center" style={{ background: themeStyles.cardBg, borderColor: themeStyles.border }}>
          <h2 className="text-xl font-bold flex items-center gap-x-2">
            💰 Currency Preference
          </h2>
          <select
            value={currency.code}
            onChange={(e) => changeCurrency(currencyList.find(c => c.code === e.target.value))}
            className="p-2 rounded-md border border-gray-300 transition-colors"
            style={{ background: themeStyles.inputBg, color: themeStyles.text }}
          >
            {currencyList.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="p-6 rounded-lg shadow-md mb-8" style={{ background: themeStyles.cardBg, borderColor: themeStyles.border }}>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-x-2"><LockKeyhole size={30} /> Update Password</h2>
          <label className="block mb-4">
            <span>Old Password</span>
            <input type="password" name="oldPassword" className="w-full p-3 border rounded-md" value={password.oldPassword} onChange={handlePasswordChange}
              style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }} />
          </label>
          <label className="block mb-4">
            <span>New Password</span>
            <input type="password" name="newPassword" className="w-full p-3 border rounded-md" value={password.newPassword} onChange={handlePasswordChange}
              style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }} />
          </label>
          <label className="block mb-4">
            <span>Confirm New Password</span>
            <input type="password" name="confirmPassword" className="w-full p-3 border rounded-md" value={password.confirmPassword} onChange={handlePasswordChange}
              style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }} />
          </label>
          <button className="w-full py-3 rounded-md font-bold transition-colors" onClick={handleUpdatePassword}
            style={{ background: themeStyles.buttonBg, color: themeStyles.buttonText }}>
            <Lock className="inline mr-2" /> Update Password
          </button>
        </div>
        <div className="p-6 rounded-lg shadow-md" style={{ background: themeStyles.cardBg, borderColor: themeStyles.border }}>
          <h2 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-x-2"><TriangleAlert size={30} /> Delete Account</h2>
          <p className="mb-4">This action is irreversible.</p>
          <input type="password" placeholder="Enter your password" className="w-full p-3 border rounded-md" onChange={handleDeletePasswordChange}
            style={{ background: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.border }} />
          <button className="w-full py-3 mt-2 rounded-lg font-bold transition-colors" onClick={handleDeleteAccount}
            style={{ background: themeStyles.dangerBg, color: themeStyles.buttonText }}>
            <Trash2 className="inline mr-2" /> Delete My Account
          </button>
        </div>
      </div>
    );
  };
  
  export default SettingsPage;