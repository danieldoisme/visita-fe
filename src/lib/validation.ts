import { z } from "zod";

// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register form schema
export const registerSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập họ tên"),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Email không hợp lệ"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Profile form schema
export const profileSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Booking form schema
export const bookingSchema = z.object({
  selectedDate: z.date({
    message: "Vui lòng chọn ngày khởi hành",
  }),
  adults: z.number().min(1, "Phải có ít nhất 1 người lớn").max(10),
  children: z.number().min(0).max(10),
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ (10-11 số)"),
  paymentMethod: z.enum(["bank_transfer", "credit_card", "cash"]),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Tour form schema
export const tourSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tên tour"),
  location: z.string().min(1, "Vui lòng nhập địa điểm"),
  price: z
    .number()
    .min(0, "Giá phải lớn hơn hoặc bằng 0"),
  duration: z.string().min(1, "Vui lòng nhập thời lượng"),
  category: z.string().optional(),
  status: z.enum(["Hoạt động", "Nháp", "Đã đóng"]),
  image: z.string().optional(),
  description: z.string().optional(),
});

export type TourFormData = z.infer<typeof tourSchema>;
