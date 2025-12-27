import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useBooking, Booking } from "@/context/BookingContext";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Check, X, Eye } from "lucide-react";

// Status badge configuration
type BookingStatus = Booking["status"];

interface StatusConfig {
    label: string;
    className: string;
}

const statusConfig: Record<BookingStatus, StatusConfig> = {
    pending: {
        label: "Chờ xác nhận",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    confirmed: {
        label: "Đã xác nhận",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    cancelled: {
        label: "Đã hủy",
        className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    completed: {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
};

const getStatusBadge = (status: BookingStatus) => {
    const config = statusConfig[status];
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
};

// Format booking ID as #0001
const formatBookingId = (id: number): string => {
    return `#${id.toString().padStart(4, "0")}`;
};

// Format price as VND currency
const formatCurrency = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
};

// Confirmation dialog keys
const CONFIRM_BOOKING_KEY = "confirm_booking";
const CANCEL_BOOKING_KEY = "cancel_booking";

export default function BookingsManagementPage() {
    const navigate = useNavigate();
    const { bookings, confirmBooking, cancelBooking } = useBooking();
    const { shouldShowConfirmation, setDontShowAgain } = useConfirmationPreferences();

    const [searchTerm, setSearchTerm] = useState("");
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: "confirm" | "cancel";
        bookingId: number | null;
    }>({
        isOpen: false,
        type: "confirm",
        bookingId: null,
    });

    // Filter bookings by customer name or tour title
    const filteredBookings = bookings.filter((booking) => {
        const search = searchTerm.toLowerCase();
        return (
            booking.contactInfo.fullName.toLowerCase().includes(search) ||
            booking.tourTitle.toLowerCase().includes(search) ||
            booking.contactInfo.email.toLowerCase().includes(search)
        );
    });

    // Handle confirm action
    const handleConfirmClick = (bookingId: number) => {
        if (shouldShowConfirmation(CONFIRM_BOOKING_KEY)) {
            setConfirmDialog({ isOpen: true, type: "confirm", bookingId });
        } else {
            executeConfirm(bookingId);
        }
    };

    // Handle cancel action
    const handleCancelClick = (bookingId: number) => {
        if (shouldShowConfirmation(CANCEL_BOOKING_KEY)) {
            setConfirmDialog({ isOpen: true, type: "cancel", bookingId });
        } else {
            executeCancel(bookingId);
        }
    };

    // Execute confirm booking
    const executeConfirm = async (bookingId: number) => {
        try {
            await confirmBooking(bookingId);
            toast.success("Đã xác nhận booking thành công!");
        } catch {
            toast.error("Không thể xác nhận booking. Vui lòng thử lại.");
        }
    };

    // Execute cancel booking
    const executeCancel = async (bookingId: number) => {
        try {
            await cancelBooking(bookingId);
            toast.success("Đã hủy booking thành công!");
        } catch {
            toast.error("Không thể hủy booking. Vui lòng thử lại.");
        }
    };

    // Handle dialog confirm
    const handleDialogConfirm = () => {
        if (confirmDialog.bookingId === null) return;

        if (confirmDialog.type === "confirm") {
            executeConfirm(confirmDialog.bookingId);
        } else {
            executeCancel(confirmDialog.bookingId);
        }

        setConfirmDialog({ isOpen: false, type: "confirm", bookingId: null });
    };

    // Handle dialog cancel
    const handleDialogCancel = () => {
        setConfirmDialog({ isOpen: false, type: "confirm", bookingId: null });
    };

    // Handle "don't show again" checkbox
    const handleDontShowAgain = () => {
        const key = confirmDialog.type === "confirm" ? CONFIRM_BOOKING_KEY : CANCEL_BOOKING_KEY;
        setDontShowAgain(key);
    };

    // Navigate to booking details (tour page for now)
    const handleViewDetails = (booking: Booking) => {
        navigate(`/tours/${booking.tourId}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý Booking</h2>
                    <p className="text-muted-foreground">
                        Xem và quản lý các đơn đặt tour của khách hàng.
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search"
                        name="search"
                        placeholder="Tìm theo tên khách hàng hoặc tour..."
                        className="pl-8"
                        aria-label="Tìm kiếm booking"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Tour</TableHead>
                            <TableHead>Ngày khởi hành</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "Không tìm thấy booking nào." : "Chưa có booking nào."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">
                                        {formatBookingId(booking.id)}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{booking.contactInfo.fullName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.contactInfo.email}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {booking.tourTitle}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(booking.selectedDate), "dd/MM/yyyy", {
                                            locale: vi,
                                        })}
                                    </TableCell>
                                    <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {/* View Details */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Xem chi tiết"
                                                onClick={() => handleViewDetails(booking)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {/* Confirm - only for pending */}
                                            {booking.status === "pending" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    title="Xác nhận"
                                                    onClick={() => handleConfirmClick(booking.id)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {/* Cancel - for pending and confirmed only */}
                                            {(booking.status === "pending" || booking.status === "confirmed") && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Hủy"
                                                    onClick={() => handleCancelClick(booking.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
                title={confirmDialog.type === "confirm" ? "Xác nhận booking" : "Hủy booking"}
                message={
                    confirmDialog.type === "confirm"
                        ? "Bạn có chắc chắn muốn xác nhận booking này không?"
                        : "Bạn có chắc chắn muốn hủy booking này không? Hành động này không thể hoàn tác."
                }
                confirmText={confirmDialog.type === "confirm" ? "Xác nhận" : "Hủy booking"}
                cancelText="Đóng"
                variant={confirmDialog.type === "cancel" ? "danger" : "default"}
                showDontShowAgain
                onDontShowAgainChange={handleDontShowAgain}
            />
        </div>
    );
}
