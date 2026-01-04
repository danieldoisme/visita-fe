import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, LogOut, Menu, Map, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/internal/login");
    };

    const menuItems = [
        {
            title: "Chat với khách hàng",
            icon: MessageSquare,
            path: "/staff/chat",
        },
        {
            title: "Danh sách tour",
            icon: Map,
            path: "/staff/tours",
        },
        {
            title: "Đặt tour",
            icon: CalendarPlus,
            path: "/staff/booking",
        },
    ];

    return (
        <div className="h-screen overflow-hidden bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm transition-transform duration-300 lg:translate-x-0 flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b">
                    <Link to="/staff/chat" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <span>Visita Staff</span>
                    </Link>
                </div>

                <div className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <Icon className="h-5 w-5" />
                                {item.title}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t shrink-0">
                    <div className="p-3 bg-slate-50 rounded-lg mb-2 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                            {(user?.fullName || "S").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.fullName}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                <header className="bg-white border-b h-16 flex items-center justify-between px-4 lg:px-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>

                    <div className="ml-auto flex items-center gap-4">
                        {/* Header actions if needed */}
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
