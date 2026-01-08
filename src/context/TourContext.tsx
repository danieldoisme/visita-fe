import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchAllTours,
  fetchAllToursAdmin,
  fetchTourByUuid,
  createTourApi,
  updateTourApi,
  deleteTourApi,
  updateTourStatusApi,
  type TourSearchParams,
  type PaginatedResult,
} from "@/api/tourService";
import { fetchStaffMembers, type StaffMember } from "@/api/staffService";
import { syncTourImages } from "@/api/imageService";
import { ApiError } from "@/api/apiClient";
import {
  getRecommendations,
  getRecommendationsForUser,
} from "@/services/recommendationService";

// Tour image structure for multi-image support
export interface TourImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
  caption?: string | null;
  altText?: string | null;
}

export interface Tour {
  id: number;
  tourUuid?: string; // Original UUID from backend for API calls
  title: string;
  location: string;
  price: number;
  priceChild?: number;
  duration: string;
  images: TourImage[];
  image?: string;
  rating: number;
  reviews: number;
  category?: string;
  region?: string;
  capacity?: number;
  availability?: number;
  status: "Hoạt động" | "Đã đóng";
  description?: string;
  itinerary?: string;
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

// Re-export search types for use in components
export type { TourSearchParams, PaginatedResult };

interface TourContextType {
  tours: Tour[];
  staffList: StaffMember[];
  loading: boolean;
  staffLoading: boolean;
  error: string | null;
  getTourByUuid: (uuid: string) => Promise<Tour | undefined>;
  getRecommendedTours: (
    currentTourId: number,
    category?: string,
    userId?: string
  ) => Promise<Tour[]>;
  getPersonalizedRecommendations: (userId: string) => Promise<Tour[]>;
  addTour: (
    tour: Omit<Tour, "id" | "rating" | "reviews">,
    staffId: string
  ) => Promise<void>;
  updateTour: (
    id: number,
    tour: Partial<Tour>,
    staffId: string
  ) => Promise<void>;
  updateTourStatus: (id: number, isActive: boolean) => Promise<void>;
  deleteTour: (id: number) => Promise<void>;
  refreshTours: () => Promise<void>;
  loadStaffs: () => Promise<StaffMember[]>;
  searchTours: (params: TourSearchParams) => Promise<PaginatedResult<Tour>>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  // Stabilize the fetch function selection based on user role
  // Only admin users can access /admins/tours endpoint
  // Staff users use the public /tours endpoint (or /staffs/{id}/tours for their own tours)
  const userRole = user?.role;
  const shouldUseAdminEndpoint = Boolean(user && userRole === 'admin');

