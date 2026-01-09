import type { Tour, TourImage } from "@/context/TourContext";
import type { TourRequest, TourEntity } from "../generated/types.gen";
import { hashStringToNumber } from "@/lib/hashUtils";

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
 * Backend region enum to Vietnamese display text
 */
export const REGION_MAP: Record<string, string> = {
  NORTH: "Miền Bắc",
  CENTRAL: "Miền Trung",
  SOUTH: "Miền Nam",
};

/**
 * Vietnamese region to backend enum
 */
export const REGION_REVERSE_MAP: Record<string, "NORTH" | "CENTRAL" | "SOUTH"> =
{
  "Miền Bắc": "NORTH",
  "Miền Trung": "CENTRAL",
  "Miền Nam": "SOUTH",
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
export const mapTourEntityToTour = (entity: TourEntity | any): Tour => {
  // Handle images which can be TourImageEntity[] or string[] (URLs)
  let images: TourImage[] = [];
  if (entity.images) {
    if (typeof entity.images[0] === "string") {
      // Handle string array (from TourResponse DTO)
      images = (entity.images as string[]).map((url, index) => ({
        id: `img-${entity.tourId}-${index}`,
        url: url,
        isPrimary: index === 0,
        order: index,
      }));
    } else {
      // Handle TourImageEntity array (from TourEntity)
      images = (entity.images as any[]).map((img, index) => ({
        id: img.imageId || `img-${entity.tourId}-${index}`,
        url: img.imageUrl || "",
        isPrimary: index === 0,
        order: index,
        caption: img.description,
      }));
    }
  }

  const numericId = hashStringToNumber(entity.tourId || "");

  if (entity.tourId) {
    storeTourIdMapping(numericId, entity.tourId);
  }

  // Use pre-calculated stats from backend if available (TourResponse DTO)
  let rating = 0;
  let reviewCount = 0;

  if (
    typeof entity.averageRating === "number" &&
    typeof entity.reviewCount === "number"
  ) {
    rating = entity.averageRating;
    reviewCount = entity.reviewCount;
  } else {
    // Fallback: Calculate from reviews list (for TourEntity or if DTO missing fields)
    const reviews = entity.reviews || [];
    // Note: This matches legacy logic of filtering visible reviews only.
    // If Admin needs total stats, this might need adjustment, but sticking to existing logic for Entity case.
    const visibleReviews = reviews.filter((r: any) => r.isVisible);
    const avgRating =
      visibleReviews.length > 0
        ? visibleReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
        visibleReviews.length
        : 0;
    rating = avgRating;
    reviewCount = visibleReviews.length;
  }

  return {
    id: numericId,
    tourUuid: entity.tourId, // Store the original UUID for API calls
    title: entity.title || "",
    location: entity.destination || "",
    price: entity.priceAdult || 0,
    priceChild: entity.priceChild,
    duration: entity.duration || "",
    images,
    image: images[0]?.url || "",
    rating: Math.round(rating * 10) / 10,
    reviews: reviewCount,
    category: CATEGORY_MAP[entity.category || ""] || entity.category,
    region: REGION_MAP[entity.region || ""] || entity.region,
    capacity: entity.capacity,
    availability: entity.availability,
    status: entity.isActive ? "Hoạt động" : "Đã đóng",
    description: entity.description,
    itinerary: entity.itinerary,
    startDate: entity.startDate,
    endDate: entity.endDate,
    staffId: entity.staff?.userId || entity.staffId, // Handle both object (Entity) and ID (DTO)
  };
};

/**
 * Map frontend Tour to backend TourRequest
 */
export const mapTourToTourRequest = (
  tour: Partial<Tour>,
  staffId: string
): TourRequest => {
  // Calculate child price: use provided value or default to 50% of adult price
  const priceChild = tour.priceChild ?? Math.round((tour.price || 0) * 0.5);

  // Map region from Vietnamese to backend enum
  const region =
    REGION_REVERSE_MAP[tour.region || ""] ??
    (() => {
      console.error(`Invalid region: ${tour.region}`);
      throw new Error(
        `Invalid region: ${tour.region}. Valid regions: ${Object.keys(
          REGION_REVERSE_MAP
        ).join(", ")}`
      );
    })();

  // Map category from Vietnamese to backend enum
  const category =
    CATEGORY_REVERSE_MAP[tour.category || ""] ??
    (() => {
      console.error(`Invalid category: ${tour.category}`);
      throw new Error(
        `Invalid category: ${tour.category}. Valid categories: ${Object.keys(
          CATEGORY_REVERSE_MAP
        ).join(", ")}`
      );
    })();

  return {
    title: tour.title || "",
    description: tour.description,
    itinerary: tour.itinerary,
    priceAdult: tour.price || 0,
    priceChild,
    duration: tour.duration,
    destination: tour.location || "",
    startDate: tour.startDate,
    endDate: tour.endDate,
    capacity: tour.capacity ?? 50,
    category,
    region,
    availability: tour.availability ?? (tour.capacity || 50),
    staff_id: staffId,
  };
};

/**
 * Map array of TourEntity to Tour array
 */
export const mapTourEntitiesToTours = (entities: TourEntity[]): Tour[] => {
  return entities.map(mapTourEntityToTour);
};
