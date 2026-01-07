import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Calendar } from "@/components/ui/calendar";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useBooking, PaymentMethod } from "@/context/BookingContext";
import { Tour } from "@/context/TourContext";
import { bookingSchema, BookingFormData } from "@/lib/validation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    CalendarDays,
    Users,
    Banknote,
    Plus,
    Minus,
    Check,
    Loader2,
    Shield,
} from "lucide-react";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import { AppliedDiscount } from "@/context/PromotionsContext";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    tour: Tour;
}

export function BookingModal({ isOpen, onClose, tour }: BookingModalProps) {
    const { user, isAdmin, isStaff } = useAuth();
    const { addBooking } = useBooking();

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            selectedDate: undefined,
            adults: 1,
            children: 0,
            fullName: "",
            email: "",
            phone: "",
            paymentMethod: "cash",
            promoCode: "",
            specialRequest: "",
        },
    });

    // State for applied discount
    const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

    const { watch, setValue, formState: { isSubmitting } } = form;
    const selectedDate = watch("selectedDate");
    const adults = watch("adults");
    const children = watch("children");
    const isSuccess = form.formState.isSubmitSuccessful;

    // Ref for date section to scroll into view on error
    const dateSectionRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to first error field on validation failure
    useEffect(() => {
        const errors = form.formState.errors;
        if (errors.selectedDate && dateSectionRef.current) {
            dateSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [form.formState.errors]);

    // Pre-fill contact info if logged in
    useEffect(() => {
        if (user) {
            form.setValue("fullName", user.fullName);
            form.setValue("email", user.email);
        }
    }, [user, form]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            form.reset({
                selectedDate: undefined,
                adults: 1,
                children: 0,
                fullName: user?.fullName || "",
                email: user?.email || "",
                phone: "",
                paymentMethod: "cash",
                specialRequest: "",
            });
            setAppliedDiscount(null);
        }
    }, [isOpen, user, form]);

    const basePrice = tour.price * adults + tour.price * 0.5 * children;
    const totalPrice = appliedDiscount ? appliedDiscount.finalPrice : basePrice;

    // State for payment popup
    const [gatewayLoading, setGatewayLoading] = useState(false);
    const [paymentPopupBlocked, setPaymentPopupBlocked] = useState(false);
    const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null);
    const paymentPopupRef = useRef<Window | null>(null);

    // Listen for payment result from popup
    useEffect(() => {
        const handlePaymentMessage = (event: MessageEvent) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === "PAYMENT_SUCCESS") {
                setGatewayLoading(false);
                setPendingPaymentUrl(null);
                setPaymentPopupBlocked(false);
                paymentPopupRef.current = null;
                // Form will show success state via isSubmitSuccessful
            } else if (event.data?.type === "PAYMENT_CANCEL") {
                setGatewayLoading(false);
                setPendingPaymentUrl(null);
                setPaymentPopupBlocked(false);
                paymentPopupRef.current = null;
                toast.error("Thanh toán bị hủy. Vui lòng thử lại.");
                // Reset form submission state to allow retry
                form.reset(form.getValues());
            }
        };

        window.addEventListener("message", handlePaymentMessage);
        return () => window.removeEventListener("message", handlePaymentMessage);
    }, [form]);

    // Handle popup manually if blocked
    const openPaymentPopup = (url: string) => {
        const popup = window.open(
            url,
            "payment_popup",
            "width=500,height=700,scrollbars=yes,resizable=yes"
        );

        if (popup) {
            paymentPopupRef.current = popup;
            setPaymentPopupBlocked(false);
            setPendingPaymentUrl(null);
        } else {
            // Popup was blocked
            setPaymentPopupBlocked(true);
            setPendingPaymentUrl(url);
        }
    };

    const onSubmit = async (data: BookingFormData) => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để đặt tour");
            return;
        }

        try {
            setGatewayLoading(true);
            setPaymentPopupBlocked(false);
            setPendingPaymentUrl(null);

            const result = await addBooking({
                tourId: tour.id,
                tourUuid: tour.tourUuid,
                tourTitle: tour.title,
                tourPrice: tour.price,
                selectedDate: data.selectedDate,
                adults: data.adults,
                children: data.children,
                contactInfo: {
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                },
                paymentMethod: data.paymentMethod,
                totalPrice,
                specialRequest: data.specialRequest,
                ...(appliedDiscount && { promoCode: appliedDiscount.code }),
                userId: user.userId,
            });

            // Handle payment redirect for MoMo/PayPal
            if (result.paymentUrl && (data.paymentMethod === "momo" || data.paymentMethod === "paypal")) {
                openPaymentPopup(result.paymentUrl);
                // Keep gatewayLoading true while waiting for popup result
            } else {
                // Cash payment - no redirect needed
                setGatewayLoading(false);
                toast.success("Đặt tour thành công!");
            }
        } catch (error) {
            console.error("Booking failed:", error);
            toast.error("Đặt tour thất bại. Vui lòng thử lại.");
            setGatewayLoading(false);
        }
    };


    const paymentMethods: {
        id: PaymentMethod;
        label: string;
        icon?: typeof Banknote;
        imageUrl?: string;
    }[] = [
            { id: "cash" as PaymentMethod, label: "Thanh toán khi nhận tour", icon: Banknote },
            { id: "momo" as PaymentMethod, label: "Ví MoMo", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a0/MoMo_Logo_App.svg" },
            { id: "paypal" as PaymentMethod, label: "PayPal", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
        ];

    // Block admin users from booking
    if (isAdmin) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Đặt tour" className="max-w-md">
                <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Chức năng dành cho khách hàng</h3>
                    <p className="text-gray-600 mb-6">
                        Tài khoản quản trị viên không thể đặt tour. Vui lòng sử dụng tài khoản khách hàng để đặt tour hoặc quay lại trang quản trị.
                    </p>
                    <div className="space-y-3">
                        <Button onClick={onClose} variant="outline" className="w-full">
                            Đóng
                        </Button>
                        <Button onClick={() => window.location.href = "/admin"} className="w-full">
                            Về trang quản trị
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    // Block staff users - redirect to staff booking page
    if (isStaff) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Đặt tour" className="max-w-md">
                <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Đặt tour cho khách hàng</h3>
                    <p className="text-gray-600 mb-6">
                        Để đặt tour cho khách hàng tại quầy, vui lòng sử dụng trang đặt tour dành cho nhân viên.
                    </p>
                    <div className="space-y-3">
                        <Button onClick={onClose} variant="outline" className="w-full">
                            Đóng
                        </Button>
                        <Button onClick={() => window.location.href = `/staff/booking/${tour.id}`} className="w-full">
                            Đặt tour cho khách hàng
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    if (isSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Đặt tour thành công!" className="max-w-md">
                <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Cảm ơn bạn đã đặt tour!</h3>
                    <p className="text-gray-600 mb-4">
                        Chúng tôi đã nhận được yêu cầu đặt tour của bạn. Thông tin chi tiết sẽ được gửi đến email{" "}
                        <span className="font-medium">{watch("email")}</span>.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                        <p className="text-sm text-gray-600 mb-1">Tour: <span className="font-medium text-gray-900">{tour.title}</span></p>
                        <p className="text-sm text-gray-600 mb-1">
                            Ngày khởi hành: <span className="font-medium text-gray-900">{selectedDate && formatDate(selectedDate)}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Tổng tiền: <span className="font-medium text-primary">{formatCurrency(totalPrice)}</span>
                        </p>
                    </div>
                    <Button onClick={onClose} className="w-full">
                        Đóng
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Đặt tour" className="max-w-2xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Tour Info Summary */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 flex gap-4">
                        <img
                            src={tour.image}
                            alt={tour.title}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                            <h3 className="font-semibold text-lg">{tour.title}</h3>
                            <p className="text-sm text-gray-600">{tour.location} • {tour.duration}</p>
                            <p className="text-primary font-bold mt-1">
                                {formatCurrency(tour.price)}
                                <span className="text-gray-500 font-normal text-sm"> / người</span>
                            </p>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <FormField
                        control={form.control}
                        name="selectedDate"
                        render={({ field }) => (
                            <FormItem ref={dateSectionRef}>
                                <p className="flex items-center gap-2 text-sm font-medium mb-2">
                                    <CalendarDays className="w-4 h-4" />
                                    Chọn ngày khởi hành
                                </p>
                                <div className="border rounded-lg p-2 flex justify-center">
                                    <FormControl>
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date()}
                                            className="rounded-md"
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Guest Selection */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium mb-3">
                            <Users className="w-4 h-4" />
                            Số lượng khách
                        </p>
                        <div className="space-y-3">
                            {/* Adults */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div>
                                    <p className="font-medium">Người lớn</p>
                                    <p className="text-sm text-gray-500">Từ 12 tuổi trở lên</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setValue("adults", Math.max(1, adults - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                        disabled={adults <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-semibold">{adults}</span>
                                    <button
                                        type="button"
                                        onClick={() => setValue("adults", Math.min(10, adults + 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                        disabled={adults >= 10}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {/* Children */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div>
                                    <p className="font-medium">Trẻ em</p>
                                    <p className="text-sm text-gray-500">Từ 2-11 tuổi (giảm 50%)</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setValue("children", Math.max(0, children - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                        disabled={children <= 0}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-semibold">{children}</span>
                                    <button
                                        type="button"
                                        onClick={() => setValue("children", Math.min(10, children + 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                        disabled={children >= 10}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <p className="text-sm font-medium mb-3 block">Thông tin liên hệ</p>
                        <div className="space-y-3">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <label htmlFor="fullName" className="sr-only">Họ và tên</label>
                                        <FormControl>
                                            <Input
                                                id="fullName"
                                                autoComplete="name"
                                                placeholder="Họ và tên *"
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
                                        <label htmlFor="email" className="sr-only">Email</label>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="Email *"
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
                                        <label htmlFor="phone" className="sr-only">Số điện thoại</label>
                                        <FormControl>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="Số điện thoại *"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Special Request */}
                    <FormField
                        control={form.control}
                        name="specialRequest"
                        render={({ field }) => (
                            <FormItem>
                                <label htmlFor="specialRequest" className="text-sm font-medium mb-2 block">
                                    Yêu cầu đặc biệt (tùy chọn)
                                </label>
                                <FormControl>
                                    <Textarea
                                        id="specialRequest"
                                        placeholder="Ghi chú thêm cho tour..."
                                        rows={3}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Promo Code */}
                    <PromoCodeInput
                        originalPrice={basePrice}
                        onDiscountApplied={setAppliedDiscount}
                        appliedDiscount={appliedDiscount}
                    />

                    {/* Payment Method */}
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <p className="text-sm font-medium mb-3 block">Phương thức thanh toán</p>
                                <div className="space-y-2">
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => field.onChange(method.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${field.value === method.id
                                                ? "border-primary bg-primary/5"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            {method.icon ? (
                                                <method.icon className={`w-5 h-5 ${field.value === method.id ? "text-primary" : "text-gray-500"}`} />
                                            ) : method.imageUrl ? (
                                                <img src={method.imageUrl} alt={method.label} className="w-8 h-8 object-contain" />
                                            ) : null}
                                            <span className={field.value === method.id ? "font-medium" : ""}>{method.label}</span>
                                            {field.value === method.id && (
                                                <Check className="w-4 h-4 text-primary ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Price Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
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
                        <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Tổng cộng</span>
                            <span className="text-primary text-lg">
                                {formatCurrency(totalPrice)}
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || gatewayLoading}
                        className="w-full h-12 text-lg"
                    >
                        {isSubmitting || gatewayLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {gatewayLoading ? "Đang chờ thanh toán..." : "Đang xử lý..."}
                            </>
                        ) : (
                            "Xác nhận đặt tour"
                        )}
                    </Button>

                    {/* Popup Blocked Fallback */}
                    {paymentPopupBlocked && pendingPaymentUrl && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800 mb-2">
                                <strong>Popup bị chặn!</strong> Trình duyệt đã chặn cửa sổ thanh toán.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => openPaymentPopup(pendingPaymentUrl)}
                            >
                                Mở trang thanh toán
                            </Button>
                        </div>
                    )}

                    <p className="text-xs text-center text-gray-500">
                        Bằng việc nhấn "Xác nhận đặt tour", bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
                    </p>
                </form>
            </Form>
        </Modal>
    );
}