  // Load tours from API on mount
  // Admin/Staff: fetch all tours including inactive
  // Regular users: fetch only active tours
  const loadTours = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (shouldUseAdminEndpoint) {
        result = await fetchAllToursAdmin();
      } else {
        result = await fetchAllTours({ page: 0, size: 100 });
      }
      setTours(result.content);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể tải danh sách tour";
      setError(message);
      console.error("Error loading tours:", err);
    } finally {
      setLoading(false);
    }
  }, [shouldUseAdminEndpoint]);

  // Load staff list from API - returns staff list for immediate use
  const loadStaffs = useCallback(async (): Promise<StaffMember[]> => {
    if (staffList.length > 0) return staffList; // Already loaded

    setStaffLoading(true);
    try {
      const staffs = await fetchStaffMembers();
      setStaffList(staffs);
      return staffs;
    } catch (err) {
      console.error("Error loading staff list:", err);
      return [];
    } finally {
      setStaffLoading(false);
    }
  }, [staffList]);

  // Wait for auth to complete before fetching tours
  // This ensures we use the correct endpoint (admin vs public) on the first fetch
  useEffect(() => {
    // Don't fetch until auth has finished loading
    if (authLoading) return;

    const fetchTours = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use admin endpoint only for admin users
        // Staff users use public endpoint (they access their own tours via /staffs/{id}/tours)
        const userRole = user?.role;
        const useAdminEndpoint = Boolean(user && userRole === 'admin');
        let result;
        if (useAdminEndpoint) {
          result = await fetchAllToursAdmin();
        } else {
          result = await fetchAllTours({ page: 0, size: 100 });
        }
        setTours(result.content);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Không thể tải danh sách tour";
        setError(message);
        console.error("Error loading tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [authLoading, user]);



  const getTourByUuid = async (uuid: string): Promise<Tour | undefined> => {
    // First check cached tours by UUID
    const cachedTour = tours.find((t) => t.tourUuid === uuid);
    if (cachedTour) {
      return cachedTour;
    }

    // Fetch from API if not in cache
    try {
      return await fetchTourByUuid(uuid);
    } catch (err) {
      console.error("Error fetching tour by UUID:", err);
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
            .filter(
              (t): t is Tour => t !== undefined && t.status === "Hoạt động"
            );

          if (recommendedTours.length > 0) {
            return recommendedTours;
          }
        }
      } catch (error) {
        console.warn(
          "AI recommendation failed, falling back to category filter:",
          error
        );
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

  // Get personalized recommendations for a user (without needing a current tour)
  const getPersonalizedRecommendations = async (
    userId: string
  ): Promise<Tour[]> => {
    try {
      const recommendedIds = await getRecommendationsForUser(userId);

      if (recommendedIds.length > 0) {
        // Map recommended UUIDs to Tour objects
        const recommendedTours = recommendedIds
          .map((uuid) => tours.find((t) => t.tourUuid === uuid))
          .filter(
            (t): t is Tour => t !== undefined && t.status === "Hoạt động"
          );

        if (recommendedTours.length > 0) {
          return recommendedTours;
        }
      }
    } catch (error) {
      console.warn("Failed to get personalized recommendations:", error);
    }

    // Fallback: return popular active tours (sorted by rating)
    return tours
      .filter((t) => t.status === "Hoạt động")
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  };

  const addTour = async (
    tourData: Omit<Tour, "id" | "rating" | "reviews">,
    staffId: string
  ) => {
    try {
      const newTour = await createTourApi(tourData, staffId);

      // Sync images after tour is created
      if (tourData.images && tourData.images.length > 0 && newTour.tourUuid) {
        await syncTourImages(newTour.tourUuid, tourData.images);
        // Update the tour with synced images
        newTour.images = tourData.images;
      }

      setTours((prev) => [...prev, newTour]);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể tạo tour mới";
      setError(message);
      throw err;
    }
  };

  const updateTour = async (
    id: number,
    updatedData: Partial<Tour>,
    staffId: string
  ) => {
    try {
      const updatedTour = await updateTourApi(id, updatedData, staffId);

      // Sync images after tour is updated
      if (updatedData.images && updatedTour.tourUuid) {
        await syncTourImages(updatedTour.tourUuid, updatedData.images);
        // Update the tour with synced images
        updatedTour.images = updatedData.images;
      }

      setTours((prev) =>
        prev.map((tour) => (tour.id === id ? updatedTour : tour))
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể cập nhật tour";
      setError(message);
      throw err;
    }
  };

  const deleteTour = async (id: number) => {
    try {
      await deleteTourApi(id);
      setTours((prev) => prev.filter((tour) => tour.id !== id));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể xóa tour";
      setError(message);
      throw err;
    }
  };

  const refreshTours = async () => {
    await loadTours();
  };

  // Search tours with filters (returns paginated result from API)
  const searchTours = async (params: TourSearchParams): Promise<PaginatedResult<Tour>> => {
    return await fetchAllTours(params);
  };

  const updateTourStatus = async (id: number, isActive: boolean) => {
    try {
      await updateTourStatusApi(id, isActive);
      // Update local state
      setTours((prev) =>
        prev.map((tour) =>
          tour.id === id
            ? { ...tour, status: isActive ? "Hoạt động" : "Đã đóng" }
            : tour
        )
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể cập nhật trạng thái tour";
      setError(message);
      throw err;
    }
  };

  return (
    <TourContext.Provider
      value={{
        tours,
        staffList,
        loading,
        staffLoading,
        error,
        getTourByUuid,
        getRecommendedTours,
        getPersonalizedRecommendations,
        addTour,
        updateTour,
        updateTourStatus,
        deleteTour,
        refreshTours,
        loadStaffs,
        searchTours,
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
