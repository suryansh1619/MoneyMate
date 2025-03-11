import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="min-h-screen">
      <Outlet /> 
    </div>
  );
};

export default ProtectedLayout;