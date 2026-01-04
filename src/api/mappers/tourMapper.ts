import type { Tour, TourImage } from "@/context/TourContext";
import type { TourResponse, TourRequest, TourEntity } from "../generated/types.gen";

/**
 * Backend category enum to Vietnamese display text
 */
export const CATEGORY_MAP: Record<string, string> = {
    BEACH: "Biển đảo",
    CITY: "Thành phố",
    CULTURE: "Văn hóa",
    EXPLORATION: "Phiêu lưu",
    ADVENTURE: "Mạo hiểm",
    NATURE: "Thiên nhiên",
    FOOD: "Ẩm thực",
};

/**
 * Vietnamese category to backend enum
 */
export const CATEGORY_REVERSE_MAP: Record<string, TourRequest["category"]> = {
    "Biển đảo": "BEACH",
    "Thành phố": "CITY",
    "Văn hóa": "CULTURE",
    "Phiêu lưu": "EXPLORATION",
    "Mạo hiểm": "ADVENTURE",
    "Thiên nhiên": "NATURE",
    "Ẩm thực": "FOOD",
};

/**
 * Simple hash function to convert string UUID to number
 */
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

/**
 * Store original tourId for API calls (UUID string)
 */
const tourIdMap = new Map<number, string>();

export const storeTourIdMapping = (numericId: number, uuid: string): void => {
    tourIdMap.set(numericId, uuid);
};

export const getTourUuid = (numericId: number): string | undefined => {
    return tourIdMap.get(numericId);
};

/**
 * Map backend TourEntity to frontend Tour interface
 * TourEntity is used by /tours endpoint (public list)
 */
export const mapTourEntityToTour = (entity: TourEntity): Tour => {
    // Convert TourImageEntity array to TourImage array
    const images: TourImage[] = (entity.images || []).map((img, index) => ({
        id: img.imageId || `img-${entity.tourId}-${index}`,
        url: img.imageUrl || "",
        isPrimary: index === 0,
        order: index,
        caption: img.description,
    }));

    const numericId = hashStringToNumber(entity.tourId || "");

    // Store the mapping immediately
    if (entity.tourId) {
        storeTourIdMapping(numericId, entity.tourId);
    }

    // Calculate average rating from reviews if available
    const reviews = entity.reviews || [];
    const visibleReviews = reviews.filter(r => r.isVisible);
    const avgRating = visibleReviews.length > 0
        ? visibleReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / visibleReviews.length
        : 0;

    return {
        id: numericId,
        title: entity.title || "",
        location: entity.destination || "",
        price: entity.priceAdult || 0,
        duration: entity.duration || "",
        images,
        image: images[0]?.url || "",
        rating: Math.round(avgRating * 10) / 10,
        reviews: visibleReviews.length,
        category: CATEGORY_MAP[entity.category || ""] || entity.category,
        status: entity.isActive ? "Hoạt động" : "Đã đóng",
        description: entity.description,
        startDate: entity.startDate,
        endDate: entity.endDate,
    };
};

/**
 * Map backend TourResponse to frontend Tour interface
 * TourResponse is used by specific endpoints like /tours/{id}
 */
export const mapTourResponseToTour = (response: TourResponse): Tour => {
    // Convert simple image URLs to TourImage array
    const images: TourImage[] = (response.images || []).map((url, index) => ({
        id: `img-${response.tourId}-${index}`,
        url,
        isPrimary: index === 0,
        order: index,
    }));

    const numericId = hashStringToNumber(response.tourId || "");

    // Store the mapping immediately
    if (response.tourId) {
        storeTourIdMapping(numericId, response.tourId);
    }

    return {
        id: numericId,
        title: response.title || "",
        location: response.destination || "",
        price: response.priceAdult || 0,
        duration: response.duration || "",
        images,
        image: images[0]?.url || "",
        rating: response.averageRating || 0,
        reviews: response.reviewCount || 0,
        category: CATEGORY_MAP[response.category || ""] || response.category,
        status: response.isActive ? "Hoạt động" : "Đã đóng",
        description: response.description,
        startDate: response.startDate,
        endDate: response.endDate,
    };
};

/**
 * Map frontend Tour to backend TourRequest
 */
export const mapTourToTourRequest = (
    tour: Partial<Tour>,
    staffId: string
): TourRequest => {
    return {
        title: tour.title || "",
        description: tour.description,
        priceAdult: tour.price || 0,
        priceChild: Math.round((tour.price || 0) * 0.7),
        duration: tour.duration,
        destination: tour.location || "",
        startDate: tour.startDate,
        endDate: tour.endDate,
        capacity: 50,
        category: CATEGORY_REVERSE_MAP[tour.category || ""] || "EXPLORATION",
        region: "CENTRAL",
        availability: 50,
        staff_id: staffId,
    };
};

/**
 * Map array of TourEntity to Tour array
 */
export const mapTourEntitiesToTours = (entities: TourEntity[]): Tour[] => {
    return entities.map(mapTourEntityToTour);
};

/**
 * Map array of TourResponse to Tour array
 */
export const mapTourResponsesToTours = (responses: TourResponse[]): Tour[] => {
    return responses.map(mapTourResponseToTour);
};
