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
import { fetchStaffMembers, type StaffMember } from "@/api/staffService";
import { ApiError } from "@/api/apiClient";
import { getRecommendations } from "@/services/recommendationService";

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
  tourUuid?: string; // Original UUID from backend for API calls
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
  staffId?: string;
}

// Helper function to get the primary/cover image URL
export const getCoverImage = (tour: Tour): string => {
  const primaryImage = tour.images?.find((img) => img.isPrimary);
  if (primaryImage) return primaryImage.url;
  if (tour.images && tour.images.length > 0) return tour.images[0].url;
  return tour.image || "";
};

// Re-export StaffMember type for convenience
export type { StaffMember };

interface TourContextType {
  tours: Tour[];
  staffList: StaffMember[];
  loading: boolean;
  staffLoading: boolean;
  error: string | null;
  getTour: (id: number) => Promise<Tour | undefined>;
  getRecommendedTours: (currentTourId: number, category?: string, userId?: string) => Promise<Tour[]>;
  addTour: (tour: Omit<Tour, "id" | "rating" | "reviews">, staffId: string) => Promise<void>;
  updateTour: (id: number, tour: Partial<Tour>, staffId: string) => Promise<void>;
  deleteTour: (id: number) => Promise<void>;
  refreshTours: () => Promise<void>;
  loadStaffs: () => Promise<void>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);
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

  // Load staff list from API
  const loadStaffs = useCallback(async () => {
    if (staffList.length > 0) return; // Already loaded

    setStaffLoading(true);
    try {
      const staffs = await fetchStaffMembers();
      setStaffList(staffs);
    } catch (err) {
      console.error("Error loading staff list:", err);
    } finally {
      setStaffLoading(false);
    }
  }, [staffList.length]);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  const getTour = async (id: number): Promise<Tour | undefined> => {
    const cachedTour = tours.find((t) => t.id === id);
    if (cachedTour) {
      return cachedTour;
    }

    try {
      return await fetchTourById(id);
    } catch (err) {
      console.error("Error fetching tour:", err);
      return undefined;
    }
  };

  const getRecommendedTours = async (
    currentTourId: number,
    category?: string,
    userId?: string
  ): Promise<Tour[]> => {
    // Get the current tour to find its UUID for the AI service
    const currentTour = tours.find((t) => t.id === currentTourId);
    const tourUuid = currentTour?.tourUuid;

    // Try AI recommendation service if we have the tour UUID
    if (tourUuid) {
      try {
        const recommendedIds = await getRecommendations(tourUuid, userId);

        if (recommendedIds.length > 0) {
          // Map recommended UUIDs to Tour objects
          const recommendedTours = recommendedIds
            .map((uuid) => tours.find((t) => t.tourUuid === uuid))
            .filter((t): t is Tour => t !== undefined && t.status === "Hoạt động");

          if (recommendedTours.length > 0) {
            return recommendedTours;
          }
        }
      } catch (error) {
        console.warn('AI recommendation failed, falling back to category filter:', error);
      }
    }

    // Fallback: category-based filtering
    const sameCategoryTours = tours.filter((tour) => {
      if (tour.id === currentTourId) return false;
      if (tour.status !== "Hoạt động") return false;
      if (category && tour.category !== category) return false;
      return true;
    });

    if (sameCategoryTours.length > 0) {
      return sameCategoryTours;
    }

    // Final fallback: any active tour
    return tours.filter((tour) => {
      if (tour.id === currentTourId) return false;
      if (tour.status !== "Hoạt động") return false;
      return true;
    });
  };

  const addTour = async (
    tourData: Omit<Tour, "id" | "rating" | "reviews">,
    staffId: string
  ) => {
    try {
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

  const updateTour = async (id: number, updatedData: Partial<Tour>, staffId: string) => {
    try {
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
        staffList,
        loading,
        staffLoading,
        error,
        getTour,
        getRecommendedTours,
        addTour,
        updateTour,
        deleteTour,
        refreshTours,
        loadStaffs,
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
