import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, Loader2 } from "lucide-react";
import API_BASE_URL from "../config";
import { ThemeContext } from "../contexts/ThemeContext";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { darktheme } = useContext(ThemeContext);

  const themeStyles = darktheme
    ? {
        background: "#121212",
        text: "#ffffff",
        cardBackground: "#1e1e1e",
        border: "#444",
        buttonbg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
        buttonText: "#fff",
        inputBackground: "#333",
        link: "#0d6efd",
        shadow: "0px 0px 10px rgba(255,255,255,0.2)",
      }
    : {
        background: "#f8f9fa",
        text: "#212529",
        cardBackground: "#ffffff",
        border: "#ced4da",
        buttonbg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
        buttonText: "#000",
        inputBackground: "#fff",
        link: "#007bff",
        shadow: "0px 0px 10px rgba(0,0,0,0.1)",
      };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!formData.username || !formData.password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          email: response.data.email,
        })
      );
      navigate("/dashboard");
    } 
    catch (error) {
      setErrorMessage(error.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleGuestLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/guest/guest-login`);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          email: `${response.data.username.toLowerCase()}@guest.com`,
          isGuest: true,
        })
      );

      navigate("/dashboard");
    } 
    catch (error) {
      console.error("Guest login error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      alert("Error logging in as guest: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-300"
      style={{ background: themeStyles.background, color: themeStyles.text }}
    >
      <div
        className="p-8 rounded-xl shadow-lg w-full max-w-md transition-all duration-300"
        style={{ background: themeStyles.cardBackground, color: themeStyles.text, boxShadow: themeStyles.shadow }}
      >
        <div className="text-center mb-6">
          <Wallet size={48} className="mx-auto animate-pulse" strokeWidth={1.5} />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Welcome Back</h1>
          <p className="text-sm">Enter your credentials to access your account</p>
        </div>
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md focus:ring-2 transition-all duration-300"
              style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
              placeholder="Enter your Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-md focus:ring-2 transition-all duration-300"
              style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-md transition-all duration-300"
            style={{ background: themeStyles.buttonbg, color: themeStyles.buttonText, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? <Loader2 size={20} className="mx-auto animate-spin" /> : "Sign in"}
          </button>
          <button 
            type="button" 
            className="w-full p-3 rounded-md transition-all duration-300" 
            style={{ background: themeStyles.buttonbg, color: themeStyles.buttonText, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            onClick={handleGuestLogin}>
            Sign in as Guest
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold hover:underline" style={{ color: themeStyles.link }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
