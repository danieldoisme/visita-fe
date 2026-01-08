import apiClient, { ApiError, type ApiResponse } from "./apiClient";
import type { TourImageEntity } from "./generated/types.gen";
import type { TourImage } from "@/context/TourContext";

/**
 * Add a new image to a tour
 */
export const addTourImageApi = async (
    tourId: string,
    imageUrl: string,
    description?: string
): Promise<TourImageEntity> => {
    const response = await apiClient.post<ApiResponse<TourImageEntity>>(
        `/admins/tours/${tourId}/images`,
        {
            imageUrl,
            description,
        }
    );

    if (!response.data.result) {
        throw new ApiError(9999, "Không thể thêm hình ảnh");
    }

    return response.data.result;
};

/**
 * Delete an image from a tour
 */
export const deleteTourImageApi = async (
    tourId: string,
    imageId: string
): Promise<void> => {
    await apiClient.delete(`/admins/tours/${tourId}/images/${imageId}`);
};

/**
 * Update an existing tour image
 */
export const updateTourImageApi = async (
    tourId: string,
    imageId: string,
    imageUrl: string,
    description?: string
): Promise<TourImageEntity> => {
    const response = await apiClient.put<ApiResponse<TourImageEntity>>(
        `/admins/tours/${tourId}/images/${imageId}`,
        {
            imageUrl,
            description,
        }
    );

    if (!response.data.result) {
        throw new ApiError(9999, "Không thể cập nhật hình ảnh");
    }

    return response.data.result;
};

/**
 * Fetch all images for a tour
 */
export const fetchTourImagesApi = async (
    tourId: string
): Promise<TourImageEntity[]> => {
    const response = await apiClient.get<ApiResponse<TourImageEntity[]>>(
        `/admins/tours/${tourId}/images`
    );

    return response.data.result || [];
};

/**
 * Sync images for a tour - handles add, update, delete in one operation
 * @param tourId - The tour UUID
 * @param newImages - The new images array from the form
 */
export const syncTourImages = async (
    tourId: string,
    newImages: TourImage[]
): Promise<void> => {
    // Fetch current images from the backend
    const existingImages = await fetchTourImagesApi(tourId);

    // Create a map of existing images by imageId
    const existingImageMap = new Map(
        existingImages.map((img) => [img.imageId, img])
    );

    // Track which existing images are still present (to determine deletions)
    const processedImageIds = new Set<string>();

    // Process each new image
    for (const newImage of newImages) {
        // Check if this image has a valid backend imageId (starts with UUID format)
        const isExistingImage =
            newImage.id &&
            !newImage.id.startsWith("temp-") &&
            existingImageMap.has(newImage.id);

        if (isExistingImage && newImage.id) {
            // Existing image - check if it needs update
            const existingImage = existingImageMap.get(newImage.id);
            processedImageIds.add(newImage.id);

            // Update if URL or caption changed
            if (
                existingImage &&
                (existingImage.imageUrl !== newImage.url ||
                    existingImage.description !== newImage.caption)
            ) {
                await updateTourImageApi(
                    tourId,
                    newImage.id,
                    newImage.url,
                    newImage.caption ?? undefined
                );
            }
        } else {
            // New image - add it
            await addTourImageApi(tourId, newImage.url, newImage.caption ?? undefined);
        }
    }

    // Delete images that were removed
    for (const existingImage of existingImages) {
        if (existingImage.imageId && !processedImageIds.has(existingImage.imageId)) {
            await deleteTourImageApi(tourId, existingImage.imageId);
        }
    }
};
