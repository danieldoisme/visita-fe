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

// Mock data for testing
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    tourId: 1,
    tourTitle: "Khám phá Vịnh Hạ Long 3 ngày 2 đêm",
    tourPrice: 4500000,
    selectedDate: new Date("2025-01-15"),
    adults: 2,
    children: 1,
    contactInfo: {
      fullName: "Nguyễn Văn An",
      email: "nguyenvanan@gmail.com",
      phone: "0901234567",
    },
    paymentMethod: "momo",
    paymentStatus: "success",
    totalPrice: 11250000,
    status: "confirmed",
    createdAt: new Date("2024-12-20"),
  },
  {
    id: 2,
    tourId: 2,
    tourTitle: "Tour Đà Nẵng - Hội An 4 ngày 3 đêm",
    tourPrice: 5200000,
    selectedDate: new Date("2025-01-20"),
    adults: 4,
    children: 0,
    contactInfo: {
      fullName: "Trần Thị Bình",
      email: "tranthib@gmail.com",
      phone: "0912345678",
    },
    paymentMethod: "paypal",
    paymentStatus: "pending",
    totalPrice: 20800000,
    specialRequest: "Cần phòng view biển",
    status: "pending",
    createdAt: new Date("2024-12-25"),
  },
  {
    id: 3,
    tourId: 3,
    tourTitle: "Phú Quốc nghỉ dưỡng 5 ngày 4 đêm",
    tourPrice: 7800000,
    selectedDate: new Date("2025-02-01"),
    adults: 2,
    children: 2,
    contactInfo: {
      fullName: "Lê Hoàng Cường",
      email: "lehoangcuong@gmail.com",
      phone: "0923456789",
    },
    paymentMethod: "momo",
    paymentStatus: "success",
    totalPrice: 23400000,
    status: "confirmed",
    createdAt: new Date("2024-12-22"),
  },
  {
    id: 4,
    tourId: 4,
    tourTitle: "Sapa trekking 3 ngày 2 đêm",
    tourPrice: 3200000,
    selectedDate: new Date("2024-12-28"),
    adults: 1,
    children: 0,
    contactInfo: {
      fullName: "Phạm Minh Đức",
      email: "phamminhduc@gmail.com",
      phone: "0934567890",
    },
    paymentMethod: "cash",
    paymentStatus: "success",
    totalPrice: 3200000,
    status: "completed",
    createdAt: new Date("2024-12-15"),
  },
  {
    id: 5,
    tourId: 5,
    tourTitle: "Đà Lạt mộng mơ 3 ngày 2 đêm",
    tourPrice: 2800000,
    selectedDate: new Date("2025-01-10"),
    adults: 3,
    children: 1,
    contactInfo: {
      fullName: "Hoàng Thị Em",
      email: "hoangthiem@gmail.com",
      phone: "0945678901",
    },
    paymentMethod: "paypal",
    paymentStatus: "refunded",
    totalPrice: 9800000,
    status: "cancelled",
    createdAt: new Date("2024-12-18"),
  },
  {
    id: 6,
    tourId: 1,
    tourTitle: "Khám phá Vịnh Hạ Long 3 ngày 2 đêm",
    tourPrice: 4500000,
    selectedDate: new Date("2025-02-14"),
    adults: 2,
    children: 0,
    contactInfo: {
      fullName: "Võ Văn Phong",
      email: "vovanphong@gmail.com",
      phone: "0956789012",
    },
    paymentMethod: "cash",
    paymentStatus: "pending",
    totalPrice: 9000000,
    status: "pending",
    createdAt: new Date("2024-12-27"),
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
