import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { useSorting } from "@/hooks/useSorting";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { UserDetailsModal } from "@/components/UserDetailsModal";
import { UserEditModal } from "@/components/UserEditModal";
import { TableSkeleton, EmptyState, BulkActionBar, SortableHeader, PaginationControls, StatusBadge, userStatusConfig, type BulkAction } from "@/components/admin";
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
import { Search, Lock, Unlock, Eye, Users, Pencil, Trash2 } from "lucide-react";

import {
  fetchUsers,
  updateUserStatusApi,
  updateUserById,
  deleteUserApi,
  type User,
  type PaginatedUsers,
  type UserUpdateData,
} from "@/services/adminUserService";

// Page size for pagination
const PAGE_SIZE = 10;

// Confirmation dialog keys
const LOCK_USER_KEY = "lock_user";
const UNLOCK_USER_KEY = "unlock_user";
const BULK_LOCK_USER_KEY = "bulk_lock_user";
const BULK_UNLOCK_USER_KEY = "bulk_unlock_user";

// Role display configuration
const getRoleDisplay = (role: "admin" | "staff" | "user") => {
  switch (role) {
    case "admin":
      return { label: "Quản trị viên", className: "bg-primary text-primary-foreground" };
    case "staff":
      return { label: "Nhân viên", className: "bg-blue-500 text-white" };
    default:
      return { label: "Người dùng", className: "bg-secondary text-secondary-foreground" };
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Sorting state
  const { sort, toggleSort, sortData } = useSorting<User>({
    defaultSort: { key: "role", direction: "desc" },
    sortConfig: {
      role: "string",
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
  const { shouldShowConfirmation, setDontShowAgain } = useConfirmationPreferences();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "lock" | "unlock" | "bulk_lock" | "bulk_unlock";
    userId: string | null;
    action?: "delete";
    id?: string;
  }>({
    isOpen: false,
    type: "lock",
    userId: null,
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

  // Fetch users from API
  const loadUsers = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const data: PaginatedUsers = await fetchUsers(page, PAGE_SIZE);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  // Filter and sort users (client-side search on loaded data)
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortData(filtered);
  }, [users, searchTerm, sortData]);

  // Get IDs of selectable users (exclude admins)
  const selectableUserIds = useMemo(
    () => filteredUsers.filter((u) => u.role !== "admin").map((u) => u.id),
    [filteredUsers]
  );

  // Count selected users by status for disabling bulk actions
  const selectedUsersWithStatus = useMemo(() => {
    const selectedUsers = users.filter((u) => selectedArray.includes(u.id) && u.role !== "admin");
    return {
      active: selectedUsers.filter((u) => u.isActive).length,
      locked: selectedUsers.filter((u) => !u.isActive).length,
      total: selectedUsers.length,
    };
  }, [users, selectedArray]);

  // Execute lock/unlock single user
  const executeToggleLock = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newStatus = !user.isActive;
    setActionLoading(userId);

    try {
      await updateUserStatusApi(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: newStatus } : u
        )
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
    const usersToLock = selectedArray.filter((id) => {
      const user = users.find((u) => u.id === id);
      return user && user.role !== "admin" && user.isActive;
    });

    try {
      await Promise.all(usersToLock.map((id) => updateUserStatusApi(id, false)));
      setUsers((prev) =>
        prev.map((user) =>
          usersToLock.includes(user.id) ? { ...user, isActive: false } : user
        )
      );
      toast.success(`Đã khóa ${usersToLock.length} tài khoản!`);
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
    const usersToUnlock = selectedArray.filter((id) => {
      const user = users.find((u) => u.id === id);
      return user && !user.isActive;
    });

    try {
      await Promise.all(usersToUnlock.map((id) => updateUserStatusApi(id, true)));
      setUsers((prev) =>
        prev.map((user) =>
          usersToUnlock.includes(user.id) ? { ...user, isActive: true } : user
        )
      );
      toast.success(`Đã mở khóa ${usersToUnlock.length} tài khoản!`);
      clearSelection();
    } catch {
      toast.error("Không thể mở khóa một số tài khoản");
    } finally {
      setActionLoading(null);
    }
  };



  // Handle lock/unlock click
  const handleToggleLockClick = (user: User) => {
    const dialogType = user.isActive ? "lock" : "unlock";
    const key = user.isActive ? LOCK_USER_KEY : UNLOCK_USER_KEY;

    if (shouldShowConfirmation(key)) {
      setDialogContent({
        title: user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản",
        message: user.isActive
          ? "Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập."
          : "Bạn có chắc chắn muốn mở khóa tài khoản này?",
        variant: user.isActive ? "warning" : "default",
      });
      setConfirmDialog({ isOpen: true, type: dialogType, userId: user.id });
    } else {
      executeToggleLock(user.id);
    }
  };



  // Handle bulk lock click
  const handleBulkLockClick = () => {
    if (shouldShowConfirmation(BULK_LOCK_USER_KEY)) {
      setDialogContent({
        title: "Khóa các tài khoản đã chọn",
        message: `Bạn có chắc chắn muốn khóa ${selectedCount} tài khoản đã chọn?`,
        variant: "warning",
      });
      setConfirmDialog({ isOpen: true, type: "bulk_lock", userId: null });
    } else {
      executeBulkLock();
    }
  };

  // Handle bulk unlock click
  const handleBulkUnlockClick = () => {
    if (shouldShowConfirmation(BULK_UNLOCK_USER_KEY)) {
      setDialogContent({
        title: "Mở khóa các tài khoản đã chọn",
        message: `Bạn có chắc chắn muốn mở khóa ${selectedCount} tài khoản đã chọn?`,
        variant: "default",
      });
      setConfirmDialog({ isOpen: true, type: "bulk_unlock", userId: null });
    } else {
      executeBulkUnlock();
    }
  };



  // Dialog confirm handler
  const handleDialogConfirm = async () => {
    switch (confirmDialog.type) {
      case "lock":
      case "unlock":
        if (confirmDialog.userId) await executeToggleLock(confirmDialog.userId);
        break;
      case "bulk_lock":
        await executeBulkLock();
        break;
      case "bulk_unlock":
        await executeBulkUnlock();
        break;
    }

    if (confirmDialog.action === "delete") {
      try {
        await deleteUserApi(confirmDialog.id as string);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === confirmDialog.id ? { ...u, isActive: false } : u
          )
        );
        toast.success("Vô hiệu hóa tài khoản thành công!");
      } catch (error) {
        toast.error("Không thể vô hiệu hóa tài khoản");
        console.error("Failed to delete user", error);
      }
    }
    setActionLoading(null);
    setConfirmDialog({ ...confirmDialog, isOpen: false, type: "lock", userId: null });
  };

  // Dialog cancel handler
  const handleDialogCancel = () => {
    setConfirmDialog({ isOpen: false, type: "lock", userId: null });
  };

  // Don't show again handler
  const handleDontShowAgain = () => {
    const keyMap: Record<string, string> = {
      lock: LOCK_USER_KEY,
      unlock: UNLOCK_USER_KEY,
      bulk_lock: BULK_LOCK_USER_KEY,
      bulk_unlock: BULK_UNLOCK_USER_KEY,
    };
    setDontShowAgain(keyMap[confirmDialog.type]);
  };



  // View details handlers
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedUser(null);
  };

  // Edit user handlers
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleSaveUser = async (id: string, data: UserUpdateData) => {
    try {
      const updatedUser = await updateUserById(id, data);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? updatedUser : u))
      );
      toast.success("Cập nhật thông tin người dùng thành công!");
    } catch {
      toast.error("Không thể cập nhật thông tin người dùng");
      throw new Error("Failed to update user");
    }
  };

  // Delete user handlers
  const handleDeleteUser = (user: User) => {
    setDialogContent({
      title: "Vô hiệu hóa tài khoản",
      message: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của ${user.fullName}? Người dùng này, nếu xóa, sẽ không thể đăng nhập cho đến khi được kích hoạt lại.`,
      variant: "danger",
    });
    setConfirmDialog({
      isOpen: true,
      action: "delete",
      id: user.id,
      type: "lock",
      userId: null,
    });
  };

  // Clear search filter
  const handleClearFilters = () => {
    setSearchTerm("");
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    loadUsers(page);
    clearSelection();
  };

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      label: "Khóa",
      icon: <Lock className="h-4 w-4 mr-1" />,
      onClick: handleBulkLockClick,
      disabled: selectedUsersWithStatus.locked === selectedUsersWithStatus.total || actionLoading === "bulk",
    },
    {
      label: "Mở khóa",
      icon: <Unlock className="h-4 w-4 mr-1" />,
      onClick: handleBulkUnlockClick,
      disabled: selectedUsersWithStatus.active === selectedUsersWithStatus.total || actionLoading === "bulk",
    },

  ];

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6" />
              Quản lý Người dùng
            </h2>
            <p className="text-muted-foreground">
              Quản lý tài khoản và quyền truy cập của người dùng.
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
            <Users className="h-6 w-6" />
            Quản lý Người dùng
          </h2>
          <p className="text-muted-foreground">
            Quản lý tài khoản và quyền truy cập của người dùng.
          </p>
        </div>
      </div>

      {/* Toolbar: Search & Bulk Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap overflow-x-hidden p-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-users"
            name="search-users"
            placeholder="Tìm kiếm người dùng..."
            className="pl-8"
            aria-label="Tìm kiếm người dùng"
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
        {filteredUsers.length === 0 ? (
          <EmptyState
            message={searchTerm ? "Không tìm thấy người dùng nào" : "Chưa có người dùng nào"}
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
                      id="select-all-users"
                      name="select-all-users"
                      type="checkbox"
                      checked={isAllSelected(selectableUserIds)}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected(selectableUserIds);
                      }}
                      onChange={() => toggleAll(selectableUserIds)}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Chọn tất cả người dùng"
                    />
                  </TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <SortableHeader sortKey="role" currentSort={sort} onSort={toggleSort}>
                    Vai trò
                  </SortableHeader>
                  <SortableHeader sortKey="isActive" currentSort={sort} onSort={toggleSort}>
                    Trạng thái
                  </SortableHeader>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleDisplay = getRoleDisplay(user.role);
                  return (
                    <TableRow key={user.id} className={isSelected(user.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <input
                          id={`user-checkbox-${user.id}`}
                          name={`user-checkbox-${user.id}`}
                          type="checkbox"
                          checked={isSelected(user.id)}
                          onChange={() => toggleSelection(user.id)}
                          disabled={user.role === "admin"}
                          className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                          aria-label={`Chọn ${user.fullName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{user.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleDisplay.className}`}>
                          {roleDisplay.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={user.isActive ? "active" : "locked"}
                          config={userStatusConfig}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(user)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            disabled={user.role === "admin"}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleLockClick(user)}
                            disabled={user.role === "admin" || actionLoading === user.id}
                            title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          >
                            {user.isActive ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.role === "admin" || !user.isActive}
                            title="Xóa (Vô hiệu hóa)"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser ? {
          id: selectedUser.id,
          email: selectedUser.email,
          name: selectedUser.fullName,
          phone: selectedUser.phone,
          dob: selectedUser.dob,
          gender: selectedUser.gender,
          address: selectedUser.address,
          role: selectedUser.role,
          status: selectedUser.isActive ? "active" : "locked",
        } : null}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
      />

      {/* User Edit Modal */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={userToEdit}
        onSave={handleSaveUser}
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
    </div >
  );
}
