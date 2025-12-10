import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTour, Tour } from "@/context/TourContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, ArrowLeft, Calendar, Users } from "lucide-react";

export default function TourDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTour } = useTour();
  const [tour, setTour] = useState<Tour | undefined>(undefined);
  const [loading, setLoading] = useState(true);

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
      <div className="container mx-auto py-12 text-center">
        <div className="animate-pulse">Đang tải thông tin tour...</div>
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
        <div className="lg:col-span-2 space-y-6">
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
            <p className="text-gray-600 leading-relaxed mb-6">
              {tour.description || "Chưa có mô tả chi tiết cho tour này."}
            </p>

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
        </div>

        {/* Sidebar Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-24">
            <div className="mb-6">
              <span className="text-gray-500">Giá từ</span>
              <div className="text-3xl font-bold text-primary">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(tour.price)}
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

            <Button className="w-full h-12 text-lg">Đặt Tour Ngay</Button>
            <p className="text-xs text-center text-gray-500 mt-4">
              Không tính phí đặt chỗ. Xác nhận ngay lập tức.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
