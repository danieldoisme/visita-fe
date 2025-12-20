import { useState } from "react";
import { X } from "lucide-react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Compass, Menu, User, Calendar, LogOut, ChevronDown, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ChatWidget from "@/components/ChatWidget";

export default function MainLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get user's initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Compass className="h-6 w-6" />
            <span>Visita</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Trang chủ
            </Link>
            <Link
              to="/tours"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Tour
            </Link>
            <Link
              to="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Giới thiệu
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              /* Authenticated User Dropdown */
              <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                <PopoverTrigger asChild>
                  <button
                    id="user-menu-trigger"
                    name="user-menu"
                    className="hidden md:flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(user?.name || "U")}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="px-3 py-2 border-b mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    {isAdmin ? (
                      /* Admin Menu Items */
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Trang quản trị
                      </Link>
                    ) : (
                      /* User Menu Items */
                      <>
                        <Link
                          to="/profile"
                          state={{ tab: "personal" }}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Trang cá nhân
                        </Link>
                        <Link
                          to="/profile"
                          state={{ tab: "bookings" }}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          Đặt chỗ của tôi
                        </Link>
                        <Link
                          to="/profile"
                          state={{ tab: "security" }}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Lock className="w-4 h-4" />
                          Bảo mật
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="border-t mt-2 pt-2">
                    <button
                      id="logout-button"
                      name="logout"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              /* Guest Login Button */
              <Link to="/login">
                <Button id="login-button" name="login" variant="ghost" size="sm" className="hidden md:flex">
                  Đăng nhập
                </Button>
              </Link>
            )}
            <Button id="book-now-button" name="book-now" size="sm" className="hidden md:flex">
              Đặt ngay
            </Button>
            <Button
              id="mobile-menu-button"
              name="mobile-menu"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
              >
                Trang chủ
              </Link>
              <Link
                to="/tours"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
              >
                Tour
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
              >
                Giới thiệu
              </Link>
              <div className="border-t my-2"></div>
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                    >
                      Trang quản trị
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/profile"
                        state={{ tab: "personal" }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                      >
                        Trang cá nhân
                      </Link>
                      <Link
                        to="/profile"
                        state={{ tab: "bookings" }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                      >
                        Đặt chỗ của tôi
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 transition-colors hover:bg-red-50 text-left"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                >
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Visita Inc. Bảo lưu mọi quyền.
          </p>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <ChatWidget />
    </div>
  );
}
