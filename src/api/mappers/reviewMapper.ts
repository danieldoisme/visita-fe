import type { ReviewResponse } from "../generated/types.gen";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Actual backend response structure for paginated reviews.
 * Note: The backend returns a nested structure with `content` and `page` as siblings,
 * which differs from the OpenAPI schema's flat PageObject structure.
 */
export interface BackendPagedReviewResponse {
  content?: ReviewResponse[];
  page?: {
    size?: number;
    number?: number;
    totalElements?: number;
    totalPages?: number;
  };
}

export type ReviewStatus = "approved" | "hidden";

export interface Review {
  id: string;
  bookingId: string;
  tourId: string;
  tourTitle?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: ReviewStatus;
}

export interface PaginatedReviews {
  reviews: Review[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
}

// ============================================================================
// MAPPERS
// ============================================================================

/**
 * Map backend isVisible boolean to frontend status
 */
const mapVisibilityToStatus = (isVisible?: boolean): ReviewStatus => {
  return isVisible === false ? "hidden" : "approved";
};

/**
 * Map single ReviewResponse to frontend Review
 */
export const mapReviewResponse = (response: ReviewResponse): Review => {
  return {
    id: response.reviewId || "",
    bookingId: response.bookingId || "",
    tourId: response.tourId || "",
    userId: response.userId || "",
    userName: response.userName || "Khách hàng",
    rating: response.rating || 0,
    comment: response.comment || "",
    createdAt: response.createdAt || new Date().toISOString(),
    status: mapVisibilityToStatus(response.isVisible),
  };
};

/**
 * Map paginated API response to frontend PaginatedReviews
 * Note: The backend returns { content: [...], page: { size, number, totalElements, totalPages } }
 * which differs from the flat PageObject in the OpenAPI schema.
 * The backend uses 0-based page numbering, but the UI uses 1-based.
 */
export const mapPagedReviews = (
  response: BackendPagedReviewResponse
): PaginatedReviews => {
  const content = response.content || [];
  const page = response.page || {};
  const pageNumber = page.number || 0;
  const totalPages = page.totalPages || 0;

  return {
    reviews: content.map(mapReviewResponse),
    totalElements: page.totalElements || 0,
    totalPages: totalPages,
    currentPage: pageNumber + 1, // Convert 0-based to 1-based for UI
    pageSize: page.size || 10,
    isFirst: pageNumber === 0,
    isLast: pageNumber >= totalPages - 1,
  };
};

// ============================================================================
// REQUEST HELPERS
// ============================================================================

export interface CreateReviewPayload {
  bookingId: string;
  tourId: string;
  rating: number;
  comment: string;
}

/**
 * Validate review payload before submission
 */
export const validateReviewPayload = (
  payload: CreateReviewPayload
): string | null => {
  if (!payload.tourId) {
    return "Tour ID is required";
  }
  if (payload.rating < 1 || payload.rating > 5) {
    return "Rating must be between 1 and 5";
  }
  if (!payload.comment || payload.comment.trim().length < 10) {
    return "Comment must be at least 10 characters";
  }
  return null;
};
