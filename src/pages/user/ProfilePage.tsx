import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBooking, Booking } from "@/context/BookingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    User,
    Calendar,
    Users,
    Camera,
    Save,
    MapPin,
    Clock,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type TabType = "personal" | "bookings";

export default function ProfilePage() {
    const { user } = useAuth();
    const { bookings } = useBooking();
    const [activeTab, setActiveTab] = useState<TabType>("personal");

    // Personal info form state
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Get user's initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle save (mock)
    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    // Get status badge styling
    const getStatusBadge = (status: Booking["status"]) => {
        switch (status) {
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Đang xử lý
                    </Badge>
                );
            case "confirmed":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Đã xác nhận
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        Đã hủy
                    </Badge>
                );
        }
    };

    // Filter user's bookings (in real app, would filter by user ID)
    const userBookings = bookings;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                <div className="container py-12">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                                {getInitials(user?.name || "U")}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors">
                                <Camera className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                        {/* User Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                {user?.name}
                            </h1>
                            <p className="text-slate-600">{user?.email}</p>
                            <Badge variant="secondary" className="mt-2">
                                {user?.role === "admin" ? "Quản trị viên" : "Thành viên"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b bg-white sticky top-16 z-40">
                <div className="container">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => setActiveTab("personal")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "personal"
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Thông tin cá nhân
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("bookings")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "bookings"
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Đặt chỗ của tôi
                                {userBookings.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {userBookings.length}
                                    </Badge>
                                )}
                            </div>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="container py-8">
                {/* Personal Info Tab */}
                {activeTab === "personal" && (
                    <div className="max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <User className="w-5 h-5" />
                                    Thông tin cá nhân
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xl font-semibold">
                                        {getInitials(name || user?.name || "U")}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">
                                            Ảnh đại diện
                                        </p>
                                        <p className="text-xs text-slate-500 mb-2">
                                            JPG, GIF hoặc PNG. Tối đa 2MB.
                                        </p>
                                        <Button variant="outline" size="sm">
                                            <Camera className="w-4 h-4 mr-2" />
                                            Thay đổi ảnh
                                        </Button>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="full-name" className="text-sm font-medium text-slate-700">
                                            Họ và tên
                                        </label>
                                        <Input
                                            id="full-name"
                                            name="full-name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Nhập email"
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex items-center gap-4 pt-4 border-t">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </Button>
                                    {saveSuccess && (
                                        <span className="text-sm text-green-600 font-medium">
                                            ✓ Đã lưu thành công!
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === "bookings" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Lịch sử đặt chỗ
                            </h2>
                            <p className="text-sm text-slate-500">
                                {userBookings.length} đặt chỗ
                            </p>
                        </div>

                        {userBookings.length === 0 ? (
                            /* Empty State */
                            <Card>
                                <CardContent className="py-16 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Calendar className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                                        Chưa có đặt chỗ nào
                                    </h3>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                        Bạn chưa đặt tour nào. Hãy khám phá các tour hấp dẫn của
                                        chúng tôi!
                                    </p>
                                    <Button asChild>
                                        <a href="/tours">Khám phá tour</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            /* Bookings List */
                            <div className="space-y-4">
                                {userBookings.map((booking) => (
                                    <Card
                                        key={booking.id}
                                        className="hover:shadow-md transition-shadow"
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                {/* Booking Info */}
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-lg text-slate-900">
                                                                {booking.tourTitle}
                                                            </h3>
                                                            <p className="text-sm text-slate-500">
                                                                Mã đặt chỗ: #{booking.id.toString().padStart(6, "0")}
                                                            </p>
                                                        </div>
                                                        {getStatusBadge(booking.status)}
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4 text-slate-400" />
                                                            {format(new Date(booking.selectedDate), "dd/MM/yyyy", {
                                                                locale: vi,
                                                            })}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Users className="w-4 h-4 text-slate-400" />
                                                            {booking.adults} người lớn
                                                            {booking.children > 0 &&
                                                                `, ${booking.children} trẻ em`}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                            Đặt ngày{" "}
                                                            {format(new Date(booking.createdAt), "dd/MM/yyyy", {
                                                                locale: vi,
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price & Actions */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-500">Tổng tiền</p>
                                                        <p className="text-xl font-bold text-primary">
                                                            {booking.totalPrice.toLocaleString("vi-VN")}₫
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            Chi tiết
                                                        </Button>
                                                        {booking.status !== "cancelled" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                Hủy đặt chỗ
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
