import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { registerSchema, RegisterFormData } from "@/lib/validation";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  Compass,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Facebook,
  AlertCircle,
} from "lucide-react";
import GoogleAuthButton from "@/components/common/GoogleAuthButton";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setIsLoading(true);

    const result = await register(data.email, data.password, data.name);

    if (result.success) {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
    } else {
      setError(result.error || "Đăng ký thất bại");
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* Left Side: Image & Quote (Flipped for Register) */}
      <div className="relative hidden h-full flex-col bg-muted text-white lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1606801954050-be6b29588460?q=80&w=2070&auto=format&fit=crop"
          alt="Travel Adventure"
          className="absolute inset-0 h-full w-full object-cover travel-bg-image"
        />
        <div className="relative z-20 flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Compass className="h-6 w-6" />
            <span>Visita</span>
          </div>

          <div className="glass-quote rounded-2xl p-8 max-w-lg">
            <blockquote className="space-y-2">
              <p className="text-lg font-medium leading-relaxed">
                &ldquo;Hãy cùng Visita khám phá những nẻo đường đất nước, để
                thêm yêu từng dải đất hình chữ S thân thương.&rdquo;
              </p>
              <footer className="text-sm font-semibold pt-4 border-t border-white/20 mt-4">
                Visita TEAM
                <div className="text-xs font-normal opacity-80">
                  Đồng hành cùng bạn
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="h-full overflow-y-auto relative animate-fade-in">
        <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute top-8 right-8">
            <Link
              to="/"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </div>

          <div className="mx-auto w-full max-w-[400px] space-y-8">
            <div className="flex flex-col space-y-2 text-center items-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Compass className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Tạo tài khoản
              </h1>
              <p className="text-sm text-muted-foreground">
                Nhập thông tin chi tiết để bắt đầu hành trình của bạn
              </p>
            </div>

            <div className="grid gap-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Form {...form}>
                <form
                  className="grid gap-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <div className="relative group">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                          <FormControl>
                            <Input
                              placeholder="Nguyễn Văn A"
                              type="text"
                              autoCapitalize="words"
                              autoComplete="name"
                              autoCorrect="off"
                              className="pl-10 login-input"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                          <FormControl>
                            <Input
                              placeholder="name@example.com"
                              type="email"
                              autoCapitalize="none"
                              autoComplete="email"
                              autoCorrect="off"
                              className="pl-10 login-input"
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
                        <FormLabel>Mật khẩu</FormLabel>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Tối thiểu 8 ký tự"
                              autoComplete="new-password"
                              className="pl-10 pr-10 login-input"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                          <FormControl>
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Nhập lại mật khẩu"
                              autoComplete="new-password"
                              className="pl-10 pr-10 login-input"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    className="login-btn-gradient h-11 font-semibold text-md"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <GoogleAuthButton disabled={isLoading} />
                <Button
                  variant="outline"
                  className="social-btn"
                  onClick={() =>
                    toast.info("Đăng ký với Facebook chưa được triển khai")
                  }
                >
                  <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                  Facebook
                </Button>
              </div>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="underline underline-offset-4 hover:text-primary font-medium"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
