import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TourProvider } from "@/context/TourContext";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/user/HomePage";
import ToursPage from "@/pages/user/ToursPage";
import TourDetailsPage from "@/pages/user/TourDetailsPage";
import AboutPage from "@/pages/user/AboutPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ToursManagementPage from "@/pages/admin/ToursManagementPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <TourProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* User Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="tours" element={<ToursPage />} />
                <Route path="tours/:id" element={<TourDetailsPage />} />
                <Route path="about" element={<AboutPage />} />
              </Route>

              {/* Admin Routes - Protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin" adminLoginRedirect>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="tours" element={<ToursManagementPage />} />
                <Route
                  path="users"
                  element={<div className="p-6">Trang quản lý người dùng</div>}
                />
                <Route
                  path="settings"
                  element={<div className="p-6">Trang cài đặt</div>}
                />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TourProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
