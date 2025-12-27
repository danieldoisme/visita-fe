import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useBooking, Booking } from "@/context/BookingContext";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { useSorting } from "@/hooks/useSorting";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { TableSkeleton, EmptyState, BulkActionBar, SortableHeader, StatusBadge, bookingStatusConfig, PaginationControls, ITEMS_PER_PAGE, type BulkAction } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Check, X, Eye } from "lucide-react";
import { formatCurrency, formatBookingId, formatDate } from "@/lib/formatters";

// Confirmation dialog keys
const CONFIRM_BOOKING_KEY = "confirm_booking";
const CANCEL_BOOKING_KEY = "cancel_booking";
const BULK_CONFIRM_KEY = "bulk_confirm_booking";
const BULK_CANCEL_KEY = "bulk_cancel_booking";

export default function BookingsManagementPage() {
    const navigate = useNavigate();
    const { bookings, confirmBooking, cancelBooking } = useBooking();
    const { shouldShowConfirmation, setDontShowAgain } = useConfirmationPreferences();

    const [searchTerm, setSearchTerm] = useState("");
    const [loading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Sorting state
    const { sort, toggleSort, sortData } = useSorting<Booking>({
        defaultSort: { key: "selectedDate", direction: "desc" },
        sortConfig: {
            selectedDate: "date",
            totalPrice: "number",
            status: "string",
        },
    });

    // Selection state
    const {
        selectedCount,
        selectedArray,
        hasSelection,
        toggleSelection,
        toggleAll,
        clearSelection,
        isSelected,
        isAllSelected,
        isSomeSelected,
    } = useTableSelection<number>();

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: "confirm" | "cancel" | "bulk_confirm" | "bulk_cancel";
        bookingId: number | null;
    }>({
        isOpen: false,
        type: "confirm",
        bookingId: null,
    });

    // Filter and sort bookings by customer name or tour title
    const filteredBookings = useMemo(() => {
        const filtered = bookings.filter((booking) => {
            const search = searchTerm.toLowerCase();
            return (
                booking.contactInfo.fullName.toLowerCase().includes(search) ||
                booking.tourTitle.toLowerCase().includes(search) ||
                booking.contactInfo.email.toLowerCase().includes(search)
            );
        });
        return sortData(filtered);
    }, [bookings, searchTerm, sortData]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredBookings, currentPage]);

    // Get IDs of paginated bookings
    const paginatedBookingIds = useMemo(
        () => paginatedBookings.map((b) => b.id),
        [paginatedBookings]
    );

    // Get pending bookings in selection (for bulk confirm)
    const selectedPendingBookings = useMemo(() => {
        return bookings.filter(
            (b) => selectedArray.includes(b.id) && b.status === "pending"
        );
    }, [bookings, selectedArray]);

    // Get cancellable bookings in selection (for bulk cancel)
    const selectedCancellableBookings = useMemo(() => {
        return bookings.filter(
            (b) => selectedArray.includes(b.id) && (b.status === "pending" || b.status === "confirmed")
        );
    }, [bookings, selectedArray]);

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

    // Handle bulk confirm click
    const handleBulkConfirmClick = () => {
        if (shouldShowConfirmation(BULK_CONFIRM_KEY)) {
            setConfirmDialog({ isOpen: true, type: "bulk_confirm", bookingId: null });
        } else {
            executeBulkConfirm();
        }
    };

    // Handle bulk cancel click
    const handleBulkCancelClick = () => {
        if (shouldShowConfirmation(BULK_CANCEL_KEY)) {
            setConfirmDialog({ isOpen: true, type: "bulk_cancel", bookingId: null });
        } else {
            executeBulkCancel();
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

    // Execute bulk confirm
    const executeBulkConfirm = async () => {
        const pendingIds = selectedPendingBookings.map((b) => b.id);
        for (const id of pendingIds) {
            await confirmBooking(id);
        }
        toast.success(`Đã xác nhận ${pendingIds.length} booking!`);
        clearSelection();
    };

    // Execute bulk cancel
    const executeBulkCancel = async () => {
        const cancellableIds = selectedCancellableBookings.map((b) => b.id);
        for (const id of cancellableIds) {
            await cancelBooking(id);
        }
        toast.success(`Đã hủy ${cancellableIds.length} booking!`);
        clearSelection();
    };

    // Handle dialog confirm
    const handleDialogConfirm = () => {
        switch (confirmDialog.type) {
            case "confirm":
                if (confirmDialog.bookingId) executeConfirm(confirmDialog.bookingId);
                break;
            case "cancel":
                if (confirmDialog.bookingId) executeCancel(confirmDialog.bookingId);
                break;
            case "bulk_confirm":
                executeBulkConfirm();
                break;
            case "bulk_cancel":
                executeBulkCancel();
                break;
        }
        setConfirmDialog({ isOpen: false, type: "confirm", bookingId: null });
    };

    // Handle dialog cancel
    const handleDialogCancel = () => {
        setConfirmDialog({ isOpen: false, type: "confirm", bookingId: null });
    };

    // Handle "don't show again" checkbox
    const handleDontShowAgain = () => {
        const keyMap: Record<string, string> = {
            confirm: CONFIRM_BOOKING_KEY,
            cancel: CANCEL_BOOKING_KEY,
            bulk_confirm: BULK_CONFIRM_KEY,
            bulk_cancel: BULK_CANCEL_KEY,
        };
        setDontShowAgain(keyMap[confirmDialog.type]);
    };

    // Get dialog content
    const getDialogContent = () => {
        switch (confirmDialog.type) {
            case "confirm":
                return {
                    title: "Xác nhận booking",
                    message: "Bạn có chắc chắn muốn xác nhận booking này không?",
                    variant: "default" as const,
                };
            case "cancel":
                return {
                    title: "Hủy booking",
                    message: "Bạn có chắc chắn muốn hủy booking này không? Hành động này không thể hoàn tác.",
                    variant: "danger" as const,
                };
            case "bulk_confirm":
                return {
                    title: "Xác nhận các booking đã chọn",
                    message: `Bạn có chắc chắn muốn xác nhận ${selectedPendingBookings.length} booking đang chờ?`,
                    variant: "default" as const,
                };
            case "bulk_cancel":
                return {
                    title: "Hủy các booking đã chọn",
                    message: `Bạn có chắc chắn muốn hủy ${selectedCancellableBookings.length} booking? Hành động này không thể hoàn tác.`,
                    variant: "danger" as const,
                };
        }
    };

    const dialogContent = getDialogContent();

    // Navigate to booking details (tour page for now)
    const handleViewDetails = (booking: Booking) => {
        navigate(`/tours/${booking.tourId}`);
    };

    // Clear search filter
    const handleClearFilters = () => {
        setSearchTerm("");
        setCurrentPage(1);
    };

    // Bulk actions configuration
    const bulkActions: BulkAction[] = [
        {
            label: `Xác nhận (${selectedPendingBookings.length})`,
            icon: <Check className="h-4 w-4 mr-1" />,
            onClick: handleBulkConfirmClick,
            disabled: selectedPendingBookings.length === 0,
        },
        {
            label: `Hủy (${selectedCancellableBookings.length})`,
            icon: <X className="h-4 w-4 mr-1" />,
            onClick: handleBulkCancelClick,
            variant: "destructive",
            disabled: selectedCancellableBookings.length === 0,
        },
    ];

    // Show loading skeleton
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý Booking</h2>
                        <p className="text-muted-foreground">
                            Xem và quản lý các đơn đặt tour của khách hàng.
                        </p>
                    </div>
                </div>
                <TableSkeleton columns={7} rows={5} hasCheckbox />
            </div>
        );
    }

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

            {/* Toolbar: Search & Bulk Actions */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search"
                        name="search"
                        placeholder="Tìm theo tên khách hàng hoặc tour..."
                        className="pl-8"
                        aria-label="Tìm kiếm booking"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                {hasSelection && (
                    <BulkActionBar
                        selectedCount={selectedCount}
                        actions={bulkActions}
                        onClearSelection={clearSelection}
                    />
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                {filteredBookings.length === 0 ? (
                    <EmptyState
                        message={searchTerm ? "Không tìm thấy booking nào" : "Chưa có booking nào"}
                        showClearFilters={!!searchTerm}
                        onClearFilters={handleClearFilters}
                    />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input
                                            id="select-all-bookings"
                                            name="select-all-bookings"
                                            type="checkbox"
                                            checked={isAllSelected(paginatedBookingIds)}
                                            ref={(el) => {
                                                if (el) el.indeterminate = isSomeSelected(paginatedBookingIds);
                                            }}
                                            onChange={() => toggleAll(paginatedBookingIds)}
                                            className="h-4 w-4 rounded border-gray-300"
                                            aria-label="Chọn tất cả booking"
                                        />
                                    </TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Tour</TableHead>
                                    <SortableHeader sortKey="selectedDate" currentSort={sort} onSort={toggleSort}>
                                        Ngày khởi hành
                                    </SortableHeader>
                                    <SortableHeader sortKey="totalPrice" currentSort={sort} onSort={toggleSort}>
                                        Tổng tiền
                                    </SortableHeader>
                                    <SortableHeader sortKey="status" currentSort={sort} onSort={toggleSort}>
                                        Trạng thái
                                    </SortableHeader>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedBookings.map((booking) => (
                                    <TableRow key={booking.id} className={isSelected(booking.id) ? "bg-muted/50" : ""}>
                                        <TableCell>
                                            <input
                                                id={`booking-checkbox-${booking.id}`}
                                                name={`booking-checkbox-${booking.id}`}
                                                type="checkbox"
                                                checked={isSelected(booking.id)}
                                                onChange={() => toggleSelection(booking.id)}
                                                className="h-4 w-4 rounded border-gray-300"
                                                aria-label={`Chọn ${formatBookingId(booking.id)}`}
                                            />
                                        </TableCell>
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
                                            {formatDate(booking.selectedDate)}
                                        </TableCell>
                                        <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={booking.status} config={bookingStatusConfig} />
                                        </TableCell>
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
                                ))}
                            </TableBody>
                        </Table>
                        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                )}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
                title={dialogContent.title}
                message={dialogContent.message}
                confirmText={confirmDialog.type.includes("cancel") ? "Hủy booking" : "Xác nhận"}
                cancelText="Đóng"
                variant={dialogContent.variant}
                showDontShowAgain
                onDontShowAgainChange={handleDontShowAgain}
            />
        </div>
    );
}
