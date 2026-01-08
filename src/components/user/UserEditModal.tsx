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
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Mail, Phone, CalendarIcon, MapPin } from "lucide-react";
import type { User, UserUpdateData } from "@/api/services/adminUserService";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const userEditSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phone: z.string().optional(),
  dob: z.date().nullable().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().optional(),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

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

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (id: string, data: UserUpdateData) => Promise<void>;
}

export function UserEditModal({
  isOpen,
  onClose,
  user,
  onSave,
}: UserEditModalProps) {
  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      dob: null,
      gender: undefined,
      address: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      form.reset({
        fullName: user.fullName || "",
        phone: user.phone || "",
        dob: user.dob ? new Date(user.dob) : null,
        gender: user.gender,
        address: user.address || "",
      });
    }
  }, [isOpen, user, form]);

  const onSubmit = async (data: UserEditFormData) => {
    if (!user) return;

    await onSave(user.id, {
      fullName: data.fullName,
      phone: data.phone || undefined,
      dob: data.dob ? format(data.dob, "yyyy-MM-dd") : undefined,
      gender: data.gender,
      address: data.address || undefined,
    });
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa người dùng"
      className="max-w-md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label
              htmlFor="user-email-readonly"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </label>
            <Input
              id="user-email-readonly"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email không thể thay đổi vì yêu cầu xác thực
            </p>
          </div>

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="edit-user-fullName">Họ và tên</FormLabel>
                <FormControl>
                  <Input
                    id="edit-user-fullName"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="edit-user-phone"
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Số điện thoại
                </FormLabel>
                <FormControl>
                  <Input
                    id="edit-user-phone"
                    type="tel"
                    placeholder="0901234567"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth - Calendar Popover like ProfilePage */}
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel
                  htmlFor="edit-user-dob"
                  className="flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Ngày sinh
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="edit-user-dob"
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
                        <span>Chọn ngày sinh</span>
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

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="edit-user-gender">Giới tính</FormLabel>
                <Select
                  name="gender"
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger id="edit-user-gender">
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

          {/* Address - Textarea for better appearance */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="edit-user-address"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Địa chỉ
                </FormLabel>
                <FormControl>
                  <Textarea
                    id="edit-user-address"
                    placeholder="Nhập địa chỉ..."
                    rows={2}
                    autoComplete="street-address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
