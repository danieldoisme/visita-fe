import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TourProvider } from "@/context/TourContext";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/user/HomePage";
import ToursPage from "@/pages/user/ToursPage";
import DestinationsPage from "@/pages/user/DestinationsPage";
import TourDetailsPage from "@/pages/user/TourDetailsPage";
import AboutPage from "@/pages/user/AboutPage";
import ProfilePage from "@/pages/user/ProfilePage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ToursManagementPage from "@/pages/admin/ToursManagementPage";
import UsersPage from "@/pages/admin/UsersPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";


function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <TourProvider>
          <Toaster position="top-right" richColors />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <ScrollToTop />
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* User Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="destinations" element={<DestinationsPage />} />
                <Route path="tours" element={<ToursPage />} />
                <Route path="tours/:id" element={<TourDetailsPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute blockedRoles={["admin"]} redirectTo="/admin">
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
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
                <Route path="users" element={<UsersPage />} />
                <Route path="settings" element={<SettingsPage />} />
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
