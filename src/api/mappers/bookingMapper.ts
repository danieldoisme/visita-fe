import type { Booking, PaymentMethod, PaymentStatus } from "@/context/BookingContext";
import type {
    BookingDetailResponse,
    BookingRequest,
    StaffBookingRequest,
} from "../generated/types.gen";
import { getTourUuid } from "./tourMapper";
import { hashStringToNumber } from "@/utils/hashUtils";

/**
 * Store original bookingId for API calls (UUID string)
 */
const bookingIdMap = new Map<number, string>();

export const storeBookingIdMapping = (numericId: number, uuid: string): void => {
    bookingIdMap.set(numericId, uuid);
};

export const getBookingUuid = (numericId: number): string | undefined => {
    return bookingIdMap.get(numericId);
};

/**
 * Clear booking ID mappings (call on logout to prevent memory leak)
 */
export const clearBookingIdMap = (): void => {
    bookingIdMap.clear();
};

/**
 * Map backend payment method to frontend
 */
const mapPaymentMethod = (method?: string): PaymentMethod => {
    switch (method?.toUpperCase()) {
        case "MOMO":
            return "momo";
        case "PAYPAL":
            return "paypal";
        case "CASH":
        case "DIRECT":
        default:
            return "cash";
    }
};

/**
 * Map backend payment status to frontend
 */
const mapPaymentStatus = (status?: string): PaymentStatus => {
    switch (status?.toUpperCase()) {
        case "SUCCESS":
            return "success";
        case "FAILED":
            return "failed";
        case "REFUNDED":
            return "refunded";
        case "PENDING":
        default:
            return "pending";
    }
};

/**
 * Map backend booking status to frontend
 */
const mapBookingStatus = (
    status?: string
): "pending" | "confirmed" | "cancelled" | "completed" => {
    switch (status?.toUpperCase()) {
        case "CONFIRMED":
            return "confirmed";
        case "CANCELLED":
            return "cancelled";
        case "COMPLETED":
            return "completed";
        case "PENDING":
        default:
            return "pending";
    }
};

/**
 * Map backend BookingDetailResponse to frontend Booking interface
 */
export const mapBookingDetailToBooking = (response: BookingDetailResponse): Booking => {
    const numericId = hashStringToNumber(response.bookingId || "");
    const numericTourId = hashStringToNumber(response.tourId || "");

    // Store the mapping
    if (response.bookingId) {
        storeBookingIdMapping(numericId, response.bookingId);
    }

    return {
        id: numericId,
        userId: response.userId,
        tourId: numericTourId,
        tourTitle: response.tourTitle || "",
        tourPrice: (response.totalPrice || 0) / Math.max(response.numAdults || 1, 1),
        selectedDate: response.startDate ? new Date(response.startDate) : new Date(),
        adults: response.numAdults || 1,
        children: response.numChildren || 0,
        contactInfo: {
            fullName: response.userName || "",
            email: response.userEmail || "",
            phone: response.userPhone || "",
        },
        paymentMethod: mapPaymentMethod(response.paymentMethod),
        paymentStatus: mapPaymentStatus(response.paymentStatus),
        totalPrice: response.totalPrice || 0,
        specialRequest: response.specialRequest,
        status: mapBookingStatus(response.status),
        createdAt: response.bookingDate ? new Date(response.bookingDate) : new Date(),
    };
};

/**
 * Map array of BookingDetailResponse to Booking array
 */
export const mapBookingDetailsToBookings = (
    responses: BookingDetailResponse[]
): Booking[] => {
    return responses.map(mapBookingDetailToBooking);
};

/**
 * Map frontend payment method to backend
 */
const mapPaymentMethodToApi = (
    method: PaymentMethod
): BookingRequest["paymentMethod"] => {
    switch (method) {
        case "momo":
            return "MOMO";
        case "paypal":
            return "PAYPAL";
        case "cash":
        default:
            return "CASH";
    }
};

/**
 * Map frontend booking form data to backend BookingRequest
 */
export const mapBookingToRequest = (
    booking: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">,
    tourUuid: string
): BookingRequest => {
    return {
        tourId: tourUuid,
        numAdults: booking.adults,
        numChildren: booking.children || 0,
        paymentMethod: mapPaymentMethodToApi(booking.paymentMethod),
        specialRequest: booking.specialRequest,
    };
};

/**
 * Map frontend staff booking to backend StaffBookingRequest
 */
export const mapStaffBookingToRequest = (
    booking: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">,
    tourUuid: string,
    userId: string
): StaffBookingRequest => {
    return {
        userId,
        tourId: tourUuid,
        numAdults: booking.adults,
        numChildren: booking.children || 0,
        specialRequest: booking.specialRequest,
    };
};

/**
 * Get tour UUID for a booking
 * Prioritizes: 1) direct tourUuid, 2) map lookup, 3) fallback to string ID
 */
export const getTourUuidForBooking = (tourId: number, tourUuid?: string): string => {
    if (tourUuid) return tourUuid;
    return getTourUuid(tourId) || String(tourId);
};
