import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Star,
  Search,
  Users,
  ArrowRight,
  Shield,
  Globe,
  Clock,
  CheckCircle2,
} from "lucide-react";

const TRENDING_DESTINATIONS = [
  "Hạ Long, Quảng Ninh",
  "Đà Nẵng",
  "Phú Quốc",
  "Hội An",
  "Sapa",
  "Nha Trang",
  "Đà Lạt",
  "Huế",
];

const FEATURED_TOURS = [
  {
    id: 1,
    title: "Khám phá Vịnh Hạ Long",
    location: "Quảng Ninh",
    price: 3500000,
    duration: "2 Ngày",
    rating: 4.9,
    reviews: 124,
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Bán chạy",
  },
  {
    id: 2,
    title: "Văn hóa Cố đô Huế",
    location: "Huế",
    price: 2500000,
    duration: "3 Ngày",
    rating: 4.8,
    reviews: 89,
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Văn hóa",
  },
  {
    id: 3,
    title: "Nghỉ dưỡng Phú Quốc",
    location: "Kiên Giang",
    price: 5000000,
    duration: "4 Ngày",
    rating: 4.9,
    reviews: 210,
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2938&auto=format&fit=crop",
    tag: "Lãng mạn",
  },
];

const POPULAR_DESTINATIONS = [
  {
    name: "Đà Nẵng",
    count: "120+ Tour",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Hà Nội",
    count: "85+ Tour",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Hồ Chí Minh",
    count: "90+ Tour",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sapa",
    count: "75+ Tour",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80",
  },
];

