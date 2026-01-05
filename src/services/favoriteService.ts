/**
 * Favorite Service
 * Handles API calls for user favorites (wishlist)
 */

import apiClient, { ApiError, type ApiResponse } from "@/api/apiClient";
import { mapTourEntitiesToTours } from "@/api/mappers/tourMapper";
import type { Tour } from "@/context/TourContext";
import type { TourEntity } from "@/api/generated/types.gen";

/**
 * Fetch current user's favorite tours
 * GET /favorites
 * @returns Array of Tour objects
 */
export async function fetchFavorites(): Promise<Tour[]> {
    try {
        const response = await apiClient.get<ApiResponse<TourEntity[]>>("/favorites");

        const entities = response.data.result || [];
        return mapTourEntitiesToTours(entities);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Không thể tải danh sách yêu thích", error);
    }
}

/**
 * Add a tour to favorites
 * POST /favorites/{tourId}
 * @param tourId - The tour UUID (string) to add
 */
export async function addToFavorites(tourId: string): Promise<void> {
    try {
        await apiClient.post<ApiResponse<string>>(`/favorites/${tourId}`);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Không thể thêm vào yêu thích", error);
    }
}

/**
 * Remove a tour from favorites
 * DELETE /favorites/{tourId}
 * @param tourId - The tour UUID (string) to remove
 */
export async function removeFromFavorites(tourId: string): Promise<void> {
    try {
        await apiClient.delete<ApiResponse<string>>(`/favorites/${tourId}`);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Không thể xóa khỏi yêu thích", error);
    }
}
