import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Leaderboard from './pages/public/Leaderboard';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Tools from './pages/admin/Tools';
import Categories from './pages/admin/Categories';
import Tags from './pages/admin/Tags';

// Protected Route Wrapper
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div>Đang tải...</div>;
  return isAdmin ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route 
        path="/admin/*" 
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        } 
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="tools" element={<Tools />} />
        <Route path="categories" element={<Categories />} />
        <Route path="tags" element={<Tags />} />
        <Route path="settings" element={<div style={{padding:'2rem'}}><h1>Cài đặt hệ thống</h1><p>Đang phát triển...</p></div>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
