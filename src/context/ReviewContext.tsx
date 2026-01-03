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

// Mock data for user-001 (Nguyễn Văn A) - reviews linked to completed bookings
const MOCK_REVIEWS: Review[] = [
    // Review for booking ID 1 - Vịnh Hạ Long (completed)
    {
        id: 1,
        bookingId: 1,
        tourId: 1,
        tourTitle: "Khám phá Vịnh Hạ Long & Hang Sửng Sốt",
        userId: "user-001",
        userName: "Nguyễn Văn A",
        rating: 5,
        comment: "Chuyến đi tuyệt vời! Cảnh đẹp như tranh vẽ, hướng dẫn viên nhiệt tình và am hiểu. Đồ ăn trên du thuyền rất ngon. Sẽ quay lại lần nữa!",
        date: "2024-10-20T10:30:00",
        status: "approved",
    },
    // Review for booking ID 2 - Huế (completed)
    {
        id: 2,
        bookingId: 2,
        tourId: 2,
        tourTitle: "Văn hóa Cố đô Huế & Thưởng thức Nhã nhạc",
        userId: "user-001",
        userName: "Nguyễn Văn A",
        rating: 4,
        comment: "Tour văn hóa rất ý nghĩa. Được tìm hiểu nhiều về lịch sử triều Nguyễn. Chỉ tiếc là thời gian hơi gấp, muốn có thêm thời gian thăm Đại Nội.",
        date: "2024-11-10T14:15:00",
        status: "approved",
    },
    // Review for booking ID 3 - Đà Lạt (completed) - pending review
    {
        id: 3,
        bookingId: 3,
        tourId: 4,
        tourTitle: "Đà Lạt Mộng Mơ",
        userId: "user-001",
        userName: "Nguyễn Văn A",
        rating: 5,
        comment: "Đà Lạt quá đẹp! Thời tiết mát mẻ, các điểm tham quan được sắp xếp hợp lý. Khách sạn 4 sao rất sạch sẽ và tiện nghi. Trẻ con rất thích!",
        date: "2024-11-25T09:00:00",
        status: "pending",
    },
    // Review for booking ID 4 - Cát Bà (completed) - hidden status for testing
    {
        id: 4,
        bookingId: 4,
        tourId: 5,
        tourTitle: "Khám phá Đảo Cát Bà & Vịnh Lan Hạ",
        userId: "user-001",
        userName: "Nguyễn Văn A",
        rating: 3,
        comment: "Tour ổn nhưng thời gian di chuyển hơi dài. Vịnh Lan Hạ đẹp, kayak rất vui. Dịch vụ ăn uống cần cải thiện thêm.",
        date: "2024-12-05T16:30:00",
        status: "hidden",
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
