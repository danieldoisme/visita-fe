import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { Tour, getCoverImage } from "@/context/TourContext";
import { MapPin, Clock, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

export interface TourCardProps {
  tour: Tour;
  /** Card display variant */
  variant?: "default" | "compact" | "featured" | "recommended";
  /** Layout mode for list views */
  layout?: "grid" | "list";
  /** Show favorite button */
  showFavorite?: boolean;
  /** Show features list */
  showFeatures?: boolean;
  /** Custom accent color for themed sections */
  accentColor?: "primary" | "purple";
  /** Additional className */
  className?: string;
}

/**
 * Reusable tour card component with multiple variants.
 * - default: Standard card for ToursPage grid/list
 * - compact: Smaller card for sidebar recommendations
 * - featured: Larger card for homepage featured section
 * - recommended: AI recommendation style with purple gradient
 */
export function TourCard({
  tour,
  variant = "default",
  layout = "grid",
  showFavorite = true,
  showFeatures = true,
  accentColor = "primary",
  className,
}: TourCardProps) {
  const imageUrl = getCoverImage(tour);
  const isPurple = accentColor === "purple";

  // Compact variant for sidebar recommendations - Purple themed
  if (variant === "compact") {
    return (
      <div className={cn("group bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-3 border border-purple-100 hover:border-purple-200 transition-all", className)}>
        <div className="flex gap-3">
          <Link to={`/tours/${tour.id}`} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={imageUrl}
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </Link>
          <div className="flex-1 min-w-0 flex flex-col">
            <Link to={`/tours/${tour.id}`}>
              <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                {tour.title}
              </h4>
            </Link>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3 text-purple-500" />
                <span className="truncate max-w-[80px]">{tour.location}</span>
              </div>
              <span className="text-purple-300">•</span>
              <div className="flex items-center gap-0.5">
                <Clock className="h-3 w-3 text-purple-500" />
                <span>{tour.duration}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2">
              <div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{tour.rating}</span>
                  <span>({tour.reviews})</span>
                </div>
                <p className="text-sm font-bold text-purple-600">
                  {formatCurrency(tour.price)}
                </p>
              </div>
              <Link to={`/tours/${tour.id}`}>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs rounded-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                >
                  Xem chi tiết
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Featured/Recommended variant for homepage sections
  if (variant === "featured" || variant === "recommended") {
    return (
      <Card
        className={cn(
          "group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl",
          variant === "recommended" && "bg-white/80 backdrop-blur-sm",
          className
        )}
      >
        <div className="relative h-[240px] overflow-hidden">
          <img
            src={imageUrl}
            alt={tour.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {tour.tags?.[0] && (
            <Badge
              className={cn(
                "absolute top-4 right-4 font-semibold shadow-sm border-0",
                isPurple
                  ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600"
                  : "bg-white/90 text-black hover:bg-white"
              )}
            >
              {tour.tags[0]}
            </Badge>
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <MapPin className="h-3 w-3 mr-1" /> {tour.location}
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3
              className={cn(
                "font-bold text-xl line-clamp-1 transition-colors",
                isPurple ? "group-hover:text-purple-600" : "group-hover:text-primary"
              )}
            >
              {tour.title}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <Clock className={cn("h-4 w-4 mr-1.5", isPurple ? "text-purple-500" : "text-primary")} />
              {tour.duration}
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1.5 text-yellow-500 fill-yellow-500" />
              {tour.rating} ({tour.reviews})
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Từ</p>
              <p className={cn("text-xl sm:text-2xl font-bold", isPurple ? "text-purple-600" : "text-primary")}>
                {tour.price.toLocaleString("vi-VN")}đ
              </p>
            </div>
            <Link to={`/tours/${tour.id}`} className="flex-shrink-0 w-full xs:w-auto">
              <Button
                size="sm"
                className={cn(
                  "rounded-full px-4 sm:px-6 w-full xs:w-auto",
                  isPurple && "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                )}
              >
                Xem chi tiết
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant for ToursPage with list/grid layout support
  const isListLayout = layout === "list";

  return (
    <Card
      className={cn(
        "group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl",
        isListLayout ? "flex flex-col md:flex-row" : "flex flex-col",
        className
      )}
    >
      {/* Image Section */}
      <div
        className={cn(
          "relative overflow-hidden",
          isListLayout ? "w-full md:w-[320px] h-[240px] md:h-auto" : "aspect-[4/3] w-full"
        )}
      >
        <img
          src={imageUrl}
          alt={tour.title}
          className="object-cover w-full h-full hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {tour.tags?.map((tag, i) => (
            <Badge
              key={i}
              className="bg-white/90 text-slate-900 hover:bg-white shadow-sm backdrop-blur-sm border-0 font-semibold"
            >
              {tag}
            </Badge>
          ))}
        </div>
        {showFavorite && <FavoriteButton tourId={tour.id} className="absolute top-3 right-3" />}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
            {tour.location}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-slate-900">{tour.rating}</span>
            <span className="text-xs text-muted-foreground">({tour.reviews})</span>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {tour.title}
        </h3>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {tour.duration}
          </div>
          {showFeatures &&
            tour.features?.slice(0, 2).map((feature, i) => (
              <div
                key={i}
                className="flex items-center text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md"
              >
                <Check className="h-3 w-3 mr-1.5 text-green-600" />
                {feature}
              </div>
            ))}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col xs:flex-row xs:items-end xs:justify-between gap-3">
          <div className="flex flex-col">
            {tour.originalPrice && (
              <span className="text-xs text-muted-foreground line-through mb-0.5">
                {tour.originalPrice.toLocaleString("vi-VN")}đ
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground font-medium">Từ</span>
              <span className="text-xl font-bold text-primary">
                {tour.price.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
          <Link to={`/tours/${tour.id}`} className="w-full xs:w-auto">
            <Button className="rounded-xl px-6 font-semibold shadow-none hover:shadow-md transition-all w-full xs:w-auto">
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
