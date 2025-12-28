import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Loader2,
    Compass,
    LogIn,
    UserPlus,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
} from "lucide-react";

interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    onSuccess?: () => void;
}

type AuthTab = "login" | "register";

export function AuthRequiredModal({
    isOpen,
    onClose,
    title = "Đăng nhập để tiếp tục",
    message = "Vui lòng đăng nhập hoặc tạo tài khoản để tiếp tục.",
    onSuccess,
}: AuthRequiredModalProps) {
    const { login, register } = useAuth();
    const { executePendingFavorite } = useFavorites();

    const [activeTab, setActiveTab] = useState<AuthTab>("login");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Password visibility toggles
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Login form state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register form state
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

    const resetForm = () => {
        setLoginEmail("");
        setLoginPassword("");
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterConfirmPassword("");
        setActiveTab("login");
        setShowLoginPassword(false);
        setShowRegisterPassword(false);
        setShowConfirmPassword(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setIsSubmitting(true);
        const result = await login(loginEmail, loginPassword);

        if (result.success) {
            toast.success("Đăng nhập thành công!");
            // Execute the pending favorite action
            await executePendingFavorite();
            handleClose();
            // Call onSuccess callback if provided
            onSuccess?.();
        } else {
            toast.error(result.error || "Đăng nhập thất bại");
        }
        setIsSubmitting(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (registerPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (registerPassword !== registerConfirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsSubmitting(true);
        const result = await register(registerEmail, registerPassword, registerName);

        if (result.success) {
            toast.success("Tạo tài khoản thành công!");
            // Execute the pending favorite action
            await executePendingFavorite();
            handleClose();
            // Call onSuccess callback if provided
            onSuccess?.();
        } else {
            toast.error(result.error || "Đăng ký thất bại");
        }
        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title} className="max-w-md">
            <div className="space-y-6">
                {/* Header with icon and message */}
                <div className="text-center">
                    <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Compass className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-gray-600 text-sm">{message}</p>
                </div>

                {/* Tab navigation */}
                <div className="flex border-b">
                    <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "login"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <LogIn className="w-4 h-4 inline-block mr-2" />
                        Đăng nhập
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("register")}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "register"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <UserPlus className="w-4 h-4 inline-block mr-2" />
                        Đăng ký
                    </button>
                </div>

                {/* Login form */}
                {activeTab === "login" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="login-email" className="text-sm font-medium text-gray-700 block mb-1">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    disabled={isSubmitting}
                                    autoComplete="email"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="login-password" className="text-sm font-medium text-gray-700 block mb-1">
                                Mật khẩu
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="login-password"
                                    name="password"
                                    type={showLoginPassword ? "text" : "password"}
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    disabled={isSubmitting}
                                    autoComplete="current-password"
                                    className="pl-10 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    tabIndex={-1}
                                >
                                    {showLoginPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </form>
                )}

                {/* Register form */}
                {activeTab === "register" && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label htmlFor="register-name" className="text-sm font-medium text-gray-700 block mb-1">
                                Họ và tên
                            </label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="register-name"
                                    name="name"
                                    value={registerName}
                                    onChange={(e) => setRegisterName(e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    disabled={isSubmitting}
                                    autoComplete="name"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="register-email" className="text-sm font-medium text-gray-700 block mb-1">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    disabled={isSubmitting}
                                    autoComplete="email"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="register-password" className="text-sm font-medium text-gray-700 block mb-1">
                                Mật khẩu
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="register-password"
                                    name="password"
                                    type={showRegisterPassword ? "text" : "password"}
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    placeholder="Tối thiểu 6 ký tự"
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                    className="pl-10 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                    tabIndex={-1}
                                >
                                    {showRegisterPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="register-confirm-password" className="text-sm font-medium text-gray-700 block mb-1">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="register-confirm-password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={registerConfirmPassword}
                                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                    className="pl-10 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                "Tạo tài khoản"
                            )}
                        </Button>
                    </form>
                )}

            </div>
        </Modal>
    );
}
