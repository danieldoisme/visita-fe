import apiClient, { ApiError, type ApiResponse } from "./apiClient";
import type {
    BookingResponse,
    BookingDetailResponse,
    BookingUpdateRequest,
} from "./generated/types.gen";
import type { Booking } from "@/context/BookingContext";
import {
    mapBookingDetailToBooking,
    mapBookingDetailsToBookings,
    mapBookingToRequest,
    mapStaffBookingToRequest,
    getBookingUuid,
    getTourUuidForBooking,
} from "./mappers/bookingMapper";

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number;
    size?: number;
}

/**
 * Page data structure from backend (generic)
 */
interface PageData<T> {
    totalElements?: number;
    totalPages?: number;
    first?: boolean;
    last?: boolean;
    size?: number;
    content?: T[];
    number?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResult<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    isFirst: boolean;
    isLast: boolean;
}

/**
 * Booking creation response
 */
export interface CreateBookingResult {
    booking: Booking | null;
    paymentUrl?: string;
    message?: string;
}

/**
 * Create a booking (user endpoint)
 * POST /bookings
 */
export const createBookingApi = async (
    bookingData: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">
): Promise<CreateBookingResult> => {
    const tourUuid = getTourUuidForBooking(bookingData.tourId, bookingData.tourUuid);
    const request = mapBookingToRequest(bookingData, tourUuid);

    const response = await apiClient.post<ApiResponse<BookingResponse>>("/bookings", request);

    if (!response.data.result) {
        throw new ApiError(9999, "Không thể tạo đặt tour");
    }

    const result = response.data.result;

    return {
        booking: null,
        paymentUrl: result.paymentUrl,
        message: result.message,
    };
};

/**
 * Create a staff booking (staff endpoint)
 * POST /staffs/booking
 */
export const createStaffBookingApi = async (
    bookingData: Omit<Booking, "id" | "status" | "createdAt" | "paymentStatus">,
    userId: string
): Promise<CreateBookingResult> => {
    const tourUuid = getTourUuidForBooking(bookingData.tourId, bookingData.tourUuid);
    const request = mapStaffBookingToRequest(bookingData, tourUuid, userId);

    const response = await apiClient.post<ApiResponse<BookingResponse>>(
        "/staffs/booking",
        request
    );

    if (!response.data.result) {
        throw new ApiError(9999, "Không thể tạo đặt tour");
    }

    const result = response.data.result;

    return {
        booking: null,
        paymentUrl: result.paymentUrl,
        message: result.message,
    };
};

/**
 * Fetch active bookings for current user
 * GET /bookings/active
 */
export const fetchActiveBookings = async (
    params?: PaginationParams
): Promise<PaginatedResult<Booking>> => {
    const response = await apiClient.get<ApiResponse<PageData<BookingDetailResponse>>>(
        "/bookings/active",
        {
            params: {
                page: (params?.page ?? 0) + 1,
                size: params?.size ?? 20,
            },
        }
    );

    const pageData = response.data.result;
    const bookings = mapBookingDetailsToBookings(pageData?.content || []);

    return {
        content: bookings,
        totalElements: pageData?.totalElements || 0,
        totalPages: pageData?.totalPages || 0,
        currentPage: pageData?.number || 0,
        pageSize: pageData?.size || 20,
        isFirst: pageData?.first ?? true,
        isLast: pageData?.last ?? true,
    };
};

/**
 * Fetch booking history for current user
 * GET /bookings/history
 */
export const fetchBookingHistory = async (
    params?: PaginationParams
): Promise<PaginatedResult<Booking>> => {
    const response = await apiClient.get<ApiResponse<PageData<BookingDetailResponse>>>(
        "/bookings/history",
        {
            params: {
                page: (params?.page ?? 0) + 1,
                size: params?.size ?? 20,
            },
        }
    );

    const pageData = response.data.result;
    const bookings = mapBookingDetailsToBookings(pageData?.content || []);

    return {
        content: bookings,
        totalElements: pageData?.totalElements || 0,
        totalPages: pageData?.totalPages || 0,
        currentPage: pageData?.number || 0,
        pageSize: pageData?.size || 20,
        isFirst: pageData?.first ?? true,
        isLast: pageData?.last ?? true,
    };
};

