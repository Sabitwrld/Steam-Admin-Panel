import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import GameManagement from './pages/GameManagement';
import GenreManagement from './pages/GenreManagement';
import TagManagement from './pages/TagManagement';
import OrderManagement from './pages/OrderManagement';
import ReviewManagement from './pages/ReviewManagement';
import UserManagement from './pages/UserManagement';
import CampaignManagement from './pages/CampaignManagement';
import CouponManagement from './pages/CouponManagement';
import VoucherManagement from './pages/VoucherManagement';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="games" element={<GameManagement />} />
                    <Route path="genres" element={<GenreManagement />} />
                    <Route path="tags" element={<TagManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="reviews" element={<ReviewManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="campaigns" element={<CampaignManagement />} />
                    <Route path="coupons" element={<CouponManagement />} />
                    <Route path="vouchers" element={<VoucherManagement />} />
                </Route>
                
                {/* Catch all route - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;