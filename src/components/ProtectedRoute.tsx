import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    adminLoginRedirect?: boolean;
}

export default function ProtectedRoute({
    children,
    requiredRole,
    adminLoginRedirect = false,
}: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show nothing while checking auth status
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Not authenticated - redirect to appropriate login page
    if (!isAuthenticated) {
        const loginPath = adminLoginRedirect ? "/admin/login" : "/login";
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Check role requirement
    if (requiredRole && user?.role !== requiredRole) {
        // User doesn't have required role - redirect to home
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
