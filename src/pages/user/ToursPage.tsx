import { useState, useEffect } from "react";
import { Pagination, usePagination } from "@/components/ui/Pagination";
import { useSearchParams } from "react-router-dom";
import { useTour } from "@/context/TourContext";
import { useChat } from "@/context/ChatContext";
import { matchesDateRange } from "@/utils/dateUtils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VoiceSearchButton } from "@/components/ui/VoiceSearchButton";
import { AuthRequiredModal } from "@/components/AuthRequiredModal";
import { TourCard } from "@/components/TourCard";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Calendar as CalendarIcon,
  Star,
  LayoutGrid,
  List,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

const CATEGORIES = [
  "Phiêu lưu",
  "Văn hóa",
  "Thám hiểm",
  "Thành phố",
  "Lãng mạn",
  "Biển",
];
const DURATIONS = ["1-3 Ngày", "4-7 Ngày", "8-14 Ngày", "15+ Ngày"];
const RATINGS = [5, 4, 3];
const TOURS_PER_PAGE = 6;

export default function ToursPage() {
  const [searchParams] = useSearchParams();
  const { tours, loading } = useTour();
  const { setWidgetOpen } = useChat();
  const { isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("visita_tours_view_mode");
    return saved === "list" ? "list" : "grid";
  });
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortOption, setSortOption] = useState<string>("Đề xuất");
  const [currentPage, setCurrentPage] = useState(1);

  // Read location from URL query params on mount
  useEffect(() => {
    const locationParam = searchParams.get("location");
    if (locationParam) {
      setSearchTerm(locationParam);
    }
  }, [searchParams]);

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem("visita_tours_view_mode", viewMode);
  }, [viewMode]);

  // Get date filter params from URL
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  // State for date range filter - initialize from URL or undefined
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    startDateParam ? {
      from: new Date(startDateParam),
      to: endDateParam ? new Date(endDateParam) : undefined
    } : undefined
  );

  // Sync state when URL params change (e.g. navigation from home)
  useEffect(() => {
    if (startDateParam) {
      setDateRange({
        from: new Date(startDateParam),
        to: endDateParam ? new Date(endDateParam) : undefined
      });
    }
  }, [startDateParam, endDateParam]);

  // Helper function to parse duration string to days
  const parseDurationToDays = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Helper function to check if tour duration matches selected duration filters
  const matchesDuration = (tourDuration: string): boolean => {
    if (selectedDurations.length === 0) return true;
    const days = parseDurationToDays(tourDuration);
    return selectedDurations.some((dur) => {
      if (dur === "1-3 Ngày") return days >= 1 && days <= 3;
      if (dur === "4-7 Ngày") return days >= 4 && days <= 7;
      if (dur === "8-14 Ngày") return days >= 8 && days <= 14;
      if (dur === "15+ Ngày") return days >= 15;
      return false;
    });
  };

  // Helper function to check if tour matches selected categories
  const matchesCategory = (tourTags: string[] | undefined): boolean => {
    if (selectedCategories.length === 0) return true;
    if (!tourTags) return false;
    return selectedCategories.some((cat) => tourTags.includes(cat));
  };

  const filteredTours = tours
    .filter(
      (tour) =>
        tour.status === "Hoạt động" &&
        (tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tour.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
        matchesCategory(tour.tags) &&
        matchesDuration(tour.duration) &&
        matchesDateRange(
          tour.startDate,
          tour.endDate,
          dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
          dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined
        ) &&
        tour.rating >= minRating &&
        tour.price >= priceRange[0] &&
        tour.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "Giá: Thấp đến Cao":
          return a.price - b.price;
        case "Giá: Cao đến Thấp":
          return b.price - a.price;
        case "Thời gian: Ngắn đến Dài":
          return parseDurationToDays(a.duration) - parseDurationToDays(b.duration);
        default:
          return 0; // "Đề xuất" - keep original order
      }
    });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange, selectedCategories, selectedDurations, minRating, priceRange, sortOption]);

  // Pagination
  const toursPagination = usePagination(filteredTours, TOURS_PER_PAGE);
  const paginatedTours = toursPagination.getPaginatedItems(currentPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Đang tải danh sách tour...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Breadcrumb & Header */}
      <div className="relative bg-slate-900 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop"
            alt="Vịnh Hạ Long"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-slate-900/90" />
        </div>
        <div className="container relative z-10">
          <div className="flex items-center text-sm text-slate-300 mb-6 font-medium">
            <span className="hover:text-white cursor-pointer transition-colors">
              Trang chủ
            </span>
            <ChevronRight className="h-4 w-4 mx-3 text-slate-500" />
            <span className="text-white">Tour</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Khám phá Việt Nam
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed">
            Khám phá {tours.length}+ trải nghiệm độc đáo, từ leo núi đến dạo
            phố. Cuộc phiêu lưu tiếp theo của bạn bắt đầu tại đây.
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
            </Button>
          </div>

          {/* Mobile Filter Overlay */}
          {showMobileFilters && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          {/* Sidebar Filters */}
          <aside
            className={`
            fixed top-16 bottom-0 left-0 right-0 z-50 bg-white p-6 overflow-y-auto transition-transform duration-300 ease-in-out
            lg:static lg:p-0 lg:bg-transparent lg:w-[280px] lg:block lg:translate-x-0 lg:z-auto
            ${showMobileFilters
                ? "translate-x-0"
                : "-translate-x-full"
              }
          `}
          >
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="text-xl font-bold">Bộ lọc</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-8 px-1">
              {/* Search */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">
                  Tìm kiếm
                </h3>
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="search"
                      placeholder="Tìm kiếm tour..."
                      className="pl-9 bg-white border-slate-200 focus-visible:ring-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <VoiceSearchButton
                    onResult={(text) => setSearchTerm(text)}
                    size="md"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">
                  Thời gian
                </h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-range-picker"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white border-slate-200 hover:bg-slate-50",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Chọn ngày đi - về</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">
                  Khoảng giá
                </h3>
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{priceRange[0].toLocaleString("vi-VN")}đ</span>
                    <span>{priceRange[1].toLocaleString("vi-VN")}đ</span>
                  </div>
                  <input
                    name="priceRange"
                    type="range"
                    min="0"
                    max="100000000"
                    step="500000"
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value)])
                    }
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">
                  Danh mục
                </h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <div className="relative flex items-center">
                        <input
                          name="category"
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => {
                            setSelectedCategories((prev) =>
                              prev.includes(cat)
                                ? prev.filter((c) => c !== cat)
                                : [...prev, cat]
                            );
                          }}
                          className="peer h-4 w-4 border-slate-300 rounded text-primary focus:ring-primary"
                        />
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium">
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">
                  Thời gian
                </h3>
                <div className="space-y-2">
                  {DURATIONS.map((dur) => (
                    <label
                      key={dur}
                      className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <input
                        name="duration"
                        type="checkbox"
                        checked={selectedDurations.includes(dur)}
                        onChange={() => {
                          setSelectedDurations((prev) =>
                            prev.includes(dur)
                              ? prev.filter((d) => d !== dur)
                              : [...prev, dur]
                          );
                        }}
                        className="h-4 w-4 border-slate-300 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium">
                        {dur}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">
                  Đánh giá
                </h3>
                <div className="space-y-2">
                  {RATINGS.map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <input
                        name="rating"
                        type="radio"
                        checked={minRating === rating}
                        onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                        className="h-4 w-4 border-slate-300 rounded text-primary focus:ring-primary"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-slate-200 text-slate-200"
                              }`}
                          />
                        ))}
                        <span className="text-sm text-slate-600 ml-1">
                          trở lên
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-sm text-muted-foreground font-medium">
                <span className="text-foreground font-bold">
                  {filteredTours.length}
                </span>{" "}
                kết quả tìm thấy
              </p>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm flex-shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${viewMode === "grid"
                      ? "bg-slate-100 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${viewMode === "list"
                      ? "bg-slate-100 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <select
                  name="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer min-w-0 flex-1 sm:flex-initial sm:w-auto"
                >
                  <option>Đề xuất</option>
                  <option>Giá: Thấp đến Cao</option>
                  <option>Giá: Cao đến Thấp</option>
                  <option>Thời gian: Ngắn đến Dài</option>
                </select>
              </div>
            </div>
            {/* Grid */}
            <div
              className={`grid gap-6 ${viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1"
                }`}
            >
              {paginatedTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  layout={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={toursPagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-800 shadow-2xl">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
                alt="Background"
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-800/40" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 md:p-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-medium">
                    Hỗ trợ trực tuyến 24/7
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  Sẵn sàng lên kế hoạch cho <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    kỳ nghỉ mơ ước?
                  </span>
                </h2>

                <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                  Các chuyên gia tư vấn du lịch của chúng tôi luôn sẵn sàng hỗ
                  trợ bạn lên lịch trình hoàn hảo. Không có câu hỏi nào là quá
                  nhỏ.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-base shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <span className="mr-2">📞</span> Gọi 1900 1234
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setAuthModalOpen(true);
                        return;
                      }
                      setWidgetOpen(true);
                    }}
                    className="h-14 px-8 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-white hover:border-white/40 font-medium text-base backdrop-blur-md transition-all"
                  >
                    Chat với chuyên gia
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block relative">
                <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                      MH
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Minh Hoàng</h4>
                      <p className="text-slate-400 text-sm">
                        Chuyên gia du lịch
                      </p>
                    </div>
                    <div className="ml-auto text-yellow-400 flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-200 italic">
                    "Chúng tôi đã có một khoảng thời gian tuyệt vời! Lịch trình
                    hoàn hảo và đội ngũ hỗ trợ luôn có mặt khi chúng tôi cần.
                    Rất khuyến khích!"
                  </p>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-emerald-500/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          setWidgetOpen(true);
        }}
        message="Vui lòng đăng nhập để chat với chuyên gia tư vấn."
      />
    </div >
  );
}
