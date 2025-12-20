import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBooking, Booking } from "@/context/BookingContext";
import { profileSchema, ProfileFormData, changePasswordSchema, ChangePasswordFormData } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    User,
    Calendar,
    Users,
    Camera,
    Save,
    MapPin,
    Clock,
    Lock,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type TabType = "personal" | "bookings" | "security";

export default function ProfilePage() {
    const { user } = useAuth();
    const { bookings, cancelBooking } = useBooking();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        // Initialize from location state if available
        const state = location.state as { tab?: TabType } | null;
        return state?.tab || "personal";
    });

    // Update tab when navigating with state
    useEffect(() => {
        const state = location.state as { tab?: TabType } | null;
        if (state?.tab) {
            setActiveTab(state.tab);
        }
    }, [location.state]);

    // Form setup with react-hook-form
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
        },
    });

    // Security form setup
    const securityForm = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Update form when user data changes
    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
            });
        }
    }, [user, form]);

    // Get user's initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle save
    const onSubmit = async (data: ProfileFormData) => {
        setIsSaving(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSaving(false);
        toast.success("Đã lưu thông tin thành công!");
        console.log("Profile data:", data);
    };

    // Handle password change
    const onPasswordChange = async (data: ChangePasswordFormData) => {
        setIsChangingPassword(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsChangingPassword(false);

        // Reset form
        securityForm.reset();

        toast.success("Đổi mật khẩu thành công");
        console.log("Password change data:", data);
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

    // Handle change photo button click
    const handleChangePhoto = () => {
        toast.info("Tính năng sẽ sớm ra mắt!");
    };

    // Handle cancel booking
    const handleCancelBooking = async (bookingId: number) => {
        await cancelBooking(bookingId);
        toast.success("Đã hủy đặt chỗ thành công!");
    };

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
                            <button
                                onClick={handleChangePhoto}
                                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors"
                            >
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
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "security"
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Bảo mật
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
                                        {getInitials(form.watch("name") || user?.name || "U")}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">
                                            Ảnh đại diện
                                        </p>
                                        <p className="text-xs text-slate-500 mb-2">
                                            JPG, GIF hoặc PNG. Tối đa 2MB.
                                        </p>
                                        <Button variant="outline" size="sm" onClick={handleChangePhoto}>
                                            <Camera className="w-4 h-4 mr-2" />
                                            Thay đổi ảnh
                                        </Button>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Họ và tên</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nhập họ và tên"
                                                            autoComplete="name"
                                                            {...field}
                                                        />
                                                    </FormControl>
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
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="Nhập email"
                                                            autoComplete="email"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Save Button */}
                                        <div className="flex items-center gap-4 pt-4 border-t">
                                            <Button type="submit" disabled={isSaving}>
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
                                        </div>
                                    </form>
                                </Form>
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
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/tours/${booking.tourId}`)}
                                                        >
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            Chi tiết
                                                        </Button>
                                                        {booking.status !== "cancelled" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleCancelBooking(booking.id)}
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

                {/* Security Tab */}
                {activeTab === "security" && (
                    <div className="max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Lock className="w-5 h-5" />
                                    Đổi mật khẩu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...securityForm}>
                                    <form onSubmit={securityForm.handleSubmit(onPasswordChange)} className="space-y-4">
                                        {/* Hidden username field for accessibility/password managers (uses email as identifier) */}
                                        <input
                                            type="text"
                                            name="email"
                                            defaultValue={user?.email}
                                            autoComplete="username"
                                            className="sr-only"
                                            tabIndex={-1}
                                            aria-hidden="true"
                                        />
                                        <FormField
                                            control={securityForm.control}
                                            name="currentPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Nhập mật khẩu hiện tại"
                                                            autoComplete="current-password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={securityForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mật khẩu mới</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Nhập mật khẩu mới"
                                                            autoComplete="new-password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={securityForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Nhập lại mật khẩu mới"
                                                            autoComplete="new-password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="pt-4 border-t">
                                            <Button type="submit" disabled={isChangingPassword}>
                                                {isChangingPassword ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-4 h-4 mr-2" />
                                                        Đổi mật khẩu
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
