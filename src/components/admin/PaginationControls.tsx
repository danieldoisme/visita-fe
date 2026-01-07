import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Shared constant for all admin tables
export const ITEMS_PER_PAGE = 10;

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationControlsProps) {
    // Show 0/0 when there's no data
    const displayPage = totalPages === 0 ? 0 : currentPage;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
                Trang {displayPage} / {totalPages}
            </p>
            <div className="flex gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1 || totalPages === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages || totalPages === 0}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
