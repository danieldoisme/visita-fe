import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** Require a specific role to access this route */
    requiredRole?: UserRole;
    /** Block specific roles from accessing this route */
    blockedRoles?: UserRole[];
    /** Redirect to admin login instead of user login when not authenticated */
    adminLoginRedirect?: boolean;
    /** Custom redirect destination for blocked/unauthorized users */
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    requiredRole,
    blockedRoles,
    adminLoginRedirect = false,
    redirectTo,
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
        const loginPath = adminLoginRedirect ? "/internal/login" : "/login";
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Check if user's role is blocked from this route
    if (blockedRoles && user?.role && blockedRoles.includes(user.role)) {
        // Redirect to custom destination or role-appropriate default
        const destination = redirectTo || (user.role === "admin" ? "/admin" : "/");
        return <Navigate to={destination} replace />;
    }

    // Check role requirement
    if (requiredRole && user?.role !== requiredRole) {
        // User doesn't have required role - redirect to custom destination or home
        const destination = redirectTo || "/";
        return <Navigate to={destination} replace />;
    }

    return <>{children}</>;
}
