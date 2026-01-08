import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Loader2, Mail, Phone, CalendarIcon, MapPin, User, Lock } from "lucide-react";
import type { StaffCreateData } from "@/services/adminStaffService";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const staffCreateSchema = z.object({
    username: z.string().min(1, "Tên đăng nhập là bắt buộc").min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    password: z.string().min(1, "Mật khẩu là bắt buộc").min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    fullName: z.string().min(1, "Họ tên là bắt buộc"),
    email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
    phone: z.string().optional(),
    dob: z.date().nullable().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    address: z.string().optional(),
});

type StaffCreateFormData = z.infer<typeof staffCreateSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

const GENDER_OPTIONS = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "other", label: "Khác" },
] as const;

// ============================================================================
// COMPONENT
// ============================================================================

interface StaffCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: StaffCreateData) => Promise<void>;
}

export function StaffCreateModal({ isOpen, onClose, onSave }: StaffCreateModalProps) {
    const form = useForm<StaffCreateFormData>({
        resolver: zodResolver(staffCreateSchema),
        defaultValues: {
            username: "",
            password: "",
            fullName: "",
            email: "",
            phone: "",
            dob: null,
            gender: undefined,
            address: "",
        },
    });

    const { formState: { isSubmitting } } = form;

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            form.reset({
                username: "",
                password: "",
                fullName: "",
                email: "",
                phone: "",
                dob: null,
                gender: undefined,
                address: "",
            });
        }
    }, [isOpen, form]);

    const onSubmit = async (data: StaffCreateFormData) => {
        await onSave({
            username: data.username,
            password: data.password,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone || undefined,
            dob: data.dob ? format(data.dob, "yyyy-MM-dd") : undefined,
            gender: data.gender,
            address: data.address || undefined,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm nhân viên mới" className="max-w-lg">
            <p className="text-sm text-muted-foreground mb-4">
                Tạo tài khoản nhân viên mới trong hệ thống.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Username & Password Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="create-staff-username" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Tên đăng nhập *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="create-staff-username"
                                            placeholder="staff01"
                                            autoComplete="username"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="create-staff-password" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Mật khẩu *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="create-staff-password"
                                            type="password"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Full Name */}
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="create-staff-fullName">Họ và tên *</FormLabel>
                                <FormControl>
                                    <Input
                                        id="create-staff-fullName"
                                        placeholder="Nguyễn Văn A"
                                        autoComplete="name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="create-staff-email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email *
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        id="create-staff-email"
                                        type="email"
                                        placeholder="staff@visita.com"
                                        autoComplete="email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Phone & Gender Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="create-staff-phone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Số điện thoại
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="create-staff-phone"
                                            type="tel"
                                            placeholder="0912345678"
                                            autoComplete="tel"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="create-staff-gender">Giới tính</FormLabel>
                                    <Select
                                        name="create-staff-gender"
                                        onValueChange={field.onChange}
                                        value={field.value || ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger id="create-staff-gender">
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {GENDER_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* DOB & Address Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="dob"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel htmlFor="create-staff-dob" className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        Ngày sinh
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="create-staff-dob"
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "dd/MM/yyyy", { locale: vi })
                                                ) : (
                                                    <span>dd/mm/yyyy</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value || undefined}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                                captionLayout="dropdown"
                                                fromYear={1940}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="create-staff-address" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Địa chỉ
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="create-staff-address"
                                            placeholder="123 Đường ABC"
                                            autoComplete="street-address"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                "Tạo nhân viên"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
}
