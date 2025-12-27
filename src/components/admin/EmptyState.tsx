import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface EmptyStateProps {
    /** Main message to display */
    message: string;
    /** Optional description text */
    description?: string;
    /** Whether to show "Clear Filters" button */
    showClearFilters?: boolean;
    /** Callback when "Clear Filters" is clicked */
    onClearFilters?: () => void;
}

/**
 * Consistent empty state component for admin tables.
 * Displays a friendly message when no data is available.
 */
export function EmptyState({
    message,
    description,
    showClearFilters = false,
    onClearFilters,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{message}</h3>
            {description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {description}
                </p>
            )}
            {showClearFilters && onClearFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="mt-4"
                >
                    <X className="h-4 w-4 mr-1.5" />
                    Xóa bộ lọc
                </Button>
            )}
        </div>
    );
}
