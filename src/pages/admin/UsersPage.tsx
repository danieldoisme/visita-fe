import { useState } from "react";
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
import { Search, Lock, Unlock, KeyRound } from "lucide-react";

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

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleLock = (userId: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "locked" : "active" }
          : user
      )
    );
  };

  const handleOpenResetModal = (user: UserData) => {
    setSelectedUser(user);
    setResetSuccess(false);
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setResetSuccess(true);
  };

  const handleCloseResetModal = () => {
    setIsResetModalOpen(false);
    setSelectedUser(null);
    setResetSuccess(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý Người dùng
          </h2>
          <p className="text-muted-foreground">
            Quản lý tài khoản và quyền truy cập của người dùng.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "active" ? "outline" : "destructive"}
                    className={
                      user.status === "active"
                        ? "border-green-500 text-green-600"
                        : ""
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
                      onClick={() => handleToggleLock(user.id)}
                      disabled={user.role === "admin"}
                      title={
                        user.status === "active"
                          ? "Khóa tài khoản"
                          : "Mở khóa tài khoản"
                      }
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    </div>
  );
}
