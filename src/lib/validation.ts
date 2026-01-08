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
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Internal login schema (for admin/staff using username)
export const internalLoginSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tài khoản"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export type InternalLoginFormData = z.infer<typeof internalLoginSchema>;

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
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
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
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ (10-11 số)")
    .optional()
    .or(z.literal("")),
  dob: z.date().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  address: z.string().optional().or(z.literal("")),
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
  paymentMethod: z.enum(["momo", "paypal", "cash"]),
  promoCode: z.string().optional(),
  specialRequest: z.string().max(500, "Yêu cầu đặc biệt không quá 500 ký tự").optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Edit Booking form schema (for admin)
export const editBookingSchema = z.object({
  selectedDate: z.date({ message: "Vui lòng chọn ngày khởi hành" }),
  adults: z.number().min(1, "Phải có ít nhất 1 người lớn").max(10),
  children: z.number().min(0).max(10),
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại")
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ (10-11 số)"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  specialRequest: z.string().max(500, "Yêu cầu đặc biệt không quá 500 ký tự").optional(),
});

export type EditBookingFormData = z.infer<typeof editBookingSchema>;

// Tour image schema
export const tourImageSchema = z.object({
  id: z.string(),
  url: z.string().min(1, "URL không được để trống"),
  isPrimary: z.boolean(),
  order: z.number().min(0),
  caption: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
});

export type TourImageFormData = z.infer<typeof tourImageSchema>;

// Tour form schema
export const tourSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tên tour"),
  location: z.string().min(1, "Vui lòng nhập địa điểm"),
  price: z
    .number()
    .min(0, "Giá phải lớn hơn hoặc bằng 0"),
  duration: z.string().min(1, "Vui lòng nhập thời lượng"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  region: z.string().min(1, "Vui lòng chọn miền"),
  capacity: z
    .number()
    .min(1, "Sức chứa phải lớn hơn 0")
    .max(1000, "Sức chứa không quá 1000"),
  images: z.array(tourImageSchema),
  image: z.string().optional(),
  description: z.string().optional(),
  itinerary: z.string().optional(),
  staffId: z.string().min(1, "Vui lòng chọn nhân viên phụ trách"),
});

export type TourFormData = z.infer<typeof tourSchema>;

// Change password form schema
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ (10-11 số)")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(1, "Vui lòng nhập tiêu đề"),
  message: z
    .string()
    .min(1, "Vui lòng nhập nội dung")
    .min(10, "Nội dung phải có ít nhất 10 ký tự"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
