import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "sonner";

// ============== Types ==============
interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (tourId: number) => Promise<void>;
  isFavorite: (tourId: number) => boolean;
  isLoading: boolean;
  // Pending favorite for auth-gated flow
  pendingFavoriteId: number | null;
  setPendingFavorite: (tourId: number | null) => void;
  executePendingFavorite: () => Promise<void>;
}

// ============== LocalStorage Key ==============
const FAVORITES_STORAGE_KEY = "visita_favorites";

// ============== Mock API Functions ==============
// These will be replaced with real API calls when backend is ready
const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 300));

async function addFavoriteAPI(tourId: number): Promise<boolean> {
  await mockDelay();
  // Simulating API success
  console.log(`[Mock API] Added tour ${tourId} to favorites`);
  return true;
}

async function removeFavoriteAPI(tourId: number): Promise<boolean> {
  await mockDelay();
  // Simulating API success
  console.log(`[Mock API] Removed tour ${tourId} from favorites`);
  return true;
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
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pending favorite for auth-gated flow
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(null);

  // Load favorites from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load favorites from LocalStorage:", error);
    }
  }, []);

  // Save favorites to LocalStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites to LocalStorage:", error);
    }
  }, [favorites]);

  const isFavorite = (tourId: number): boolean => {
    return favorites.includes(tourId);
  };

  const toggleFavorite = async (tourId: number): Promise<void> => {
    const wasAlreadyFavorite = isFavorite(tourId);
    setIsLoading(true);

    try {
      if (wasAlreadyFavorite) {
        // Remove from favorites
        const success = await removeFavoriteAPI(tourId);
        if (success) {
          setFavorites((prev) => prev.filter((id) => id !== tourId));
          toast.success("Đã xóa khỏi danh sách yêu thích");
        }
      } else {
        // Add to favorites
        const success = await addFavoriteAPI(tourId);
        if (success) {
          setFavorites((prev) => [...prev, tourId]);
          toast.success("Đã thêm vào danh sách yêu thích");
        }
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
    if (!favorites.includes(tourId)) {
      await toggleFavorite(tourId);
    }
  }, [pendingFavoriteId, favorites]);

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
