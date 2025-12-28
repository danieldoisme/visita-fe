import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTour, Tour } from "@/context/TourContext";
import { tourSchema, TourFormData } from "@/lib/validation";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { useSorting } from "@/hooks/useSorting";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { TableSkeleton, EmptyState, BulkActionBar, SortableHeader, PaginationControls, ITEMS_PER_PAGE, TourImageManager, type BulkAction } from "@/components/admin";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Check, FileText, XCircle, Map } from "lucide-react";

// Confirmation dialog keys
const DELETE_TOUR_KEY = "delete_tour";
const BULK_DELETE_TOUR_KEY = "bulk_delete_tour";

// Helper function to render status badge with appropriate styling
const getStatusBadge = (status: string) => {
  const variant =
    status === "Hoạt động"
      ? "default"
      : status === "Nháp"
        ? "secondary"
        : "outline";

  return <Badge variant={variant}>{status}</Badge>;
};

export default function ToursManagementPage() {
  const { tours, loading, addTour, updateTour, deleteTour } = useTour();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting state
  const { sort, toggleSort, sortData } = useSorting<Tour>({
    defaultSort: { key: "price", direction: "desc" },
    sortConfig: {
      price: "number",
      status: "string",
      bookings: "number",
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

  // Confirmation dialog state
  const { shouldShowConfirmation, setDontShowAgain } = useConfirmationPreferences();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "delete" | "bulk_delete" | "bulk_status";
    itemId: number | null;
    newStatus?: string;
  }>({
    isOpen: false,
    type: "delete",
    itemId: null,
  });

  // Filter and sort tours based on search term (case-insensitive match on title or location)
  const filteredTours = useMemo(() => {
    const filtered = tours.filter((tour) => {
      const search = searchTerm.toLowerCase();
      return (
        tour.title.toLowerCase().includes(search) ||
        tour.location.toLowerCase().includes(search)
      );
    });
    return sortData(filtered);
  }, [tours, searchTerm, sortData]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE);
  const paginatedTours = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTours.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTours, currentPage]);

  // Get IDs of paginated tours for selection
  const paginatedTourIds = useMemo(() => paginatedTours.map((t) => t.id), [paginatedTours]);

  // Count selected tours by status for disabling bulk actions
  const selectedToursWithStatus = useMemo(() => {
    const selectedTours = tours.filter((t) => selectedArray.includes(t.id));
    return {
      active: selectedTours.filter((t) => t.status === "Hoạt động").length,
      draft: selectedTours.filter((t) => t.status === "Nháp").length,
      closed: selectedTours.filter((t) => t.status === "Đã đóng").length,
      total: selectedTours.length,
    };
  }, [tours, selectedArray]);

  const form = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      title: "",
      location: "",
      price: 0,
      duration: "",
      category: "",
      status: "Nháp",
      images: [],
      image: "",
      description: "",
    },
  });

  const handleOpenModal = (tour?: Tour) => {
    if (tour) {
      setEditingTour(tour);
      form.reset({
        title: tour.title,
        location: tour.location,
        price: tour.price,
        duration: tour.duration,
        category: tour.category || "",
        status: tour.status,
        images: tour.images || [],
        image: tour.image || "",
        description: tour.description || "",
      });
    } else {
      setEditingTour(null);
      form.reset({
        title: "",
        location: "",
        price: 0,
        duration: "",
        category: "",
        status: "Nháp",
        images: [],
        image: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTour(null);
    form.reset();
  };

  const onSubmit = async (data: TourFormData) => {
    try {
      if (editingTour) {
        await updateTour(editingTour.id, data);
        toast.success("Đã cập nhật tour thành công!");
      } else {
        await addTour(data as Tour);
        toast.success("Đã thêm tour mới thành công!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving tour:", error);
      toast.error(
        editingTour
          ? "Không thể cập nhật tour. Vui lòng thử lại."
          : "Không thể thêm tour mới. Vui lòng thử lại."
      );
    }
  };

  // Execute delete action
  const executeDelete = async (id: number) => {
    await deleteTour(id);
    clearSelection();
    toast.success("Đã xóa tour thành công!");
  };

  // Execute bulk delete action
  const executeBulkDelete = async () => {
    for (const id of selectedArray) {
      await deleteTour(id);
    }
    toast.success(`Đã xóa ${selectedCount} tour thành công!`);
    clearSelection();
  };

  // Execute bulk status change
  const executeBulkStatusChange = async (newStatus: "Hoạt động" | "Nháp" | "Đã đóng") => {
    for (const id of selectedArray) {
      const tour = tours.find((t) => t.id === id);
      if (tour) {
        await updateTour(id, { ...tour, status: newStatus });
      }
    }
    toast.success(`Đã cập nhật trạng thái ${selectedCount} tour!`);
    clearSelection();
  };

  // Handle delete click
  const handleDeleteClick = (id: number) => {
    if (shouldShowConfirmation(DELETE_TOUR_KEY)) {
      setConfirmDialog({ isOpen: true, type: "delete", itemId: id });
    } else {
      executeDelete(id);
    }
  };

  // Handle bulk delete click
  const handleBulkDeleteClick = () => {
    if (shouldShowConfirmation(BULK_DELETE_TOUR_KEY)) {
      setConfirmDialog({ isOpen: true, type: "bulk_delete", itemId: null });
    } else {
      executeBulkDelete();
    }
  };

  // Handle bulk status change click
  const handleBulkStatusChange = (newStatus: "Hoạt động" | "Nháp" | "Đã đóng") => {
    executeBulkStatusChange(newStatus);
  };

  // Dialog confirm handler
  const handleDialogConfirm = () => {
    if (confirmDialog.type === "delete" && confirmDialog.itemId) {
      executeDelete(confirmDialog.itemId);
    } else if (confirmDialog.type === "bulk_delete") {
      executeBulkDelete();
    }
    setConfirmDialog({ isOpen: false, type: "delete", itemId: null });
  };

  // Dialog cancel handler
  const handleDialogCancel = () => {
    setConfirmDialog({ isOpen: false, type: "delete", itemId: null });
  };

  // Don't show again handler
  const handleDontShowAgain = () => {
    const key = confirmDialog.type === "bulk_delete" ? BULK_DELETE_TOUR_KEY : DELETE_TOUR_KEY;
    setDontShowAgain(key);
  };

  // Clear search filter
  const handleClearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      label: "Hoạt động",
      icon: <Check className="h-4 w-4 mr-1" />,
      onClick: () => handleBulkStatusChange("Hoạt động"),
      disabled: selectedToursWithStatus.active === selectedToursWithStatus.total,
    },
    {
      label: "Nháp",
      icon: <FileText className="h-4 w-4 mr-1" />,
      onClick: () => handleBulkStatusChange("Nháp"),
      variant: "outline",
      disabled: selectedToursWithStatus.draft === selectedToursWithStatus.total,
    },
    {
      label: "Đã đóng",
      icon: <XCircle className="h-4 w-4 mr-1" />,
      onClick: () => handleBulkStatusChange("Đã đóng"),
      variant: "outline",
      disabled: selectedToursWithStatus.closed === selectedToursWithStatus.total,
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
              <Map className="h-6 w-6" />
              Danh sách Tour
            </h2>
            <p className="text-muted-foreground">
              Quản lý các gói tour và danh sách hiển thị.
            </p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" /> Thêm Tour mới
          </Button>
        </div>
        <TableSkeleton columns={6} rows={5} hasCheckbox />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Map className="h-6 w-6" />
            Danh sách Tour
          </h2>
          <p className="text-muted-foreground">
            Quản lý các gói tour và danh sách hiển thị.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Thêm Tour mới
        </Button>
      </div>

      {/* Toolbar: Search & Bulk Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap overflow-x-hidden">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            name="search"
            placeholder="Tìm kiếm tour..."
            className="pl-8"
            aria-label="Tìm kiếm tour"
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
        {filteredTours.length === 0 ? (
          <EmptyState
            message={searchTerm ? "Không tìm thấy tour nào" : "Chưa có tour nào"}
            description={searchTerm ? "Thử thay đổi từ khóa tìm kiếm" : "Tạo tour đầu tiên để bắt đầu"}
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
                      id="select-all-tours"
                      name="select-all-tours"
                      type="checkbox"
                      checked={isAllSelected(paginatedTourIds)}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected(paginatedTourIds);
                      }}
                      onChange={() => toggleAll(paginatedTourIds)}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Chọn tất cả tour"
                    />
                  </TableHead>
                  <TableHead>Tên Tour</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <SortableHeader sortKey="price" currentSort={sort} onSort={toggleSort}>
                    Giá
                  </SortableHeader>
                  <SortableHeader sortKey="status" currentSort={sort} onSort={toggleSort}>
                    Trạng thái
                  </SortableHeader>
                  <SortableHeader sortKey="bookings" currentSort={sort} onSort={toggleSort}>
                    Đã đặt
                  </SortableHeader>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTours.map((tour) => (
                  <TableRow key={tour.id} className={isSelected(tour.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <input
                        id={`tour-checkbox-${tour.id}`}
                        name={`tour-checkbox-${tour.id}`}
                        type="checkbox"
                        checked={isSelected(tour.id)}
                        onChange={() => toggleSelection(tour.id)}
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label={`Chọn ${tour.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{tour.title}</TableCell>
                    <TableCell>{tour.location}</TableCell>
                    <TableCell>
                      {formatCurrency(tour.price)}
                    </TableCell>
                    <TableCell>{getStatusBadge(tour.status)}</TableCell>
                    <TableCell>{tour.bookings || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(tour)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(tour.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTour ? "Chỉnh sửa Tour" : "Thêm Tour mới"}
        className="max-w-2xl"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Tour</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên tour" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa điểm</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập địa điểm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập giá"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời lượng</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: 3 Ngày 2 Đêm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Biển, Núi, Văn hóa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <FormControl>
                      <select
                        aria-label="Trạng thái tour"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Nháp">Nháp</option>
                        <option value="Đã đóng">Đã đóng</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2">
                <TourImageManager
                  images={form.watch("images") || []}
                  onChange={(images) => {
                    form.setValue("images", images);
                    // Also set the legacy image field to the primary image URL
                    const primaryImage = images.find((img) => img.isPrimary);
                    form.setValue("image", primaryImage?.url || images[0]?.url || "");
                  }}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mô tả
                      </span>
                      <RichTextEditor
                        id="tour-description-editor"
                        name="description"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Mô tả chi tiết về tour..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button type="submit">
                {editingTour ? "Lưu thay đổi" : "Tạo Tour"}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
        title={confirmDialog.type === "bulk_delete" ? "Xóa các tour đã chọn" : "Xóa tour"}
        message={
          confirmDialog.type === "bulk_delete"
            ? `Bạn có chắc chắn muốn xóa ${selectedCount} tour đã chọn? Hành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa tour này? Hành động này không thể hoàn tác."
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
