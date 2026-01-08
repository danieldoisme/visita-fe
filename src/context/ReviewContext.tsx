import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  fetchAllReviews,
  fetchReviewsByTour,
  submitReview,
  setReviewVisibility,
} from "@/api/services/reviewService";
import type {
  Review,
  PaginatedReviews,
  CreateReviewPayload,
} from "@/api/mappers/reviewMapper";

// Re-export types for convenience
export type { Review, PaginatedReviews } from "@/api/mappers/reviewMapper";
export type ReviewStatus = "approved" | "hidden";

interface ReviewContextType {
  // State
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
  // Actions
  loadAllReviews: (page?: number, size?: number) => Promise<void>;
  loadReviewsByTour: (
    tourId: string,
    page?: number,
    size?: number
  ) => Promise<Review[]>;
  loadAllReviewsByTour: (
    tourId: string,
    page?: number,
    size?: number
  ) => Promise<Review[]>;
  addReview: (payload: CreateReviewPayload) => Promise<Review>;
  setVisibility: (reviewId: string, isVisible: boolean) => Promise<void>;
  // Helpers
  getVisibleReviewsForTour: (tourId: string) => Review[];
  getUserReviews: (userId: string) => Review[];
  hasReviewedBooking: (bookingId: number) => boolean;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
  });

  // Admin: Load all reviews with pagination
  const loadAllReviews = useCallback(
    async (page: number = 1, size: number = 10) => {
      setIsLoading(true);
      setError(null);
      try {
        const result: PaginatedReviews = await fetchAllReviews(page, size);
        setReviews(result.reviews);
        setPagination({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalElements: result.totalElements,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Public: Load reviews for a specific tour (visible only, for tour detail page)
  const loadReviewsByTour = useCallback(
    async (
      tourId: string,
      page: number = 1,
      size: number = 10
    ): Promise<Review[]> => {
      try {
        const result = await fetchReviewsByTour(tourId, page, size);
        // Return only visible reviews for public display
        return result.reviews.filter((r) => r.status === "approved");
      } catch (err) {
        console.error("Failed to load tour reviews:", err);
        return [];
      }
    },
    []
  );

  // User: Load all reviews for a tour (including hidden, for profile page)
  const loadAllReviewsByTour = useCallback(
    async (
      tourId: string,
      page: number = 1,
      size: number = 10
    ): Promise<Review[]> => {
      try {
        const result = await fetchReviewsByTour(tourId, page, size);
        // Return all reviews (including hidden) for user's own profile
        return result.reviews;
      } catch (err) {
        console.error("Failed to load tour reviews:", err);
        return [];
      }
    },
    []
  );

  // User: Submit a new review
  const addReview = useCallback(
    async (payload: CreateReviewPayload): Promise<Review> => {
      const newReview = await submitReview(payload);
      // Optimistically add to local state if admin is viewing
      setReviews((prev) => [newReview, ...prev]);
      return newReview;
    },
    []
  );

  // Admin: Toggle review visibility
  const setVisibility = useCallback(
    async (reviewId: string, isVisible: boolean) => {
      await setReviewVisibility(reviewId, isVisible);
      // Update local state immediately
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, status: isVisible ? "approved" : "hidden" }
            : r
        )
      );
    },
    []
  );

  // Helper: Filter visible reviews for a tour from cached data
  const getVisibleReviewsForTour = useCallback(
    (tourId: string): Review[] => {
      return reviews.filter(
        (r) => r.tourId === tourId && r.status === "approved"
      );
    },
    [reviews]
  );

  // Helper: Get all reviews by a specific user (for Profile page)
  const getUserReviews = useCallback(
    (userId: string): Review[] => {
      return reviews.filter((r) => r.userId === userId);
    },
    [reviews]
  );

  // Helper: Check if booking has been reviewed
  const hasReviewedBooking = useCallback(
    (bookingId: number): boolean => {
      return reviews.some((r) => r.bookingId === bookingId.toString());
    },
    [reviews]
  );

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        isLoading,
        error,
        pagination,
        loadAllReviews,
        loadReviewsByTour,
        loadAllReviewsByTour,
        addReview,
        setVisibility,
        getVisibleReviewsForTour,
        getUserReviews,
        hasReviewedBooking,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error("useReview must be used within a ReviewProvider");
  }
  return context;
};
