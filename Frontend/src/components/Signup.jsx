import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import API_BASE_URL from "../config";
import { ThemeContext } from "../contexts/ThemeContext";

const Signup = () => {
  const { darktheme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage("All required fields must be filled!");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: response.data.username,
          email: response.data.email,
          profilePicture: response.data.profilePicture,
        })
      );
      navigate("/login");
    } 
    catch (error) {
      setErrorMessage(error.response?.data?.error || "Registration failed. Try again.");
    } 
    finally {
      setLoading(false);
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
          <UserPlus size={48} className="mx-auto animate-pulse" strokeWidth={1.5} />
          <h1 
            className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Create an Account</h1>
          <p className="text-sm">Enter your details to register</p>
        </div>
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md focus:ring-2 transition-all duration-300"
              style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-md focus:ring-2 transition-all duration-300"
              style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-md focus:ring-2 transition-all duration-300"
              style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-md focus:ring-2 transition-all duration-300"
              style={{ background: themeStyles.inputBackground, color: themeStyles.text, borderColor: themeStyles.border }}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-md transition-all duration-300"
            style={{
              background: themeStyles.buttonbg,
              color: themeStyles.buttonText,
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? <Loader2 size={20} className="mx-auto animate-spin" /> : "Sign up"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: themeStyles.link }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
