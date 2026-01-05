import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTour, Tour } from "@/context/TourContext";
import { useAuth } from "@/context/AuthContext";
import { BookingModal } from "@/components/BookingModal";
import { AuthRequiredModal } from "@/components/AuthRequiredModal";
import { TourImageGallery } from "@/components/TourImageGallery";
import { TourCard } from "@/components/TourCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Star, ArrowLeft, Calendar, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useReview, Review } from "@/context/ReviewContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const TOURS_PER_PAGE = 2;

export default function TourDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTour, getRecommendedTours } = useTour();
  const { loadReviewsByTour } = useReview();
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user, isAuthenticated, isAdmin, isStaff } = useAuth();

  // Only show recommendations for logged in regular users (not admin/staff)
  const showRecommendations = isAuthenticated && !isAdmin && !isStaff;
  const [tour, setTour] = useState<Tour | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Recommended tours state
  const [recommendedTours, setRecommendedTours] = useState<Tour[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch reviews when tour loads
  useEffect(() => {
    const fetchReviews = async () => {
      if (tour) {
        const fetchedReviews = await loadReviewsByTour(tour.id.toString());
        setReviews(fetchedReviews);
      }
    };
    fetchReviews();
  }, [tour, loadReviewsByTour]);

  // Calculate average rating from valid reviews
  const averageRating = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : tour?.rating || 0;

  const reviewCount = reviews.length > 0 ? reviews.length : tour?.reviews || 0;

  const handleBookNow = () => {
    if (user) {
      // User is authenticated, open booking modal directly
      setIsBookingModalOpen(true);
    } else {
      // User is not authenticated, show auth modal first
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    // After successful auth, open booking modal
    setIsAuthModalOpen(false);
    setIsBookingModalOpen(true);
  };

  useEffect(() => {
    const fetchTour = async () => {
      if (id) {
        const data = await getTour(parseInt(id));
        setTour(data);
      }
      setLoading(false);
    };
    fetchTour();
  }, [id, getTour]);

  // Fetch recommended tours when tour is loaded
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (tour) {
        const recommendations = await getRecommendedTours(tour.id, tour.category);
        setRecommendedTours(recommendations);
        setCurrentPage(0); // Reset pagination when tour changes
      }
    };
    fetchRecommendations();
  }, [tour, getRecommendedTours]);

  // Pagination calculations
  const totalPages = Math.ceil(recommendedTours.length / TOURS_PER_PAGE);
  const paginatedTours = recommendedTours.slice(
    currentPage * TOURS_PER_PAGE,
    (currentPage + 1) * TOURS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-9 w-28 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Skeleton */}
            <Skeleton className="h-[400px] w-full rounded-xl" />

            {/* Title and Meta Skeleton */}
            <div>
              <Skeleton className="h-9 w-3/4 mb-4" />
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-9 w-36" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy tour</h2>
        <Button onClick={() => navigate("/tours")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/tours")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 min-w-0 bg-white lg:pr-4">
          <div className="relative">
            <TourImageGallery tour={tour} />
            {tour.category && (
              <Badge className="absolute top-4 right-4 bg-white/90 text-black hover:bg-white z-10">
                {tour.category}
              </Badge>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{tour.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{tour.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span>
                  {averageRating} ({reviewCount} đánh giá)
                </span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-2">Mô tả</h3>
            {tour.description ? (
              <div
                className="text-gray-600 leading-relaxed mb-6"
                dangerouslySetInnerHTML={{ __html: tour.description.replace(/&nbsp;/g, ' ') }}
              />
            ) : (
              <p className="text-gray-600 leading-relaxed mb-6">
                Chưa có mô tả chi tiết cho tour này.
              </p>
            )}

            {tour.features && tour.features.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Điểm nổi bật</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {tour.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-slate-50 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-semibold mb-4">
              Đánh giá từ khách hàng ({reviewCount} đánh giá)
            </h3>

            {/* Rating Summary Banner */}
            <div className="bg-white rounded-lg p-4 mb-6 flex items-center gap-4 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{averageRating}</div>
                <div className="text-sm text-gray-500">/5</div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                      }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Dựa trên {reviewCount} đánh giá
              </div>
            </div>

            {/* Dynamic Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{review.userName}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(review.createdAt), "dd/MM/yyyy", { locale: vi })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có đánh giá nào cho tour này. Hãy là người đầu tiên trải nghiệm và để lại đánh giá!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Sticky container for both booking and recommendations */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="mb-6">
                <span className="text-gray-500">Giá từ</span>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(tour.price)}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Ngày khởi hành</div>
                    <div className="text-xs text-gray-500">
                      Liên hệ để biết chi tiết
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Số lượng khách</div>
                    <div className="text-xs text-gray-500">Không giới hạn</div>
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 text-lg" onClick={handleBookNow}>Đặt Tour Ngay</Button>
              <FavoriteButton tourId={tour.id} variant="inline" className="w-full mt-3" />
              <p className="text-xs text-center text-gray-500 mt-4">
                Không tính phí đặt chỗ. Xác nhận ngay lập tức.
              </p>
            </div>

            {/* Recommended Tours Section - Only shown for logged in regular users */}
            {showRecommendations && recommendedTours.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Tour tương tự</h3>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Trang trước"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-xs text-gray-500 min-w-[3rem] text-center">
                        {currentPage + 1}/{totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Trang sau"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {paginatedTours.map((recommendedTour) => (
                    <TourCard
                      key={recommendedTour.id}
                      tour={recommendedTour}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tour={tour}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Đăng nhập để đặt tour"
        message="Vui lòng đăng nhập hoặc tạo tài khoản để đặt tour."
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