/**
 * Fetch all bookings (admin endpoint)
 * GET /admins/bookings
 */
export const fetchAllBookingsAdmin = async (
    params?: PaginationParams
): Promise<PaginatedResult<Booking>> => {
    const response = await apiClient.get<ApiResponse<PageData<BookingDetailResponse>>>(
        "/admins/bookings",
        {
            params: {
                page: (params?.page ?? 0) + 1,
                size: params?.size ?? 20,
            },
        }
    );

    const pageData = response.data.result;
    const bookings = mapBookingDetailsToBookings(pageData?.content || []);

    return {
        content: bookings,
        totalElements: pageData?.totalElements || 0,
        totalPages: pageData?.totalPages || 0,
        currentPage: pageData?.number || 0,
        pageSize: pageData?.size || 20,
        isFirst: pageData?.first ?? true,
        isLast: pageData?.last ?? true,
    };
};

/**
 * Get booking by ID (admin endpoint)
 * GET /admins/bookings/{id}
 */
export const fetchBookingById = async (id: number): Promise<Booking | undefined> => {
    const uuid = getBookingUuid(id);
    if (!uuid) {
        throw new ApiError(1021, "Booking không tồn tại");
    }

    const response = await apiClient.get<ApiResponse<BookingDetailResponse>>(
        `/admins/bookings/${uuid}`
    );

    if (response.data.result) {
        return mapBookingDetailToBooking(response.data.result);
    }
    return undefined;
};

/**
 * Update booking (admin endpoint)
 * PUT /admins/bookings/{id}
 */
export const updateBookingApi = async (
    id: number,
    data: Partial<Booking>
): Promise<Booking> => {
    const uuid = getBookingUuid(id);
    if (!uuid) {
        throw new ApiError(1021, "Booking không tồn tại");
    }

    const request: BookingUpdateRequest = {
        specialRequest: data.specialRequest,
        numAdults: data.adults,
        numChildren: data.children,
        status: data.status?.toUpperCase(),
    };

    const response = await apiClient.put<ApiResponse<BookingDetailResponse>>(
        `/admins/bookings/${uuid}`,
        request
    );

    if (!response.data.result) {
        throw new ApiError(9999, "Không thể cập nhật booking");
    }

    return mapBookingDetailToBooking(response.data.result);
};

/**
 * Update booking status (admin endpoint)
 * PATCH /admins/bookings/{id}/status
 */
export const updateBookingStatusApi = async (
    id: number,
    status: "pending" | "confirmed" | "cancelled" | "completed"
): Promise<void> => {
    const uuid = getBookingUuid(id);
    if (!uuid) {
        throw new ApiError(1021, "Booking không tồn tại");
    }

    await apiClient.patch(`/admins/bookings/${uuid}/status`, null, {
        params: { status: status.toUpperCase() },
    });
};

/**
 * Search bookings by keyword (admin endpoint)
 * GET /admins/bookings/search
 * Note: Backend uses 1-based pagination
 */
export const searchBookingsApi = async (
    keyword: string,
    params?: PaginationParams
): Promise<PaginatedResult<Booking>> => {
    const response = await apiClient.get<ApiResponse<PageData<BookingDetailResponse>>>(
        "/admins/bookings/search",
        {
            params: {
                keyword,
                page: (params?.page ?? 0) + 1, // Backend uses 1-based pagination
                size: params?.size ?? 20,
            },
        }
    );

    const pageData = response.data.result;
    const bookings = mapBookingDetailsToBookings(pageData?.content || []);

    return {
        content: bookings,
        totalElements: pageData?.totalElements || 0,
        totalPages: pageData?.totalPages || 0,
        currentPage: pageData?.number || 0,
        pageSize: pageData?.size || 20,
        isFirst: pageData?.first ?? true,
        isLast: pageData?.last ?? true,
    };
};