export default function HomePage() {
  const [locationQuery, setLocationQuery] = useState("");
  const [showDestinations, setShowDestinations] = useState(false);

  const filteredDestinations = TRENDING_DESTINATIONS.filter((dest) =>
    dest.toLowerCase().includes(locationQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover animate-in fade-in duration-1000"
          />
        </div>

        <div className="relative z-20 container px-4 md:px-6 flex flex-col items-center text-center space-y-8 pt-20">
          <div className="space-y-4 max-w-3xl animate-in slide-in-from-bottom-8 duration-1000 delay-100">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm mb-4"
            >
              Khám phá thế giới cùng chúng tôi
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
              Hành trình của bạn bắt đầu tại{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                đây
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-100 max-w-[700px] mx-auto drop-shadow-md font-light">
              Khám phá hơn 5.000+ tour du lịch được tuyển chọn và những cuộc
              phiêu lưu tại những điểm đến đẹp nhất thế giới.
            </p>
          </div>

          {/* Search Widget */}
          <div className="w-full max-w-5xl animate-in slide-in-from-bottom-8 duration-1000 delay-200">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl overflow-visible">
              <CardContent className="p-3 md:p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr,1fr,auto] gap-3">
                  {/* Location Input */}
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="relative">
                      <Input
                        name="location"
                        placeholder="Bạn muốn đi đâu?"
                        className="pl-12 h-14 text-base border-0 bg-slate-50 hover:bg-slate-100 focus-visible:ring-0 focus-visible:bg-white rounded-xl transition-all shadow-sm"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onFocus={() => setShowDestinations(true)}
                        onBlur={() =>
                          setTimeout(() => setShowDestinations(false), 200)
                        }
                      />
                      {showDestinations && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-slate-50">
                            {locationQuery ? "Gợi ý" : "Điểm đến phổ biến"}
                          </div>
                          <ul className="py-2 max-h-[300px] overflow-y-auto">
                            {filteredDestinations.length > 0 ? (
                              filteredDestinations.map((dest) => (
                                <li
                                  key={dest}
                                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 text-sm transition-colors"
                                  onClick={() => {
                                    setLocationQuery(dest);
                                    setShowDestinations(false);
                                  }}
                                >
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <MapPin className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-medium text-slate-700">
                                    {dest}
                                  </span>
                                </li>
                              ))
                            ) : (
                              <div className="p-4 text-sm text-muted-foreground text-center">
                                Không tìm thấy điểm đến
                              </div>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date Input */}
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <Input
                      name="date"
                      type="date"
                      className="pl-12 h-14 text-base border-0 bg-slate-50 hover:bg-slate-100 focus-visible:ring-0 focus-visible:bg-white rounded-xl transition-all shadow-sm"
                    />
                  </div>

                  {/* Guests Input */}
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Users className="h-5 w-5" />
                    </div>
                    <Input
                      name="guests"
                      placeholder="Số khách"
                      type="number"
                      min={1}
                      className="pl-12 h-14 text-base border-0 bg-slate-50 hover:bg-slate-100 focus-visible:ring-0 focus-visible:bg-white rounded-xl transition-all shadow-sm"
                    />
                  </div>

                  {/* Search Button */}
                  <Button
                    size="lg"
                    className="h-14 px-8 text-base font-semibold shadow-lg rounded-xl hover:scale-105 transition-transform duration-200"
                  >
                    <Search className="mr-2 h-5 w-5" /> Tìm kiếm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Điểm đến đa dạng</h3>
              <p className="text-muted-foreground">
                Tiếp cận hơn 500+ điểm đến trên toàn cầu với hướng dẫn viên
                chuyên nghiệp.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Đảm bảo giá tốt nhất</h3>
              <p className="text-muted-foreground">
                Chúng tôi đảm bảo bạn nhận được mức giá tốt nhất cho các tour du
                lịch của mình mà không có phí ẩn.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Đặt tour dễ dàng</h3>
              <p className="text-muted-foreground">
                Quy trình đặt tour liền mạch với xác nhận ngay lập tức và hỗ trợ
                24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Điểm đến phổ biến
              </h2>
              <p className="text-muted-foreground text-lg">
                Khám phá những địa điểm được ghé thăm nhiều nhất trong mùa này.
              </p>
            </div>
            <Button variant="outline" className="group">
              Xem tất cả điểm đến{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_DESTINATIONS.map((dest, idx) => (
              <div
                key={idx}
                className="group relative h-[300px] rounded-2xl overflow-hidden cursor-pointer"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{dest.name}</h3>
                  <p className="text-sm font-medium opacity-90">{dest.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Tour nổi bật
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Những tour du lịch được du khách yêu thích nhất. Trải nghiệm những
              điều tuyệt vời nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_TOURS.map((tour) => (
              <Card
                key={tour.id}
                className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl"
              >
                <div className="relative h-[240px] overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <Badge className="absolute top-4 right-4 bg-white/90 text-black hover:bg-white font-semibold shadow-sm">
                    {tour.tag}
                  </Badge>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> {tour.location}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">
                      {tour.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-primary" />
                      {tour.duration}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1.5 text-yellow-500 fill-yellow-500" />
                      {tour.rating} ({tour.reviews})
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Từ
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {tour.price.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                    <Button className="rounded-full px-6">Xem chi tiết</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Xem tất cả tour
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2938&auto=format&fit=crop"
            alt="Newsletter Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Cảm hứng du lịch, gửi đến bạn
            </h2>
            <p className="text-lg md:text-xl text-slate-200">
              Tham gia cùng 50.000+ du khách và nhận ưu đãi độc quyền, mẹo
              chuyên gia và hướng dẫn điểm đến được gửi thẳng vào hộp thư đến
              của bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Input
                name="email"
                autoComplete="email"
                placeholder="Địa chỉ email của bạn"
                className="h-14 bg-transparent border-0 text-white placeholder:text-white/60 focus-visible:ring-0 text-base"
              />
              <Button
                size="lg"
                className="h-14 px-8 rounded-xl bg-white text-primary hover:bg-slate-100 font-bold text-base"
              >
                Đăng ký ngay
              </Button>
            </div>
            <p className="text-sm text-slate-400">
              Không spam, hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
