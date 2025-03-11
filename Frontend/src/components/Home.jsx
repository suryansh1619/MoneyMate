import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import {CalendarDays, IndianRupee, NotebookPen, Search, Landmark, ChartColumn, LockKeyhole, SunMoon, Banknote} from "lucide-react";
const Home = () => {
  const { darktheme } = useContext(ThemeContext);

  const themeStyles = darktheme
    ? {
        background: "#1e1e1e",
        text: "#ffffff",
        cardBg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
        border: "#444",
        buttonBg: "linear-gradient(to right, #1e40af, #6b21a8, #9d174d)",
        buttonText: "#fff",
      }
    : {
        background: "#f9f9f9",
        text: "#212529",
        cardBg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
        border: "#ced4da",
        buttonBg: "linear-gradient(to right, #bfdbfe, #e9d5ff, #fbcfe8)",
        buttonText: "#212529",
      };

  return (
    <div className="min-h-screen p-6 flex flex-col justify-between" style={{ background: themeStyles.background, color: themeStyles.text }}>
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/" 
          className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"> 
          MoneyMate</Link>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 rounded-md font-bold transition"
            style={{ background: themeStyles.buttonBg, color: themeStyles.buttonText }}>
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 rounded-md font-bold transition"
            style={{ background: themeStyles.buttonBg, color: themeStyles.buttonText }}>
            Sign Up
          </Link>
        </div>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
        className="text-center py-12"
      >
        <h2 className="text-4xl font-extrabold mb-4">Take Control of Your Finances</h2>
        <p className="text-lg max-w-2xl mx-auto">
          Track every penny, set smart budgets, and visualize your expenses effortlessly.
          Your financial freedom starts here.
        </p>
        <Link to="/register" className="mt-6 inline-block px-6 py-3 text-lg font-semibold rounded-lg shadow-lg transition"
          style={{ background: themeStyles.buttonBg, color: themeStyles.buttonText }}>
          Get Started for Free
        </Link>
      </motion.div>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {[
          { emoji: <CalendarDays size={48} className="mx-auto animate-pulse" strokeWidth={1.5}/>, title: "Create Budgets", text: "Set and manage budgets to reach your financial goals." },
          { emoji: <IndianRupee size={48} className="mx-auto animate-pulse" strokeWidth={1.5}/>, title: "Add & Manage Income", text: "Easily log your income sources and track earnings." },
          { emoji: <NotebookPen size={48} className="mx-auto animate-pulse" strokeWidth={1.5}/>, title: "Add Transactions", text: "Log every transaction and keep a record of your spending." },
          { emoji: <Search size={48} className="mx-auto animate-pulse" strokeWidth={1.5}/>, title: "Track Expenses", text: "Categorize and monitor all your expenses in one place." },
          { emoji: <Landmark size={48} className="mx-auto animate-pulse" strokeWidth={1.5}/>, title: "Budget Control", text: "Set spending limits & achieve financial goals." },
          { emoji: <ChartColumn size={48} className="mx-auto animate-pulse" strokeWidth={1.5}/>, title: "Smart Insights", text: "Visualize spending trends & patterns effortlessly." },
          { emoji: <LockKeyhole size={48} className="mx-auto animate-pulse" strokeWidth={1.5}/>, title: "Secure & Private", text: "Your data is protected with secure authentication." },
          { emoji: <SunMoon size={48} className="mx-auto animate-pulse" strokeWidth={1.5}/>, title: "Dark & Light Mode", text: "Choose between dark and light mode for the best experience." },
          { emoji: <Banknote size={48} className="mx-auto animate-pulse" strokeWidth={1.5}/>, title: "Multi-Currency Support", text: "Track expenses in your preferred currency." },
        ].map((feature, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-lg shadow-md text-center flex flex-col items-center justify-center"
            style={{ background: themeStyles.cardBg, borderColor: themeStyles.border }}
          >
            <p className="text-5xl mb-3 flex justify-center">{feature.emoji}</p>
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="text-lg mt-2">{feature.text}</p>
          </motion.div>
        ))}
      </motion.div>
      <footer className="text-center text-sm mt-12 opacity-75">
        &copy; {new Date().getFullYear()} MoneyMate. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Home;
