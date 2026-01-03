import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    MapPin,
    ChevronRight,
    ArrowRight,
    Palmtree,
    Mountain,
    Building2,
    Landmark,
    TreePine,
    TrendingUp,
    Calendar,
} from "lucide-react";

// Types
type Region = "all" | "north" | "central" | "south";
type Category = "beach" | "mountain" | "city" | "heritage" | "eco";

interface Destination {
    id: string;
    name: string;
    province: string;
    region: "north" | "central" | "south";
    description: string;
    image: string;
    tourCount: number;
    categories: Category[];
    bestSeason: string;
    isTrending?: boolean;
}

// Category configuration
const CATEGORIES: { id: Category; label: string; icon: React.ElementType }[] = [
    { id: "beach", label: "Biển đảo", icon: Palmtree },
    { id: "mountain", label: "Núi rừng", icon: Mountain },
    { id: "city", label: "Thành phố", icon: Building2 },
    { id: "heritage", label: "Di sản văn hóa", icon: Landmark },
    { id: "eco", label: "Sinh thái", icon: TreePine },
];

// Region configuration
const REGIONS: { id: Region; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "north", label: "Miền Bắc" },
    { id: "central", label: "Miền Trung" },
    { id: "south", label: "Miền Nam" },
];

// Mock destinations data
const DESTINATIONS: Destination[] = [
    {
        id: "ha-long",
        name: "Vịnh Hạ Long",
        province: "Quảng Ninh",
        region: "north",
        description: "Di sản thiên nhiên thế giới UNESCO với hàng nghìn đảo đá vôi",
        image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop",
        tourCount: 120,
        categories: ["beach", "heritage"],
        bestSeason: "Tháng 10 - Tháng 4",
        isTrending: true,
    },
    {
        id: "sapa",
        name: "Sapa",
        province: "Lào Cai",
        region: "north",
        description: "Thị trấn sương mù với ruộng bậc thang và văn hóa dân tộc",
        image: "https://images.unsplash.com/photo-1570366583862-f91883984fde?q=80&w=2070&auto=format&fit=crop",
        tourCount: 75,
        categories: ["mountain", "heritage"],
        bestSeason: "Tháng 9 - Tháng 11",
        isTrending: true,
    },
    {
        id: "ha-giang",
        name: "Hà Giang",
        province: "Hà Giang",
        region: "north",
        description: "Cao nguyên đá hùng vĩ với cung đường phượt đẹp nhất Việt Nam",
        image: "https://images.unsplash.com/photo-1686755660203-55781dbc2f24?q=80&w=2070&auto=format&fit=crop",
        tourCount: 45,
        categories: ["mountain", "eco"],
        bestSeason: "Tháng 10 - Tháng 12",
    },
    {
        id: "ha-noi",
        name: "Hà Nội",
        province: "Hà Nội",
        region: "north",
        description: "Thủ đô ngàn năm văn hiến với phố cổ và ẩm thực đường phố",
        image: "https://images.unsplash.com/photo-1576513500959-4f29b3fed28f?q=80&w=2070&auto=format&fit=crop",
        tourCount: 85,
        categories: ["city", "heritage"],
        bestSeason: "Tháng 9 - Tháng 11",
    },
    {
        id: "da-nang",
        name: "Đà Nẵng",
        province: "Đà Nẵng",
        region: "central",
        description: "Thành phố biển năng động với Bà Nà Hills và cầu Vàng nổi tiếng",
        image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2070&auto=format&fit=crop",
        tourCount: 120,
        categories: ["beach", "city"],
        bestSeason: "Tháng 3 - Tháng 8",
        isTrending: true,
    },
    {
        id: "hoi-an",
        name: "Hội An",
        province: "Quảng Nam",
        region: "central",
        description: "Phố cổ đèn lồng lãng mạn, di sản văn hóa thế giới UNESCO",
        image: "https://images.unsplash.com/photo-1758178673639-fce25e582cbd?q=80?q=80&w=2070&auto=format&fit=crop",
        tourCount: 90,
        categories: ["heritage", "city"],
        bestSeason: "Tháng 2 - Tháng 5",
    },
    {
        id: "hue",
        name: "Huế",
        province: "Thừa Thiên Huế",
        region: "central",
        description: "Cố đô triều Nguyễn với lăng tẩm, đền đài và ẩm thực cung đình",
        image: "https://images.unsplash.com/photo-1674798201360-745535e67e6e?q=80&w=2070&auto=format&fit=crop",
        tourCount: 65,
        categories: ["heritage"],
        bestSeason: "Tháng 1 - Tháng 4",
    },
    {
        id: "quang-binh",
        name: "Quảng Bình",
        province: "Quảng Bình",
        region: "central",
        description: "Vương quốc hang động với Sơn Đoòng - hang động lớn nhất thế giới",
        image: "https://images.unsplash.com/photo-1758298134919-e1beb8048ac0?q=80&w=2070&auto=format&fit=crop",
        tourCount: 40,
        categories: ["eco", "mountain"],
        bestSeason: "Tháng 4 - Tháng 8",
        isTrending: true,
    },
    {
        id: "da-lat",
        name: "Đà Lạt",
        province: "Lâm Đồng",
        region: "south",
        description: "Thành phố ngàn hoa với khí hậu mát mẻ quanh năm",
        image: "https://images.unsplash.com/photo-1552310065-aad9ebece999?q=80&w=2070&auto=format&fit=crop",
        tourCount: 95,
        categories: ["mountain", "eco"],
        bestSeason: "Tháng 11 - Tháng 3",
    },
    {
        id: "phu-quoc",
        name: "Phú Quốc",
        province: "Kiên Giang",
        region: "south",
        description: "Đảo ngọc với bãi biển hoang sơ và sunset tuyệt đẹp",
        image: "https://images.unsplash.com/photo-1730714103959-5d5a30acf547?q=80&w=2938&auto=format&fit=crop",
        tourCount: 110,
        categories: ["beach"],
        bestSeason: "Tháng 11 - Tháng 4",
        isTrending: true,
    },
    {
        id: "ho-chi-minh",
        name: "Hồ Chí Minh",
        province: "TP. Hồ Chí Minh",
        region: "south",
        description: "Thành phố sôi động nhất Việt Nam với kiến trúc Pháp cổ điển",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070&auto=format&fit=crop",
        tourCount: 90,
        categories: ["city"],
        bestSeason: "Tháng 12 - Tháng 4",
    },
    {
        id: "mui-ne",
        name: "Mũi Né",
        province: "Bình Thuận",
        region: "south",
        description: "Bãi biển với đồi cát đỏ độc đáo và thiên đường lướt ván",
        image: "https://images.unsplash.com/photo-1617620217902-5a6eefe41fa7?q=80&w=2070&auto=format&fit=crop",
        tourCount: 55,
        categories: ["beach"],
        bestSeason: "Tháng 11 - Tháng 4",
    },
];

