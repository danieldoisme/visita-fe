import { useState } from "react";
import { toast } from "sonner";
import { Booking, PaymentStatus, useBooking } from "@/context/BookingContext";
import { Modal } from "@/components/ui/modal";
import { StatusBadge, bookingStatusConfig } from "@/components/admin";
import { formatCurrency, formatBookingId, formatDate } from "@/lib/formatters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Users,
  User,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Loader2,
  Receipt,
} from "lucide-react";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const PAYMENT_STATUS_OPTIONS: {
  value: PaymentStatus;
  label: string;
  color: string;
}[] = [
  {
    value: "pending",
    label: "Chờ xử lý",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "success",
    label: "Thành công",
    color: "bg-green-100 text-green-800",
  },
  { value: "failed", label: "Thất bại", color: "bg-red-100 text-red-800" },
  {
    value: "refunded",
    label: "Đã hoàn tiền",
    color: "bg-blue-100 text-blue-800",
  },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  momo: "Ví MoMo",
  paypal: "PayPal",
  cash: "Tiền mặt",
};

export function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  const { updatePaymentStatus, bookings } = useBooking();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get live booking data from context to ensure we have the latest paymentStatus
  const liveBooking = booking
    ? bookings.find((b) => b.id === booking.id) || booking
    : null;

  if (!liveBooking) return null;

  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    if (newStatus === liveBooking.paymentStatus) return;

    setIsUpdating(true);
    try {
      await updatePaymentStatus(liveBooking.id, newStatus);
      toast.success("Đã cập nhật trạng thái thanh toán!");
    } catch {
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentPaymentStatus = PAYMENT_STATUS_OPTIONS.find(
    (opt) => opt.value === (liveBooking.paymentStatus || "pending")
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Booking"
      className="max-w-lg"
    >
      <div className="space-y-5">
        {/* Booking Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {formatBookingId(liveBooking.id)}
            </span>
            <StatusBadge
              status={liveBooking.status}
              config={bookingStatusConfig}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDate(liveBooking.createdAt)}
          </span>
        </div>

        <div className="border-t" />

        {/* Tour Info */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
          <h4 className="font-semibold text-base mb-1">
            {liveBooking.tourTitle}
          </h4>
          <p className="text-sm text-muted-foreground">
            Giá: {formatCurrency(liveBooking.tourPrice)} / người
          </p>
        </div>

        {/* Guest Details */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Thông tin đặt tour
          </h5>
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Ngày khởi hành
              </span>
              <span className="font-medium">
                {formatDate(liveBooking.selectedDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Người lớn</span>
              <span>
                {liveBooking.adults} × {formatCurrency(liveBooking.tourPrice)}
              </span>
            </div>
            {liveBooking.children > 0 && (
              <div className="flex justify-between text-sm">
                <span>Trẻ em</span>
                <span>
                  {liveBooking.children} ×{" "}
                  {formatCurrency(liveBooking.tourPrice * 0.5)}
                </span>
              </div>
            )}
            {liveBooking.promoCode && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Mã khuyến mãi</span>
                <span className="font-medium">{liveBooking.promoCode}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Tổng tiền</span>
              <span className="text-primary">
                {formatCurrency(liveBooking.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Thông tin khách hàng
          </h5>
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {liveBooking.contactInfo.fullName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{liveBooking.contactInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{liveBooking.contactInfo.phone}</span>
            </div>
          </div>
        </div>

        {/* Special Request */}
        {liveBooking.specialRequest && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Yêu cầu đặc biệt
            </h5>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              {liveBooking.specialRequest}
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Thanh toán
          </h5>
          <div className="bg-muted/50 rounded-lg p-3 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Phương thức
              </span>
              <span className="font-medium">
                {PAYMENT_METHOD_LABELS[liveBooking.paymentMethod] ||
                  liveBooking.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Trạng thái</span>
              <div className="flex items-center gap-2">
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                <Select
                  value={liveBooking.paymentStatus || "pending"}
                  onValueChange={(value) =>
                    handlePaymentStatusChange(value as PaymentStatus)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="h-8 w-auto min-w-[130px] border-0 bg-transparent p-0 shadow-none hover:bg-muted/50 focus:ring-0">
                    <Badge
                      className={`${currentPaymentStatus?.color} hover:${currentPaymentStatus?.color}`}
                    >
                      {currentPaymentStatus?.label || "Chưa xác định"}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <Badge
                          className={`${option.color} hover:${option.color}`}
                        >
                          {option.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
