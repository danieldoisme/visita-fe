import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTour, Tour } from "@/context/TourContext";
import { BookingModal } from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Star, ArrowLeft, Calendar, Users } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function TourDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTour } = useTour();
  const [tour, setTour] = useState<Tour | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
          <div className="relative h-[400px] rounded-xl overflow-hidden">
            <img
              src={tour.image}
              alt={tour.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 right-4 bg-white/90 text-black hover:bg-white">
              {tour.category}
            </Badge>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{tour.title}</h1>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
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
                  {tour.rating} ({tour.reviews} đánh giá)
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
              Đánh giá từ khách hàng ({tour.reviews} đánh giá)
            </h3>

            {/* Rating Summary Banner */}
            <div className="bg-white rounded-lg p-4 mb-6 flex items-center gap-4 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{tour.rating}</div>
                <div className="text-sm text-gray-500">/5</div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${star <= Math.round(tour.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                      }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Dựa trên {tour.reviews} đánh giá
              </div>
            </div>

            {/* Mock Reviews List */}
            <div className="space-y-4">
              {/* Review 1 */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    PB
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Phạm Văn B</span>
                      <span className="text-sm text-gray-500">12/10/2023</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= 5
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình và am hiểu. Cảnh đẹp, dịch vụ tốt. Rất đáng để trải nghiệm!
                    </p>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
                    NT
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Nguyễn Thị C</span>
                      <span className="text-sm text-gray-500">28/09/2023</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= 4
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Chuyến đi rất ấn tượng, đồ ăn ngon, khách sạn sạch sẽ. Chỉ tiếc là thời gian hơi ngắn, ước gì có thêm 1 ngày nữa.
                    </p>
                  </div>
                </div>
              </div>

              {/* Review 3 */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold">
                    TH
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Trần Hoàng D</span>
                      <span className="text-sm text-gray-500">15/08/2023</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= 5
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Đây là lần thứ 2 mình đi tour này và vẫn thấy rất hài lòng. Giá cả hợp lý, chất lượng dịch vụ ổn định. Sẽ giới thiệu cho bạn bè!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-24">
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

            <Button className="w-full h-12 text-lg" onClick={() => setIsBookingModalOpen(true)}>Đặt Tour Ngay</Button>
            <p className="text-xs text-center text-gray-500 mt-4">
              Không tính phí đặt chỗ. Xác nhận ngay lập tức.
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tour={tour}
      />
    </div>
  );
}
