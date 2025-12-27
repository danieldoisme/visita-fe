import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { Save, Check, RotateCcw, Settings } from "lucide-react";

// Settings state interface
interface SettingsState {
    // General
    siteName: string;
    tagline: string;
    contactEmail: string;
    phone: string;
    // Notifications
    emailNotifications: boolean;
    bookingAlerts: boolean;
    systemAlerts: boolean;
    // Security
    sessionTimeout: string;
    twoFactorAuth: boolean;
    // Appearance
    darkMode: boolean;
}

const initialSettings: SettingsState = {
    siteName: "Visita",
    tagline: "Khám phá Việt Nam cùng Visita",
    contactEmail: "contact@visita.com",
    phone: "+84 123 456 789",
    emailNotifications: true,
    bookingAlerts: true,
    systemAlerts: false,
    sessionTimeout: "30",
    twoFactorAuth: false,
    darkMode: false,
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsState>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { restoreAllConfirmations, hasDismissedConfirmations } = useConfirmationPreferences();

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const updateSetting = <K extends keyof SettingsState>(
        key: K,
        value: SettingsState[K]
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Cài đặt
                    </h2>
                    <p className="text-muted-foreground">
                        Quản lý cài đặt hệ thống và tùy chọn của bạn.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Đang lưu...
                        </>
                    ) : showSuccess ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Đã lưu!
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thay đổi
                        </>
                    )}
                </Button>
            </div>

            {/* General Settings */}
            <SettingsCard
                title="Thông tin chung"
                description="Cập nhật thông tin cơ bản của website."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="siteName" className="text-sm font-medium">
                            Tên website
                        </label>
                        <Input
                            id="siteName"
                            value={settings.siteName}
                            onChange={(e) => updateSetting("siteName", e.target.value)}
                            placeholder="Tên website"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="tagline" className="text-sm font-medium">
                            Khẩu hiệu
                        </label>
                        <Input
                            id="tagline"
                            value={settings.tagline}
                            onChange={(e) => updateSetting("tagline", e.target.value)}
                            placeholder="Khẩu hiệu website"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="contactEmail" className="text-sm font-medium">
                            Email liên hệ
                        </label>
                        <Input
                            id="contactEmail"
                            type="email"
                            autoComplete="email"
                            value={settings.contactEmail}
                            onChange={(e) => updateSetting("contactEmail", e.target.value)}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                            Số điện thoại
                        </label>
                        <Input
                            id="phone"
                            autoComplete="tel"
                            value={settings.phone}
                            onChange={(e) => updateSetting("phone", e.target.value)}
                            placeholder="+84 xxx xxx xxx"
                        />
                    </div>
                </div>
            </SettingsCard>

            {/* Notification Settings */}
            <SettingsCard
                title="Thông báo"
                description="Quản lý các tùy chọn thông báo của hệ thống."
            >
                <div className="space-y-4">
                    <SettingsRow
                        label="Thông báo qua email"
                        description="Nhận thông báo qua email khi có hoạt động mới."
                    >
                        <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) =>
                                updateSetting("emailNotifications", checked)
                            }
                        />
                    </SettingsRow>
                    <SettingsRow
                        label="Cảnh báo đặt tour"
                        description="Nhận thông báo khi có đặt tour mới hoặc hủy tour."
                    >
                        <Switch
                            checked={settings.bookingAlerts}
                            onCheckedChange={(checked) =>
                                updateSetting("bookingAlerts", checked)
                            }
                        />
                    </SettingsRow>
                    <SettingsRow
                        label="Cảnh báo hệ thống"
                        description="Nhận thông báo về các vấn đề kỹ thuật và cập nhật hệ thống."
                    >
                        <Switch
                            checked={settings.systemAlerts}
                            onCheckedChange={(checked) =>
                                updateSetting("systemAlerts", checked)
                            }
                        />
                    </SettingsRow>
                </div>
            </SettingsCard>

            {/* Security Settings */}
            <SettingsCard
                title="Bảo mật"
                description="Cấu hình các tùy chọn bảo mật cho tài khoản."
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label htmlFor="sessionTimeout" className="text-sm font-medium">
                                Thời gian hết phiên (phút)
                            </label>
                            <p className="text-sm text-muted-foreground">
                                Tự động đăng xuất sau khoảng thời gian không hoạt động.
                            </p>
                        </div>
                        <select
                            id="sessionTimeout"
                            className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={settings.sessionTimeout}
                            onChange={(e) => updateSetting("sessionTimeout", e.target.value)}
                        >
                            <option value="15">15 phút</option>
                            <option value="30">30 phút</option>
                            <option value="60">60 phút</option>
                            <option value="120">2 giờ</option>
                        </select>
                    </div>
                    <SettingsRow
                        label="Xác thực hai yếu tố"
                        description="Thêm lớp bảo mật bổ sung cho tài khoản của bạn."
                    >
                        <Switch
                            checked={settings.twoFactorAuth}
                            onCheckedChange={(checked) =>
                                updateSetting("twoFactorAuth", checked)
                            }
                        />
                    </SettingsRow>
                </div>
            </SettingsCard>

            {/* Appearance Settings */}
            <SettingsCard
                title="Giao diện"
                description="Tùy chỉnh giao diện hiển thị."
            >
                <SettingsRow
                    label="Chế độ tối"
                    description="Sử dụng giao diện tối để giảm mỏi mắt."
                >
                    <Switch
                        checked={settings.darkMode}
                        onCheckedChange={(checked) => updateSetting("darkMode", checked)}
                    />
                </SettingsRow>
            </SettingsCard>

            {/* Warnings & Confirmations Settings */}
            <SettingsCard
                title="Cảnh báo & Xác nhận"
                description="Quản lý các hộp thoại xác nhận trong hệ thống."
            >
                <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">Khôi phục cảnh báo</p>
                        <p className="text-sm text-muted-foreground">
                            Hiển thị lại tất cả các hộp thoại xác nhận đã bị ẩn.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasDismissedConfirmations()}
                        onClick={() => {
                            restoreAllConfirmations();
                            toast.success("Đã khôi phục tất cả cảnh báo!");
                        }}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Khôi phục
                    </Button>
                </div>
            </SettingsCard>
        </div>
    );
}

// Helper Components
function SettingsCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 pb-4">
                <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
            </div>
            <div className="p-6 pt-0">{children}</div>
        </div>
    );
}

function SettingsRow({
    label,
    description,
    children,
}: {
    label: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </div>
    );
}
