import type { Tour, TourImage } from "@/context/TourContext";
import type { TourRequest, TourEntity } from "../generated/types.gen";
import { hashStringToNumber } from "@/utils/hashUtils";

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
 * Clear tour ID mappings (call on logout to prevent memory leak)
 */
export const clearTourIdMap = (): void => {
    tourIdMap.clear();
};

/**
 * Map backend TourEntity to frontend Tour interface
 */
export const mapTourEntityToTour = (entity: TourEntity): Tour => {
    const images: TourImage[] = (entity.images || []).map((img, index) => ({
        id: img.imageId || `img-${entity.tourId}-${index}`,
        url: img.imageUrl || "",
        isPrimary: index === 0,
        order: index,
        caption: img.description,
    }));

    const numericId = hashStringToNumber(entity.tourId || "");

    if (entity.tourId) {
        storeTourIdMapping(numericId, entity.tourId);
    }

    const reviews = entity.reviews || [];
    const visibleReviews = reviews.filter(r => r.isVisible);
    const avgRating = visibleReviews.length > 0
        ? visibleReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / visibleReviews.length
        : 0;

    return {
        id: numericId,
        tourUuid: entity.tourId, // Store the original UUID for API calls
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
