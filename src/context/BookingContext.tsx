import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  createBookingApi,
  createStaffBookingApi,
  fetchActiveBookings,
  fetchBookingHistory,
  fetchAllBookingsAdmin,
  updateBookingApi,
  updateBookingStatusApi,
} from "@/api/bookingService";
import { ApiError } from "@/api/apiClient";

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
}

export type PaymentMethod = "momo" | "paypal" | "cash";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export interface Booking {
  id: number;
  userId?: string;
  staffId?: string;
  tourId: number;
  tourUuid?: string; // Original tour UUID for API calls
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
  loading: boolean;
  error: string | null;
  addBooking: (
    booking: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">
  ) => Promise<{ paymentUrl?: string; message?: string }>;
  addStaffBooking: (
    booking: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">,
    userId: string
  ) => Promise<{ paymentUrl?: string; message?: string }>;
  getBookings: () => Booking[];
  getUserBookings: (userId: string) => Booking[];
  cancelBooking: (id: number) => Promise<void>;
  confirmBooking: (id: number) => Promise<void>;
  completeBooking: (id: number) => Promise<void>;
  updateBooking: (id: number, data: Partial<Booking>) => Promise<void>;
  updatePaymentStatus: (id: number, status: PaymentStatus) => Promise<void>;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, isStaff } = useAuth();

  // Load bookings from API
  const loadBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let allBookings: Booking[] = [];

      if (isAdmin || isStaff) {
        // Admin/Staff: fetch all bookings
        const result = await fetchAllBookingsAdmin({ page: 0, size: 100 });
        allBookings = result.content;
      } else {
        // Regular user: fetch active + history
        const [activeResult, historyResult] = await Promise.all([
          fetchActiveBookings({ page: 0, size: 100 }),
          fetchBookingHistory({ page: 0, size: 100 }),
        ]);
        allBookings = [...activeResult.content, ...historyResult.content];
      }

      setBookings(allBookings);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể tải danh sách đặt tour";
      setError(message);
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, isStaff]);

  // Auto-fetch bookings when auth state changes
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const addBooking = async (
    bookingData: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">
  ): Promise<{ paymentUrl?: string; message?: string }> => {
    try {
      const result = await createBookingApi(bookingData);
      // Refresh bookings to get the newly created one
      await loadBookings();
      return { paymentUrl: result.paymentUrl, message: result.message };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể tạo đặt tour";
      setError(message);
      throw err;
    }
  };

  const addStaffBooking = async (
    bookingData: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">,
    userId: string
  ): Promise<{ paymentUrl?: string; message?: string }> => {
    try {
      const result = await createStaffBookingApi(bookingData, userId);
      await loadBookings();
      return { paymentUrl: result.paymentUrl, message: result.message };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể tạo đặt tour";
      setError(message);
      throw err;
    }
  };

  const getBookings = () => {
    return bookings;
  };

  const getUserBookings = (userId: string): Booking[] => {
    return bookings.filter((b) => b.userId === userId);
  };

  const cancelBooking = async (id: number) => {
    try {
      await updateBookingStatusApi(id, "cancelled");
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: "cancelled" as const } : booking
        )
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể hủy đặt tour";
      setError(message);
      throw err;
    }
  };

  const confirmBooking = async (id: number) => {
    try {
      await updateBookingStatusApi(id, "confirmed");
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: "confirmed" as const } : booking
        )
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể xác nhận đặt tour";
      setError(message);
      throw err;
    }
  };

  const completeBooking = async (id: number) => {
    try {
      await updateBookingStatusApi(id, "completed");
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: "completed" as const } : booking
        )
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể hoàn thành đặt tour";
      setError(message);
      throw err;
    }
  };

  const updateBooking = async (id: number, data: Partial<Booking>) => {
    try {
      const updatedBooking = await updateBookingApi(id, data);
      setBookings((prev) =>
        prev.map((booking) => (booking.id === id ? updatedBooking : booking))
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể cập nhật đặt tour";
      setError(message);
      throw err;
    }
  };

  const updatePaymentStatus = async (id: number, status: PaymentStatus) => {
    try {
      await updateBookingApi(id, { paymentStatus: status } as Partial<Booking>);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, paymentStatus: status } : booking
        )
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể cập nhật trạng thái thanh toán";
      setError(message);
      throw err;
    }
  };

  const refreshBookings = async () => {
    await loadBookings();
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        addBooking,
        addStaffBooking,
        getBookings,
        getUserBookings,
        cancelBooking,
        confirmBooking,
        completeBooking,
        updateBooking,
        updatePaymentStatus,
        refreshBookings,
      }}
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
