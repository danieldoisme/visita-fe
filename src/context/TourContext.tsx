import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Tour {
  id: number;
  title: string;
  location: string;
  price: number;
  duration: string;
  image: string;
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
}

interface TourContextType {
  tours: Tour[];
  loading: boolean;
  getTour: (id: number) => Promise<Tour | undefined>;
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
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop",
    category: "Phiêu lưu",
    status: "Hoạt động",
    description:
      "Trải nghiệm du thuyền 5 sao tham quan Vịnh Hạ Long, di sản thiên nhiên thế giới. Khám phá Hang Sửng Sốt, chèo kayak và thưởng thức hải sản tươi ngon.",
    features: ["Bao gồm hướng dẫn viên", "Bao gồm bữa ăn", "Xe đưa đón"],
    tags: ["Bán chạy", "Hủy miễn phí"],
    difficulty: "Trung bình",
  },
  {
    id: 2,
    title: "Văn hóa Cố đô Huế & Thưởng thức Nhã nhạc",
    location: "Huế",
    price: 2500000,
    duration: "3 Ngày",
    rating: 4.8,
    reviews: 89,
    image:
      "https://images.unsplash.com/photo-1674798201360-745535e67e6e?q=80&w=2070&auto=format&fit=crop",
    category: "Văn hóa",
    status: "Hoạt động",
    description:
      "Khám phá vẻ đẹp cổ kính của Cố đô Huế và thưởng thức Nhã nhạc cung đình. Tham quan Đại Nội, Lăng Tự Đức và chùa Thiên Mụ.",
    features: ["Nhóm nhỏ", "Vé tham quan"],
    tags: ["Sắp hết chỗ"],
    difficulty: "Dễ",
  },
  {
    id: 3,
    title: "Khám phá Hang Sơn Đoòng",
    location: "Quảng Bình",
    price: 65000000,
    duration: "4 Ngày",
    rating: 5.0,
    reviews: 45,
    image:
      "https://images.unsplash.com/photo-1638793772999-8df79f0ef0b8?q=80&w=2070&auto=format&fit=crop",
    category: "Mạo hiểm",
    status: "Hoạt động",
    description:
      "Chinh phục hang động lớn nhất thế giới với hành trình thám hiểm đầy thử thách. Trải nghiệm cắm trại trong hang và ngắm nhìn những thạch nhũ kỳ vĩ.",
    features: ["Trực thăng", "Lều trại cao cấp"],
    tags: ["Cao cấp"],
    difficulty: "Khó",
  },
  {
    id: 4,
    title: "Đà Lạt Mộng Mơ",
    location: "Lâm Đồng",
    price: 2500000,
    duration: "3 Ngày",
    rating: 4.7,
    reviews: 210,
    image:
      "https://images.unsplash.com/photo-1552310065-aad9ebece999?q=80&w=2070&auto=format&fit=crop",
    category: "Nghỉ dưỡng",
    status: "Hoạt động",
    description:
      "Tận hưởng không khí se lạnh và vẻ đẹp lãng mạn của thành phố ngàn hoa. Tham quan Thung lũng Tình yêu, Hồ Xuân Hương và Langbiang.",
    features: ["Khách sạn 4 sao", "Tiệc BBQ"],
    tags: ["Cặp đôi"],
    difficulty: "Dễ",
  },
];

const STORAGE_KEY = "visita_tours_data";

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
      value={{ tours, loading, getTour, addTour, updateTour, deleteTour }}
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
