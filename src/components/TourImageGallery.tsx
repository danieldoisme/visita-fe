import { useState, useCallback } from "react";
import { Tour } from "@/context/TourContext";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface TourImageGalleryProps {
    tour: Tour;
    className?: string;
}

export function TourImageGallery({ tour, className = "" }: TourImageGalleryProps) {
    const images = tour.images || [];
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Sort images by order, primary first
    const sortedImages = [...images].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.order - b.order;
    });

    // Fallback to legacy image if no images array
    const hasImages = sortedImages.length > 0;
    const legacyImageUrl = tour.image || "";

    const currentImage = hasImages ? sortedImages[selectedIndex] : null;
    const mainImageUrl = currentImage?.url || legacyImageUrl;
    const mainImageAlt = currentImage?.altText || currentImage?.caption || tour.title;

    // Navigation handlers
    const handlePrevious = useCallback(() => {
        setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
    }, [sortedImages.length]);

    const handleNext = useCallback(() => {
        setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
    }, [sortedImages.length]);

    // Keyboard navigation for lightbox
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowLeft") handlePrevious();
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "Escape") setIsLightboxOpen(false);
        },
        [handlePrevious, handleNext]
    );

    // If no images at all, show placeholder
    if (!mainImageUrl) {
        return (
            <div className={`relative h-[400px] rounded-xl overflow-hidden bg-muted ${className}`}>
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <span>Không có hình ảnh</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Main Image */}
            <div className={`relative ${className}`}>
                <div
                    className="relative h-[400px] rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => hasImages && setIsLightboxOpen(true)}
                >
                    <img
                        src={mainImageUrl}
                        alt={mainImageAlt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Zoom indicator */}
                    {hasImages && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}

                    {/* Caption */}
                    {currentImage?.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <p className="text-white text-sm">{currentImage.caption}</p>
                        </div>
                    )}

                    {/* Navigation arrows (only if multiple images) */}
                    {hasImages && sortedImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Ảnh trước"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Ảnh tiếp"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Image counter */}
                    {hasImages && sortedImages.length > 1 && (
                        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                            {selectedIndex + 1} / {sortedImages.length}
                        </div>
                    )}
                </div>

                {/* Thumbnail strip (only if multiple images) */}
                {hasImages && sortedImages.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {sortedImages.map((image, index) => (
                            <button
                                key={image.id}
                                onClick={() => setSelectedIndex(index)}
                                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${index === selectedIndex
                                    ? "ring-2 ring-primary ring-offset-2"
                                    : "opacity-70 hover:opacity-100"
                                    }`}
                            >
                                <img
                                    src={image.url}
                                    alt={image.altText || image.caption || `Ảnh ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://placehold.co/80x80?text=Error";
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && hasImages && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                    onClick={() => setIsLightboxOpen(false)}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Xem ảnh lớn"
                >
                    {/* Close button */}
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-50"
                        aria-label="Đóng"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    {/* Navigation */}
                    {sortedImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
                                aria-label="Ảnh trước"
                            >
                                <ChevronLeft className="h-10 w-10" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
                                aria-label="Ảnh tiếp"
                            >
                                <ChevronRight className="h-10 w-10" />
                            </button>
                        </>
                    )}

                    {/* Main lightbox image */}
                    <div
                        className="max-w-[90vw] max-h-[85vh] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={currentImage?.url}
                            alt={currentImage?.altText || currentImage?.caption || tour.title}
                            className="max-w-full max-h-[85vh] object-contain"
                        />

                        {/* Caption in lightbox */}
                        {currentImage?.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-center">
                                <p className="text-white">{currentImage.caption}</p>
                            </div>
                        )}
                    </div>

                    {/* Counter in lightbox */}
                    {sortedImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                            {selectedIndex + 1} / {sortedImages.length}
                        </div>
                    )}

                    {/* Thumbnail strip in lightbox */}
                    {sortedImages.length > 1 && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2">
                            {sortedImages.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedIndex(index);
                                    }}
                                    className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${index === selectedIndex
                                        ? "ring-2 ring-white"
                                        : "opacity-50 hover:opacity-100"
                                        }`}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.altText || image.caption || `Ảnh ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
