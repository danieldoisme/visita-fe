import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { TourProvider } from "@/context/TourContext";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { PromotionsProvider } from "@/context/PromotionsContext";
import { ContactProvider } from "@/context/ContactContext";
import { ReviewProvider } from "@/context/ReviewContext";
import { ChatProvider } from "@/context/ChatContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/user/HomePage";
import ToursPage from "@/pages/user/ToursPage";
import DestinationsPage from "@/pages/user/DestinationsPage";
import TourDetailsPage from "@/pages/user/TourDetailsPage";
import AboutPage from "@/pages/user/AboutPage";
import ContactPage from "@/pages/user/ContactPage";
import ProfilePage from "@/pages/user/ProfilePage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ToursManagementPage from "@/pages/admin/ToursManagementPage";
import UsersPage from "@/pages/admin/UsersPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import BookingsManagementPage from "@/pages/admin/BookingsManagementPage";
import InteractionManagementPage from "@/pages/admin/InteractionManagementPage";
import PromotionsPage from "@/pages/admin/PromotionsPage";
import StaffLayout from "@/layouts/StaffLayout";
import StaffChatPage from "@/pages/staff/StaffChatPage";
import StaffToursPage from "@/pages/staff/StaffToursPage";
import StaffBookingFormPage from "@/pages/staff/StaffBookingFormPage";
import InternalLoginPage from "@/pages/auth/InternalLoginPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import GoogleCallbackPage from "@/pages/auth/GoogleCallbackPage";
import PaymentSuccessPage from "@/pages/payment/PaymentSuccessPage";
import PaymentCancelPage from "@/pages/payment/PaymentCancelPage";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BookingProvider>
          <FavoritesProvider>
            <PromotionsProvider>
              <ContactProvider>
                <ReviewProvider>
                  <ChatProvider>
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
                          {/* Payment Result Routes (for popup) */}
                          <Route path="/payment/success" element={<PaymentSuccessPage />} />
                          <Route path="/payment/cancel" element={<PaymentCancelPage />} />

                          {/* Auth Routes */}
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
                          <Route path="/internal/login" element={<InternalLoginPage />} />
                          <Route path="/admin/login" element={<Navigate to="/internal/login" replace />} />
                          <Route path="/staff/login" element={<Navigate to="/internal/login" replace />} />

                          {/* User Routes */}
                          <Route path="/" element={<MainLayout />}>
                            <Route index element={<HomePage />} />
                            <Route path="destinations" element={<DestinationsPage />} />
                            <Route path="tours" element={<ToursPage />} />
                            <Route path="tours/:id" element={<TourDetailsPage />} />
                            <Route path="about" element={<AboutPage />} />
                            <Route path="contact" element={<ContactPage />} />
                            <Route
                              path="profile"
                              element={
                                <ProtectedRoute blockedRoles={["admin", "staff"]}>
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
                            <Route path="bookings" element={<BookingsManagementPage />} />
                            <Route path="interactions" element={<InteractionManagementPage />} />
                            <Route path="promotions" element={<PromotionsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                          </Route>

                          {/* Staff Routes - Protected */}
                          <Route
                            path="/staff"
                            element={
                              <ProtectedRoute requiredRole="staff" adminLoginRedirect>
                                <StaffLayout />
                              </ProtectedRoute>
                            }
                          >
                            <Route index element={<Navigate to="chat" replace />} />
                            <Route path="chat" element={<StaffChatPage />} />
                            <Route path="tours" element={<StaffToursPage />} />
                            <Route path="booking" element={<StaffBookingFormPage />} />
                            <Route path="booking/:tourId" element={<StaffBookingFormPage />} />
                          </Route>

                          {/* 404 */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </BrowserRouter>
                    </TourProvider>
                  </ChatProvider>
                </ReviewProvider>
              </ContactProvider>
            </PromotionsProvider>
          </FavoritesProvider>
        </BookingProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
