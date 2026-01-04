import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  fetchAllTours,
  fetchTourById,
  createTourApi,
  updateTourApi,
  deleteTourApi,
} from "@/api/tourService";
import { ApiError } from "@/api/apiClient";

// Tour image structure for multi-image support
export interface TourImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
  caption?: string;
  altText?: string;
}

export interface Tour {
  id: number;
  title: string;
  location: string;
  price: number;
  duration: string;
  images: TourImage[];
  image?: string;
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
  startDate?: string;
  endDate?: string;
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
  error: string | null;
  getTour: (id: number) => Promise<Tour | undefined>;
  getRecommendedTours: (currentTourId: number, category?: string) => Promise<Tour[]>;
  addTour: (tour: Omit<Tour, "id" | "rating" | "reviews">) => Promise<void>;
  updateTour: (id: number, tour: Partial<Tour>) => Promise<void>;
  deleteTour: (id: number) => Promise<void>;
  refreshTours: () => Promise<void>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tours from API on mount
  const loadTours = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAllTours({ page: 0, size: 100 });
      setTours(result.content);
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : "Không thể tải danh sách tour";
      setError(message);
      console.error("Error loading tours:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  const getTour = async (id: number): Promise<Tour | undefined> => {
    // First check local cache
    const cachedTour = tours.find((t) => t.id === id);
    if (cachedTour) {
      return cachedTour;
    }

    // Fetch from API if not in cache
    try {
      return await fetchTourById(id);
    } catch (err) {
      console.error("Error fetching tour:", err);
      return undefined;
    }
  };

  // Get recommended tours by category (excludes current tour)
  const getRecommendedTours = async (
    currentTourId: number,
    category?: string
  ): Promise<Tour[]> => {
    // First, try to get tours in the same category
    const sameCategoryTours = tours.filter((tour) => {
      if (tour.id === currentTourId) return false;
      if (tour.status !== "Hoạt động") return false;
      if (category && tour.category !== category) return false;
      return true;
    });

    if (sameCategoryTours.length > 0) {
      return sameCategoryTours;
    }

    // Fallback: return all other active tours
    return tours.filter((tour) => {
      if (tour.id === currentTourId) return false;
      if (tour.status !== "Hoạt động") return false;
      return true;
    });
  };

  const addTour = async (tourData: Omit<Tour, "id" | "rating" | "reviews">) => {
    try {
      // TODO: Get actual staff ID from auth context when available
      const staffId = "default-staff-id";
      const newTour = await createTourApi(tourData, staffId);
      setTours((prev) => [...prev, newTour]);
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : "Không thể tạo tour mới";
      setError(message);
      throw err;
    }
  };

  const updateTour = async (id: number, updatedData: Partial<Tour>) => {
    try {
      // TODO: Get actual staff ID from auth context when available
      const staffId = "default-staff-id";
      const updatedTour = await updateTourApi(id, updatedData, staffId);
      setTours((prev) =>
        prev.map((tour) => (tour.id === id ? updatedTour : tour))
      );
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : "Không thể cập nhật tour";
      setError(message);
      throw err;
    }
  };

  const deleteTour = async (id: number) => {
    try {
      await deleteTourApi(id);
      setTours((prev) => prev.filter((tour) => tour.id !== id));
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : "Không thể xóa tour";
      setError(message);
      throw err;
    }
  };

  const refreshTours = async () => {
    await loadTours();
  };

  return (
    <TourContext.Provider
      value={{
        tours,
        loading,
        error,
        getTour,
        getRecommendedTours,
        addTour,
        updateTour,
        deleteTour,
        refreshTours,
      }}
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
