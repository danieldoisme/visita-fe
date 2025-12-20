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

export type PaymentMethod = "bank_transfer" | "credit_card" | "momo" | "paypal" | "cash";

export interface Booking {
  id: number;
  tourId: number;
  tourTitle: string;
  tourPrice: number;
  selectedDate: Date;
  adults: number;
  children: number;
  contactInfo: ContactInfo;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
}

interface BookingContextType {
  bookings: Booking[];
  addBooking: (
    booking: Omit<Booking, "id" | "status" | "createdAt">
  ) => Promise<Booking>;
  getBookings: () => Booking[];
  cancelBooking: (id: number) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKING_STORAGE_KEY = "visita_bookings";

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings from localStorage on mount
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
      }
    }
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
    }
  }, [bookings]);

  const addBooking = async (
    bookingData: Omit<Booking, "id" | "status" | "createdAt">
  ): Promise<Booking> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newBooking: Booking = {
      ...bookingData,
      id: Math.max(...bookings.map((b) => b.id), 0) + 1,
      status: "confirmed",
      createdAt: new Date(),
    };

    setBookings((prev) => [...prev, newBooking]);
    return newBooking;
  };

  const getBookings = () => {
    return bookings;
  };

  const cancelBooking = async (id: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" as const } : booking
      )
    );
  };

  return (
    <BookingContext.Provider
      value={{ bookings, addBooking, getBookings, cancelBooking }}
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
