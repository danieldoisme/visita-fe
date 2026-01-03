import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MapPin,
  Calendar as CalendarIcon,
  Search,
  Users,
  ArrowRight,
  Shield,
  Globe,
  CheckCircle2,
  X,
  Minus,
  Plus,
} from "lucide-react";
import { VoiceSearchButton } from "@/components/ui/VoiceSearchButton";
import { TourCard } from "@/components/TourCard";
import { Tour } from "@/context/TourContext";

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

const FEATURED_TOURS: Tour[] = [
  {
    id: 1,
    title: "Khám phá Vịnh Hạ Long",
    location: "Quảng Ninh",
    price: 3500000,
    duration: "2 Ngày",
    rating: 4.9,
    reviews: 124,
    images: [{ id: "f1", url: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop", isPrimary: true, order: 0 }],
    tags: ["Bán chạy"],
    status: "Hoạt động",
  },
  {
    id: 2,
    title: "Văn hóa Cố đô Huế",
    location: "Huế",
    price: 2500000,
    duration: "3 Ngày",
    rating: 4.8,
    reviews: 89,
    images: [{ id: "f2", url: "https://images.unsplash.com/photo-1674798201360-745535e67e6e?q=80&w=2070&auto=format&fit=crop", isPrimary: true, order: 0 }],
    tags: ["Văn hóa"],
    status: "Hoạt động",
  },
  {
    id: 3,
    title: "Nghỉ dưỡng Phú Quốc",
    location: "Kiên Giang",
    price: 5000000,
    duration: "4 Ngày",
    rating: 4.9,
    reviews: 210,
    images: [{ id: "f3", url: "https://images.unsplash.com/photo-1730714103959-5d5a30acf547?q=80&w=2938&auto=format&fit=crop", isPrimary: true, order: 0 }],
    tags: ["Lãng mạn"],
    status: "Hoạt động",
  },
];

const POPULAR_DESTINATIONS = [
  {
    name: "Đà Nẵng",
    count: "120+ Tour",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Hà Nội",
    count: "85+ Tour",
    image:
      "https://images.unsplash.com/photo-1576513500959-4f29b3fed28f?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Hồ Chí Minh",
    count: "90+ Tour",
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Sapa",
    count: "75+ Tour",
    image:
      "https://images.unsplash.com/photo-1570366583862-f91883984fde?q=80&w=2070&auto=format&fit=crop",
  },
];

// Mock AI-recommended tours based on user history (thesis: Recommendation System)
const AI_RECOMMENDED_TOURS: Tour[] = [
  {
    id: 101,
    title: "Khám phá Hang Sơn Đoòng",
    location: "Quảng Bình",
    price: 8500000,
    duration: "4 Ngày",
    rating: 4.9,
    reviews: 56,
    images: [{ id: "ai1", url: "https://images.unsplash.com/photo-1638793772999-8df79f0ef0b8?q=80&w=2070&auto=format&fit=crop", isPrimary: true, order: 0 }],
    tags: ["Phiêu lưu"],
    status: "Hoạt động",
  },
  {
    id: 102,
    title: "Trekking Hà Giang Loop",
    location: "Hà Giang",
    price: 4200000,
    duration: "3 Ngày",
    rating: 4.8,
    reviews: 92,
    images: [{ id: "ai2", url: "https://images.unsplash.com/photo-1686755660203-55781dbc2f24?q=80&w=2070&auto=format&fit=crop", isPrimary: true, order: 0 }],
    tags: ["Trekking"],
    status: "Hoạt động",
  },
  {
    id: 103,
    title: "Thiên đường biển Côn Đảo",
    location: "Bà Rịa - Vũng Tàu",
    price: 6800000,
    duration: "3 Ngày",
    rating: 4.9,
    reviews: 78,
    images: [{ id: "ai3", url: "https://images.unsplash.com/photo-1725433734976-9be2e772d0bc?q=80&w=2070&auto=format&fit=crop", isPrimary: true, order: 0 }],
    tags: ["Biển đảo"],
    status: "Hoạt động",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [locationQuery, setLocationQuery] = useState("");
  const [showDestinations, setShowDestinations] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const isMobile = useIsMobile();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (locationQuery) params.append("location", locationQuery);
    if (date?.from) params.append("startDate", format(date.from, "yyyy-MM-dd"));
    if (date?.to) params.append("endDate", format(date.to, "yyyy-MM-dd"));
    params.append("adults", adults.toString());
    params.append("children", children.toString());

    navigate(`/tours?${params.toString()}`);
  };

  const filteredDestinations = TRENDING_DESTINATIONS.filter((dest) =>
    dest.toLowerCase().includes(locationQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop"
            alt="Vịnh Hạ Long - Di sản Thế giới UNESCO"
            className="w-full h-full object-cover animate-in fade-in zoom-in-105 duration-1000 fill-mode-both"
          />
        </div>

        <div className="relative z-20 container px-4 md:px-6 flex flex-col items-center text-center space-y-8 pt-20">
          <div className="space-y-4 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm mb-4"
            >
              Khám phá Việt Nam cùng chúng tôi
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
              Hành trình của bạn bắt đầu tại{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                đây
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-100 max-w-[700px] mx-auto drop-shadow-md font-light">
              Khám phá hơn 1.000+ tour du lịch được tuyển chọn và những cuộc
              phiêu lưu tại những điểm đến đẹp nhất Việt Nam.
            </p>
          </div>

          {/* Search Widget */}
          <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both">
            <div className="bg-white rounded-3xl md:rounded-full shadow-2xl p-2 md:p-3">
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr,1fr,1fr,auto] gap-2 md:gap-0 md:divide-x divide-slate-100">
                {/* Location Input */}
                <Popover open={showDestinations} onOpenChange={setShowDestinations}>
                  <div
                    data-search-widget
                    className="relative group px-4 py-2 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    <label
                      htmlFor="location-input"
                      className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1"
                    >
                      Địa điểm
                    </label>
                    <PopoverAnchor asChild>
                      <div className="relative flex items-center">
                        <MapPin className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <input
                          id="location-input"
                          name="location-input"
                          type="text"
                          placeholder="Bạn muốn đi đâu?"
                          className="flex-1 bg-transparent border-0 p-0 text-base font-medium placeholder:text-muted-foreground/70 focus:ring-0 focus:outline-none"
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                          onFocus={() => setShowDestinations(true)}
                        />
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <VoiceSearchButton
                            onResult={(text) => setLocationQuery(text)}
                            size="sm"
                          />
                          {locationQuery && (
                            <button
                              onClick={() => setLocationQuery("")}
                              className="p-1 hover:bg-slate-200 rounded-full text-muted-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </PopoverAnchor>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0 rounded-2xl overflow-hidden"
                      align="start"
                      side="bottom"
                      avoidCollisions={false}
                      sideOffset={16}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onInteractOutside={(e) => {
                        // Prevent closing when clicking inside the search widget
                        const target = e.target as HTMLElement;
                        if (target.closest("[data-search-widget]")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-slate-50">
                        Điểm đến
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
                    </PopoverContent>
                  </div>
                </Popover>

                {/* Date Range Picker */}
                <div className="col-span-2 relative group px-4 py-2 hover:bg-slate-50 rounded-2xl transition-colors">
                  <label
                    htmlFor="date-range-picker"
                    className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1"
                  >
                    Thời gian
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-range-picker"
                        variant={"ghost"}
                        className={cn(
                          "w-full justify-start text-left font-medium p-0 h-auto hover:bg-transparent text-base text-slate-700",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "dd/MM/yyyy")} -{" "}
                              {format(date.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(date.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span>Chọn ngày đi - về</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={isMobile ? 1 : 2}
                        disabled={{ before: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Guests */}
                <div className="relative group px-4 py-2 hover:bg-slate-50 rounded-2xl transition-colors">
                  <label
                    htmlFor="guest-selector"
                    className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1"
                  >
                    Khách
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="guest-selector"
                        variant="ghost"
                        className="w-full justify-start text-left font-medium p-0 h-auto hover:bg-transparent text-base text-slate-700"
                      >
                        <Users className="h-5 w-5 text-primary mr-2" />
                        {adults + children} Khách
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-72 p-4 rounded-2xl"
                      align={isMobile ? "center" : "start"}
                    >
                      {/* Adults */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold">Người lớn</p>
                          <p className="text-xs text-muted-foreground">
                            Từ 12 tuổi
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            disabled={adults <= 1}
                            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-4 text-center font-medium">
                            {adults}
                          </span>
                          <button
                            onClick={() => setAdults(adults + 1)}
                            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Trẻ em</p>
                          <p className="text-xs text-muted-foreground">
                            Dưới 12 tuổi
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setChildren(Math.max(0, children - 1))
                            }
                            disabled={children <= 0}
                            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-4 text-center font-medium">
                            {children}
                          </span>
                          <button
                            onClick={() => setChildren(children + 1)}
                            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Search Button */}
                <div className="flex items-center justify-center md:justify-end p-2">
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    className="w-full md:w-auto h-12 md:h-14 px-6 md:px-8 rounded-full bg-primary hover:bg-primary/90 text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <Search className="mr-2 h-5 w-5" /> Tìm kiếm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recommendations Section - Only shown when authenticated */}
      {isAuthenticated && (
        <section className="py-20 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0"
                >
                  ✨ AI Recommendation
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  Gợi ý dành riêng cho bạn
                </h2>
                <p className="text-muted-foreground text-lg">
                  Dựa trên lịch sử tìm kiếm và sở thích của bạn, AI của chúng tôi
                  đề xuất những hành trình phù hợp nhất.
                </p>
              </div>
              <Button variant="outline" className="group">
                Xem thêm gợi ý{" "}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {AI_RECOMMENDED_TOURS.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  variant="recommended"
                  accentColor="purple"
                  showFavorite={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}

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
                Tiếp cận hơn 63+ tỉnh thành trên toàn quốc với hướng dẫn viên
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
            <Link to="/destinations">
              <Button variant="outline" className="group">
                Xem tất cả điểm đến{" "}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_DESTINATIONS.map((dest, idx) => (
              <Link
                to={`/tours?location=${encodeURIComponent(dest.name)}`}
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
              </Link>
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
              <TourCard
                key={tour.id}
                tour={tour}
                variant="featured"
                showFavorite={false}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/tours">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                Xem tất cả tour
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?q=80&w=2070&auto=format&fit=crop"
            alt="Tràng An - Ninh Bình"
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Cảm ơn bạn đã đăng ký!");
              }}
              className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
            >
              <Input
                name="email"
                aria-label="Địa chỉ email"
                autoComplete="email"
                placeholder="Địa chỉ email của bạn"
                className="h-14 bg-transparent border-0 text-white placeholder:text-white/60 focus-visible:ring-0 text-base"
              />
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 rounded-xl bg-white text-primary hover:bg-slate-100 font-bold text-base"
              >
                Đăng ký ngay
              </Button>
            </form>
            <p className="text-sm text-slate-400">
              Không spam, hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
