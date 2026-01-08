import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactFormSchema, ContactFormData } from "@/lib/validation";
import { useContact, ContactType } from "@/context/ContactContext";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, Send, Loader2 } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ContactType;
  bookingId?: number;
  tourTitle?: string;
}

export function ContactModal({
  isOpen,
  onClose,
  type,
  bookingId,
  tourTitle,
}: ContactModalProps) {
  const { submitContactRequest } = useContact();
  const { user } = useAuth();

  // Get title and default subject based on type
  const getModalConfig = () => {
    switch (type) {
      case "change-request":
        return {
          title: "Yêu cầu thay đổi đặt chỗ",
          defaultSubject: bookingId
            ? `Yêu cầu thay đổi - Mã #${bookingId.toString().padStart(6, "0")}${
                tourTitle ? ` - ${tourTitle}` : ""
              }`
            : "Yêu cầu thay đổi đặt chỗ",
        };
      case "consultation":
        return {
          title: "Liên hệ tư vấn",
          defaultSubject: tourTitle
            ? `Tư vấn về ${tourTitle}`
            : "Yêu cầu tư vấn tour",
        };
      default:
        return {
          title: "Liên hệ với chúng tôi",
          defaultSubject: "",
        };
    }
  };

  const config = getModalConfig();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      subject: config.defaultSubject,
      message: "",
    },
  });

  // Reset form when modal opens/closes or type changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        subject: config.defaultSubject,
        message: "",
      });
    }
  }, [isOpen, type, bookingId, tourTitle, user, form, config.defaultSubject]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitContactRequest({
        ...data,
        type,
        bookingId,
        tourTitle,
      });

      toast.success(
        "Đã gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất."
      );
      onClose();
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
      <div className="p-1">
        {/* Header info */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-primary/5 rounded-lg">
          <Mail className="w-5 h-5 text-primary" />
          <p className="text-sm text-slate-600">
            Vui lòng điền thông tin bên dưới. Chúng tôi sẽ phản hồi trong vòng
            24 giờ.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập họ và tên"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Nhập email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject field */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message field */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        type === "change-request"
                          ? "Mô tả chi tiết thay đổi bạn muốn yêu cầu (ví dụ: đổi ngày, số lượng người, ...)"
                          : "Nhập nội dung tin nhắn"
                      }
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi yêu cầu
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}
