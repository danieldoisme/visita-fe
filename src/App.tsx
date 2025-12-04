import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/user/HomePage";
import ToursPage from "@/pages/user/ToursPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ToursManagementPage from "@/pages/admin/ToursManagementPage";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tours" element={<ToursPage />} />
          <Route
            path="about"
            element={<div className="p-10">About Page Placeholder</div>}
          />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tours" element={<ToursManagementPage />} />
          <Route
            path="users"
            element={<div className="p-6">Manage Users Placeholder</div>}
          />
          <Route
            path="settings"
            element={<div className="p-6">Settings Placeholder</div>}
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
