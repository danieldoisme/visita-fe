import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in as admin
    if (isAuthenticated && isAdmin) {
        navigate("/admin", { replace: true });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Check if user is admin
            navigate("/admin", { replace: true });
        } else {
            setError(result.error || "Đăng nhập thất bại");
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-zinc-950">
            {/* Left Side: Admin Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                </div>
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
                    <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-8 border border-primary/30">
                        <Shield className="h-10 w-10" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 text-center">
                        Quản trị Visita
                    </h1>
                    <p className="text-zinc-400 text-center max-w-md text-lg">
                        Truy cập bảng điều khiển quản trị để quản lý tours, người dùng và
                        cài đặt hệ thống.
                    </p>
                    <div className="mt-12 flex items-center gap-4 text-zinc-500 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Hệ thống hoạt động</span>
                        </div>
                        <div className="w-px h-4 bg-zinc-700" />
                        <span>Bảo mật SSL</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-zinc-900">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4 border border-primary/30">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Quản trị Visita</h1>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-white mb-2">Đăng nhập</h2>
                        <p className="text-zinc-400">
                            Nhập thông tin đăng nhập của quản trị viên
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium text-zinc-300"
                                htmlFor="email"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="admin@visita.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-11 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium text-zinc-300"
                                htmlFor="password"
                            >
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 pr-11 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-zinc-500 hover:text-zinc-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Đang đăng nhập...
                                </div>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </form>

                    <div className="text-center pt-4 border-t border-zinc-800">
                        <Link
                            to="/"
                            className="text-sm text-zinc-400 hover:text-primary transition-colors"
                        >
                            ← Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
