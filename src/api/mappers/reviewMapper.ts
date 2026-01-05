import type { ReviewResponse, PageObject } from "../generated/types.gen";

// ============================================================================
// TYPES
// ============================================================================

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
 * The PageObject content contains ReviewResponse items
 */
export const mapPagedReviews = (page: PageObject): PaginatedReviews => {
    const content = (page.content || []) as unknown as ReviewResponse[];

    return {
        reviews: content.map(mapReviewResponse),
        totalElements: page.totalElements || 0,
        totalPages: page.totalPages || 0,
        currentPage: page.number || 0,
        pageSize: page.size || 10,
        isFirst: page.first || false,
        isLast: page.last || false,
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
export const validateReviewPayload = (payload: CreateReviewPayload): string | null => {
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
