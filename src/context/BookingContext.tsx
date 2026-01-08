import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
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
  bookingUuid?: string; // Original booking UUID for API calls
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
  promoCode?: string;
}

interface BookingContextType {
  bookings: Booking[];
  activeBookings: Booking[];
  historyBookings: Booking[];
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
  loadHistoryBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  // Load active bookings (PENDING, CONFIRMED, CANCELLED - not COMPLETED)
  const loadActiveBookings = useCallback(async () => {
    if (!user) {
      setActiveBookings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isAdmin) {
        // Only Admin can fetch all bookings via /admins/bookings
        // Staff should use /staffs/{id}/bookings for their assigned bookings (handled by individual pages)
        const result = await fetchAllBookingsAdmin({ page: 0, size: 100 });
        setActiveBookings(result.content);
      } else {
        // Regular user and Staff: fetch only their active bookings
        const result = await fetchActiveBookings({ page: 0, size: 100 });
        setActiveBookings(result.content);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Không thể tải danh sách đặt tour";
      setError(message);
      console.error("Error loading active bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Load history bookings (COMPLETED only - for reviews)
  const loadHistoryBookings = useCallback(async () => {
    if (!user || isAdmin) {
      // Admin already has all bookings in activeBookings
      // Staff and regular users may need their history
      return;
    }

    try {
      const result = await fetchBookingHistory({ page: 0, size: 100 });
      setHistoryBookings(result.content);
    } catch (err) {
      console.error("Error loading booking history:", err);
    }
  }, [user, isAdmin]);

  // Combined bookings for backward compatibility
  const bookings = useMemo(() => {
    if (isAdmin) {
      return activeBookings;
    }
    return [...activeBookings, ...historyBookings];
  }, [activeBookings, historyBookings, isAdmin]);

  // Auto-fetch active bookings when auth state changes
  useEffect(() => {
    loadActiveBookings();
  }, [loadActiveBookings]);

  const addBooking = async (
    bookingData: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">
  ): Promise<{ paymentUrl?: string; message?: string }> => {
    try {
      const result = await createBookingApi(bookingData);
      // Refresh bookings to get the newly created one
      await loadActiveBookings();
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
      await loadActiveBookings();
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
      setActiveBookings((prev: Booking[]) =>
        prev.map((booking: Booking) =>
          booking.id === id
            ? { ...booking, status: "cancelled" as const }
            : booking
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
      setActiveBookings((prev: Booking[]) =>
        prev.map((booking: Booking) =>
          booking.id === id
            ? { ...booking, status: "confirmed" as const }
            : booking
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
      setActiveBookings((prev: Booking[]) =>
        prev.map((booking: Booking) =>
          booking.id === id
            ? { ...booking, status: "completed" as const }
            : booking
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
      setActiveBookings((prev: Booking[]) =>
        prev.map((booking: Booking) => (booking.id === id ? updatedBooking : booking))
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
      setActiveBookings((prev: Booking[]) =>
        prev.map((booking: Booking) =>
          booking.id === id ? { ...booking, paymentStatus: status } : booking
        )
      );
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Không thể cập nhật trạng thái thanh toán";
      setError(message);
      throw err;
    }
  };

  const refreshBookings = async () => {
    await loadActiveBookings();
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        activeBookings,
        historyBookings,
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
        loadHistoryBookings,
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
