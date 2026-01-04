import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Map, Settings, LogOut, Menu, X, CalendarDays, MessageSquare, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Bảng điều khiển", href: "/admin" },
  { icon: Map, label: "Quản lý Tour", href: "/admin/tours" },
  { icon: CalendarDays, label: "Quản lý Booking", href: "/admin/bookings" },
  { icon: MessageSquare, label: "Quản lý Tương tác", href: "/admin/interactions" },
  { icon: Ticket, label: "Quản lý Khuyến mãi", href: "/admin/promotions" },
  { icon: Users, label: "Người dùng", href: "/admin/users" },
  { icon: Settings, label: "Cài đặt", href: "/admin/settings" },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/internal/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-muted/40">
      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
          "sm:translate-x-0 sm:flex",
          isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <span className="font-bold text-lg">Quản trị Visita</span>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-muted sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                location.pathname === item.href
                  ? "bg-muted text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col sm:pl-64 w-full">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted sm:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-semibold text-lg">Bảng điều khiển</h1>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm hidden sm:block">
                <p className="font-medium">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
