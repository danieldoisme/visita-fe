import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBooking, Booking } from "@/context/BookingContext";
import { useTour } from "@/context/TourContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useReview, ReviewStatus } from "@/context/ReviewContext";
import { ContactModal } from "@/components/ContactModal";
import { ReviewModal } from "@/components/ReviewModal";
import { ContactType } from "@/context/ContactContext";
import { profileSchema, ProfileFormData, changePasswordSchema, ChangePasswordFormData } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Calendar as CalendarIcon,
    Users,
    Camera,
    Save,
    MapPin,
    Clock,
    Pencil,
    Lock,
    Heart,
    Trash2,
    Star,
    MessageSquare,
    Phone,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

type TabType = "personal" | "bookings" | "favorites" | "reviews" | "security";

export default function ProfilePage() {
    const { user } = useAuth();
    const { bookings, cancelBooking } = useBooking();
    const { tours } = useTour();
    const { favorites, toggleFavorite } = useFavorites();
    const { getUserReviews, hasReviewedBooking } = useReview();
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

    // Contact modal state
    const [contactModal, setContactModal] = useState<{
        isOpen: boolean;
        type: ContactType;
        bookingId?: number;
        tourTitle?: string;
    }>({
        isOpen: false,
        type: "change-request",
    });

    const openChangeRequestModal = (bookingId: number, tourTitle: string) => {
        setContactModal({
            isOpen: true,
            type: "change-request",
            bookingId,
            tourTitle,
        });
    };

    const closeContactModal = () => {
        setContactModal((prev) => ({ ...prev, isOpen: false }));
    };

    // Review modal state
    const [reviewModal, setReviewModal] = useState<{
        isOpen: boolean;
        booking: Booking | null;
    }>({
        isOpen: false,
        booking: null,
    });

    const openReviewModal = (booking: Booking) => {
        setReviewModal({
            isOpen: true,
            booking,
        });
    };

    const closeReviewModal = () => {
        setReviewModal((prev) => ({ ...prev, isOpen: false }));
    };

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.fullName || "",
            email: user?.email || "",
            phone: "",
            dob: null,
            gender: null,
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

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.fullName,
                email: user.email,
                phone: "",
                dob: null,
                gender: null,
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
                        Chờ xác nhận
                    </Badge>
                );
            case "confirmed":
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        Đã xác nhận
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        Đã hủy
                    </Badge>
                );
            case "completed":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Hoàn thành
                    </Badge>
                );
        }
    };

    // Filter user's bookings by current user ID
    const userBookings = bookings.filter((b) => b.userId === user?.userId);

    // Handle change photo button click
    const handleChangePhoto = () => {
        toast.info("Tính năng sẽ sớm ra mắt!");
    };

    // Handle cancel booking
    const handleCancelBooking = async (bookingId: number) => {
        await cancelBooking(bookingId);
        toast.success("Đã hủy đặt chỗ thành công!");
    };

    // Get favorite tours
    const favoriteTours = tours.filter((tour) => favorites.includes(tour.id));

    // Get user reviews
    const userReviews = user ? getUserReviews(user.userId) : [];

    // Get review status badge styling
    const getReviewStatusBadge = (status: ReviewStatus) => {
        switch (status) {
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Chờ duyệt
                    </Badge>
                );
            case "approved":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Đã duyệt
                    </Badge>
                );
            case "hidden":
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        Đã ẩn
                    </Badge>
                );
        }
    };

    // Render stars for reviews
    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                        }`}
                />
            ))}
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <div className="container px-4 md:px-8 py-8 md:py-12">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl md:text-3xl font-semibold shadow-lg">
                                    {getInitials(user?.fullName || "U")}
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
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                    {user?.fullName}
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
                    <div className="container px-4 md:px-8">
                        <nav className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setActiveTab("personal")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "personal"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">Thông tin cá nhân</span>
                                    <span className="sm:hidden">Cá nhân</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("bookings")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "bookings"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Đặt chỗ của tôi</span>
                                    <span className="sm:hidden">Đặt chỗ</span>
                                    {userBookings.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {userBookings.length}
                                        </Badge>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("reviews")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "reviews"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="hidden sm:inline">Đánh giá của tôi</span>
                                    <span className="sm:hidden">Đánh giá</span>
                                    {userReviews.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {userReviews.length}
                                        </Badge>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("favorites")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "favorites"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4" />
                                    Yêu thích
                                    {favoriteTours.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {favoriteTours.length}
                                        </Badge>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "security"
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
                <div className="container px-4 md:px-8 py-6 md:py-8">
                    {/* Personal Info Tab */}
                    {activeTab === "personal" && (
                        <div className="max-w-2xl w-full">
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
                                            {getInitials(form.watch("name") || user?.fullName || "U")}
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
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="phone">Số điện thoại</FormLabel>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                            <FormControl>
                                                                <Input
                                                                    id="phone"
                                                                    type="tel"
                                                                    placeholder="0901234567"
                                                                    autoComplete="tel"
                                                                    className="pl-10"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="dob"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel htmlFor="dob">Ngày sinh</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        id="dob"
                                                                        type="button"
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "w-full pl-3 text-left font-normal",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value ? (
                                                                            format(field.value, "dd/MM/yyyy", { locale: vi })
                                                                        ) : (
                                                                            <span>Chọn ngày sinh</span>
                                                                        )}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value || undefined}
                                                                        onSelect={field.onChange}
                                                                        disabled={(date) =>
                                                                            date > new Date() || date < new Date("1900-01-01")
                                                                        }
                                                                        initialFocus
                                                                        captionLayout="dropdown"
                                                                        fromYear={1940}
                                                                        toYear={new Date().getFullYear()}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="gender"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel htmlFor="gender">Giới tính</FormLabel>
                                                            <Select
                                                                name="gender"
                                                                onValueChange={field.onChange}
                                                                value={field.value ?? ""}
                                                            >
                                                                <SelectTrigger id="gender">
                                                                    <SelectValue placeholder="Chọn giới tính" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="male">Nam</SelectItem>
                                                                    <SelectItem value="female">Nữ</SelectItem>
                                                                    <SelectItem value="other">Khác</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

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
                                            <CalendarIcon className="w-8 h-8 text-slate-400" />
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
                                                <div className="flex flex-col gap-4">
                                                    {/* Booking Info */}
                                                    <div className="flex-1 space-y-3">
                                                        <div className="space-y-2">
                                                            <h3 className="font-semibold text-lg text-slate-900">
                                                                {booking.tourTitle}
                                                            </h3>
                                                            <p className="text-sm text-slate-500">
                                                                Mã đặt chỗ: #{booking.id.toString().padStart(6, "0")}
                                                            </p>
                                                            {getStatusBadge(booking.status)}
                                                        </div>

                                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                                                            <div className="flex items-center gap-1.5">
                                                                <CalendarIcon className="w-4 h-4 text-slate-400" />
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
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-slate-100">
                                                        <div>
                                                            <p className="text-sm text-slate-500">Tổng tiền</p>
                                                            <p className="text-xl font-bold text-primary">
                                                                {booking.totalPrice.toLocaleString("vi-VN")}₫
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => navigate(`/tours/${booking.tourId}`)}
                                                            >
                                                                <MapPin className="w-4 h-4 mr-1" />
                                                                Chi tiết
                                                            </Button>
                                                            {booking.status !== "cancelled" && booking.status !== "completed" && (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            openChangeRequestModal(
                                                                                booking.id,
                                                                                booking.tourTitle
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil className="w-4 h-4 mr-1" />
                                                                        Yêu cầu thay đổi
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleCancelBooking(booking.id)}
                                                                    >
                                                                        Hủy đặt chỗ
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {booking.status === "completed" && !hasReviewedBooking(booking.id) && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => openReviewModal(booking)}
                                                                >
                                                                    <Star className="w-4 h-4 mr-1" />
                                                                    Viết đánh giá
                                                                </Button>
                                                            )}
                                                            {booking.status === "completed" && hasReviewedBooking(booking.id) && (
                                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                                    Đã đánh giá
                                                                </Badge>
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

                    {/* Favorites Tab */}
                    {activeTab === "favorites" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Tour yêu thích
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {favoriteTours.length} tour
                                </p>
                            </div>

                            {favoriteTours.length === 0 ? (
                                /* Empty State */
                                <Card>
                                    <CardContent className="py-16 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                                            <Heart className="w-8 h-8 text-red-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                                            Chưa có tour yêu thích
                                        </h3>
                                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                            Nhấn vào biểu tượng trái tim trên các tour để thêm vào danh sách yêu thích.
                                        </p>
                                        <Button asChild>
                                            <a href="/tours">Khám phá tour</a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                /* Favorites Grid */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favoriteTours.map((tour) => (
                                        <Card
                                            key={tour.id}
                                            className="group overflow-hidden hover:shadow-md transition-shadow"
                                        >
                                            <div className="relative aspect-[4/3]">
                                                <img
                                                    src={tour.image}
                                                    alt={tour.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <button
                                                    onClick={() => toggleFavorite(tour.id)}
                                                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                    aria-label="Xóa khỏi yêu thích"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {tour.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {tour.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                                                    <Clock className="w-4 h-4" />
                                                    {tour.duration}
                                                    <span className="ml-auto flex items-center gap-1 text-yellow-500">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        {tour.rating}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t">
                                                    <div className="text-primary font-bold">
                                                        {tour.price.toLocaleString("vi-VN")}₫
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => navigate(`/tours/${tour.id}`)}
                                                    >
                                                        Xem chi tiết
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === "reviews" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Đánh giá của tôi
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {userReviews.length} đánh giá
                                </p>
                            </div>

                            {userReviews.length === 0 ? (
                                /* Empty State */
                                <Card>
                                    <CardContent className="py-16 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                            <MessageSquare className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                                            Chưa có đánh giá nào
                                        </h3>
                                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                            Sau khi hoàn thành tour, bạn có thể viết đánh giá để chia sẻ trải nghiệm của mình.
                                        </p>
                                        <Button onClick={() => setActiveTab("bookings")}>
                                            Xem đặt chỗ của tôi
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                /* Reviews List */
                                <div className="space-y-4">
                                    {userReviews.map((review) => (
                                        <Card key={review.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col gap-4">
                                                    {/* Review Info */}
                                                    <div className="flex-1 space-y-3">
                                                        <div className="space-y-2">
                                                            <h3 className="font-semibold text-lg text-slate-900">
                                                                {review.tourTitle}
                                                            </h3>
                                                            <p className="text-sm text-slate-500">
                                                                {format(new Date(review.date), "dd/MM/yyyy", { locale: vi })}
                                                            </p>
                                                            {getReviewStatusBadge(review.status)}
                                                        </div>

                                                        {renderStars(review.rating)}

                                                        <p className="text-slate-600">{review.comment}</p>

                                                        {review.status === "pending" && (
                                                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                                                Đánh giá của bạn đang chờ quản trị viên xem xét trước khi hiển thị công khai.
                                                            </p>
                                                        )}
                                                        {review.status === "hidden" && (
                                                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                                Đánh giá này đã bị ẩn và không hiển thị công khai.
                                                            </p>
                                                        )}
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

            {/* Contact Modal for Change Requests */}
            <ContactModal
                isOpen={contactModal.isOpen}
                onClose={closeContactModal}
                type={contactModal.type}
                bookingId={contactModal.bookingId}
                tourTitle={contactModal.tourTitle}
            />

            {/* Review Modal */}
            {reviewModal.booking && (
                <ReviewModal
                    isOpen={reviewModal.isOpen}
                    onClose={closeReviewModal}
                    booking={reviewModal.booking}
                />
            )}
        </>
    );
}
