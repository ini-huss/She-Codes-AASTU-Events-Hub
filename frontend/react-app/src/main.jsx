// main.jsx - FULLY FIXED

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetailPage from './pages/EventDetailPage';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component - FIXED
const ProtectedRoute = ({ children, requiredRole }) => {
  // ✅ Fix 1: Use OR operator () not space
  const token = localStorage.getItem("token")||  sessionStorage.getItem("token");
  
  // ✅ Fix 2: Check sessionStorage FIRST since that's where role is stored
  const userRole = sessionStorage.getItem("userRole") || localStorage.getItem("userRole");
  
  console.log("=== ProtectedRoute Debug ===");
  console.log("Token exists:", !!token);
  console.log("Role from sessionStorage:", sessionStorage.getItem("userRole"));
  console.log("Role from localStorage:", localStorage.getItem("userRole"));
  console.log("Final userRole:", userRole);
  console.log("============================");
  
  if (!token) {
    console.log("❌ No token, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole === "admin" && userRole !== "admin") {
    console.log("❌ Not admin, redirecting to home. Role:", userRole);
    return <Navigate to="/" replace />;
  }
  
  console.log("✅ Access granted to admin route");
  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Home / App */}
        <Route path="/" element={<App />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Event details */}
        <Route path="/events/:id" element={<EventDetailPage />} />

        {/* Admin Dashboard - Protected */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);