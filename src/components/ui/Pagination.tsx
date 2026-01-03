import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /** Maximum number of page buttons to show (excluding prev/next) */
    maxVisiblePages?: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5,
}: PaginationProps) {
    // Generate array of page numbers to display
    const getVisiblePages = (): (number | "ellipsis")[] => {
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | "ellipsis")[] = [];
        const halfVisible = Math.floor(maxVisiblePages / 2);

        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, currentPage + halfVisible);

        // Adjust if at the start
        if (currentPage <= halfVisible) {
            endPage = Math.min(totalPages, maxVisiblePages);
        }

        // Adjust if at the end
        if (currentPage > totalPages - halfVisible) {
            startPage = Math.max(1, totalPages - maxVisiblePages + 1);
        }

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push("ellipsis");
            }
        }

        // Add visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            if (!pages.includes(i)) {
                pages.push(i);
            }
        }

        // Add ellipsis and last page if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push("ellipsis");
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="rounded-lg"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Trước
                </Button>

                {visiblePages.map((page, index) =>
                    page === "ellipsis" ? (
                        <span key={`ellipsis-${index}`} className="text-muted-foreground px-2">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? "secondary" : "ghost"}
                            className={`w-10 h-10 p-0 rounded-lg ${currentPage === page
                                ? "font-bold bg-primary/10 text-primary hover:bg-primary/20"
                                : ""
                                }`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </Button>
                    )
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg"
                >
                    Sau
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            <p className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
            </p>
        </div>
    );
}

/** Hook for managing client-side pagination state */
export function usePagination<T>(items: T[], itemsPerPage: number = 5) {
    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

    const getPaginatedItems = (currentPage: number): T[] => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    return {
        totalPages,
        totalItems: items.length,
        getPaginatedItems,
        itemsPerPage,
    };
}
