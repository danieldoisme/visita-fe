import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
}

export type PaymentMethod = "momo" | "paypal" | "cash";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export interface Booking {
  id: number;
  userId?: string;        // Set when user is logged in
  guestEmail?: string;    // For guest bookings, used to claim later
  staffId?: string;       // Set when booking is created by staff
  tourId: number;
  tourTitle: string;
  tourPrice: number;
  selectedDate: Date;
  adults: number;
  children: number;
  contactInfo: ContactInfo;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  specialRequest?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: Date;
}

interface BookingContextType {
  bookings: Booking[];
  addBooking: (
    booking: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">
  ) => Promise<Booking>;
  addStaffBooking: (
    booking: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">,
    staffId: string
  ) => Promise<Booking>;
  getBookings: () => Booking[];
  getUserBookings: (userId: string) => Booking[];
  claimGuestBookings: (email: string, userId: string) => void;
  cancelBooking: (id: number) => Promise<void>;
  confirmBooking: (id: number) => Promise<void>;
  completeBooking: (id: number) => Promise<void>;
  updateBooking: (id: number, data: Partial<Booking>) => Promise<void>;
  updatePaymentStatus: (id: number, status: PaymentStatus) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKING_STORAGE_KEY = "visita_bookings";

// Mock data for user-001 (Nguyễn Văn A) - 12 bookings covering all statuses
const MOCK_BOOKINGS: Booking[] = [
  // ========== COMPLETED BOOKINGS (4) ==========
  {
    id: 1,
    userId: "user-001",
    tourId: 1,
    tourTitle: "Khám phá Vịnh Hạ Long & Hang Sửng Sốt",
    tourPrice: 3500000,
    selectedDate: new Date("2024-10-15"),
    adults: 2,
    children: 0,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "momo",
    paymentStatus: "success",
    totalPrice: 7000000,
    status: "completed",
    createdAt: new Date("2024-10-01"),
  },
  {
    id: 2,
    userId: "user-001",
    tourId: 2,
    tourTitle: "Văn hóa Cố đô Huế & Thưởng thức Nhã nhạc",
    tourPrice: 2500000,
    selectedDate: new Date("2024-11-05"),
    adults: 3,
    children: 1,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "paypal",
    paymentStatus: "success",
    totalPrice: 8750000,
    specialRequest: "Cần hướng dẫn viên nói tiếng Anh",
    status: "completed",
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 3,
    userId: "user-001",
    tourId: 4,
    tourTitle: "Đà Lạt Mộng Mơ",
    tourPrice: 2500000,
    selectedDate: new Date("2024-11-20"),
    adults: 2,
    children: 2,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "momo",
    paymentStatus: "success",
    totalPrice: 8000000,
    status: "completed",
    createdAt: new Date("2024-11-05"),
  },
  {
    id: 4,
    userId: "user-001",
    tourId: 5,
    tourTitle: "Khám phá Đảo Cát Bà & Vịnh Lan Hạ",
    tourPrice: 2800000,
    selectedDate: new Date("2024-12-01"),
    adults: 4,
    children: 0,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "cash",
    paymentStatus: "success",
    totalPrice: 11200000,
    status: "completed",
    createdAt: new Date("2024-11-15"),
  },
  {
    id: 13,
    userId: "user-001",
    tourId: 7,
    tourTitle: "Phố cổ Hội An & Làng rau Trà Quế",
    tourPrice: 1800000,
    selectedDate: new Date("2024-12-10"),
    adults: 2,
    children: 1,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "momo",
    paymentStatus: "success",
    totalPrice: 4500000,
    specialRequest: "Muốn tham gia làm đèn lồng",
    status: "completed",
    createdAt: new Date("2024-11-25"),
  },
  // ========== CONFIRMED BOOKINGS (3) ==========
  {
    id: 5,
    userId: "user-001",
    tourId: 1,
    tourTitle: "Khám phá Vịnh Hạ Long & Hang Sửng Sốt",
    tourPrice: 3500000,
    selectedDate: new Date("2026-01-20"),
    adults: 2,
    children: 1,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "momo",
    paymentStatus: "success",
    totalPrice: 8750000,
    status: "confirmed",
    createdAt: new Date("2025-12-28"),
  },
  {
    id: 6,
    userId: "user-001",
    tourId: 3,
    tourTitle: "Khám phá Hang Sơn Đoòng",
    tourPrice: 65000000,
    selectedDate: new Date("2026-02-20"),
    adults: 1,
    children: 0,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "paypal",
    paymentStatus: "success",
    totalPrice: 65000000,
    specialRequest: "Cần thiết bị leo núi chuyên nghiệp",
    status: "confirmed",
    createdAt: new Date("2025-12-15"),
  },
  {
    id: 7,
    userId: "user-001",
    tourId: 2,
    tourTitle: "Văn hóa Cố đô Huế & Thưởng thức Nhã nhạc",
    tourPrice: 2500000,
    selectedDate: new Date("2026-01-25"),
    adults: 2,
    children: 0,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "momo",
    paymentStatus: "success",
    totalPrice: 5000000,
    status: "confirmed",
    createdAt: new Date("2025-12-20"),
  },
  // ========== PENDING BOOKINGS (3) ==========
  {
    id: 8,
    userId: "user-001",
    tourId: 4,
    tourTitle: "Đà Lạt Mộng Mơ",
    tourPrice: 2500000,
    selectedDate: new Date("2026-02-14"),
    adults: 2,
    children: 0,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "cash",
    paymentStatus: "pending",
    totalPrice: 5000000,
    specialRequest: "Kỷ niệm ngày Valentine",
    status: "pending",
    createdAt: new Date("2026-01-02"),
  },
  {
    id: 9,
    userId: "user-001",
    tourId: 5,
    tourTitle: "Khám phá Đảo Cát Bà & Vịnh Lan Hạ",
    tourPrice: 2800000,
    selectedDate: new Date("2026-03-01"),
    adults: 3,
    children: 2,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "momo",
    paymentStatus: "success",
    totalPrice: 11200000,
    status: "pending",
    createdAt: new Date("2026-01-03"),
  },
  {
    id: 10,
    userId: "user-001",
    tourId: 6,
    tourTitle: "Nha Trang - Thiên đường biển",
    tourPrice: 3200000,
    selectedDate: new Date("2026-03-15"),
    adults: 4,
    children: 1,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "paypal",
    paymentStatus: "success",
    totalPrice: 14400000,
    status: "pending",
    createdAt: new Date("2026-01-01"),
  },
  // ========== CANCELLED BOOKINGS (2) ==========
  {
    id: 11,
    userId: "user-001",
    tourId: 3,
    tourTitle: "Khám phá Hang Sơn Đoòng",
    tourPrice: 65000000,
    selectedDate: new Date("2024-09-15"),
    adults: 2,
    children: 0,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "paypal",
    paymentStatus: "refunded",
    totalPrice: 130000000,
    specialRequest: "Hủy do lịch trình thay đổi",
    status: "cancelled",
    createdAt: new Date("2024-08-01"),
  },
  {
    id: 12,
    userId: "user-001",
    tourId: 1,
    tourTitle: "Khám phá Vịnh Hạ Long & Hang Sửng Sốt",
    tourPrice: 3500000,
    selectedDate: new Date("2024-12-25"),
    adults: 5,
    children: 2,
    contactInfo: {
      fullName: "Nguyễn Văn A",
      email: "user@visita.com",
      phone: "0901234567",
    },
    paymentMethod: "momo",
    paymentStatus: "refunded",
    totalPrice: 21000000,
    status: "cancelled",
    createdAt: new Date("2024-12-10"),
  },
];

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings from localStorage on mount, or use mock data
  useEffect(() => {
    const storedBookings = localStorage.getItem(BOOKING_STORAGE_KEY);
    if (storedBookings) {
      try {
        const parsed = JSON.parse(storedBookings);
        // Convert date strings back to Date objects
        const bookingsWithDates = parsed.map((b: Booking) => ({
          ...b,
          selectedDate: new Date(b.selectedDate),
          createdAt: new Date(b.createdAt),
        }));
        setBookings(bookingsWithDates);
      } catch {
        localStorage.removeItem(BOOKING_STORAGE_KEY);
        setBookings(MOCK_BOOKINGS);
      }
    } else {
      // No stored bookings, use mock data
      setBookings(MOCK_BOOKINGS);
    }
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
    }
  }, [bookings]);

  const addBooking = async (
    bookingData: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">
  ): Promise<Booking> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Determine initial payment status based on payment method
    // MoMo/PayPal: Assume gateway handshake succeeded (handled in UI before calling this)
    // Cash: Payment pending until received at tour
    const paymentStatus: PaymentStatus =
      bookingData.paymentMethod === "momo" || bookingData.paymentMethod === "paypal"
        ? "success"
        : "pending";

    const newBooking: Booking = {
      ...bookingData,
      id: Math.max(...bookings.map((b) => b.id), 0) + 1,
      paymentStatus,
      status: "pending",
      createdAt: new Date(),
    };

    setBookings((prev) => [...prev, newBooking]);
    return newBooking;
  };

  // Staff booking - automatically confirmed (paid upfront at office)
  const addStaffBooking = async (
    bookingData: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">,
    staffId: string
  ): Promise<Booking> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newBooking: Booking = {
      ...bookingData,
      id: Math.max(...bookings.map((b) => b.id), 0) + 1,
      staffId,
      paymentStatus: "success", // Staff bookings are paid upfront
      status: "confirmed", // Auto-confirmed for staff bookings
      createdAt: new Date(),
    };

    setBookings((prev) => [...prev, newBooking]);
    return newBooking;
  };

  const getBookings = () => {
    return bookings;
  };

  // Get bookings for a specific user
  const getUserBookings = (userId: string): Booking[] => {
    return bookings.filter((b) => b.userId === userId);
  };

  // Claim guest bookings when user registers with same email
  const claimGuestBookings = (email: string, userId: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.guestEmail?.toLowerCase() === email.toLowerCase() && !booking.userId
          ? { ...booking, userId, guestEmail: undefined }
          : booking
      )
    );
  };

  const cancelBooking = async (id: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" as const } : booking
      )
    );
  };

  const confirmBooking = async (id: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: "confirmed" as const } : booking
      )
    );
  };

  const completeBooking = async (id: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: "completed" as const } : booking
      )
    );
  };

  const updateBooking = async (id: number, data: Partial<Booking>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, ...data } : booking
      )
    );
  };

  const updatePaymentStatus = async (id: number, status: PaymentStatus) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, paymentStatus: status } : booking
      )
    );
  };

  return (
    <BookingContext.Provider
      value={{ bookings, addBooking, addStaffBooking, getBookings, getUserBookings, claimGuestBookings, cancelBooking, confirmBooking, completeBooking, updateBooking, updatePaymentStatus }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
