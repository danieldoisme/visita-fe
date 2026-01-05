import {
    createReview,
    getAllReviews,
    getReviewsByTour,
    updateReviewVisibility,
} from "@/api/generated/sdk.gen";
import {
    type Review,
    type PaginatedReviews,
    type CreateReviewPayload,
    mapReviewResponse,
    mapPagedReviews,
} from "@/api/mappers/reviewMapper";

// ============================================================================
// ADMIN: FETCH ALL REVIEWS
// ============================================================================

export const fetchAllReviews = async (
    page: number = 1,
    size: number = 10
): Promise<PaginatedReviews> => {
    const response = await getAllReviews({
        query: { page, size },
    });

    if (response.data?.result) {
        return mapPagedReviews(response.data.result);
    }

    throw new Error("Failed to fetch reviews");
};

// ============================================================================
// PUBLIC: FETCH REVIEWS BY TOUR
// ============================================================================

export const fetchReviewsByTour = async (
    tourId: string,
    page: number = 1,
    size: number = 10
): Promise<PaginatedReviews> => {
    const response = await getReviewsByTour({
        path: { tourId },
        query: { page, size },
    });

    if (response.data?.result) {
        return mapPagedReviews(response.data.result);
    }

    throw new Error("Failed to fetch tour reviews");
};

// ============================================================================
// USER: SUBMIT REVIEW
// ============================================================================

export const submitReview = async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await createReview({
        body: {
            tourId: payload.tourId,
            rating: payload.rating,
            comment: payload.comment,
        },
    });

    if (response.data?.result) {
        return mapReviewResponse(response.data.result);
    }

    throw new Error("Failed to submit review");
};

// ============================================================================
// ADMIN: SET REVIEW VISIBILITY
// ============================================================================

export const setReviewVisibility = async (
    reviewId: string,
    isVisible: boolean
): Promise<void> => {
    const response = await updateReviewVisibility({
        path: { id: reviewId },
        query: { isVisible },
    });

    if (response.error) {
        throw new Error("Failed to update review visibility");
    }
};
