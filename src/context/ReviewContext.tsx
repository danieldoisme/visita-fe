import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

export type ReviewStatus = "pending" | "approved" | "hidden";

export interface Review {
    id: number;
    bookingId: number;      // Links to completed booking (one review per booking)
    tourId: number;
    tourTitle: string;
    userId: string;
    userName: string;
    rating: number;         // 1-5
    comment: string;
    date: string;           // ISO string
    status: ReviewStatus;
}

interface ReviewContextType {
    reviews: Review[];
    addReview: (data: Omit<Review, "id" | "date" | "status">) => Promise<Review>;
    getReviewsByTour: (tourId: number) => Review[];        // Returns approved only
    getUserReviews: (userId: string) => Review[];          // Returns all user's reviews
    hasReviewedBooking: (bookingId: number) => boolean;    // Check if booking already reviewed
    // Admin functions
    approveReview: (id: number) => void;
    hideReview: (id: number) => void;
    deleteReview: (id: number) => void;
    // Get all reviews for admin
    getAllReviews: () => Review[];
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

const REVIEW_STORAGE_KEY = "visita_reviews";

// Mock data for demonstration
const MOCK_REVIEWS: Review[] = [
    {
        id: 1,
        bookingId: 4, // Matches "completed" booking in BookingContext
        tourId: 4,
        tourTitle: "Sapa trekking 3 ngày 2 đêm",
        userId: "user-1",
        userName: "Phạm Minh Đức",
        rating: 5,
        comment: "Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình và am hiểu. Cảnh đẹp, dịch vụ tốt. Rất đáng để trải nghiệm!",
        date: "2024-12-20T10:30:00",
        status: "approved",
    },
    {
        id: 2,
        bookingId: 100, // Mock booking
        tourId: 1,
        tourTitle: "Khám phá Vịnh Hạ Long & Hang Sửng Sốt",
        userId: "user-2",
        userName: "Nguyễn Văn A",
        rating: 4,
        comment: "Chuyến đi rất ấn tượng, đồ ăn ngon, khách sạn sạch sẽ. Chỉ tiếc là thời gian hơi ngắn, ước gì có thêm 1 ngày nữa.",
        date: "2024-12-18T14:15:00",
        status: "pending",
    },
    {
        id: 3,
        bookingId: 101,
        tourId: 2,
        tourTitle: "Văn hóa Cố đô Huế & Thưởng thức Nhã nhạc",
        userId: "user-3",
        userName: "Trần Thị B",
        rating: 5,
        comment: "Đây là lần thứ 2 mình đi tour này và vẫn thấy rất hài lòng. Giá cả hợp lý, chất lượng dịch vụ ổn định. Sẽ giới thiệu cho bạn bè!",
        date: "2024-12-15T09:00:00",
        status: "approved",
    },
];

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
    const [reviews, setReviews] = useState<Review[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const storedReviews = localStorage.getItem(REVIEW_STORAGE_KEY);
        if (storedReviews) {
            try {
                setReviews(JSON.parse(storedReviews));
            } catch {
                localStorage.removeItem(REVIEW_STORAGE_KEY);
                setReviews(MOCK_REVIEWS);
            }
        } else {
            setReviews(MOCK_REVIEWS);
        }
    }, []);

    // Persist to localStorage when reviews change
    useEffect(() => {
        if (reviews.length > 0) {
            localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
        }
    }, [reviews]);

    const addReview = async (
        data: Omit<Review, "id" | "date" | "status">
    ): Promise<Review> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newReview: Review = {
            ...data,
            id: Math.max(...reviews.map((r) => r.id), 0) + 1,
            date: new Date().toISOString(),
            status: "pending", // Always starts as pending for admin approval
        };

        setReviews((prev) => [...prev, newReview]);
        return newReview;
    };

    // Get approved reviews for a tour (public display)
    const getReviewsByTour = (tourId: number): Review[] => {
        return reviews.filter((r) => r.tourId === tourId && r.status === "approved");
    };

    // Get all reviews by a user (for profile page)
    const getUserReviews = (userId: string): Review[] => {
        return reviews.filter((r) => r.userId === userId);
    };

    // Check if a booking has already been reviewed
    const hasReviewedBooking = (bookingId: number): boolean => {
        return reviews.some((r) => r.bookingId === bookingId);
    };

    // Admin: Approve a review
    const approveReview = (id: number) => {
        setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "approved" as ReviewStatus } : r))
        );
    };

    // Admin: Hide a review
    const hideReview = (id: number) => {
        setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "hidden" as ReviewStatus } : r))
        );
    };

    // Admin: Delete a review
    const deleteReview = (id: number) => {
        setReviews((prev) => prev.filter((r) => r.id !== id));
    };

    // Get all reviews (for admin)
    const getAllReviews = (): Review[] => {
        return reviews;
    };

    return (
        <ReviewContext.Provider
            value={{
                reviews,
                addReview,
                getReviewsByTour,
                getUserReviews,
                hasReviewedBooking,
                approveReview,
                hideReview,
                deleteReview,
                getAllReviews,
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
