import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";
import BudgetPage from "./components/BudgetPage";
import ExpensesPage from "./components/ExpensesPage";
import SettingsPage from "./components/SettingsPage";
import IncomePage from "./components/IncomePage"; 
import ProtectedLayout from "./components/ProtectedLayout";
import Sidebar from "./components/Sidebar";
import BudgetDetailsPage from "./components/BudgetDetailsPage";
import { ThemeProvider, ThemeContext } from "./contexts/ThemeContext";
import {CurrencyProvider} from "./contexts/CurrencyContext";

const AppContent = () => {
  const { darktheme } = useContext(ThemeContext);

  const themeStyles = darktheme
    ? { background: "#1e1e1e", text: "#ffffff" }
    : { background: "#f9f9f9", text: "#212529" };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={
            <div>
              <Sidebar />
              <div className="font-sans min-h-full pl-12" style={{ background: themeStyles.background, color: themeStyles.text }}>
                <Dashboard />
              </div>
            </div>
          }/>
          <Route path="/budget" element={
            <div>
              <Sidebar />
              <div className="font-sans min-h-full pl-12" style={{ background: themeStyles.background, color: themeStyles.text }}>
                <BudgetPage />
              </div>
            </div>
          }/>
          <Route path="/budget/:id" element={
            <div>
              <Sidebar />
              <div className="font-sans min-h-full pl-12" style={{ background: themeStyles.background, color: themeStyles.text }}>
                <BudgetDetailsPage />
              </div>
            </div>
          }/>
          <Route path="/expenses" element={
            <div>
              <Sidebar />
              <div className="font-sans min-h-full pl-12" style={{ background: themeStyles.background, color: themeStyles.text }}>
                <ExpensesPage />
              </div>
            </div>
          }/>
          <Route path="/income" element={
            <div>
              <Sidebar />
              <div className="font-sans min-h-full pl-12" style={{ background: themeStyles.background, color: themeStyles.text }}>
                <IncomePage />
              </div>
            </div>
          }/>
          <Route path="/settings" element={
            <div>
              <Sidebar />
              <div className="font-sans min-h-full pl-12" style={{ background: themeStyles.background, color: themeStyles.text }}>
                <SettingsPage />
              </div>
            </div>
          }/>
        </Route>
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <CurrencyProvider>
      <AppContent />
      </CurrencyProvider>
    </ThemeProvider>
  );
};

export default App;
