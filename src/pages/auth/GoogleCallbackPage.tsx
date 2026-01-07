import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Compass, Loader2 } from "lucide-react";

/**
 * Handles the Google OAuth redirect callback.
 * This page is loaded after Google redirects back with an access token in the URL hash.
 */
export default function GoogleCallbackPage() {
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);

    // Guard to prevent duplicate execution (React StrictMode runs effects twice)
    const hasProcessed = useRef(false);

    // Get the stored redirect path or default to home
    const getRedirectPath = () => {
        const stored = sessionStorage.getItem("google_auth_redirect");
        sessionStorage.removeItem("google_auth_redirect");
        return stored || "/";
    };

    useEffect(() => {
        // Prevent duplicate execution
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const processCallback = async () => {
            // For implicit flow, the access token is in the URL hash fragment
            // Example: #access_token=xxx&token_type=Bearer&expires_in=3600&scope=...
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get("access_token");
            const errorParam = hashParams.get("error");

            // Check for error in URL hash (from Google)
            if (errorParam) {
                const errorDescription = hashParams.get("error_description") || errorParam;
                setError(`Google authentication failed: ${errorDescription}`);
                setIsProcessing(false);
                return;
            }

            if (accessToken) {
                // We have the access token, proceed with login
                try {
                    const result = await loginWithGoogle(accessToken);
                    if (result.success) {
                        toast.success("Đăng nhập với Google thành công!");
                        navigate(getRedirectPath(), { replace: true });
                    } else {
                        setError(result.error || "Đăng nhập với Google thất bại");
                    }
                } catch (err) {
                    console.error("Google login error:", err);
                    setError("Đã xảy ra lỗi khi đăng nhập với Google");
                }
            } else {
                // No token and no error - invalid state
                setError("Không tìm thấy thông tin xác thực. Vui lòng thử lại.");
            }
            setIsProcessing(false);
        };

        processCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error && !isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4 p-8 max-w-md">
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
                        <Compass className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Xác thực thất bại</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <button
                        onClick={() => navigate("/login", { replace: true })}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Quay lại đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <Compass className="h-8 w-8" />
                </div>
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Đang xác thực với Google...</p>
            </div>
        </div>
    );
}
