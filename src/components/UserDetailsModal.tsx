import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export interface UserDetails {
    id: number;
    email: string;
    name: string;
    phone?: string;
    dob?: string;
    gender?: "male" | "female" | "other";
    role: "user" | "admin";
    status: "active" | "locked";
}

interface UserDetailsModalProps {
    user: UserDetails | null;
    isOpen: boolean;
    onClose: () => void;
}

const getGenderLabel = (gender?: string) => {
    switch (gender) {
        case "male":
            return "Nam";
        case "female":
            return "Nữ";
        case "other":
            return "Khác";
        default:
            return "Chưa cập nhật";
    }
};

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết người dùng"
            className="max-w-md"
        >
            <div className="space-y-4">
                {/* User Avatar & Name Header */}
                <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-lg">{user.name}</p>
                    </div>
                </div>

                {/* Role & Status */}
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Vai trò</p>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                        <Badge
                            variant={user.status === "active" ? "outline" : "destructive"}
                            className={user.status === "active" ? "border-green-500 text-green-600" : ""}
                        >
                            {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                        </Badge>
                    </div>
                </div>

                {/* User Details */}
                <div className="space-y-3 pt-2">
                    {/* Email */}
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{user.email}</p>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Số điện thoại</p>
                            <p className="text-sm font-medium">
                                {user.phone || "Chưa cập nhật"}
                            </p>
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Ngày sinh</p>
                            <p className="text-sm font-medium">
                                {user.dob
                                    ? format(new Date(user.dob), "dd/MM/yyyy", { locale: vi })
                                    : "Chưa cập nhật"}
                            </p>
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                            <UserCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Giới tính</p>
                            <p className="text-sm font-medium">{getGenderLabel(user.gender)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