export default function DestinationsPage() {
    const [selectedRegion, setSelectedRegion] = useState<Region>("all");
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

    // Filter destinations
    const filteredDestinations = DESTINATIONS.filter((dest) => {
        const matchesRegion = selectedRegion === "all" || dest.region === selectedRegion;
        const matchesCategory =
            selectedCategories.length === 0 ||
            selectedCategories.some((cat) => dest.categories.includes(cat));
        return matchesRegion && matchesCategory;
    });

    // Trending destinations
    const trendingDestinations = DESTINATIONS.filter((dest) => dest.isTrending);

    const toggleCategory = (category: Category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const getCategoryIcon = (category: Category) => {
        const cat = CATEGORIES.find((c) => c.id === category);
        return cat?.icon || MapPin;
    };

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative bg-slate-900 py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1480996408299-fc0e830b5db1?q=80&w=2070&auto=format&fit=crop"
                        alt="Đèo Khau Phạ"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-slate-900/90" />
                </div>
                <div className="container relative z-10">
                    <div className="flex items-center text-sm text-slate-300 mb-6 font-medium">
                        <Link to="/" className="hover:text-white cursor-pointer transition-colors">
                            Trang chủ
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-3 text-slate-500" />
                        <span className="text-white">Điểm đến</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                        Khám phá điểm đến{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            Việt Nam
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed mb-8">
                        Từ những bãi biển hoang sơ đến núi rừng hùng vĩ, khám phá vẻ đẹp đa
                        dạng của đất nước hình chữ S.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <MapPin className="h-4 w-4 text-blue-400" />
                            <span className="font-semibold text-white">34</span> Tỉnh thành
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <Landmark className="h-4 w-4 text-amber-400" />
                            <span className="font-semibold text-white">500+</span> Điểm đến
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <Calendar className="h-4 w-4 text-emerald-400" />
                            <span className="font-semibold text-white">1000+</span> Tour
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="bg-white border-b sticky top-16 z-30">
                <div className="container py-4">
                    {/* Region Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {REGIONS.map((region) => (
                            <button
                                key={region.id}
                                onClick={() => setSelectedRegion(region.id)}
                                className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${selectedRegion === region.id
                                    ? "bg-primary text-white shadow-md"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {region.label}
                            </button>
                        ))}
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((category) => {
                            const Icon = category.icon;
                            const isSelected = selectedCategories.includes(category.id);
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => toggleCategory(category.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isSelected
                                        ? "bg-primary/10 text-primary border-2 border-primary"
                                        : "bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {category.label}
                                </button>
                            );
                        })}
                        {selectedCategories.length > 0 && (
                            <button
                                onClick={() => setSelectedCategories([])}
                                className="px-4 py-2 rounded-full text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Trending Section */}
            <section className="py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
                <div className="container">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-semibold text-sm">Hot tháng 12</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold">Điểm đến thịnh hành</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trendingDestinations.map((dest) => (
                            <Link
                                key={dest.id}
                                to={`/tours?location=${encodeURIComponent(dest.name)}`}
                                className="group relative h-[280px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                    {dest.tourCount}+ Tour
                                </Badge>
                                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                    <h3 className="text-xl font-bold mb-1">{dest.name}</h3>
                                    <p className="text-sm text-slate-200 opacity-90 line-clamp-2">
                                        {dest.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Destinations Grid */}
            <section className="py-16">
                <div className="container">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">Tất cả điểm đến</h2>
                            <p className="text-muted-foreground">
                                Tìm thấy <span className="font-semibold text-foreground">{filteredDestinations.length}</span> điểm đến
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDestinations.map((dest) => (
                            <Card
                                key={dest.id}
                                className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl"
                            >
                                <div className="relative h-[200px] overflow-hidden">
                                    <img
                                        src={dest.image}
                                        alt={dest.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <Badge className="absolute top-3 left-3 bg-white/90 text-slate-900 hover:bg-white border-0">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {dest.province}
                                    </Badge>
                                    <Badge className="absolute top-3 right-3 bg-primary text-white border-0">
                                        {dest.tourCount}+ Tour
                                    </Badge>
                                </div>
                                <CardContent className="p-5">
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                        {dest.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {dest.description}
                                    </p>

                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {dest.categories.slice(0, 2).map((cat) => {
                                            const Icon = getCategoryIcon(cat);
                                            const catInfo = CATEGORIES.find((c) => c.id === cat);
                                            return (
                                                <span
                                                    key={cat}
                                                    className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
                                                >
                                                    <Icon className="h-3 w-3" />
                                                    {catInfo?.label}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {/* Best Season */}
                                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                        Mùa đẹp: {dest.bestSeason}
                                    </div>

                                    <Link to={`/tours?location=${encodeURIComponent(dest.name)}`}>
                                        <Button className="w-full rounded-xl group/btn">
                                            Xem tour
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredDestinations.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-lg text-muted-foreground">
                                Không tìm thấy điểm đến phù hợp. Thử điều chỉnh bộ lọc của bạn.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => {
                                    setSelectedRegion("all");
                                    setSelectedCategories([]);
                                }}
                            >
                                Xóa tất cả bộ lọc
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="container">
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-primary to-blue-600 shadow-2xl">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                        </div>
                        <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Chưa tìm được điểm đến ưng ý?
                            </h2>
                            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                                Để lại thông tin, chuyên gia tư vấn của chúng tôi sẽ giúp bạn lên
                                kế hoạch cho chuyến đi hoàn hảo.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/contact">
                                    <Button
                                        size="lg"
                                        className="h-14 px-8 rounded-2xl bg-white text-primary hover:bg-slate-100 font-bold text-base"
                                    >
                                        Liên hệ tư vấn
                                    </Button>
                                </Link>
                                <Link to="/tours">
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        className="h-14 px-8 rounded-2xl border-2 border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white font-bold text-base"
                                    >
                                        Xem tất cả tour
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
