import type { Tour, TourImage } from "@/context/TourContext";
import { hashStringToNumber } from "@/utils/hashUtils";
import { storeTourIdMapping, CATEGORY_MAP, REGION_MAP } from "./tourMapper";

/**
 * TourResponse from /staffs/{id}/tours endpoint
 * This matches the actual API response structure with direct averageRating/reviewCount fields
 */
export interface TourResponse {
    tourId?: string;
    title?: string;
    description?: string;
    itinerary?: string;
    priceAdult?: number;
    priceChild?: number;
    duration?: string;
    destination?: string;
    startDate?: string | null;
    endDate?: string | null;
    capacity?: number;
    isActive?: boolean;
    category?: "BEACH" | "CITY" | "CULTURE" | "EXPLORATION" | "ADVENTURE" | "NATURE" | "FOOD";
    region?: "NORTH" | "CENTRAL" | "SOUTH";
    availability?: number;
    images?: string[]; // Simple string array in TourResponse
    averageRating?: number;
    reviewCount?: number;
    staffId?: string;
    staffName?: string;
}

/**
 * Paginated response structure for staff tours
 */
export interface StaffToursPageResponse {
    content?: TourResponse[];
    page?: {
        size?: number;
        number?: number;
        totalElements?: number;
        totalPages?: number;
    };
}

/**
 * Map TourResponse (from staff endpoint) to frontend Tour interface
 */
export const mapTourResponseToTour = (response: TourResponse): Tour => {
    // Convert simple string array to TourImage array
    const images: TourImage[] = (response.images || []).map((url, index) => ({
        id: `img-${response.tourId}-${index}`,
        url: url,
        isPrimary: index === 0,
        order: index,
        caption: null,
        altText: null,
    }));

    const numericId = hashStringToNumber(response.tourId || "");

    // Store UUID mapping for API calls
    if (response.tourId) {
        storeTourIdMapping(numericId, response.tourId);
    }

    return {
        id: numericId,
        tourUuid: response.tourId,
        title: response.title || "",
        location: response.destination || "",
        price: response.priceAdult || 0,
        priceChild: response.priceChild,
        duration: response.duration || "",
        images,
        image: images[0]?.url || "",
        // Use direct values from API response (no client-side calculation needed)
        rating: Math.round((response.averageRating || 0) * 10) / 10,
        reviews: response.reviewCount || 0,
        category: CATEGORY_MAP[response.category || ""] || response.category,
        region: REGION_MAP[response.region || ""] || response.region,
        capacity: response.capacity,
        availability: response.availability,
        status: response.isActive ? "Hoạt động" : "Đã đóng",
        description: response.description,
        itinerary: response.itinerary,
        startDate: response.startDate || undefined,
        endDate: response.endDate || undefined,
        staffId: response.staffId,
    };
};

/**
 * Map array of TourResponse to Tour array
 */
export const mapTourResponsesToTours = (responses: TourResponse[]): Tour[] => {
    return responses.map(mapTourResponseToTour);
};
