import { useState, useMemo } from "react";
import { format, isAfter, isBefore, isWithinInterval, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { TableSkeleton, EmptyState, BulkActionBar, StatusBadge, promotionStatusConfig, type BulkAction } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Ticket, Calendar as CalendarIcon, Plus, Pencil, Trash2, Search, Percent, Banknote, Check, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

// ============== Types ==============
type DiscountType = "percent" | "amount";
type PromotionStatus = "active" | "expired" | "disabled";

interface Promotion {
    id: number;
    code: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    usedCount: number;
    status: PromotionStatus;
    isManuallyDisabled: boolean; // Track if admin manually disabled it
}

// ============== Mock Data ==============
const INITIAL_PROMOTIONS: Promotion[] = [
    {
        id: 1,
        code: "SUMMER2025",
        description: "Khuyến mãi mùa hè - Giảm giá cho tất cả tour biển",
        discountType: "percent",
        discountValue: 15,
        startDate: "2025-06-01",
        endDate: "2025-08-31",
        usageLimit: 100,
        usedCount: 23,
        status: "active",
        isManuallyDisabled: false,
    },
    {
        id: 2,
        code: "TETHOLIDAY",
        description: "Ưu đãi Tết Nguyên Đán - Giảm trực tiếp",
        discountType: "amount",
        discountValue: 500000,
        startDate: "2025-01-15",
        endDate: "2025-02-15",
        usageLimit: 50,
        usedCount: 50,
        status: "expired",
        isManuallyDisabled: false,
    },
    {
        id: 3,
        code: "WELCOME10",
        description: "Ưu đãi khách hàng mới - Giảm 10% cho đơn đầu tiên",
        discountType: "percent",
        discountValue: 10,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        usageLimit: 500,
        usedCount: 127,
        status: "active",
        isManuallyDisabled: false,
    },
    {
        id: 4,
        code: "DALAT300K",
        description: "Giảm 300.000đ cho tất cả tour Đà Lạt",
        discountType: "amount",
        discountValue: 300000,
        startDate: "2025-03-01",
        endDate: "2025-04-30",
        usageLimit: 80,
        usedCount: 15,
        status: "disabled",
        isManuallyDisabled: true,
    },
    {
        id: 5,
        code: "VIP20",
        description: "Ưu đãi đặc biệt dành cho khách VIP",
        discountType: "percent",
        discountValue: 20,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        usageLimit: 200,
        usedCount: 198,
        status: "expired",
        isManuallyDisabled: false,
    },
];

// ============== Helper Functions ==============
import { formatCurrency, formatDateRange } from "@/lib/formatters";

// Format discount display (e.g., "15%" or "500.000đ")
const formatDiscount = (type: DiscountType, value: number): string => {
    if (type === "percent") {
        return `${value}%`;
    }
    return formatCurrency(value);
};

// Calculate status based on dates with manual override support (Hybrid approach)
const calculateStatus = (
    startDate: string,
    endDate: string,
    isManuallyDisabled: boolean
): PromotionStatus => {
    if (isManuallyDisabled) {
        return "disabled";
    }

    const today = startOfDay(new Date());
    const start = startOfDay(new Date(startDate));
    const end = startOfDay(new Date(endDate));

    if (isAfter(today, end)) {
        return "expired";
    }

    if (isBefore(today, start)) {
        return "disabled"; // Not yet started, show as disabled
    }

    if (isWithinInterval(today, { start, end })) {
        return "active";
    }

    return "disabled";
};

// Confirmation dialog keys
const DELETE_PROMOTION_KEY = "delete_promotion";
const BULK_DELETE_PROMOTION_KEY = "bulk_delete_promotion";

// ============== Main Component ==============
export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading] = useState(false);

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

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "percent" as DiscountType,
        discountValue: 0,
        usageLimit: 100,
    });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Confirmation dialog
    const { shouldShowConfirmation, setDontShowAgain } = useConfirmationPreferences();
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: "delete" | "bulk_delete";
        itemId: number | null;
    }>({
        isOpen: false,
        type: "delete",
        itemId: null,
    });

    // Filter promotions based on search
    const filteredPromotions = useMemo(() => {
        return promotions
            .map((promo) => ({
                ...promo,
                // Recalculate status based on dates
                status: calculateStatus(promo.startDate, promo.endDate, promo.isManuallyDisabled),
            }))
            .filter((promo) => {
                const search = searchTerm.toLowerCase();
                return (
                    promo.code.toLowerCase().includes(search) ||
                    promo.description.toLowerCase().includes(search)
                );
            });
    }, [promotions, searchTerm]);

    // Get IDs of filtered promotions
    const filteredPromotionIds = useMemo(
        () => filteredPromotions.map((p) => p.id),
        [filteredPromotions]
    );

    // Get selected promotions that can be activated/deactivated
    const selectedActivatableCount = useMemo(() => {
        return promotions.filter(
            (p) => selectedArray.includes(p.id) && p.isManuallyDisabled
        ).length;
    }, [promotions, selectedArray]);

    const selectedDeactivatableCount = useMemo(() => {
        return promotions.filter(
            (p) => selectedArray.includes(p.id) && !p.isManuallyDisabled
        ).length;
    }, [promotions, selectedArray]);

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.code.trim()) {
            errors.code = "Vui lòng nhập mã khuyến mãi";
        } else if (!/^[A-Z0-9]+$/.test(formData.code.toUpperCase())) {
            errors.code = "Mã chỉ chứa chữ cái và số";
        }

        if (!formData.description.trim()) {
            errors.description = "Vui lòng nhập mô tả";
        }

        if (formData.discountValue <= 0) {
            errors.discountValue = "Giá trị giảm phải lớn hơn 0";
        }

        if (formData.discountType === "percent" && formData.discountValue > 100) {
            errors.discountValue = "Phần trăm giảm không được quá 100%";
        }

        if (!dateRange?.from || !dateRange?.to) {
            errors.dateRange = "Vui lòng chọn thời gian hiệu lực";
        }

        if (formData.usageLimit <= 0) {
            errors.usageLimit = "Giới hạn sử dụng phải lớn hơn 0";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Open modal for create/edit
    const handleOpenModal = (promotion?: Promotion) => {
        if (promotion) {
            setEditingPromotion(promotion);
            setFormData({
                code: promotion.code,
                description: promotion.description,
                discountType: promotion.discountType,
                discountValue: promotion.discountValue,
                usageLimit: promotion.usageLimit,
            });
            setDateRange({
                from: new Date(promotion.startDate),
                to: new Date(promotion.endDate),
            });
        } else {
            setEditingPromotion(null);
            setFormData({
                code: "",
                description: "",
                discountType: "percent",
                discountValue: 0,
                usageLimit: 100,
            });
            setDateRange(undefined);
        }
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPromotion(null);
        setFormErrors({});
    };

    // Handle form submission
    const handleSubmit = () => {
        if (!validateForm()) return;

        const promotionData: Promotion = {
            id: editingPromotion?.id || Date.now(),
            code: formData.code.toUpperCase(),
            description: formData.description,
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            startDate: format(dateRange!.from!, "yyyy-MM-dd"),
            endDate: format(dateRange!.to!, "yyyy-MM-dd"),
            usageLimit: formData.usageLimit,
            usedCount: editingPromotion?.usedCount || 0,
            status: "active",
            isManuallyDisabled: editingPromotion?.isManuallyDisabled || false,
        };

        if (editingPromotion) {
            setPromotions((prev) =>
                prev.map((p) => (p.id === editingPromotion.id ? promotionData : p))
            );
            toast.success("Đã cập nhật khuyến mãi thành công!");
        } else {
            setPromotions((prev) => [...prev, promotionData]);
            toast.success("Đã tạo khuyến mãi mới thành công!");
        }

        handleCloseModal();
    };

    // Delete promotion - execute action
    const executeDeletePromotion = (id: number) => {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
        clearSelection();
        toast.success("Đã xóa khuyến mãi thành công!");
    };

    // Bulk delete - execute action
    const executeBulkDelete = () => {
        setPromotions((prev) => prev.filter((p) => !selectedArray.includes(p.id)));
        toast.success(`Đã xóa ${selectedCount} khuyến mãi!`);
        clearSelection();
    };

    // Delete promotion - click handler
    const handleDeleteClick = (id: number) => {
        if (shouldShowConfirmation(DELETE_PROMOTION_KEY)) {
            setConfirmDialog({ isOpen: true, type: "delete", itemId: id });
        } else {
            executeDeletePromotion(id);
        }
    };

    // Bulk delete - click handler
    const handleBulkDeleteClick = () => {
        if (shouldShowConfirmation(BULK_DELETE_PROMOTION_KEY)) {
            setConfirmDialog({ isOpen: true, type: "bulk_delete", itemId: null });
        } else {
            executeBulkDelete();
        }
    };

    // Dialog handlers
    const handleDialogConfirm = () => {
        if (confirmDialog.type === "delete" && confirmDialog.itemId) {
            executeDeletePromotion(confirmDialog.itemId);
        } else if (confirmDialog.type === "bulk_delete") {
            executeBulkDelete();
        }
        setConfirmDialog({ isOpen: false, type: "delete", itemId: null });
    };

    const handleDialogCancel = () => {
        setConfirmDialog({ isOpen: false, type: "delete", itemId: null });
    };

    const handleDontShowAgain = () => {
        const key = confirmDialog.type === "bulk_delete" ? BULK_DELETE_PROMOTION_KEY : DELETE_PROMOTION_KEY;
        setDontShowAgain(key);
    };

    // Toggle promotion disabled status (single)
    const handleToggleStatus = (id: number) => {
        setPromotions((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, isManuallyDisabled: !p.isManuallyDisabled } : p
            )
        );
        const promo = promotions.find((p) => p.id === id);
        if (promo) {
            toast.success(
                promo.isManuallyDisabled
                    ? "Đã kích hoạt lại khuyến mãi!"
                    : "Đã vô hiệu hóa khuyến mãi!"
            );
        }
    };

    // Bulk activate
    const handleBulkActivate = () => {
        setPromotions((prev) =>
            prev.map((p) =>
                selectedArray.includes(p.id) ? { ...p, isManuallyDisabled: false } : p
            )
        );
        toast.success(`Đã kích hoạt ${selectedActivatableCount} khuyến mãi!`);
        clearSelection();
    };

    // Bulk deactivate
    const handleBulkDeactivate = () => {
        setPromotions((prev) =>
            prev.map((p) =>
                selectedArray.includes(p.id) ? { ...p, isManuallyDisabled: true } : p
            )
        );
        toast.success(`Đã vô hiệu hóa ${selectedDeactivatableCount} khuyến mãi!`);
        clearSelection();
    };

    // Clear search filter
    const handleClearFilters = () => {
        setSearchTerm("");
    };

    // Bulk actions configuration
    const bulkActions: BulkAction[] = [
        {
            label: "Kích hoạt",
            icon: <Check className="h-4 w-4 mr-1" />,
            onClick: handleBulkActivate,
            disabled: selectedActivatableCount === 0,
        },
        {
            label: "Vô hiệu hóa",
            icon: <Ban className="h-4 w-4 mr-1" />,
            onClick: handleBulkDeactivate,
            disabled: selectedDeactivatableCount === 0,
        },
        {
            label: "Xóa",
            icon: <Trash2 className="h-4 w-4 mr-1" />,
            onClick: handleBulkDeleteClick,
            variant: "destructive",
        },
    ];

    // Show loading skeleton
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Ticket className="h-6 w-6" />
                            Quản lý Khuyến mãi
                        </h2>
                        <p className="text-muted-foreground">
                            Quản lý mã giảm giá và các chiến dịch marketing
                        </p>
                    </div>
                    <Button disabled>
                        <Plus className="mr-2 h-4 w-4" /> Tạo khuyến mãi
                    </Button>
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
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Ticket className="h-6 w-6" />
                        Quản lý Khuyến mãi
                    </h2>
                    <p className="text-muted-foreground">
                        Quản lý mã giảm giá và các chiến dịch marketing
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" /> Tạo khuyến mãi
                </Button>
            </div>

            {/* Toolbar: Search & Bulk Actions */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-promotions"
                        name="search-promotions"
                        placeholder="Tìm kiếm mã khuyến mãi..."
                        className="pl-8"
                        aria-label="Tìm kiếm mã khuyến mãi"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredPromotions.length === 0 ? (
                    <EmptyState
                        message={searchTerm ? "Không tìm thấy khuyến mãi nào" : "Chưa có khuyến mãi nào"}
                        description={searchTerm ? "Thử thay đổi từ khóa tìm kiếm" : "Tạo khuyến mãi đầu tiên để bắt đầu"}
                        showClearFilters={!!searchTerm}
                        onClearFilters={handleClearFilters}
                    />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <input
                                        id="select-all-promotions"
                                        name="select-all-promotions"
                                        type="checkbox"
                                        checked={isAllSelected(filteredPromotionIds)}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isSomeSelected(filteredPromotionIds);
                                        }}
                                        onChange={() => toggleAll(filteredPromotionIds)}
                                        className="h-4 w-4 rounded border-gray-300"
                                        aria-label="Chọn tất cả khuyến mãi"
                                    />
                                </TableHead>
                                <TableHead>Mã khuyến mãi</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead>Giảm giá</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Sử dụng</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPromotions.map((promo) => (
                                <TableRow key={promo.id} className={isSelected(promo.id) ? "bg-muted/50" : ""}>
                                    <TableCell>
                                        <input
                                            id={`promotion-checkbox-${promo.id}`}
                                            name={`promotion-checkbox-${promo.id}`}
                                            type="checkbox"
                                            checked={isSelected(promo.id)}
                                            onChange={() => toggleSelection(promo.id)}
                                            className="h-4 w-4 rounded border-gray-300"
                                            aria-label={`Chọn ${promo.code}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono font-semibold text-primary">
                                            {promo.code}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {promo.description}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center gap-1 font-medium">
                                            {promo.discountType === "percent" ? (
                                                <Percent className="h-3 w-3 text-blue-600" />
                                            ) : (
                                                <Banknote className="h-3 w-3 text-green-600" />
                                            )}
                                            {formatDiscount(promo.discountType, promo.discountValue)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDateRange(promo.startDate, promo.endDate)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {promo.usedCount}/{promo.usageLimit}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={promo.status} config={promotionStatusConfig} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenModal(promo)}
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleToggleStatus(promo.id)}
                                                title={promo.isManuallyDisabled ? "Kích hoạt" : "Vô hiệu hóa"}
                                                className={cn(
                                                    promo.isManuallyDisabled
                                                        ? "text-green-600 hover:text-green-700"
                                                        : "text-orange-600 hover:text-orange-700"
                                                )}
                                            >
                                                <Ticket className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteClick(promo.id)}
                                                title="Xóa"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingPromotion ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
                className="max-w-lg"
            >
                <div className="space-y-4">
                    {/* Promotion Code */}
                    <div className="space-y-2">
                        <Label htmlFor="code">Mã khuyến mãi</Label>
                        <Input
                            id="code"
                            placeholder="Ví dụ: SUMMER2025"
                            value={formData.code}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                            }
                            className={cn(formErrors.code && "border-red-500")}
                        />
                        {formErrors.code && (
                            <p className="text-sm text-red-500">{formErrors.code}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Input
                            id="description"
                            placeholder="Mô tả ngắn về khuyến mãi"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                            }
                            className={cn(formErrors.description && "border-red-500")}
                        />
                        {formErrors.description && (
                            <p className="text-sm text-red-500">{formErrors.description}</p>
                        )}
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discountType">Loại giảm giá</Label>
                            <select
                                id="discountType"
                                name="discountType"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.discountType}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        discountType: e.target.value as DiscountType,
                                    }))
                                }
                            >
                                <option value="percent">Phần trăm (%)</option>
                                <option value="amount">Số tiền (VNĐ)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discountValue">
                                Giá trị giảm {formData.discountType === "percent" ? "(%)" : "(VNĐ)"}
                            </Label>
                            <Input
                                id="discountValue"
                                type="number"
                                placeholder={formData.discountType === "percent" ? "10" : "100000"}
                                value={formData.discountValue || ""}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        discountValue: Number(e.target.value),
                                    }))
                                }
                                className={cn(formErrors.discountValue && "border-red-500")}
                            />
                            {formErrors.discountValue && (
                                <p className="text-sm text-red-500">{formErrors.discountValue}</p>
                            )}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label htmlFor="dateRange">Thời gian hiệu lực</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="dateRange"
                                    variant="outline"
                                    aria-label="Chọn thời gian hiệu lực"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground",
                                        formErrors.dateRange && "border-red-500"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                                                {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                                            </>
                                        ) : (
                                            format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                                        )
                                    ) : (
                                        "Chọn thời gian"
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        {formErrors.dateRange && (
                            <p className="text-sm text-red-500">{formErrors.dateRange}</p>
                        )}
                    </div>

                    {/* Usage Limit */}
                    <div className="space-y-2">
                        <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
                        <Input
                            id="usageLimit"
                            type="number"
                            placeholder="100"
                            value={formData.usageLimit || ""}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    usageLimit: Number(e.target.value),
                                }))
                            }
                            className={cn(formErrors.usageLimit && "border-red-500")}
                        />
                        {formErrors.usageLimit && (
                            <p className="text-sm text-red-500">{formErrors.usageLimit}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editingPromotion ? "Lưu thay đổi" : "Tạo khuyến mãi"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
                title={confirmDialog.type === "bulk_delete" ? "Xóa các khuyến mãi đã chọn" : "Xóa khuyến mãi"}
                message={
                    confirmDialog.type === "bulk_delete"
                        ? `Bạn có chắc chắn muốn xóa ${selectedCount} khuyến mãi đã chọn? Hành động này không thể hoàn tác.`
                        : "Bạn có chắc chắn muốn xóa khuyến mãi này không? Hành động này không thể hoàn tác."
                }
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                showDontShowAgain
                onDontShowAgainChange={handleDontShowAgain}
            />
        </div>
    );
}
