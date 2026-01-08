import apiClient, { ApiError, type ApiResponse } from "./apiClient";
import type { TourEntity } from "./generated/types.gen";
import type { Tour } from "@/context/TourContext";
import {
  mapTourEntityToTour,
  mapTourEntitiesToTours,
  mapTourToTourRequest,
  getTourUuid,
  storeTourIdMapping,
} from "./mappers/tourMapper";

/**
 * Page info structure from backend
 */
interface PageInfo {
  size?: number;
  number?: number;
  totalElements?: number;
  totalPages?: number;
}

/**
 * Page data structure from backend (generic)
 */
interface PageData<T> {
  content?: T[];
  page?: PageInfo;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  size?: number;
}

/**
 * Tour search/filter parameters matching backend API
 */
export interface TourSearchParams extends PaginationParams {
  title?: string;
  destination?: string;
  category?:
    | "BEACH"
    | "CITY"
    | "CULTURE"
    | "EXPLORATION"
    | "ADVENTURE"
    | "NATURE"
    | "FOOD";
  region?: "NORTH" | "CENTRAL" | "SOUTH";
  minPrice?: number;
  maxPrice?: number;
  startDateFrom?: string;
  endDateTo?: string;
  endDateLimit?: string;
  minRating?: number;
  numAdults?: number;
  numChildren?: number;
  sortBy?: "price" | "rating" | "title" | "startDate";
  sortDirection?: "asc" | "desc";
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
 * Fetch all active tours (public endpoint) with optional search/filter params
 * Returns PageTourEntity wrapped in ApiResponse
 */
export const fetchAllTours = async (
  params?: TourSearchParams
): Promise<PaginatedResult<Tour>> => {
  // Build query params, only include defined values
  const queryParams: Record<string, unknown> = {
    page: (params?.page ?? 0) + 1, // Backend uses 1-based pagination
    size: params?.size ?? 20,
  };

  // Add optional filter params if provided
  if (params?.title) queryParams.title = params.title;
  if (params?.destination) queryParams.destination = params.destination;
  if (params?.category) queryParams.category = params.category;
  if (params?.region) queryParams.region = params.region;
  if (params?.minPrice !== undefined) queryParams.minPrice = params.minPrice;
  if (params?.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
  if (params?.startDateFrom) queryParams.startDateFrom = params.startDateFrom;
  if (params?.endDateTo) queryParams.endDateTo = params.endDateTo;
  if (params?.endDateLimit) queryParams.endDateLimit = params.endDateLimit;
  if (params?.minRating !== undefined) queryParams.minRating = params.minRating;
  if (params?.numAdults !== undefined) queryParams.numAdults = params.numAdults;
  if (params?.numChildren !== undefined)
    queryParams.numChildren = params.numChildren;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortDirection) queryParams.sortDirection = params.sortDirection;

  const response = await apiClient.get<ApiResponse<PageData<TourEntity>>>(
    "/tours",
    {
      params: queryParams,
    }
  );

  const pageData = response.data.result;
  const pageInfo = pageData?.page;
  const tours = mapTourEntitiesToTours(pageData?.content || []);

  return {
    content: tours,
    totalElements: pageInfo?.totalElements || 0,
    totalPages: pageInfo?.totalPages || 0,
    currentPage: pageInfo?.number || 0,
    pageSize: pageInfo?.size || 20,
    isFirst: (pageInfo?.number || 0) === 0,
    isLast: (pageInfo?.number || 0) >= (pageInfo?.totalPages || 1) - 1,
  };
};

/**
 * Fetch a single tour by UUID (public endpoint)
 */
export const fetchTourByUuid = async (
  uuid: string
): Promise<Tour | undefined> => {
  try {
    const response = await apiClient.get<ApiResponse<TourEntity>>(
      `/tours/${uuid}`
    );

    if (response.data.result) {
      const tour = mapTourEntityToTour(response.data.result);
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
 * Note: Backend returns a direct array, not a paginated wrapper
 */
export const fetchAllToursAdmin = async (): Promise<PaginatedResult<Tour>> => {
  const response = await apiClient.get<
    ApiResponse<TourEntity[] | PageData<TourEntity>>
  >("/admins/tours");

  const result = response.data.result;

  // Handle both array response (current backend) and paginated wrapper (future)
  const isDirectArray = Array.isArray(result);
  const tourEntities = isDirectArray ? result : result?.content || [];
  const pageInfo = isDirectArray ? undefined : result?.page;
  const tours = mapTourEntitiesToTours(tourEntities);

  return {
    content: tours,
    totalElements: pageInfo?.totalElements || tours.length,
    totalPages: pageInfo?.totalPages || 1,
    currentPage: pageInfo?.number || 0,
    pageSize: pageInfo?.size || tours.length,
    isFirst: true,
    isLast: true,
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

  const response = await apiClient.post<ApiResponse<TourEntity>>(
    "/admins/tours",
    request
  );

  if (!response.data.result) {
    throw new ApiError(9999, "Không thể tạo tour mới");
  }

  // Use the mapper for consistent field mapping and tourUuid assignment
  const createdTour = mapTourEntityToTour(response.data.result);

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
  // Use tourUuid from data if available, fallback to the in-memory map
  const uuid = tourData.tourUuid || getTourUuid(id);
  if (!uuid) {
    throw new ApiError(1021, "Tour không tồn tại");
  }

  const request = mapTourToTourRequest(tourData, staffId);

  const response = await apiClient.put<ApiResponse<TourEntity>>(
    `/admins/tours/${uuid}`,
    request
  );

  if (!response.data.result) {
    throw new ApiError(9999, "Không thể cập nhật tour");
  }

  // Use the response directly instead of fetching again
  // (fetchTourById uses public endpoint which fails for inactive tours)
  const updatedTour = mapTourEntityToTour(response.data.result);

  // Ensure the UUID mapping is stored
  if (response.data.result.tourId) {
    storeTourIdMapping(updatedTour.id, response.data.result.tourId);
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
