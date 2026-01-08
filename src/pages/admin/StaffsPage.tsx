import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { useSorting } from "@/hooks/useSorting";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { UserDetailsModal } from "@/components/UserDetailsModal";
import { UserEditModal } from "@/components/UserEditModal";
import { StaffCreateModal } from "@/components/StaffCreateModal";
import {
  TableSkeleton,
  EmptyState,
  BulkActionBar,
  SortableHeader,
  PaginationControls,
  StatusBadge,
  userStatusConfig,
  type BulkAction,
} from "@/components/admin";
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
import {
  Search,
  Lock,
  Unlock,
  Eye,
  UserCog,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import {
  fetchStaffs,
  createStaffApi,
  updateStaffById,
  updateStaffStatusApi,
  deleteStaffApi,
  type Staff,
  type PaginatedStaffs,
  type StaffCreateData,
  type StaffUpdateData,
} from "@/services/adminStaffService";

// Page size for pagination
const PAGE_SIZE = 10;

// Confirmation dialog keys
const LOCK_STAFF_KEY = "lock_staff";
const UNLOCK_STAFF_KEY = "unlock_staff";
const BULK_LOCK_STAFF_KEY = "bulk_lock_staff";
const BULK_UNLOCK_STAFF_KEY = "bulk_unlock_staff";

export default function StaffsPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Sorting state
  const { sort, toggleSort, sortData } = useSorting<Staff>({
    defaultSort: { key: "fullName", direction: "asc" },
    sortConfig: {
      fullName: "string",
      isActive: "string",
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

  // Confirmation dialog state
  const { shouldShowConfirmation, setDontShowAgain } =
    useConfirmationPreferences();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "lock" | "unlock" | "bulk_lock" | "bulk_unlock" | "delete";
    staffId: string | null;
  }>({
    isOpen: false,
    type: "lock",
    staffId: null,
  });

  const [dialogContent, setDialogContent] = useState<{
    title: string;
    message: string;
    variant: "default" | "danger" | "warning";
  }>({
    title: "",
    message: "",
    variant: "default",
  });

  // Fetch staffs from API
  const loadStaffs = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const data: PaginatedStaffs = await fetchStaffs(page, PAGE_SIZE);
      setStaffs(data.staffs);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch {
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStaffs(1);
  }, [loadStaffs]);

  // Filter and sort staffs (client-side search on loaded data)
  const filteredStaffs = useMemo(() => {
    const filtered = staffs.filter(
      (staff) =>
        staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortData(filtered);
  }, [staffs, searchTerm, sortData]);

  // Get IDs of selectable staffs
  const selectableStaffIds = useMemo(
    () => filteredStaffs.map((s) => s.id),
    [filteredStaffs]
  );

  // Count selected staffs by status for disabling bulk actions
  const selectedStaffsWithStatus = useMemo(() => {
    const selectedStaffs = staffs.filter((s) => selectedArray.includes(s.id));
    return {
      active: selectedStaffs.filter((s) => s.isActive).length,
      locked: selectedStaffs.filter((s) => !s.isActive).length,
      total: selectedStaffs.length,
    };
  }, [staffs, selectedArray]);

  // Execute lock/unlock single staff
  const executeToggleLock = async (staffId: string) => {
    const staff = staffs.find((s) => s.id === staffId);
    if (!staff) return;

    const newStatus = !staff.isActive;
    setActionLoading(staffId);

    try {
      await updateStaffStatusApi(staffId, newStatus);
      setStaffs((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, isActive: newStatus } : s))
      );
      toast.success(newStatus ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản!");
    } catch {
      toast.error("Không thể cập nhật trạng thái tài khoản");
    } finally {
      setActionLoading(null);
    }
  };

  // Execute bulk lock
  const executeBulkLock = async () => {
    setActionLoading("bulk");
    const staffsToLock = selectedArray.filter((id) => {
      const staff = staffs.find((s) => s.id === id);
      return staff && staff.isActive;
    });

    try {
      await Promise.all(
        staffsToLock.map((id) => updateStaffStatusApi(id, false))
      );
      setStaffs((prev) =>
        prev.map((staff) =>
          staffsToLock.includes(staff.id)
            ? { ...staff, isActive: false }
            : staff
        )
      );
      toast.success(`Đã khóa ${staffsToLock.length} tài khoản!`);
      clearSelection();
    } catch {
      toast.error("Không thể khóa một số tài khoản");
    } finally {
      setActionLoading(null);
    }
  };

  // Execute bulk unlock
  const executeBulkUnlock = async () => {
    setActionLoading("bulk");
    const staffsToUnlock = selectedArray.filter((id) => {
      const staff = staffs.find((s) => s.id === id);
      return staff && !staff.isActive;
    });

    try {
      await Promise.all(
        staffsToUnlock.map((id) => updateStaffStatusApi(id, true))
      );
      setStaffs((prev) =>
        prev.map((staff) =>
          staffsToUnlock.includes(staff.id)
            ? { ...staff, isActive: true }
            : staff
        )
      );
      toast.success(`Đã mở khóa ${staffsToUnlock.length} tài khoản!`);
      clearSelection();
    } catch {
      toast.error("Không thể mở khóa một số tài khoản");
    } finally {
      setActionLoading(null);
    }
  };

  // Execute delete staff (soft delete - sets isActive to false)
  const executeDeleteStaff = async (staffId: string) => {
    setActionLoading(staffId);
    try {
      await deleteStaffApi(staffId);
      setStaffs((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, isActive: false } : s))
      );
      toast.success("Vô hiệu hóa tài khoản thành công!");
    } catch {
      toast.error("Không thể vô hiệu hóa tài khoản");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle lock/unlock click
  const handleToggleLockClick = (staff: Staff) => {
    const dialogType = staff.isActive ? "lock" : "unlock";
    const key = staff.isActive ? LOCK_STAFF_KEY : UNLOCK_STAFF_KEY;

    if (shouldShowConfirmation(key)) {
      setDialogContent({
        title: staff.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản",
        message: staff.isActive
          ? "Bạn có chắc chắn muốn khóa tài khoản này? Nhân viên sẽ không thể đăng nhập."
          : "Bạn có chắc chắn muốn mở khóa tài khoản này?",
        variant: staff.isActive ? "warning" : "default",
      });
      setConfirmDialog({ isOpen: true, type: dialogType, staffId: staff.id });
    } else {
      executeToggleLock(staff.id);
    }
  };

  // Handle bulk lock click
  const handleBulkLockClick = () => {
    if (shouldShowConfirmation(BULK_LOCK_STAFF_KEY)) {
      setDialogContent({
        title: "Khóa các tài khoản đã chọn",
        message: `Bạn có chắc chắn muốn khóa ${selectedCount} tài khoản đã chọn?`,
        variant: "warning",
      });
      setConfirmDialog({ isOpen: true, type: "bulk_lock", staffId: null });
    } else {
      executeBulkLock();
    }
  };

  // Handle bulk unlock click
  const handleBulkUnlockClick = () => {
    if (shouldShowConfirmation(BULK_UNLOCK_STAFF_KEY)) {
      setDialogContent({
        title: "Mở khóa các tài khoản đã chọn",
        message: `Bạn có chắc chắn muốn mở khóa ${selectedCount} tài khoản đã chọn?`,
        variant: "default",
      });
      setConfirmDialog({ isOpen: true, type: "bulk_unlock", staffId: null });
    } else {
      executeBulkUnlock();
    }
  };

  // Handle delete click (soft delete)
  const handleDeleteClick = (staff: Staff) => {
    setDialogContent({
      title: "Vô hiệu hóa tài khoản",
      message: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của ${staff.fullName}? Nhân viên này sẽ không thể đăng nhập cho đến khi được kích hoạt lại.`,
      variant: "danger",
    });
    setConfirmDialog({ isOpen: true, type: "delete", staffId: staff.id });
  };

  // Dialog confirm handler
  const handleDialogConfirm = async () => {
    switch (confirmDialog.type) {
      case "lock":
      case "unlock":
        if (confirmDialog.staffId)
          await executeToggleLock(confirmDialog.staffId);
        break;
      case "bulk_lock":
        await executeBulkLock();
        break;
      case "bulk_unlock":
        await executeBulkUnlock();
        break;
      case "delete":
        if (confirmDialog.staffId)
          await executeDeleteStaff(confirmDialog.staffId);
        break;
    }
    setConfirmDialog({ isOpen: false, type: "lock", staffId: null });
  };

  // Dialog cancel handler
  const handleDialogCancel = () => {
    setConfirmDialog({ isOpen: false, type: "lock", staffId: null });
  };

  // Don't show again handler
  const handleDontShowAgain = () => {
    const keyMap: Record<string, string> = {
      lock: LOCK_STAFF_KEY,
      unlock: UNLOCK_STAFF_KEY,
      bulk_lock: BULK_LOCK_STAFF_KEY,
      bulk_unlock: BULK_UNLOCK_STAFF_KEY,
    };
    setDontShowAgain(keyMap[confirmDialog.type]);
  };

  // View details handlers
  const handleViewDetails = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedStaff(null);
  };

  // Edit staff handlers
  const handleEditStaff = (staff: Staff) => {
    setStaffToEdit(staff);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setStaffToEdit(null);
  };

  const handleSaveStaff = async (id: string, data: StaffUpdateData) => {
    try {
      const updatedStaff = await updateStaffById(id, data);
      setStaffs((prev) => prev.map((s) => (s.id === id ? updatedStaff : s)));
      toast.success("Cập nhật thông tin nhân viên thành công!");
    } catch {
      toast.error("Không thể cập nhật thông tin nhân viên");
      throw new Error("Failed to update staff");
    }
  };

  // Create staff handlers
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateStaff = async (data: StaffCreateData) => {
    const newStaff = await createStaffApi(data);
    setStaffs((prev) => [newStaff, ...prev]);
    toast.success("Tạo nhân viên mới thành công!");
  };

  // Clear search filter
  const handleClearFilters = () => {
    setSearchTerm("");
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    loadStaffs(page);
    clearSelection();
  };

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      label: "Khóa",
      icon: <Lock className="h-4 w-4 mr-1" />,
      onClick: handleBulkLockClick,
      disabled:
        selectedStaffsWithStatus.locked === selectedStaffsWithStatus.total ||
        actionLoading === "bulk",
    },
    {
      label: "Mở khóa",
      icon: <Unlock className="h-4 w-4 mr-1" />,
      onClick: handleBulkUnlockClick,
      disabled:
        selectedStaffsWithStatus.active === selectedStaffsWithStatus.total ||
        actionLoading === "bulk",
    },
  ];

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <UserCog className="h-6 w-6" />
              Quản lý Nhân viên
            </h2>
            <p className="text-muted-foreground">
              Quản lý tài khoản nhân viên trong hệ thống.
            </p>
          </div>
        </div>
        <TableSkeleton columns={5} rows={5} hasCheckbox />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Quản lý Nhân viên
          </h2>
          <p className="text-muted-foreground">
            Quản lý tài khoản nhân viên trong hệ thống.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Toolbar: Search & Bulk Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap overflow-x-hidden p-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-staffs"
            name="search-staffs"
            placeholder="Tìm kiếm nhân viên..."
            className="pl-8"
            aria-label="Tìm kiếm nhân viên"
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
        {filteredStaffs.length === 0 ? (
          <EmptyState
            message={
              searchTerm
                ? "Không tìm thấy nhân viên nào"
                : "Chưa có nhân viên nào"
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
                      id="select-all-staffs"
                      name="select-all-staffs"
                      type="checkbox"
                      checked={isAllSelected(selectableStaffIds)}
                      ref={(el) => {
                        if (el)
                          el.indeterminate = isSomeSelected(selectableStaffIds);
                      }}
                      onChange={() => toggleAll(selectableStaffIds)}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Chọn tất cả nhân viên"
                    />
                  </TableHead>
                  <SortableHeader
                    sortKey="fullName"
                    currentSort={sort}
                    onSort={toggleSort}
                  >
                    Nhân viên
                  </SortableHeader>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <SortableHeader
                    sortKey="isActive"
                    currentSort={sort}
                    onSort={toggleSort}
                  >
                    Trạng thái
                  </SortableHeader>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaffs.map((staff) => (
                  <TableRow
                    key={staff.id}
                    className={isSelected(staff.id) ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <input
                        id={`staff-checkbox-${staff.id}`}
                        name={`staff-checkbox-${staff.id}`}
                        type="checkbox"
                        checked={isSelected(staff.id)}
                        onChange={() => toggleSelection(staff.id)}
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label={`Chọn ${staff.fullName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-medium">
                          {staff.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">{staff.fullName}</span>
                          <p className="text-xs text-muted-foreground">
                            @{staff.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {staff.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {staff.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={staff.isActive ? "active" : "locked"}
                        config={userStatusConfig}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(staff)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditStaff(staff)}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleLockClick(staff)}
                          disabled={actionLoading === staff.id}
                          title={
                            staff.isActive
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"
                          }
                        >
                          {staff.isActive ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(staff)}
                          disabled={
                            actionLoading === staff.id || !staff.isActive
                          }
                          title="Xóa (Vô hiệu hóa)"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Staff Details Modal */}
      <UserDetailsModal
        user={
          selectedStaff
            ? {
              id: selectedStaff.id,
              email: selectedStaff.email,
              name: selectedStaff.fullName,
              phone: selectedStaff.phone,
              dob: selectedStaff.dob,
              gender: selectedStaff.gender,
              address: selectedStaff.address,
              role: "staff",
              status: selectedStaff.isActive ? "active" : "locked",
            }
            : null
        }
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
      />

      {/* Staff Edit Modal */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={
          staffToEdit
            ? {
              id: staffToEdit.id,
              email: staffToEdit.email,
              fullName: staffToEdit.fullName,
              phone: staffToEdit.phone,
              dob: staffToEdit.dob,
              gender: staffToEdit.gender,
              address: staffToEdit.address,
              role: "staff",
              isActive: staffToEdit.isActive,
            }
            : null
        }
        onSave={handleSaveStaff}
      />

      {/* Create Staff Modal */}
      <StaffCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleCreateStaff}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
        title={dialogContent.title}
        message={dialogContent.message}
        confirmText="Xác nhận"
        cancelText="Hủy"
        variant={dialogContent.variant}
        showDontShowAgain
        onDontShowAgainChange={handleDontShowAgain}
      />
    </div>
  );
}
