import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchFavorites, addToFavorites, removeFromFavorites } from "@/services/favoriteService";
import { getTourUuid } from "@/api/mappers/tourMapper";
import type { Tour } from "@/context/TourContext";

// ============== Types ==============
interface FavoritesContextType {
  favorites: Tour[];
  toggleFavorite: (tourId: number) => Promise<void>;
  isFavorite: (tourId: number) => boolean;
  isLoading: boolean;
  // Pending favorite for auth-gated flow
  pendingFavoriteId: number | null;
  setPendingFavorite: (tourId: number | null) => void;
  executePendingFavorite: () => Promise<void>;
  // Refresh favorites from API
  refreshFavorites: () => Promise<void>;
}

// ============== Context ==============
const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

// ============== Provider ==============
interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pending favorite for auth-gated flow
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(null);

  // Load favorites from API when user authenticates
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      const favoriteTours = await fetchFavorites();
      setFavorites(favoriteTours);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      // Don't show toast on load failure, just log it
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load favorites on auth change
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, user?.userId]);

  const isFavorite = (tourId: number): boolean => {
    return favorites.some((tour) => tour.id === tourId);
  };

  const toggleFavorite = async (tourId: number): Promise<void> => {
    if (!isAuthenticated) {
      // This shouldn't happen if UI is correct, but handle it
      toast.error("Vui lòng đăng nhập để thêm yêu thích");
      return;
    }

    // Get the UUID for API call
    const tourUuid = getTourUuid(tourId);
    if (!tourUuid) {
      console.error("Could not find UUID for tour:", tourId);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      return;
    }

    const wasAlreadyFavorite = isFavorite(tourId);
    setIsLoading(true);

    try {
      if (wasAlreadyFavorite) {
        // Remove from favorites
        await removeFromFavorites(tourUuid);
        setFavorites((prev) => prev.filter((tour) => tour.id !== tourId));
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        // Add to favorites
        await addToFavorites(tourUuid);
        // Refresh favorites to get the full tour data
        await loadFavorites();
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Set pending favorite (called when guest clicks favorite button)
  const setPendingFavorite = useCallback((tourId: number | null) => {
    setPendingFavoriteId(tourId);
  }, []);

  // Execute pending favorite (called after successful login/registration)
  const executePendingFavorite = useCallback(async (): Promise<void> => {
    if (pendingFavoriteId === null) return;

    const tourId = pendingFavoriteId;
    setPendingFavoriteId(null); // Clear pending state

    // Only add if not already a favorite
    if (!isFavorite(tourId)) {
      await toggleFavorite(tourId);
    }
  }, [pendingFavoriteId, favorites]);

  // Refresh favorites from API
  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        isLoading,
        pendingFavoriteId,
        setPendingFavorite,
        executePendingFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

// ============== Hook ==============
export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
