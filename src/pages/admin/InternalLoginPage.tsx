import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { internalLoginSchema, InternalLoginFormData } from "@/lib/validation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Shield, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated, isAdmin, isStaff } = useAuth();
    const navigate = useNavigate();

    const form = useForm<InternalLoginFormData>({
        resolver: zodResolver(internalLoginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    // Redirect if already logged in based on role
    useEffect(() => {
        if (isAuthenticated) {
            if (isAdmin) {
                navigate("/admin", { replace: true });
            } else if (isStaff) {
                navigate("/staff/chat", { replace: true });
            }
        }
    }, [isAuthenticated, isAdmin, isStaff, navigate]);

    const onSubmit = async (data: InternalLoginFormData) => {
        setError("");
        setIsLoading(true);

        const result = await login(data.username, data.password);

        if (!result.success) {
            setError(result.error || "Đăng nhập thất bại");
        }
        // Role-based redirect handled by useEffect

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-zinc-950 overflow-hidden">
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
                        Đăng nhập nội bộ
                    </h1>
                    <p className="text-zinc-400 text-center max-w-md text-lg">
                        Cổng đăng nhập dành cho nhân viên hỗ trợ và quản trị viên hệ thống Visita.
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
                        <h1 className="text-2xl font-bold text-white">Đăng nhập nội bộ</h1>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-white mb-2">Đăng nhập</h2>
                        <p className="text-zinc-400">
                            Dành cho nhân viên và quản trị viên
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-300">Tài khoản</FormLabel>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    autoComplete="username"
                                                    placeholder="admin"
                                                    className="pl-11 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-300">Mật khẩu</FormLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="current-password"
                                                    placeholder="••••••••"
                                                    className="pl-11 pr-11 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary"
                                                    {...field}
                                                />
                                            </FormControl>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                    </Form>

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
