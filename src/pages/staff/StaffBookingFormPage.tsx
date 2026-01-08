import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTour, getCoverImage, type Tour } from "@/context/TourContext";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { createCustomerForStaff, type CustomerResult } from "@/api/staffService";
import { fetchTourByUuid } from "@/api/tourService";

interface StaffUserLookup {
    userId: string;
    fullName: string;
    email: string;
    phone?: string;
}

interface CreateUserData {
    email: string;
    fullName: string;
    phone: string;
    password: string;
}

type CreateUserResult =
    | { success: true; user: StaffUserLookup }
    | { success: false; error: string };

/**
 * NOTE: Backend API Limitation
 * There is no staff endpoint to search/lookup users by email.
 * - /admins/users/{id} exists but is admin-only and requires userId (not email)
 * - No /staffs/users/search or similar endpoint exists
 * 
 * Until such an endpoint is added, staff cannot look up existing customers.
 * They can only create new customers via POST /staffs/customers.
 */
const findUserByEmail = (_email: string): StaffUserLookup | null => null;

// Create customer using the staff endpoint
const createUserForStaff = async (data: CreateUserData): Promise<CreateUserResult> => {
    try {
        const result: CustomerResult = await createCustomerForStaff({
            email: data.email,
            password: data.password,
            fullName: data.fullName,
            phone: data.phone,
        });
        return {
            success: true,
            user: {
                userId: result.userId,
                fullName: result.fullName,
                email: result.email,
                phone: result.phone,
            },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Không thể tạo tài khoản khách hàng";
        return { success: false, error: message };
    }
};
import { formatCurrency } from "@/lib/formatters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import { AppliedDiscount } from "@/context/PromotionsContext";

import {
    CalendarPlus,
    Search,
    UserPlus,
    UserCheck,
    ArrowLeft,
    ArrowRight,
    Loader2,
    Check,
    Plus,
    Minus,
    Banknote,
    Users,
    Mail,
    Phone,
    User,
    X,
    Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

const cn = (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(" ");

const baseCustomerSchema = z.object({
    email: z
        .string()
        .min(1, "Vui lòng nhập email")
        .email("Email không hợp lệ"),
    fullName: z.string().min(1, "Vui lòng nhập họ tên"),
    phone: z
        .string()
        .min(1, "Vui lòng nhập số điện thoại")
        .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ (10-11 số)"),
    password: z.string().optional(),
});

const newCustomerSchema = baseCustomerSchema.extend({
    password: z
        .string()
        .min(1, "Vui lòng nhập mật khẩu")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

const bookingSchema = z.object({
    selectedDate: z.any().refine((val): val is Date => val instanceof Date, {
        message: "Vui lòng chọn ngày khởi hành",
    }),
    adults: z.number().min(1, "Tối thiểu 1 người lớn"),
    children: z.number().min(0),
    specialRequest: z.string().optional(),
    paymentMethod: z.literal("cash"), // Strict to 'cash'
});

type CustomerFormData = z.infer<typeof newCustomerSchema>;
type BookingFormData = z.infer<typeof bookingSchema>;

type Step = "customer" | "booking" | "confirmation";

// Removed unused PAYMENT_METHODS

export default function StaffBookingFormPage() {
    const { tourId } = useParams();
    const navigate = useNavigate();
    const { tours, loading: tourLoading } = useTour();
    const { addStaffBooking } = useBooking();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState<Step>("customer");

    // Persist last selected tour
    useEffect(() => {
        if (tourId) {
            localStorage.setItem("lastStaffBookingTourId", tourId);
        } else {
            const lastId = localStorage.getItem("lastStaffBookingTourId");
            if (lastId) {
                navigate(`/staff/booking/${lastId}`, { replace: true });
            }
        }
    }, [tourId, navigate]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingUser, setExistingUser] = useState<{ userId: string; fullName: string; email: string; phone?: string } | null>(null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
    const [directTour, setDirectTour] = useState<Tour | null>(null);
    const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

    // Try to find tour in TourContext first, fall back to direct fetch
    const contextTour = tours.find((t) => t.tourUuid === tourId);
    const tour = contextTour || directTour;

    // Fetch tour directly if not found in context (staff's assigned tours may not be in public list)
    useEffect(() => {
        if (!contextTour && tourId && !tourLoading) {
            fetchTourByUuid(tourId)
                .then((fetchedTour) => {
                    if (fetchedTour) {
                        setDirectTour(fetchedTour);
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch tour:", err);
                });
        }
    }, [contextTour, tourId, tourLoading]);

    // Customer form
    const customerForm = useForm<CustomerFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: ((values: any, context: any, options: any) => {
            const schema = isNewCustomer ? newCustomerSchema : baseCustomerSchema;
            return zodResolver(schema)(values, context, options);
        }) as any, // Cast to any to handle schema switching type mismatch
        defaultValues: {
            email: "",
            fullName: "",
            phone: "",
            password: "",
        },
    });

    // Booking form
    const bookingForm = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            // selectedDate is undefined initially
            adults: 1,
            children: 0,
            specialRequest: "",
            paymentMethod: "cash",
        },
    });

    const adults = bookingForm.watch("adults");
    const children = bookingForm.watch("children");

    // Calculate total price
    const basePrice = tour
        ? tour.price * adults + tour.price * 0.5 * children
        : 0;
    const totalPrice = appliedDiscount ? appliedDiscount.finalPrice : basePrice;

    // Search for existing user by email
    const handleEmailSearch = async () => {
        const email = customerForm.getValues("email");
        if (!email || !z.string().email().safeParse(email).success) {
            toast.error("Vui lòng nhập email hợp lệ");
            return;
        }

        setIsSearching(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        const user = findUserByEmail(email);

        if (user) {
            setExistingUser({
                userId: user.userId,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
            });
            setIsNewCustomer(false);
            customerForm.setValue("fullName", user.fullName);
            customerForm.setValue("phone", user.phone || "");
            customerForm.setValue("password", ""); // Clear password if any
            customerForm.clearErrors();
            toast.success(`Tìm thấy khách hàng: ${user.fullName}`);
        } else {
            setExistingUser(null);
            setIsNewCustomer(true);
            // Don't clear email
            customerForm.setValue("fullName", "");
            customerForm.setValue("phone", "");
            customerForm.setValue("password", ""); // Ensure password field is clean
            toast.info("Khách hàng mới - Vui lòng nhập thông tin tạo tài khoản");
        }
        setIsSearching(false);
    };

    // Handle customer step submit
    const handleCustomerSubmit = (data: CustomerFormData) => {
        setCustomerData(data);
        setCurrentStep("booking");
    };

    // Handle booking step submit
    const handleBookingSubmit = () => {
        setCurrentStep("confirmation");
    };

    // Final submission
    const handleFinalSubmit = async () => {
        if (!tour || !customerData || !user) return;

        setIsSubmitting(true);
        try {
            let userId = existingUser?.userId;

            // Create new user if needed
            if (isNewCustomer) {
                const result = await createUserForStaff({
                    email: customerData.email,
                    fullName: customerData.fullName,
                    phone: customerData.phone,
                    password: customerData.password || "123456", // Fallback shouldn't happen due to validation
                });

                if (!result.success) {
                    toast.error(result.error || "Không thể tạo tài khoản khách hàng");
                    setIsSubmitting(false);
                    return;
                }
                userId = result.user.userId;
                toast.success("Đã tạo tài khoản cho khách hàng");
            }

            const bookingData = bookingForm.getValues();

            // Create booking with confirmed status
            await addStaffBooking(
                {
                    userId,
                    tourId: tour.id,
                    tourUuid: tour.tourUuid,
                    tourTitle: tour.title,
                    tourPrice: tour.price,
                    selectedDate: bookingData.selectedDate,
                    adults: bookingData.adults,
                    children: bookingData.children,
                    contactInfo: {
                        fullName: customerData.fullName,
                        email: customerData.email,
                        phone: customerData.phone,
                    },
                    paymentMethod: "cash",
                    totalPrice,
                    specialRequest: bookingData.specialRequest,
                    ...(appliedDiscount && { promoCode: appliedDiscount.code }),
                },
                user.userId
            );

            toast.success("Đặt tour thành công!");
            localStorage.removeItem("lastStaffBookingTourId");
            navigate("/staff/tours");
        } catch {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset when tour changes
    useEffect(() => {
        setCurrentStep("customer");
        setExistingUser(null);
        setIsNewCustomer(false);
        setCustomerData(null);
        customerForm.reset();
        bookingForm.reset();
    }, [tourId]);

    if (tourLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Không tìm thấy tour</p>
                <Button onClick={() => navigate("/staff/tours")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    const steps = [
        { id: "customer", label: "Khách hàng", icon: User },
        { id: "booking", label: "Chi tiết", icon: CalendarIcon },
        { id: "confirmation", label: "Xác nhận", icon: Check },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        localStorage.removeItem("lastStaffBookingTourId");
                        navigate("/staff/tours");
                    }}
                >
                    <X className="h-5 w-5" />
                </Button>
                <CalendarPlus className="h-7 w-7 text-primary" />
                <h1 className="text-2xl font-bold">Đặt Tour cho Khách</h1>
            </div>

            {/* Tour Preview */}
            <div className="bg-white rounded-xl shadow-sm border p-4 flex gap-4">
                <img
                    src={getCoverImage(tour)}
                    alt={tour.title}
                    className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg line-clamp-1">{tour.title}</h2>
                    <p className="text-sm text-muted-foreground">{tour.location} • {tour.duration}</p>
                    <p className="text-lg font-bold text-primary mt-1">
                        {formatCurrency(tour.price)}<span className="text-sm font-normal text-muted-foreground">/người</span>
                    </p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted =
                        (step.id === "customer" && (currentStep === "booking" || currentStep === "confirmation")) ||
                        (step.id === "booking" && currentStep === "confirmation");

                    return (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                                    isActive && "bg-primary text-white",
                                    isCompleted && "bg-green-100 text-green-700",
                                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="w-8 h-0.5 bg-muted mx-1" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                {/* Step 1: Customer */}
                {currentStep === "customer" && (
                    <form onSubmit={customerForm.handleSubmit(handleCustomerSubmit)} className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <User className="h-5 w-5 text-primary" />
                                Thông tin khách hàng
                            </h3>

                            {/* Email Search */}
                            <div className="space-y-2 mb-6">
                                <Label htmlFor="customer-email">Email khách hàng</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="customer-email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                            className="pl-9"
                                            {...customerForm.register("email")}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleEmailSearch}
                                        disabled={isSearching}
                                    >
                                        {isSearching ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                        <span className="ml-1 hidden sm:inline">Tìm kiếm</span>
                                    </Button>
                                </div>
                                {customerForm.formState.errors.email && (
                                    <p className="text-sm text-destructive">{customerForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            {/* Customer Status Badge */}
                            {(existingUser || isNewCustomer) && (
                                <div className="mb-4">
                                    {existingUser ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                            <UserCheck className="h-3 w-3 mr-1" />
                                            Khách hàng hiện tại
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                            <UserPlus className="h-3 w-3 mr-1" />
                                            Khách hàng mới
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Customer Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer-name">Họ và tên</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="customer-name"
                                            autoComplete="name"
                                            placeholder="Nguyễn Văn A"
                                            className="pl-9"
                                            disabled={!isNewCustomer}
                                            {...customerForm.register("fullName")}
                                        />
                                    </div>
                                    {customerForm.formState.errors.fullName && (
                                        <p className="text-sm text-destructive">{customerForm.formState.errors.fullName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer-phone">Số điện thoại</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="customer-phone"
                                            autoComplete="tel"
                                            placeholder="0901234567"
                                            className="pl-9"
                                            disabled={!isNewCustomer}
                                            {...customerForm.register("phone")}
                                        />
                                    </div>
                                    {customerForm.formState.errors.phone && (
                                        <p className="text-sm text-destructive">{customerForm.formState.errors.phone.message}</p>
                                    )}
                                </div>
                                {isNewCustomer && (
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="customer-password">Mật khẩu (Tạo mới)</Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex items-center justify-center">***</div>
                                            <Input
                                                id="customer-password"
                                                type="text"
                                                autoComplete="new-password"
                                                placeholder="Nhập mật khẩu cho khách..."
                                                className="pl-9"
                                                {...customerForm.register("password")}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            * Yêu cầu khách hàng ghi nhớ mật khẩu này để đăng nhập sau này.
                                        </p>
                                        {customerForm.formState.errors.password && (
                                            <p className="text-sm text-destructive">{customerForm.formState.errors.password.message}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={!existingUser && !isNewCustomer}>
                                Tiếp tục
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 2: Booking Details */}
                {currentStep === "booking" && (
                    <form onSubmit={bookingForm.handleSubmit(handleBookingSubmit)} className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                Chi tiết đặt tour
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Date Selection */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Ngày khởi hành</span>
                                    <div className="sm:border rounded-lg p-0 sm:p-2 flex justify-center bg-white overflow-hidden">
                                        <div className="transform scale-[0.75] xs:scale-100 origin-top">
                                            <Calendar
                                                mode="single"
                                                selected={bookingForm.watch("selectedDate")}
                                                onSelect={(date) => bookingForm.setValue("selectedDate", date as Date)}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                className="rounded-md border-0"
                                                initialFocus
                                            />
                                        </div>
                                    </div>
                                    {bookingForm.formState.errors.selectedDate && (
                                        <p className="text-sm text-destructive">{String(bookingForm.formState.errors.selectedDate.message)}</p>
                                    )}
                                </div>

                                {/* Payment Method - Fixed to Cash */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Phương thức thanh toán</span>
                                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                                        <Banknote className="mr-2 h-4 w-4" />
                                        Tiền mặt
                                    </div>
                                    <input type="hidden" {...bookingForm.register("paymentMethod")} />
                                </div>

                                {/* Adults */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Người lớn</span>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => bookingForm.setValue("adults", Math.max(1, adults - 1))}
                                            disabled={adults <= 1}
                                            aria-label="Giảm số lượng người lớn"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-12 text-center font-medium text-lg">{adults}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => bookingForm.setValue("adults", adults + 1)}
                                            aria-label="Tăng số lượng người lớn"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground">× {formatCurrency(tour.price)}</span>
                                    </div>
                                </div>

                                {/* Children */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Trẻ em (50% giá)</span>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => bookingForm.setValue("children", Math.max(0, children - 1))}
                                            disabled={children <= 0}
                                            aria-label="Giảm số lượng trẻ em"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-12 text-center font-medium text-lg">{children}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => bookingForm.setValue("children", children + 1)}
                                            aria-label="Tăng số lượng trẻ em"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground">× {formatCurrency(tour.price * 0.5)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Special Request */}
                            <div className="space-y-2 mt-6">
                                <Label htmlFor="special-request">Yêu cầu đặc biệt (tùy chọn)</Label>
                                <Textarea
                                    id="special-request"
                                    placeholder="Ghi chú thêm..."
                                    rows={3}
                                    {...bookingForm.register("specialRequest")}
                                />
                            </div>

                            {/* Promo Code */}
                            <div className="mt-6">
                                <PromoCodeInput
                                    originalPrice={basePrice}
                                    onDiscountApplied={setAppliedDiscount}
                                    appliedDiscount={appliedDiscount}
                                />
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{adults} người lớn × {formatCurrency(tour.price)}</span>
                                <span>{formatCurrency(tour.price * adults)}</span>
                            </div>
                            {children > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>{children} trẻ em × {formatCurrency(tour.price * 0.5)}</span>
                                    <span>{formatCurrency(tour.price * 0.5 * children)}</span>
                                </div>
                            )}
                            {appliedDiscount && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Giảm giá ({appliedDiscount.code})</span>
                                    <span>-{formatCurrency(appliedDiscount.discountAmount)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 flex justify-between items-center">
                                <span className="font-medium">Tổng tiền</span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep("customer")}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Quay lại
                            </Button>
                            <Button type="submit">
                                Tiếp tục
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === "confirmation" && customerData && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Check className="h-5 w-5 text-primary" />
                            Xác nhận đặt tour
                        </h3>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Customer Info */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Khách hàng
                                </h4>
                                <p className="text-sm">{customerData.fullName}</p>
                                <p className="text-sm text-muted-foreground">{customerData.email}</p>
                                <p className="text-sm text-muted-foreground">{customerData.phone}</p>
                                {isNewCustomer && (
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                                        Sẽ tạo tài khoản mới
                                    </Badge>
                                )}
                            </div>

                            {/* Booking Info */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    Chi tiết
                                </h4>
                                <p className="text-sm">
                                    Ngày: {format(bookingForm.getValues("selectedDate"), "dd/MM/yyyy", { locale: vi })}
                                </p>
                                <p className="text-sm flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {adults} người lớn{children > 0 ? ` + ${children} trẻ em` : ""}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Tiền mặt
                                </p>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Tổng thanh toán</p>
                                    <p className="text-sm text-muted-foreground">Trạng thái: Đã thanh toán</p>
                                </div>
                                <span className="text-3xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>

                        {/* Confirmed Badge */}
                        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-lg py-3">
                            <Check className="h-5 w-5" />
                            <span className="font-medium">Booking sẽ được xác nhận tự động</span>
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setCurrentStep("booking")}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Quay lại
                            </Button>
                            <Button className="w-full sm:w-auto" onClick={handleFinalSubmit} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Xác nhận đặt tour
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
