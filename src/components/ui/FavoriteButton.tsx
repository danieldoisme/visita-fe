import { useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { AuthRequiredModal } from "@/components/AuthRequiredModal";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  tourId: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "overlay" | "inline";
}

const sizeClasses = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
};

const iconSizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function FavoriteButton({
  tourId,
  className,
  size = "md",
  variant = "overlay",
}: FavoriteButtonProps) {
  const { user, isAdmin, isStaff } = useAuth();
  const {
    toggleFavorite,
    isFavorite,
    isLoading,
    setPendingFavorite,
    executePendingFavorite,
  } = useFavorites();

  // Admin and Staff don't have access to /profile page, so hide favorites feature
  if (isAdmin || isStaff) {
    return null;
  }
  const isFav = isFavorite(tourId);

  // State for auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle auth success - execute pending favorite
  const handleAuthSuccess = async () => {
    await executePendingFavorite();
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If not authenticated, show auth modal and store pending action
    if (!user) {
      setPendingFavorite(tourId);
      setShowAuthModal(true);
      return;
    }

    if (!isLoading) {
      await toggleFavorite(tourId);
    }
  };

  if (variant === "inline") {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={isLoading}
          aria-label={isFav ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
            isFav
              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              : "border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
            isLoading && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <Heart className={cn(iconSizes[size], isFav && "fill-current")} />
          {isFav ? "Đã yêu thích" : "Yêu thích"}
        </button>

        <AuthRequiredModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="Lưu tour yêu thích"
          message="Đăng nhập hoặc tạo tài khoản để lưu tour này vào danh sách yêu thích của bạn."
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Default: overlay variant (for tour cards)
  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        aria-label={isFav ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        className={cn(
          sizeClasses[size],
          "rounded-full backdrop-blur-sm transition-all duration-300",
          isFav
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-black/20 text-white hover:bg-white hover:text-red-500",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Heart
          className={cn(
            iconSizes[size],
            isFav && "fill-current",
            !isLoading && "group-hover:scale-110 transition-transform"
          )}
        />
      </button>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Lưu tour yêu thích"
        message="Đăng nhập hoặc tạo tài khoản để lưu tour này vào danh sách yêu thích của bạn."
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
