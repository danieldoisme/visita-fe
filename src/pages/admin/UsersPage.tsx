import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { useSorting } from "@/hooks/useSorting";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { TableSkeleton, EmptyState, BulkActionBar, SortableHeader, type BulkAction } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Lock, Unlock, KeyRound, Trash2 } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  status: "active" | "locked";
  avatar?: string;
}

// Mock users data
const initialUsers: UserData[] = [
  {
    id: 1,
    email: "admin@visita.com",
    name: "Admin",
    role: "admin",
    status: "active",
  },
  {
    id: 2,
    email: "user@visita.com",
    name: "Nguyen Van A",
    role: "user",
    status: "active",
  },
  {
    id: 3,
    email: "tran.binh@email.com",
    name: "Trần Thị Bình",
    role: "user",
    status: "active",
  },
  {
    id: 4,
    email: "le.cuong@email.com",
    name: "Lê Hoàng Cường",
    role: "user",
    status: "locked",
  },
  {
    id: 5,
    email: "pham.duy@email.com",
    name: "Phạm Minh Duy",
    role: "user",
    status: "active",
  },
];

// Confirmation dialog keys
const LOCK_USER_KEY = "lock_user";
const UNLOCK_USER_KEY = "unlock_user";
const DELETE_USER_KEY = "delete_user";
const BULK_DELETE_USER_KEY = "bulk_delete_user";
const BULK_LOCK_USER_KEY = "bulk_lock_user";
const BULK_UNLOCK_USER_KEY = "bulk_unlock_user";

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const loading = false; // Simulated loading state for skeleton demo

  // Sorting state
  const { sort, toggleSort, sortData } = useSorting<UserData>({
    defaultSort: { key: "role", direction: "desc" },
    sortConfig: {
      role: "string",
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

  // Confirmation dialog state
  const { shouldShowConfirmation, setDontShowAgain } = useConfirmationPreferences();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "lock" | "unlock" | "delete" | "bulk_lock" | "bulk_unlock" | "bulk_delete";
    userId: number | null;
  }>({
    isOpen: false,
    type: "lock",
    userId: null,
  });

  // Filter and sort users (exclude admins from selection for bulk actions)
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortData(filtered);
  }, [users, searchTerm, sortData]);

  // Get IDs of selectable users (non-admin only)
  const selectableUserIds = useMemo(
    () => filteredUsers.filter((u) => u.role !== "admin").map((u) => u.id),
    [filteredUsers]
  );

  // Count selected users by status for disabling bulk actions
  const selectedUsersWithStatus = useMemo(() => {
    const selectedUsers = users.filter((u) => selectedArray.includes(u.id) && u.role !== "admin");
    return {
      active: selectedUsers.filter((u) => u.status === "active").length,
      locked: selectedUsers.filter((u) => u.status === "locked").length,
      total: selectedUsers.length,
    };
  }, [users, selectedArray]);

  // Execute lock/unlock single user
  const executeToggleLock = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "locked" : "active" }
          : user
      )
    );
    toast.success(
      user?.status === "active" ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!"
    );
  };

  // Execute delete single user
  const executeDeleteUser = (userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    clearSelection();
    toast.success("Đã xóa tài khoản!");
  };

  // Execute bulk lock
  const executeBulkLock = () => {
    setUsers((prev) =>
      prev.map((user) =>
        selectedArray.includes(user.id) && user.role !== "admin"
          ? { ...user, status: "locked" }
          : user
      )
    );
    toast.success(`Đã khóa ${selectedCount} tài khoản!`);
    clearSelection();
  };

  // Execute bulk unlock
  const executeBulkUnlock = () => {
    setUsers((prev) =>
      prev.map((user) =>
        selectedArray.includes(user.id) ? { ...user, status: "active" } : user
      )
    );
    toast.success(`Đã mở khóa ${selectedCount} tài khoản!`);
    clearSelection();
  };

  // Execute bulk delete
  const executeBulkDelete = () => {
    setUsers((prev) => prev.filter((u) => !selectedArray.includes(u.id)));
    toast.success(`Đã xóa ${selectedCount} tài khoản!`);
    clearSelection();
  };

  // Handle lock/unlock click
  const handleToggleLockClick = (user: UserData) => {
    const dialogType = user.status === "active" ? "lock" : "unlock";
    const key = user.status === "active" ? LOCK_USER_KEY : UNLOCK_USER_KEY;

    if (shouldShowConfirmation(key)) {
      setConfirmDialog({ isOpen: true, type: dialogType, userId: user.id });
    } else {
      executeToggleLock(user.id);
    }
  };

  // Handle delete click
  const handleDeleteClick = (userId: number) => {
    if (shouldShowConfirmation(DELETE_USER_KEY)) {
      setConfirmDialog({ isOpen: true, type: "delete", userId });
    } else {
      executeDeleteUser(userId);
    }
  };

  // Handle bulk lock click
  const handleBulkLockClick = () => {
    if (shouldShowConfirmation(BULK_LOCK_USER_KEY)) {
      setConfirmDialog({ isOpen: true, type: "bulk_lock", userId: null });
    } else {
      executeBulkLock();
    }
  };

  // Handle bulk unlock click
  const handleBulkUnlockClick = () => {
    if (shouldShowConfirmation(BULK_UNLOCK_USER_KEY)) {
      setConfirmDialog({ isOpen: true, type: "bulk_unlock", userId: null });
    } else {
      executeBulkUnlock();
    }
  };

  // Handle bulk delete click
  const handleBulkDeleteClick = () => {
    if (shouldShowConfirmation(BULK_DELETE_USER_KEY)) {
      setConfirmDialog({ isOpen: true, type: "bulk_delete", userId: null });
    } else {
      executeBulkDelete();
    }
  };

  // Dialog confirm handler
  const handleDialogConfirm = () => {
    switch (confirmDialog.type) {
      case "lock":
      case "unlock":
        if (confirmDialog.userId) executeToggleLock(confirmDialog.userId);
        break;
      case "delete":
        if (confirmDialog.userId) executeDeleteUser(confirmDialog.userId);
        break;
      case "bulk_lock":
        executeBulkLock();
        break;
      case "bulk_unlock":
        executeBulkUnlock();
        break;
      case "bulk_delete":
        executeBulkDelete();
        break;
    }
    setConfirmDialog({ isOpen: false, type: "lock", userId: null });
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
      delete: DELETE_USER_KEY,
      bulk_lock: BULK_LOCK_USER_KEY,
      bulk_unlock: BULK_UNLOCK_USER_KEY,
      bulk_delete: BULK_DELETE_USER_KEY,
    };
    setDontShowAgain(keyMap[confirmDialog.type]);
  };

  // Get dialog content based on type
  const getDialogContent = () => {
    switch (confirmDialog.type) {
      case "lock":
        return {
          title: "Khóa tài khoản",
          message: "Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập.",
          variant: "warning" as const,
        };
      case "unlock":
        return {
          title: "Mở khóa tài khoản",
          message: "Bạn có chắc chắn muốn mở khóa tài khoản này?",
          variant: "default" as const,
        };
      case "delete":
        return {
          title: "Xóa tài khoản",
          message: "Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.",
          variant: "danger" as const,
        };
      case "bulk_lock":
        return {
          title: "Khóa các tài khoản đã chọn",
          message: `Bạn có chắc chắn muốn khóa ${selectedCount} tài khoản đã chọn?`,
          variant: "warning" as const,
        };
      case "bulk_unlock":
        return {
          title: "Mở khóa các tài khoản đã chọn",
          message: `Bạn có chắc chắn muốn mở khóa ${selectedCount} tài khoản đã chọn?`,
          variant: "default" as const,
        };
      case "bulk_delete":
        return {
          title: "Xóa các tài khoản đã chọn",
          message: `Bạn có chắc chắn muốn xóa ${selectedCount} tài khoản đã chọn? Hành động này không thể hoàn tác.`,
          variant: "danger" as const,
        };
    }
  };

  const dialogContent = getDialogContent();

  // Reset password handlers
  const handleOpenResetModal = (user: UserData) => {
    setSelectedUser(user);
    setResetSuccess(false);
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setResetSuccess(true);
  };

  const handleCloseResetModal = () => {
    setIsResetModalOpen(false);
    setSelectedUser(null);
    setResetSuccess(false);
  };

  // Clear search filter
  const handleClearFilters = () => {
    setSearchTerm("");
  };

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      label: "Khóa",
      icon: <Lock className="h-4 w-4 mr-1" />,
      onClick: handleBulkLockClick,
      disabled: selectedUsersWithStatus.locked === selectedUsersWithStatus.total,
    },
    {
      label: "Mở khóa",
      icon: <Unlock className="h-4 w-4 mr-1" />,
      onClick: handleBulkUnlockClick,
      disabled: selectedUsersWithStatus.active === selectedUsersWithStatus.total,
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
            <h2 className="text-2xl font-bold tracking-tight">Quản lý Người dùng</h2>
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
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Người dùng</h2>
          <p className="text-muted-foreground">
            Quản lý tài khoản và quyền truy cập của người dùng.
          </p>
        </div>
      </div>

      {/* Toolbar: Search & Bulk Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
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
                <SortableHeader sortKey="status" currentSort={sort} onSort={toggleSort}>
                  Trạng thái
                </SortableHeader>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
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
                      aria-label={`Chọn ${user.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "active" ? "outline" : "destructive"}
                      className={
                        user.status === "active" ? "border-green-500 text-green-600" : ""
                      }
                    >
                      {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLockClick(user)}
                        disabled={user.role === "admin"}
                        title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      >
                        {user.status === "active" ? (
                          <>
                            <Lock className="h-4 w-4 mr-1" />
                            Khóa
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-1" />
                            Mở khóa
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenResetModal(user)}
                        disabled={user.role === "admin"}
                        title="Reset mật khẩu"
                      >
                        <KeyRound className="h-4 w-4 mr-1" />
                        Reset MK
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(user.id)}
                        disabled={user.role === "admin"}
                        className="text-destructive hover:text-destructive"
                        title="Xóa tài khoản"
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

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={handleCloseResetModal}
        title="Đặt lại mật khẩu"
      >
        {!resetSuccess ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng{" "}
              <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
            </p>
            <p className="text-sm text-muted-foreground">
              Một email chứa liên kết đặt lại mật khẩu sẽ được gửi đến địa chỉ
              email của người dùng.
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseResetModal}>
                Hủy
              </Button>
              <Button onClick={handleResetPassword}>Xác nhận</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Đã gửi email đặt lại mật khẩu đến{" "}
              <strong>{selectedUser?.email}</strong>.
            </p>
            <div className="flex justify-center pt-4">
              <Button onClick={handleCloseResetModal}>Đóng</Button>
            </div>
          </div>
        )}
      </Modal>

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
