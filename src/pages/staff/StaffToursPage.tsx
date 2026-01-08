import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getCoverImage, type Tour } from "@/context/TourContext";
import { fetchStaffTours } from "@/api/staffService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Map,
    Calendar,
    Users,
    Star,
    Clock,
    ArrowUpDown,
    Loader2,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 6;

type SortField = "title" | "price" | "rating";
type SortDirection = "asc" | "desc";

export default function StaffToursPage() {
    const { user } = useAuth();
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("title");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch tours assigned to the current staff member
    const loadStaffTours = useCallback(async () => {
        if (!user?.userId) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch all tours for this staff (size=100 to get all in one request)
            const result = await fetchStaffTours(user.userId, { page: 0, size: 100 });
            setTours(result.content);
        } catch (err) {
            console.error("Error loading staff tours:", err);
            setError("Không thể tải danh sách tour. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [user?.userId]);

    useEffect(() => {
        loadStaffTours();
    }, [loadStaffTours]);

    // Filter active tours only and apply search
    const filteredTours = useMemo(() => {
        return tours
            .filter((tour) => tour.status === "Hoạt động")
            .filter((tour) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                    tour.title.toLowerCase().includes(query) ||
                    tour.location.toLowerCase().includes(query)
                );
            })
            .sort((a, b) => {
                let comparison = 0;
                switch (sortField) {
                    case "title":
                        comparison = a.title.localeCompare(b.title);
                        break;
                    case "price":
                        comparison = a.price - b.price;
                        break;
                    case "rating":
                        comparison = a.rating - b.rating;
                        break;
                }
                return sortDirection === "asc" ? comparison : -comparison;
            });
    }, [tours, searchQuery, sortField, sortDirection]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE);
    const paginatedTours = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTours.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTours, currentPage]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
                <p className="mb-4">{error}</p>
                <Button onClick={loadStaffTours}>Thử lại</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Map className="h-7 w-7 text-primary" />
                <h1 className="text-2xl font-bold">Danh sách Tour</h1>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="tour-search"
                        name="tour-search"
                        placeholder="Tìm kiếm tour..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                        className="pl-9"
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSort("title")}
                        className={cn(sortField === "title" && "bg-muted")}
                    >
                        <ArrowUpDown className="h-4 w-4 mr-1" />
                        Tên
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSort("price")}
                        className={cn(sortField === "price" && "bg-muted")}
                    >
                        <ArrowUpDown className="h-4 w-4 mr-1" />
                        Giá
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSort("rating")}
                        className={cn(sortField === "rating" && "bg-muted")}
                    >
                        <ArrowUpDown className="h-4 w-4 mr-1" />
                        Đánh giá
                    </Button>
                </div>
            </div>

            {/* Tours Grid */}
            {filteredTours.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Không tìm thấy tour nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedTours.map((tour) => (
                        <div
                            key={tour.id}
                            className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Tour Image */}
                            <div className="relative h-44 overflow-hidden">
                                <img
                                    src={getCoverImage(tour)}
                                    alt={tour.title}
                                    className="w-full h-full object-cover"
                                />
                                {tour.tags && tour.tags.length > 0 && (
                                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                                        {tour.tags.slice(0, 2).map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="bg-white/90 text-xs"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tour Info */}
                            <div className="p-4 space-y-3">
                                <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
                                    {tour.title}
                                </h3>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Map className="h-4 w-4" />
                                        <span className="truncate">{tour.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{tour.duration}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-sm">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-medium">{tour.rating}</span>
                                        <span className="text-muted-foreground">
                                            ({tour.reviews})
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary">
                                            {formatCurrency(tour.price)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">/người</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2 border-t">
                                    <Link to={`/staff/booking/${tour.tourUuid}`} className="flex-1">
                                        <Button className="w-full" size="sm" title="Đặt tour cho khách">
                                            <Users className="h-4 w-4 mr-1" />
                                            Đặt tour
                                        </Button>
                                    </Link>
                                    <Link to={`/tours/${tour.tourUuid}`} target="_blank">
                                        <Button variant="outline" size="sm" title="Lịch trình">
                                            <Calendar className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {/* Pagination & Summary */}
            <div className="space-y-4">
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="text-sm text-muted-foreground">
                            Trang {currentPage} / {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={currentPage === totalPages}
                            >
                                Sau
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
                <div className="text-sm text-muted-foreground text-center">
                    Hiển thị {paginatedTours.length} trên tổng số {filteredTours.length} tour
                </div>
            </div>
        </div>
    );
}
