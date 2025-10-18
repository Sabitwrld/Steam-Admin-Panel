import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import GameManagement from './pages/GameManagement';
import CampaignManagement from './pages/CampaignManagement';
import GenreManagement from './pages/GenreManagement';
import TagManagement from './pages/TagManagement';
import CouponManagement from './pages/CouponManagement';
import VoucherManagement from './pages/VoucherManagement';
import OrderManagement from './pages/OrderManagement';
import ReviewManagement from './pages/ReviewManagement';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="games" element={<GameManagement />} />
            <Route path="campaigns" element={<CampaignManagement />} />
            <Route path="genres" element={<GenreManagement />} />
            <Route path="tags" element={<TagManagement />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="vouchers" element={<VoucherManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
