import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Tour image structure for multi-image support
export interface TourImage {
  id: string;           // Unique ID
  url: string;          // Image URL (Cloudinary URL in production)
  isPrimary: boolean;   // Cover image designation
  order: number;        // Display order (0-based)
  caption?: string;     // Optional caption
  altText?: string;     // Accessibility alt text
}

export interface Tour {
  id: number;
  title: string;
  location: string;
  price: number;
  duration: string;
  images: TourImage[];  // Multiple images with ordering
  image?: string;       // Legacy field for backwards compatibility
  rating: number;
  reviews: number;
  category?: string;
  status: "Hoạt động" | "Nháp" | "Đã đóng";
  description?: string;
  bookings?: number;
  originalPrice?: number;
  difficulty?: string;
  tags?: string[];
  features?: string[];
  startDate?: string;   // Tour start date (ISO format "YYYY-MM-DD")
  endDate?: string;     // Tour end date (ISO format "YYYY-MM-DD")
}

// Helper function to get the primary/cover image URL
export const getCoverImage = (tour: Tour): string => {
  const primaryImage = tour.images?.find((img) => img.isPrimary);
  if (primaryImage) return primaryImage.url;
  if (tour.images?.length > 0) return tour.images[0].url;
  return tour.image || "";
};

interface TourContextType {
  tours: Tour[];
  loading: boolean;
  getTour: (id: number) => Promise<Tour | undefined>;
  getRecommendedTours: (currentTourId: number, category?: string) => Promise<Tour[]>;
  addTour: (tour: Omit<Tour, "id" | "rating" | "reviews">) => Promise<void>;
  updateTour: (id: number, tour: Partial<Tour>) => Promise<void>;
  deleteTour: (id: number) => Promise<void>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_TOURS: Tour[] = [
  {
    id: 1,
    title: "Khám phá Vịnh Hạ Long & Hang Sửng Sốt",
    location: "Hạ Long, Quảng Ninh",
    price: 3500000,
    originalPrice: 4000000,
    duration: "2 Ngày",
    rating: 4.9,
    reviews: 124,
    images: [
      {
        id: "img-1-1",
        url: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop",
        isPrimary: true,
        order: 0,
        caption: "Vịnh Hạ Long lúc bình minh",
        altText: "Toàn cảnh Vịnh Hạ Long với các núi đá vôi",
      },
      {
        id: "img-1-2",
        url: "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=2025&auto=format&fit=crop",
        isPrimary: false,
        order: 1,
        caption: "Du thuyền 5 sao trên vịnh",
        altText: "Du thuyền sang trọng trên Vịnh Hạ Long",
      },
      {
        id: "img-1-3",
        url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128&auto=format&fit=crop",
        isPrimary: false,
        order: 2,
        caption: "Hoàng hôn trên vịnh",
        altText: "Hoàng hôn vàng rực trên Vịnh Hạ Long",
      },
    ],
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop",
    category: "Phiêu lưu",
    status: "Hoạt động",
    description:
      "Trải nghiệm du thuyền 5 sao tham quan Vịnh Hạ Long, di sản thiên nhiên thế giới. Khám phá Hang Sửng Sốt, chèo kayak và thưởng thức hải sản tươi ngon.",
    features: ["Bao gồm hướng dẫn viên", "Bao gồm bữa ăn", "Xe đưa đón"],
    tags: ["Bán chạy", "Hủy miễn phí"],
    difficulty: "Trung bình",
    startDate: "2025-01-15",
    endDate: "2025-01-16",
  },
  {
    id: 2,
    title: "Văn hóa Cố đô Huế & Thưởng thức Nhã nhạc",
    location: "Huế",
    price: 2500000,
    duration: "3 Ngày",
    rating: 4.8,
    reviews: 89,
    images: [
      {
        id: "img-2-1",
        url: "https://images.unsplash.com/photo-1674798201360-745535e67e6e?q=80&w=2070&auto=format&fit=crop",
        isPrimary: true,
        order: 0,
        caption: "Đại Nội Huế",
        altText: "Cổng Ngọ Môn tại Đại Nội Huế",
      },
      {
        id: "img-2-2",
        url: "https://images.unsplash.com/photo-1580502304784-8985b7eb7260?q=80&w=2070&auto=format&fit=crop",
        isPrimary: false,
        order: 1,
        caption: "Chùa Thiên Mụ",
        altText: "Tháp Phước Duyên tại chùa Thiên Mụ",
      },
      {
        id: "img-2-3",
        url: "https://images.unsplash.com/photo-1599708153386-56b7a3c22c47?q=80&w=2070&auto=format&fit=crop",
        isPrimary: false,
        order: 2,
        caption: "Sông Hương thơ mộng",
        altText: "Hoàng hôn trên sông Hương",
      },
    ],
    image: "https://images.unsplash.com/photo-1674798201360-745535e67e6e?q=80&w=2070&auto=format&fit=crop",
    category: "Văn hóa",
    status: "Hoạt động",
    description:
      "Khám phá vẻ đẹp cổ kính của Cố đô Huế và thưởng thức Nhã nhạc cung đình. Tham quan Đại Nội, Lăng Tự Đức và chùa Thiên Mụ.",
    features: ["Nhóm nhỏ", "Vé tham quan"],
    tags: ["Sắp hết chỗ"],
    difficulty: "Dễ",
    startDate: "2025-02-01",
    endDate: "2025-02-03",
  },
  {
    id: 3,
    title: "Khám phá Hang Sơn Đoòng",
    location: "Quảng Bình",
    price: 65000000,
    duration: "4 Ngày",
    rating: 5.0,
    reviews: 45,
    images: [
      {
        id: "img-3-1",
        url: "https://images.unsplash.com/photo-1638793772999-8df79f0ef0b8?q=80&w=2070&auto=format&fit=crop",
        isPrimary: true,
        order: 0,
        caption: "Bên trong Hang Sơn Đoòng",
        altText: "Ánh sáng chiếu vào hang Sơn Đoòng",
      },
      {
        id: "img-3-2",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
        isPrimary: false,
        order: 1,
        caption: "Cắm trại trong hang",
        altText: "Khu cắm trại bên trong hang",
      },
      {
        id: "img-3-3",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop",
        isPrimary: false,
        order: 2,
        caption: "Hành trình thám hiểm",
        altText: "Đoàn thám hiểm trong hang",
      },
    ],
    image: "https://images.unsplash.com/photo-1638793772999-8df79f0ef0b8?q=80&w=2070&auto=format&fit=crop",
    category: "Mạo hiểm",
    status: "Hoạt động",
    description:
      "Chinh phục hang động lớn nhất thế giới với hành trình thám hiểm đầy thử thách. Trải nghiệm cắm trại trong hang và ngắm nhìn những thạch nhũ kỳ vĩ.",
    features: ["Trực thăng", "Lều trại cao cấp"],
    tags: ["Cao cấp"],
    difficulty: "Khó",
    startDate: "2025-02-20",
    endDate: "2025-02-23",
  },
  {
    id: 4,
    title: "Đà Lạt Mộng Mơ",
    location: "Lâm Đồng",
    price: 2500000,
    duration: "3 Ngày",
    rating: 4.7,
    reviews: 210,
    images: [
      {
        id: "img-4-1",
        url: "https://images.unsplash.com/photo-1552310065-aad9ebece999?q=80&w=2070&auto=format&fit=crop",
        isPrimary: true,
        order: 0,
        caption: "Thành phố Đà Lạt",
        altText: "Toàn cảnh thành phố Đà Lạt",
      },
      {
        id: "img-4-2",
        url: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?q=80&w=2015&auto=format&fit=crop",
        isPrimary: false,
        order: 1,
        caption: "Vườn hoa Đà Lạt",
        altText: "Vườn hoa rực rỡ tại Đà Lạt",
      },
      {
        id: "img-4-3",
        url: "https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=2070&auto=format&fit=crop",
        isPrimary: false,
        order: 2,
        caption: "Hồ Xuân Hương",
        altText: "Hồ Xuân Hương trong sương mù",
      },
    ],
    image: "https://images.unsplash.com/photo-1552310065-aad9ebece999?q=80&w=2070&auto=format&fit=crop",
    category: "Nghỉ dưỡng",
    status: "Hoạt động",
    description:
      "Tận hưởng không khí se lạnh và vẻ đẹp lãng mạn của thành phố ngàn hoa. Tham quan Thung lũng Tình yêu, Hồ Xuân Hương và Langbiang.",
    features: ["Khách sạn 4 sao", "Tiệc BBQ"],
    tags: ["Cặp đôi"],
    difficulty: "Dễ",
    startDate: "2025-03-10",
    endDate: "2025-03-12",
  },
  // Beach/Ocean tours similar to Hạ Long for recommendation demonstration
  {
    id: 5,
    title: "Khám phá Đảo Cát Bà & Vịnh Lan Hạ",
    location: "Hải Phòng",
    price: 2800000,
    originalPrice: 3200000,
    duration: "2 Ngày",
    rating: 4.8,
    reviews: 98,
    images: [
      {
        id: "img-5-1",
        url: "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16?q=80&w=2073&auto=format&fit=crop",
        isPrimary: true,
        order: 0,
        caption: "Vịnh Lan Hạ",
        altText: "Toàn cảnh Vịnh Lan Hạ",
      },
    ],
    image: "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16?q=80&w=2073&auto=format&fit=crop",
    category: "Phiêu lưu",
    status: "Hoạt động",
    description:
      "Khám phá Đảo Cát Bà và Vịnh Lan Hạ - viên ngọc ẩn mình của Việt Nam. Kayak xuyên các hang động, tắm biển và ngắm hoàng hôn trên vịnh.",
    features: ["Kayak", "Tắm biển", "Du thuyền"],
    tags: ["Biển đảo", "Thiên nhiên"],
    difficulty: "Dễ",
    startDate: "2025-01-20",
    endDate: "2025-01-21",
  },
  {
    id: 6,
    title: "Du thuyền Bái Tử Long & Đảo Quan Lạn",
    location: "Quảng Ninh",
    price: 4200000,
    originalPrice: 4800000,
    duration: "3 Ngày",
    rating: 4.9,
    reviews: 156,
    images: [
      {
        id: "img-6-1",
        url: "https://images.unsplash.com/photo-1690038718228-fbfd02d30984?q=80&w=2070&auto=format&fit=crop",
        isPrimary: true,
        order: 0,
        caption: "Vịnh Bái Tử Long",
        altText: "Du thuyền trên Vịnh Bái Tử Long",
      },
    ],
    image: "https://images.unsplash.com/photo-1690038718228-fbfd02d30984?q=80&w=2070&auto=format&fit=crop",
    category: "Phiêu lưu",
    status: "Hoạt động",
    description:
      "Khám phá Vịnh Bái Tử Long hoang sơ và Đảo Quan Lạn với bãi biển cát trắng. Lặn ngắm san hô và thưởng thức hải sản tươi sống.",
    features: ["Du thuyền 4 sao", "Lặn biển", "Hải sản"],
    tags: ["Biển đảo", "Cao cấp"],
    difficulty: "Dễ",
    startDate: "2025-02-05",
    endDate: "2025-02-07",
  },
  {
    id: 7,
    title: "Đảo Cô Tô - Thiên đường biển hoang sơ",
    location: "Quảng Ninh",
    price: 3500000,
    duration: "3 Ngày",
    rating: 4.7,
    reviews: 89,
    images: [
      {
        id: "img-7-1",
        url: "https://images.unsplash.com/photo-1566571940313-a2c6a9d0ff88?q=80&w=2070&auto=format&fit=crop",
        isPrimary: true,
        order: 0,
        caption: "Bãi biển Cô Tô",
        altText: "Bãi biển hoang sơ Cô Tô",
      },
    ],
    image: "https://images.unsplash.com/photo-1566571940313-a2c6a9d0ff88?q=80&w=2070&auto=format&fit=crop",
    category: "Phiêu lưu",
    status: "Hoạt động",
    description:
      "Đắm mình trong vẻ đẹp hoang sơ của Đảo Cô Tô. Tắm biển, câu cá, ngắm bình minh và thưởng thức hải sản tươi ngon.",
    features: ["Tắm biển", "Câu cá", "Homestay"],
    tags: ["Biển đảo", "Hoang sơ"],
    difficulty: "Dễ",
    startDate: "2025-01-25",
    endDate: "2025-01-27",
  },
];

const STORAGE_KEY = "visita_tours_data_v3"; // Bumped to v3 to include new adventure tours

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tours from localStorage on mount
  useEffect(() => {
    const loadTours = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay

      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedTours = JSON.parse(storedData) as Tour[];
          setTours(parsedTours);
        } else {
          // First time: use initial mock data and save to localStorage
          setTours(INITIAL_TOURS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TOURS));
        }
      } catch (error) {
        console.error("Error loading tours from localStorage:", error);
        setTours(INITIAL_TOURS);
      }

      setLoading(false);
    };

    loadTours();
  }, []);

  // Persist tours to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (!loading && tours.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
    }
  }, [tours, loading]);

  const getTour = async (id: number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return tours.find((t) => t.id === id);
  };

  // Get recommended tours by category (excludes current tour)
  // Ready for backend integration - async signature for API calls
  const getRecommendedTours = async (currentTourId: number, category?: string): Promise<Tour[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate API delay

    // First, try to get tours in the same category
    const sameCategoryTours = tours.filter((tour) => {
      if (tour.id === currentTourId) return false;
      if (tour.status !== "Hoạt động") return false;
      if (category && tour.category !== category) return false;
      return true;
    });

    // If we have tours in the same category, return those
    if (sameCategoryTours.length > 0) {
      return sameCategoryTours;
    }

    // Fallback: return all other active tours (different categories)
    return tours.filter((tour) => {
      if (tour.id === currentTourId) return false;
      if (tour.status !== "Hoạt động") return false;
      return true;
    });
  };

  const addTour = async (tourData: Omit<Tour, "id" | "rating" | "reviews">) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newTour: Tour = {
      ...tourData,
      id: Math.max(...tours.map((t) => t.id), 0) + 1,
      rating: 0,
      reviews: 0,
    };
    setTours((prev) => [...prev, newTour]);
  };

  const updateTour = async (id: number, updatedData: Partial<Tour>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setTours((prev) =>
      prev.map((tour) => (tour.id === id ? { ...tour, ...updatedData } : tour))
    );
  };

  const deleteTour = async (id: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setTours((prev) => prev.filter((tour) => tour.id !== id));
  };

  return (
    <TourContext.Provider
      value={{ tours, loading, getTour, getRecommendedTours, addTour, updateTour, deleteTour }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
