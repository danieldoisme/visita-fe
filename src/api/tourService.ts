import apiClient, { ApiError, type ApiResponse } from "./apiClient";
import type { PageTourEntity, TourResponse, TourEntity } from "./generated/types.gen";
import type { Tour } from "@/context/TourContext";
import {
    mapTourResponseToTour,
    mapTourEntitiesToTours,
    mapTourToTourRequest,
    getTourUuid,
    storeTourIdMapping,
} from "./mappers/tourMapper";

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number;
    size?: number;
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
 * Fetch all active tours (public endpoint)
 * Returns PageTourEntity wrapped in ApiResponse
 */
export const fetchAllTours = async (
    params?: PaginationParams
): Promise<PaginatedResult<Tour>> => {
    const response = await apiClient.get<ApiResponse<PageTourEntity>>("/tours", {
        params: {
            page: (params?.page ?? 0) + 1, // Backend uses 1-based pagination
            size: params?.size ?? 20,
        },
    });

    const pageData = response.data.result;
    const tours = mapTourEntitiesToTours(pageData?.content || []);

    return {
        content: tours,
        totalElements: pageData?.totalElements || 0,
        totalPages: pageData?.totalPages || 0,
        currentPage: pageData?.number || 0,
        pageSize: pageData?.size || 20,
        isFirst: pageData?.first ?? true,
        isLast: pageData?.last ?? true,
    };
};

/**
 * Fetch a single tour by ID (public endpoint)
 */
export const fetchTourById = async (id: number): Promise<Tour | undefined> => {
    const uuid = getTourUuid(id) || String(id);

    try {
        const response = await apiClient.get<ApiResponse<TourResponse>>(`/tours/${uuid}`);

        if (response.data.result) {
            const tour = mapTourResponseToTour(response.data.result);
            if (response.data.result.tourId) {
                storeTourIdMapping(tour.id, response.data.result.tourId);
            }
            return tour;
        }
        return undefined;
    } catch (error) {
        if (error instanceof ApiError && error.code === 1021) {
            return undefined;
        }
        throw error;
    }
};

/**
 * Fetch all tours including inactive (admin endpoint)
 */
export const fetchAllToursAdmin = async (
    params?: PaginationParams
): Promise<PaginatedResult<Tour>> => {
    const response = await apiClient.get<ApiResponse<PageTourEntity>>("/admins/tours", {
        params: {
            page: (params?.page ?? 0) + 1, // Backend uses 1-based pagination
            size: params?.size ?? 20,
        },
    });

    const pageData = response.data.result;
    const tours = mapTourEntitiesToTours(pageData?.content || []);

    return {
        content: tours,
        totalElements: pageData?.totalElements || 0,
        totalPages: pageData?.totalPages || 0,
        currentPage: pageData?.number || 0,
        pageSize: pageData?.size || 20,
        isFirst: pageData?.first ?? true,
        isLast: pageData?.last ?? true,
    };
};

/**
 * Create a new tour (admin endpoint)
 */
export const createTourApi = async (
    tourData: Omit<Tour, "id" | "rating" | "reviews">,
    staffId: string
): Promise<Tour> => {
    const request = mapTourToTourRequest(tourData, staffId);

    const response = await apiClient.post<ApiResponse<TourEntity>>("/admins/tours", request);

    if (!response.data.result) {
        throw new ApiError(9999, "Không thể tạo tour mới");
    }

    const entity = response.data.result;
    const createdTour: Tour = {
        id: hashStringToNumber(entity.tourId || ""),
        title: entity.title || "",
        location: entity.destination || "",
        price: entity.priceAdult || 0,
        duration: entity.duration || "",
        images: [],
        rating: 0,
        reviews: 0,
        status: entity.isActive ? "Hoạt động" : "Nháp",
        description: entity.description,
        startDate: entity.startDate,
        endDate: entity.endDate,
    };

    if (entity.tourId) {
        storeTourIdMapping(createdTour.id, entity.tourId);
    }

    return createdTour;
};

/**
 * Update an existing tour (admin endpoint)
 */
export const updateTourApi = async (
    id: number,
    tourData: Partial<Tour>,
    staffId: string
): Promise<Tour> => {
    const uuid = getTourUuid(id);
    if (!uuid) {
        throw new ApiError(1021, "Tour không tồn tại");
    }

    const request = mapTourToTourRequest(tourData, staffId);

    const response = await apiClient.put<ApiResponse<TourEntity>>(`/admins/tours/${uuid}`, request);

    if (!response.data.result) {
        throw new ApiError(9999, "Không thể cập nhật tour");
    }

    const updatedTour = await fetchTourById(id);
    if (!updatedTour) {
        throw new ApiError(9999, "Không thể lấy thông tin tour sau khi cập nhật");
    }

    return updatedTour;
};

/**
 * Delete a tour (admin endpoint)
 */
export const deleteTourApi = async (id: number): Promise<void> => {
    const uuid = getTourUuid(id);
    if (!uuid) {
        throw new ApiError(1021, "Tour không tồn tại");
    }

    await apiClient.delete(`/admins/tours/${uuid}`);
};

/**
 * Update tour status (admin endpoint)
 */
export const updateTourStatusApi = async (
    id: number,
    isActive: boolean
): Promise<void> => {
    const uuid = getTourUuid(id);
    if (!uuid) {
        throw new ApiError(1021, "Tour không tồn tại");
    }

    await apiClient.patch(`/admins/tours/${uuid}/status`, null, {
        params: { isActive },
    });
};

const hashStringToNumber = (str: string): number => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};
