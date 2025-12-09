import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Compass,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Facebook,
} from "lucide-react";
import "@/styles/login.css";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* Left Side: Image & Quote (Flipped for Register) */}
      <div className="relative hidden h-full flex-col bg-muted text-white lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
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
                &ldquo;To travel is to live. Join our community of explorers and
                start writing your own adventure story today.&rdquo;
              </p>
              <footer className="text-sm font-semibold pt-4 border-t border-white/20 mt-4">
                Hans Christian Andersen
                <div className="text-xs font-normal opacity-80">
                  Writer & Traveler
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
              Back to Home
            </Link>
          </div>

          <div className="mx-auto w-full max-w-[400px] space-y-8">
            <div className="flex flex-col space-y-2 text-center items-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Compass className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your details to start your journey
              </p>
            </div>

            <div className="grid gap-6">
              <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none"
                    htmlFor="name"
                  >
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="name"
                      autoCorrect="off"
                      className="pl-10 login-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      className="pl-10 login-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="pl-10 pr-10 login-input"
                    />
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
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="pl-10 pr-10 login-input"
                    />
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
                </div>
                <Button className="login-btn-gradient h-11 font-semibold text-md">
                  Create Account
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="social-btn">
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="social-btn">
                  <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                  Facebook
                </Button>
              </div>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="underline underline-offset-4 hover:text-primary font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
