import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useBooking, PaymentMethod } from "@/context/BookingContext";
import { Tour } from "@/context/TourContext";
import {
    CalendarDays,
    Users,
    CreditCard,
    Building2,
    Banknote,
    Plus,
    Minus,
    Check,
    Loader2,
    Shield,
} from "lucide-react";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    tour: Tour;
}

export function BookingModal({ isOpen, onClose, tour }: BookingModalProps) {
    const { user, isAdmin } = useAuth();
    const { addBooking } = useBooking();

    // Form state
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill contact info if logged in
    useEffect(() => {
        if (user) {
            setFullName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setIsSuccess(false);
            setErrors({});
        }
    }, [isOpen]);

    const totalPrice = tour.price * adults + tour.price * 0.5 * children;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!selectedDate) {
            newErrors.date = "Vui lòng chọn ngày khởi hành";
        }
        if (!fullName.trim()) {
            newErrors.fullName = "Vui lòng nhập họ tên";
        }
        if (!email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Email không hợp lệ";
        }
        if (!phone.trim()) {
            newErrors.phone = "Vui lòng nhập số điện thoại";
        } else if (!/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""))) {
            newErrors.phone = "Số điện thoại không hợp lệ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !selectedDate) return;

        setIsSubmitting(true);

        try {
            await addBooking({
                tourId: tour.id,
                tourTitle: tour.title,
                tourPrice: tour.price,
                selectedDate,
                adults,
                children,
                contactInfo: {
                    fullName,
                    email,
                    phone,
                },
                paymentMethod,
                totalPrice,
            });

            setIsSuccess(true);
            toast.success("Đặt tour thành công!");
        } catch (error) {
            console.error("Booking failed:", error);
            toast.error("Đặt tour thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const paymentMethods = [
        { id: "bank_transfer" as PaymentMethod, label: "Chuyển khoản ngân hàng", icon: Building2 },
        { id: "credit_card" as PaymentMethod, label: "Thẻ tín dụng / Ghi nợ", icon: CreditCard },
        { id: "cash" as PaymentMethod, label: "Thanh toán khi nhận tour", icon: Banknote },
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
                        <span className="font-medium">{email}</span>.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                        <p className="text-sm text-gray-600 mb-1">Tour: <span className="font-medium text-gray-900">{tour.title}</span></p>
                        <p className="text-sm text-gray-600 mb-1">
                            Ngày khởi hành: <span className="font-medium text-gray-900">{selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: vi })}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Tổng tiền: <span className="font-medium text-primary">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}</span>
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
            <div className="space-y-6">
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
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tour.price)}
                            <span className="text-gray-500 font-normal text-sm"> / người</span>
                        </p>
                    </div>
                </div>

                {/* Date Selection */}
                <div>
                    <p className="flex items-center gap-2 text-sm font-medium mb-2">
                        <CalendarDays className="w-4 h-4" />
                        Chọn ngày khởi hành
                    </p>
                    <div className="border rounded-lg p-2 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            className="rounded-md"
                        />
                    </div>
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>

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
                                    onClick={() => setAdults(Math.max(1, adults - 1))}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                    disabled={adults <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-semibold">{adults}</span>
                                <button
                                    type="button"
                                    onClick={() => setAdults(Math.min(10, adults + 1))}
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
                                    onClick={() => setChildren(Math.max(0, children - 1))}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                    disabled={children <= 0}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-semibold">{children}</span>
                                <button
                                    type="button"
                                    onClick={() => setChildren(Math.min(10, children + 1))}
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
                        <div>
                            <label htmlFor="fullName" className="sr-only">Họ và tên</label>
                            <Input
                                id="fullName"
                                name="fullName"
                                autoComplete="name"
                                placeholder="Họ và tên *"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={errors.fullName ? "border-red-500" : ""}
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Email *"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="sr-only">Số điện thoại</label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder="Số điện thoại *"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div>
                    <p className="text-sm font-medium mb-3 block">Phương thức thanh toán</p>
                    <div className="space-y-2">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setPaymentMethod(method.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${paymentMethod === method.id
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? "text-primary" : "text-gray-500"}`} />
                                <span className={paymentMethod === method.id ? "font-medium" : ""}>{method.label}</span>
                                {paymentMethod === method.id && (
                                    <Check className="w-4 h-4 text-primary ml-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>{adults} người lớn × {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tour.price)}</span>
                        <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tour.price * adults)}</span>
                    </div>
                    {children > 0 && (
                        <div className="flex justify-between text-sm">
                            <span>{children} trẻ em × {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tour.price * 0.5)}</span>
                            <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tour.price * 0.5 * children)}</span>
                        </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Tổng cộng</span>
                        <span className="text-primary text-lg">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        "Xác nhận đặt tour"
                    )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                    Bằng việc nhấn "Xác nhận đặt tour", bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
                </p>
            </div>
        </Modal>
    );
}
