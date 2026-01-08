import { useState, useMemo, useEffect, useCallback } from "react";
import { format, startOfDay, isAfter } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { useSorting } from "@/hooks/useSorting";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import {
  TableSkeleton,
  EmptyState,
  BulkActionBar,
  SortableHeader,
  StatusBadge,
  promotionStatusConfig,
  PaginationControls,
  ITEMS_PER_PAGE,
  type BulkAction,
} from "@/components/admin";
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
import {
  Ticket,
  Calendar as CalendarIcon,
  Plus,
  Pencil,
  Trash2,
  Search,
  Percent,
  Banknote,
  Check,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

import {
  type Promotion,
  type DiscountType,
  calculateStatus,
} from "@/api/mappers/promotionMapper";
import {
  fetchAllPromotions,
  createPromotionApi,
  updatePromotionApi,
  deletePromotionApi,
  updatePromotionStatusApi,
} from "@/api/services/promotionService";

// ============== Helper Functions ==============
import { formatCurrency, formatDateRange } from "@/lib/formatters";

// Format discount display (e.g., "15%" or "500.000đ")
const formatDiscount = (type: DiscountType, value: number): string => {
  if (type === "percent") {
    return `${value}%`;
  }
  return formatCurrency(value);
};

// Confirmation dialog keys
const DELETE_PROMOTION_KEY = "delete_promotion";
const BULK_DELETE_PROMOTION_KEY = "bulk_delete_promotion";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch promotions from API
  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      toast.error("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  // Sorting state
  const { sort, toggleSort, sortData } = useSorting<Promotion>({
    defaultSort: { key: "startDate", direction: "desc" },
    sortConfig: {
      discountValue: "number",
      startDate: "date",
      usageLimit: "number",
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
  } = useTableSelection<string>();

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
  const { shouldShowConfirmation, setDontShowAgain } =
    useConfirmationPreferences();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "delete" | "bulk_delete";
    itemId: string | null;
  }>({
    isOpen: false,
    type: "delete",
    itemId: null,
  });

  // Filter and sort promotions based on search
  const filteredPromotions = useMemo(() => {
    const filtered = promotions
      .map((promo) => ({
        ...promo,
        // Recalculate status based on dates
        status: calculateStatus(
          promo.startDate,
          promo.endDate,
          promo.isManuallyDisabled
        ),
      }))
      .filter((promo) => {
        const search = searchTerm.toLowerCase();
        return (
          promo.code.toLowerCase().includes(search) ||
          promo.description.toLowerCase().includes(search)
        );
      });
    return sortData(filtered);
  }, [promotions, searchTerm, sortData]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPromotions.length / ITEMS_PER_PAGE);
  const paginatedPromotions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPromotions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPromotions, currentPage]);

  // Get IDs of paginated promotions
  const paginatedPromotionIds = useMemo(
    () => paginatedPromotions.map((p) => p.id),
    [paginatedPromotions]
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
    } else if (isAfter(startOfDay(dateRange.from), startOfDay(dateRange.to))) {
      errors.dateRange = "Ngày bắt đầu phải trước ngày kết thúc";
    } else if (
      !editingPromotion &&
      !isAfter(startOfDay(dateRange.to), startOfDay(new Date()))
    ) {
      // Only enforce future end date for new promotions (not edits)
      errors.dateRange = "Ngày kết thúc phải trong tương lai";
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
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const promotionData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        startDate: format(dateRange!.from!, "yyyy-MM-dd"),
        endDate: format(dateRange!.to!, "yyyy-MM-dd"),
        usageLimit: formData.usageLimit,
        isManuallyDisabled: editingPromotion?.isManuallyDisabled || false,
      };

      if (editingPromotion) {
        await updatePromotionApi(editingPromotion.id, promotionData);
        toast.success("Đã cập nhật khuyến mãi thành công!");
      } else {
        await createPromotionApi(promotionData);
        toast.success("Đã tạo khuyến mãi mới thành công!");
      }

      await loadPromotions();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save promotion:", error);
      toast.error(
        editingPromotion
          ? "Không thể cập nhật khuyến mãi"
          : "Không thể tạo khuyến mãi"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete promotion - execute action
  const executeDeletePromotion = async (id: string) => {
    try {
      await deletePromotionApi(id);
      await loadPromotions();
      clearSelection();
      toast.success("Đã xóa khuyến mãi thành công!");
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      toast.error("Không thể xóa khuyến mãi");
    }
  };

  // Bulk delete - execute action
  const executeBulkDelete = async () => {
    try {
      await Promise.all(selectedArray.map((id) => deletePromotionApi(id)));
      await loadPromotions();
      toast.success(`Đã xóa ${selectedCount} khuyến mãi!`);
      clearSelection();
    } catch (error) {
      console.error("Failed to delete promotions:", error);
      toast.error("Không thể xóa một số khuyến mãi");
    }
  };

  // Delete promotion - click handler
  const handleDeleteClick = (id: string) => {
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
    const key =
      confirmDialog.type === "bulk_delete"
        ? BULK_DELETE_PROMOTION_KEY
        : DELETE_PROMOTION_KEY;
    setDontShowAgain(key);
  };

  // Toggle promotion disabled status (single)
  const handleToggleStatus = async (id: string) => {
    const promo = promotions.find((p) => p.id === id);
    if (!promo) return;

    const newIsActive = promo.isManuallyDisabled; // Toggle: if disabled, activate
    try {
      await updatePromotionStatusApi(id, newIsActive);
      await loadPromotions();
      toast.success(
        newIsActive
          ? "Đã kích hoạt lại khuyến mãi!"
          : "Đã vô hiệu hóa khuyến mãi!"
      );
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  // Bulk activate
  const handleBulkActivate = async () => {
    try {
      await Promise.all(
        selectedArray
          .filter(
            (id) => promotions.find((p) => p.id === id)?.isManuallyDisabled
          )
          .map((id) => updatePromotionStatusApi(id, true))
      );
      await loadPromotions();
      toast.success(`Đã kích hoạt ${selectedActivatableCount} khuyến mãi!`);
      clearSelection();
    } catch (error) {
      console.error("Failed to activate promotions:", error);
      toast.error("Không thể kích hoạt một số khuyến mãi");
    }
  };

  // Bulk deactivate
  const handleBulkDeactivate = async () => {
    try {
      await Promise.all(
        selectedArray
          .filter(
            (id) => !promotions.find((p) => p.id === id)?.isManuallyDisabled
          )
          .map((id) => updatePromotionStatusApi(id, false))
      );
      await loadPromotions();
      toast.success(`Đã vô hiệu hóa ${selectedDeactivatableCount} khuyến mãi!`);
      clearSelection();
    } catch (error) {
      console.error("Failed to deactivate promotions:", error);
      toast.error("Không thể vô hiệu hóa một số khuyến mãi");
    }
  };

  // Clear search filter
  const handleClearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
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
      <div className="flex items-center justify-between gap-4 flex-wrap overflow-x-hidden p-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-promotions"
            name="search-promotions"
            placeholder="Tìm kiếm mã khuyến mãi..."
            className="pl-8"
            aria-label="Tìm kiếm mã khuyến mãi"
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
        {filteredPromotions.length === 0 ? (
          <EmptyState
            message={
              searchTerm
                ? "Không tìm thấy khuyến mãi nào"
                : "Chưa có khuyến mãi nào"
            }
            description={
              searchTerm
                ? "Thử thay đổi từ khóa tìm kiếm"
                : "Tạo khuyến mãi đầu tiên để bắt đầu"
            }
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
                      id="select-all-promotions"
                      name="select-all-promotions"
                      type="checkbox"
                      checked={isAllSelected(paginatedPromotionIds)}
                      ref={(el) => {
                        if (el)
                          el.indeterminate = isSomeSelected(
                            paginatedPromotionIds
                          );
                      }}
                      onChange={() => toggleAll(paginatedPromotionIds)}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Chọn tất cả khuyến mãi"
                    />
                  </TableHead>
                  <TableHead>Mã khuyến mãi</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <SortableHeader
                    sortKey="discountValue"
                    currentSort={sort}
                    onSort={toggleSort}
                  >
                    Giảm giá
                  </SortableHeader>
                  <SortableHeader
                    sortKey="startDate"
                    currentSort={sort}
                    onSort={toggleSort}
                  >
                    Thời gian
                  </SortableHeader>
                  <SortableHeader
                    sortKey="usageLimit"
                    currentSort={sort}
                    onSort={toggleSort}
                  >
                    Giới hạn
                  </SortableHeader>
                  <SortableHeader
                    sortKey="status"
                    currentSort={sort}
                    onSort={toggleSort}
                  >
                    Trạng thái
                  </SortableHeader>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPromotions.map((promo) => (
                  <TableRow
                    key={promo.id}
                    className={isSelected(promo.id) ? "bg-muted/50" : ""}
                  >
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
                        {formatDiscount(
                          promo.discountType,
                          promo.discountValue
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDateRange(promo.startDate, promo.endDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{promo.usageLimit}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={promo.status}
                        config={promotionStatusConfig}
                      />
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
                          title={
                            promo.isManuallyDisabled
                              ? "Kích hoạt"
                              : "Vô hiệu hóa"
                          }
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
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
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
                setFormData((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
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
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
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
                Giá trị giảm{" "}
                {formData.discountType === "percent" ? "(%)" : "(VNĐ)"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                placeholder={
                  formData.discountType === "percent" ? "10" : "100000"
                }
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
                <p className="text-sm text-red-500">
                  {formErrors.discountValue}
                </p>
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
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? "Đang xử lý..."
                : editingPromotion
                ? "Lưu thay đổi"
                : "Tạo khuyến mãi"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
        title={
          confirmDialog.type === "bulk_delete"
            ? "Xóa các khuyến mãi đã chọn"
            : "Xóa khuyến mãi"
        }
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
